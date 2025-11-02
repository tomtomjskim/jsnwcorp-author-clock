import { Pool } from 'pg';
import { logger } from '../utils/logger';

export interface BookmarkResponse {
  bookmarked: boolean;
}

export interface BookmarkedQuote {
  id: number;
  text: string;
  author: string;
  source: string | null;
  language: string;
  category: string | null;
  likes_count: number;
  bookmarked_at: Date;
}

/**
 * 북마크 관리 서비스
 * - 사용자별 북마크 추가/제거
 * - 북마크 목록 조회
 */
export class BookmarkService {
  constructor(private pool: Pool) {}

  /**
   * 북마크 추가
   * @param userId 사용자 ID
   * @param quoteId 명언 ID
   * @returns 북마크 상태
   */
  async addBookmark(userId: number, quoteId: number): Promise<BookmarkResponse> {
    try {
      // 이미 북마크했는지 확인
      const existingBookmark = await this.pool.query(
        `SELECT id FROM author_clock.user_bookmarks
         WHERE user_id = $1 AND quote_id = $2`,
        [userId, quoteId]
      );

      if (existingBookmark.rows.length > 0) {
        // 이미 북마크한 경우, 그대로 반환
        return { bookmarked: true };
      }

      // 북마크 추가
      await this.pool.query(
        `INSERT INTO author_clock.user_bookmarks (user_id, quote_id)
         VALUES ($1, $2)`,
        [userId, quoteId]
      );

      logger.info(`Bookmark added: user=${userId}, quote=${quoteId}`);

      return { bookmarked: true };
    } catch (error) {
      logger.error('Failed to add bookmark', error);
      throw error;
    }
  }

  /**
   * 북마크 제거
   * @param userId 사용자 ID
   * @param quoteId 명언 ID
   * @returns 북마크 상태
   */
  async removeBookmark(userId: number, quoteId: number): Promise<BookmarkResponse> {
    try {
      // 북마크 삭제
      const deleteResult = await this.pool.query(
        `DELETE FROM author_clock.user_bookmarks
         WHERE user_id = $1 AND quote_id = $2
         RETURNING id`,
        [userId, quoteId]
      );

      if (deleteResult.rows.length === 0) {
        // 북마크가 없는 경우에도 성공 처리
        return { bookmarked: false };
      }

      logger.info(`Bookmark removed: user=${userId}, quote=${quoteId}`);

      return { bookmarked: false };
    } catch (error) {
      logger.error('Failed to remove bookmark', error);
      throw error;
    }
  }

  /**
   * 사용자의 북마크 목록 조회
   * @param userId 사용자 ID
   * @param limit 조회 개수 (기본 50)
   * @param offset 시작 위치 (기본 0)
   * @returns 북마크한 명언 목록
   */
  async getBookmarks(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ quotes: BookmarkedQuote[]; total: number }> {
    try {
      // 북마크한 명언 목록 조회
      const quotesResult = await this.pool.query(
        `SELECT
           q.id, q.text, q.author, q.source, q.language, q.category, q.likes_count,
           ub.created_at as bookmarked_at
         FROM author_clock.user_bookmarks ub
         INNER JOIN author_clock.quotes q ON ub.quote_id = q.id
         WHERE ub.user_id = $1
         ORDER BY ub.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      // 전체 개수 조회
      const countResult = await this.pool.query(
        `SELECT COUNT(*) as total
         FROM author_clock.user_bookmarks
         WHERE user_id = $1`,
        [userId]
      );

      return {
        quotes: quotesResult.rows,
        total: parseInt(countResult.rows[0]?.total || '0'),
      };
    } catch (error) {
      logger.error('Failed to get bookmarks', error);
      throw error;
    }
  }

  /**
   * 특정 명언에 북마크 여부 확인
   * @param userId 사용자 ID
   * @param quoteId 명언 ID
   * @returns 북마크 여부
   */
  async isBookmarked(userId: number, quoteId: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `SELECT id FROM author_clock.user_bookmarks
         WHERE user_id = $1 AND quote_id = $2`,
        [userId, quoteId]
      );

      return result.rows.length > 0;
    } catch (error) {
      logger.error('Failed to check bookmark status', error);
      throw error;
    }
  }

  /**
   * 여러 명언의 북마크 여부 일괄 조회 (최적화)
   * @param userId 사용자 ID
   * @param quoteIds 명언 ID 목록
   * @returns 북마크한 명언 ID Set
   */
  async getBookmarkedQuoteIds(userId: number, quoteIds: number[]): Promise<Set<number>> {
    if (quoteIds.length === 0) {
      return new Set();
    }

    try {
      const result = await this.pool.query(
        `SELECT quote_id FROM author_clock.user_bookmarks
         WHERE user_id = $1 AND quote_id = ANY($2)`,
        [userId, quoteIds]
      );

      return new Set(result.rows.map(row => row.quote_id));
    } catch (error) {
      logger.error('Failed to get bookmarked quote IDs', error);
      throw error;
    }
  }

  /**
   * 북마크 개수 조회
   * @param userId 사용자 ID
   * @returns 북마크 개수
   */
  async getBookmarkCount(userId: number): Promise<number> {
    try {
      const result = await this.pool.query(
        `SELECT COUNT(*) as total
         FROM author_clock.user_bookmarks
         WHERE user_id = $1`,
        [userId]
      );

      return parseInt(result.rows[0]?.total || '0');
    } catch (error) {
      logger.error('Failed to get bookmark count', error);
      throw error;
    }
  }
}
