import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/SessionService';
import pool from '../config/database';
import { logger } from '../utils/logger';

// SessionService 인스턴스
const sessionService = new SessionService(pool);

// Request에 userId 추가
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      sessionId?: string;
    }
  }
}

/**
 * 세션 인증 미들웨어
 * X-Session-ID 헤더에서 세션 ID를 읽고 user_id를 req에 추가
 */
export async function sessionAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        error: 'Session ID is required. Please provide X-Session-ID header.'
      });
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID format. Must be a valid UUID.'
      });
    }

    // 세션 ID로 user_id 조회/생성
    const userId = await sessionService.getOrCreateUserBySession(sessionId);

    // Request에 userId와 sessionId 추가
    req.userId = userId;
    req.sessionId = sessionId;

    next();
  } catch (error) {
    logger.error('Session auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Session authentication failed'
    });
  }
}

/**
 * 선택적 세션 인증 미들웨어
 * 세션 ID가 있으면 userId를 추가하고, 없으면 그냥 통과
 */
export async function optionalSessionAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    if (sessionId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(sessionId)) {
        const userId = await sessionService.getOrCreateUserBySession(sessionId);
        req.userId = userId;
        req.sessionId = sessionId;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional session auth error:', error);
    // 에러가 있어도 계속 진행
    next();
  }
}
