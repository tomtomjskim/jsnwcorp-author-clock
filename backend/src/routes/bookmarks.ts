import { Router, Request, Response } from 'express';
import { BookmarkService } from '../services/BookmarkService';
import { sessionAuth } from '../middleware/sessionAuth';
import pool from '../config/database';
import { logger } from '../utils/logger';

const router = Router();
const bookmarkService = new BookmarkService(pool);

/**
 * POST /api/quotes/:id/bookmark
 * 북마크 추가
 */
router.post('/:id/bookmark', sessionAuth, async (req: Request, res: Response) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.userId!; // sessionAuth에서 주입됨

    if (isNaN(quoteId) || quoteId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote ID',
      });
    }

    const result = await bookmarkService.addBookmark(userId, quoteId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error adding bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add bookmark',
    });
  }
});

/**
 * DELETE /api/quotes/:id/bookmark
 * 북마크 제거
 */
router.delete('/:id/bookmark', sessionAuth, async (req: Request, res: Response) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(quoteId) || quoteId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote ID',
      });
    }

    const result = await bookmarkService.removeBookmark(userId, quoteId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove bookmark',
    });
  }
});

/**
 * GET /api/bookmarks
 * 내 북마크 목록
 */
router.get('/', sessionAuth, async (req: Request, res: Response) => {
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

    const result = await bookmarkService.getBookmarks(userId, limit, offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookmarks',
    });
  }
});

/**
 * GET /api/quotes/:id/bookmark-status
 * 특정 명언의 북마크 상태 확인
 */
router.get('/:id/bookmark-status', sessionAuth, async (req: Request, res: Response) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(quoteId) || quoteId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quote ID',
      });
    }

    const isBookmarked = await bookmarkService.isBookmarked(userId, quoteId);

    res.json({
      success: true,
      data: {
        bookmarked: isBookmarked,
      },
    });
  } catch (error) {
    logger.error('Error checking bookmark status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check bookmark status',
    });
  }
});

/**
 * GET /api/bookmarks/count
 * 북마크 개수 조회
 */
router.get('/count', sessionAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const count = await bookmarkService.getBookmarkCount(userId);

    res.json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    logger.error('Error getting bookmark count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookmark count',
    });
  }
});

export default router;
