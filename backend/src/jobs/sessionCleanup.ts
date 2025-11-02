import cron from 'node-cron';
import { SessionService } from '../services/SessionService';
import pool from '../config/database';
import { logger } from '../utils/logger';

const sessionService = new SessionService(pool);

/**
 * 매일 자정에 오래된 세션 정리
 * - 30일 이상 미접속 세션 삭제
 * - 연관된 익명 사용자도 자동 삭제 (CASCADE)
 */
export function startSessionCleanupJob() {
  // 매일 오전 3시에 실행 (서버 부하가 적은 시간)
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Starting session cleanup job...');

      const deletedCount = await sessionService.cleanupOldSessions();

      logger.info(`Session cleanup completed: ${deletedCount} sessions deleted`);
    } catch (error) {
      logger.error('Session cleanup job failed:', error);
    }
  });

  logger.info('Session cleanup job scheduled: Daily at 3:00 AM');
}

/**
 * 서버 시작 시 한 번 실행 (초기 정리)
 */
export async function runInitialCleanup() {
  try {
    logger.info('Running initial session cleanup...');

    const deletedCount = await sessionService.cleanupOldSessions();

    logger.info(`Initial cleanup completed: ${deletedCount} sessions deleted`);
  } catch (error) {
    logger.error('Initial session cleanup failed:', error);
  }
}
