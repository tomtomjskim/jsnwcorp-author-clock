import { Pool } from 'pg';
import { logger } from '../utils/logger';

export class SessionService {
  constructor(private pool: Pool) {}

  /**
   * 익명 세션 ID로 user_id 조회 또는 생성
   */
  async getOrCreateUserBySession(sessionId: string): Promise<number> {
    try {
      // 1. 기존 세션 조회
      const existingSession = await this.pool.query(
        `SELECT user_id, last_seen
         FROM author_clock.anonymous_sessions
         WHERE session_id = $1`,
        [sessionId]
      );

      if (existingSession.rows.length > 0) {
        const userId = existingSession.rows[0].user_id;

        // last_seen 업데이트 (5분마다만)
        const lastSeen = new Date(existingSession.rows[0].last_seen);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastSeen.getTime()) / 1000 / 60;

        if (diffMinutes > 5) {
          await this.pool.query(
            `UPDATE author_clock.anonymous_sessions
             SET last_seen = NOW()
             WHERE session_id = $1`,
            [sessionId]
          );
        }

        return userId;
      }

      // 2. 새로운 익명 사용자 생성
      const username = `anon_${sessionId.substring(0, 8)}`;
      const email = `${username}@anonymous.local`;

      const newUser = await this.pool.query(
        `INSERT INTO author_clock.users
         (username, email, password_hash, display_name, preferred_language)
         VALUES ($1, $2, '', $3, 'ko')
         RETURNING id`,
        [username, email, 'Anonymous User']
      );

      const userId = newUser.rows[0].id;

      // 3. 세션 매핑 생성
      await this.pool.query(
        `INSERT INTO author_clock.anonymous_sessions
         (session_id, user_id, created_at, last_seen)
         VALUES ($1, $2, NOW(), NOW())`,
        [sessionId, userId]
      );

      logger.info(`Created new anonymous user: ${userId} (session: ${sessionId})`);
      return userId;

    } catch (error) {
      logger.error('Error in getOrCreateUserBySession:', error);
      throw error;
    }
  }

  /**
   * 세션 정보 조회
   */
  async getSessionInfo(sessionId: string) {
    try {
      const result = await this.pool.query(
        `SELECT s.id, s.session_id, s.user_id, s.created_at, s.last_seen,
                u.username, u.display_name, u.preferred_language
         FROM author_clock.anonymous_sessions s
         JOIN author_clock.users u ON s.user_id = u.id
         WHERE s.session_id = $1`,
        [sessionId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error in getSessionInfo:', error);
      throw error;
    }
  }

  /**
   * 오래된 세션 정리 (30일 이상 미접속)
   */
  async cleanupOldSessions() {
    try {
      const result = await this.pool.query(
        `DELETE FROM author_clock.anonymous_sessions
         WHERE last_seen < NOW() - INTERVAL '30 days'
         RETURNING session_id`
      );

      logger.info(`Cleaned up ${result.rowCount} old sessions`);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error in cleanupOldSessions:', error);
      throw error;
    }
  }
}
