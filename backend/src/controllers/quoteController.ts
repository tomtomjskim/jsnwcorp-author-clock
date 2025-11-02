import { Request, Response } from 'express';
import quoteService from '../services/QuoteService';
import { LikeService } from '../services/LikeService';
import { BookmarkService } from '../services/BookmarkService';
import pool from '../config/database';
import { ApiResponse, PaginatedResponse } from '../types/response';
import { logger } from '../utils/logger';

const likeService = new LikeService(pool);
const bookmarkService = new BookmarkService(pool);

/**
 * Get today's quote
 * GET /api/quotes/today
 */
export async function getTodayQuote(req: Request, res: Response) {
  const language = (req.query.language as string) || 'ko';

  const quote = await quoteService.getTodayQuote(language);

  if (!quote) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'No quote available for today',
        code: 'NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(404).json(response);
  }

  // Add isLiked and isBookmarked fields if user is authenticated
  let isLiked = false;
  let isBookmarked = false;
  if (req.userId) {
    isLiked = await likeService.isLiked(req.userId, quote.id);
    isBookmarked = await bookmarkService.isBookmarked(req.userId, quote.id);
  }

  const response: ApiResponse = {
    success: true,
    data: {
      ...quote,
      isLiked,
      isBookmarked,
    },
    meta: {
      timestamp: new Date().toISOString(),
      isToday: true,
    },
  };

  res.json(response);
}

/**
 * Get random quote
 * GET /api/quotes/random
 */
export async function getRandomQuote(req: Request, res: Response) {
  const language = (req.query.language as string) || 'ko';

  const quote = await quoteService.getRandomQuote(language);

  if (!quote) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'No quote available',
        code: 'NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(404).json(response);
  }

  // Add isLiked and isBookmarked fields if user is authenticated
  let isLiked = false;
  let isBookmarked = false;
  if (req.userId) {
    isLiked = await likeService.isLiked(req.userId, quote.id);
    isBookmarked = await bookmarkService.isBookmarked(req.userId, quote.id);
  }

  const response: ApiResponse = {
    success: true,
    data: {
      ...quote,
      isLiked,
      isBookmarked,
    },
    meta: {
      timestamp: new Date().toISOString(),
      isRandom: true,
    },
  };

  res.json(response);
}

/**
 * Get quote by ID
 * GET /api/quotes/:id
 */
export async function getQuoteById(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Invalid quote ID',
        code: 'INVALID_ID',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(400).json(response);
  }

  const quote = await quoteService.getQuoteById(id);

  if (!quote) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: 'Quote not found',
        code: 'NOT_FOUND',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(404).json(response);
  }

  // Add isLiked and isBookmarked fields if user is authenticated
  let isLiked = false;
  let isBookmarked = false;
  if (req.userId) {
    isLiked = await likeService.isLiked(req.userId, quote.id);
    isBookmarked = await bookmarkService.isBookmarked(req.userId, quote.id);
  }

  const response: ApiResponse = {
    success: true,
    data: {
      ...quote,
      isLiked,
      isBookmarked,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
}

/**
 * Get quotes list
 * GET /api/quotes
 */
export async function getQuotes(req: Request, res: Response) {
  const filters = {
    language: req.query.language as string | undefined,
    category: req.query.category as string | undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
  };

  const result = await quoteService.getQuotes(filters);

  const response: PaginatedResponse = {
    success: true,
    data: result.quotes,
    pagination: result.pagination,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
}

/**
 * Create a new quote (for Phase 2 - admin only)
 * POST /api/quotes
 */
export async function createQuote(req: Request, res: Response) {
  const quote = await quoteService.createQuote(req.body);

  const response: ApiResponse = {
    success: true,
    data: quote,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(201).json(response);
}

/**
 * Refresh today's quote cache
 * POST /api/quotes/today/refresh
 */
export async function refreshTodayQuote(req: Request, res: Response) {
  const language = (req.query.language as string) || 'ko';

  await quoteService.refreshTodayQuoteCache(language);

  const response: ApiResponse = {
    success: true,
    data: {
      message: 'Today quote cache refreshed',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.json(response);
}
