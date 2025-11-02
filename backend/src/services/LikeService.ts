import { Pool, PoolClient } from 'pg';
import { logger } from '../utils/logger';

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface LikedQuote {
  id: number;
  text: string;
  author: string;
  source: string | null;
  language: string;
  category: string | null;
  likes_count: number;
  liked_at: Date;
}

/**
 * 좋아요 관리 서비스
 * - 사용자별 좋아요 추가/제거
 * - quotes.likes_count 실시간 업데이트
 * - 트랜잭션으로 데이터 일관성 보장
 */
export class LikeService {
  constructor(private pool: Pool) {}

  /**
   * 좋아요 추가
   * @param userId 사용자 ID
   * @param quoteId 명언 ID
   * @returns 좋아요 상태 및 카운트
   */
  async addLike(userId: number, quoteId: number): Promise<LikeResponse> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 이미 좋아요했는지 확인
      const existingLike = await client.query(
        `SELECT id FROM author_clock.user_likes
         WHERE user_id = $1 AND quote_id = $2`,
        [userId, quoteId]
      );

      if (existingLike.rows.length > 0) {
        // 이미 좋아요한 경우, 현재 카운트만 반환
        const countResult = await client.query(
          `SELECT likes_count FROM author_clock.quotes WHERE id = $1`,
          [quoteId]
        );

        await client.query('COMMIT');
        return {
          liked: true,
          likes_count: countResult.rows[0]?.likes_count || 0,
        };
      }

      // 좋아요 추가
      await client.query(
        `INSERT INTO author_clock.user_likes (user_id, quote_id)
         VALUES ($1, $2)`,
        [userId, quoteId]
      );

      // quotes 테이블의 likes_count 증가
      const updateResult = await client.query(
        `UPDATE author_clock.quotes
         SET likes_count = likes_count + 1
         WHERE id = $1
         RETURNING likes_count`,
        [quoteId]
      );

      await client.query('COMMIT');

      logger.info(`Like added: user=${userId}, quote=${quoteId}`);

      return {
        liked: true,
        likes_count: updateResult.rows[0]?.likes_count || 1,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to add like', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 좋아요 제거
   * @param userId 사용자 ID
   * @param quoteId 명언 ID
   * @returns 좋아요 상태 및 카운트
   */
  async removeLike(userId: number, quoteId: number): Promise<LikeResponse> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 좋아요 삭제
      const deleteResult = await client.query(
        `DELETE FROM author_clock.user_likes
         WHERE user_id = $1 AND quote_id = $2
         RETURNING id`,
        [userId, quoteId]
      );

      if (deleteResult.rows.length === 0) {
        // 좋아요가 없는 경우, 현재 카운트만 반환
        const countResult = await client.query(
          `SELECT likes_count FROM author_clock.quotes WHERE id = $1`,
          [quoteId]
        );

        await client.query('COMMIT');
        return {
          liked: false,
          likes_count: countResult.rows[0]?.likes_count || 0,
        };
      }

      // quotes 테이블의 likes_count 감소
      const updateResult = await client.query(
        `UPDATE author_clock.quotes
         SET likes_count = GREATEST(likes_count - 1, 0)
         WHERE id = $1
         RETURNING likes_count`,
        [quoteId]
      );

      await client.query('COMMIT');

      logger.info(`Like removed: user=${userId}, quote=${quoteId}`);

      return {
        liked: false,
        likes_count: updateResult.rows[0]?.likes_count || 0,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Failed to remove like', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 사용자가 좋아요한 명언 목록 조회
   * @param userId 사용자 ID
   * @param limit 조회 개수 (기본 50)
   * @param offset 시작 위치 (기본 0)
   * @returns 좋아요한 명언 목록
   */
  async getLikedQuotes(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ quotes: LikedQuote[]; total: number }> {
    try {
      // 좋아요한 명언 목록 조회
      const quotesResult = await this.pool.query(
        `SELECT
           q.id, q.text, q.author, q.source, q.language, q.category, q.likes_count,
           ul.created_at as liked_at
         FROM author_clock.user_likes ul
         INNER JOIN author_clock.quotes q ON ul.quote_id = q.id
         WHERE ul.user_id = $1
         ORDER BY ul.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      // 전체 개수 조회
      const countResult = await this.pool.query(
        `SELECT COUNT(*) as total
         FROM author_clock.user_likes
         WHERE user_id = $1`,
        [userId]
      );

      return {
        quotes: quotesResult.rows,
        total: parseInt(countResult.rows[0]?.total || '0'),
      };
    } catch (error) {
      logger.error('Failed to get liked quotes', error);
      throw error;
    }
  }

  /**
   * 특정 명언에 좋아요 여부 확인
   * @param userId 사용자 ID
   * @param quoteId 명언 ID
   * @returns 좋아요 여부
   */
  async isLiked(userId: number, quoteId: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `SELECT id FROM author_clock.user_likes
         WHERE user_id = $1 AND quote_id = $2`,
        [userId, quoteId]
      );

      return result.rows.length > 0;
    } catch (error) {
      logger.error('Failed to check like status', error);
      throw error;
    }
  }

  /**
   * 여러 명언의 좋아요 여부 일괄 조회 (최적화)
   * @param userId 사용자 ID
   * @param quoteIds 명언 ID 목록
   * @returns 좋아요한 명언 ID Set
   */
  async getLikedQuoteIds(userId: number, quoteIds: number[]): Promise<Set<number>> {
    if (quoteIds.length === 0) {
      return new Set();
    }

    try {
      const result = await this.pool.query(
        `SELECT quote_id FROM author_clock.user_likes
         WHERE user_id = $1 AND quote_id = ANY($2)`,
        [userId, quoteIds]
      );

      return new Set(result.rows.map(row => row.quote_id));
    } catch (error) {
      logger.error('Failed to get liked quote IDs', error);
      throw error;
    }
  }

  /**
   * 명언의 좋아요 개수 조회
   * @param quoteId 명언 ID
   * @returns 좋아요 개수
   */
  async getLikesCount(quoteId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT likes_count FROM author_clock.quotes WHERE id = $1`,
        [quoteId]
      );

      return result.rows[0]?.likes_count || 0;
    } catch (error) {
      logger.error('Failed to get likes count', error);
      throw error;
    }
  }
}
