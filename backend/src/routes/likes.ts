import { Router, Request, Response } from 'express';
import { LikeService } from '../services/LikeService';
import { sessionAuth } from '../middleware/sessionAuth';
import pool from '../config/database';
import { logger } from '../utils/logger';

const router = Router();
const likeService = new LikeService(pool);

/**
 * GET /api/quotes/liked
 * 내가 좋아요한 명언 목록
 * NOTE: Must be defined BEFORE /:id routes to avoid route matching issues
 */
router.get('/liked', sessionAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 100',
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        success: false,
        error: 'Offset must be non-negative',
      });
    }

    const result = await likeService.getLikedQuotes(userId, limit, offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching liked quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch liked quotes',
    });
  }
});

/**
 * POST /api/quotes/:id/like
 * 좋아요 추가
 */
router.post('/:id/like', sessionAuth, async (req: Request, res: Response) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.userId!; // sessionAuth에서 주입됨

    if (isNaN(quoteId) || quoteId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote ID',
      });
    }

    const result = await likeService.addLike(userId, quoteId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error adding like:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add like',
    });
  }
});

/**
 * DELETE /api/quotes/:id/like
 * 좋아요 제거
 */
router.delete('/:id/like', sessionAuth, async (req: Request, res: Response) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(quoteId) || quoteId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote ID',
      });
    }

    const result = await likeService.removeLike(userId, quoteId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error removing like:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove like',
    });
  }
});

/**
 * GET /api/quotes/:id/like-status
 * 특정 명언의 좋아요 상태 확인
 */
router.get('/:id/like-status', sessionAuth, async (req: Request, res: Response) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(quoteId) || quoteId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote ID',
      });
    }

    const isLiked = await likeService.isLiked(userId, quoteId);
    const likesCount = await likeService.getLikesCount(quoteId);

    res.json({
      success: true,
      data: {
        liked: isLiked,
        likes_count: likesCount,
      },
    });
  } catch (error) {
    logger.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check like status',
    });
  }
});

export default router;
