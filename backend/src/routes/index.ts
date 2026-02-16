import { Router, Request, Response } from 'express';
import quotesRouter from './quotes';
import likesRouter from './likes';
import bookmarksRouter from './bookmarks';
import seoRouter from './seo';
import { testConnection } from '../config/database';
import redisClient from '../config/redis';
import { HealthCheckResponse } from '../types/response';
import { config } from '../config/env';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    // Test Redis connection
    const redisConnected = redisClient.isOpen;

    const status: HealthCheckResponse = {
      status: dbConnected && redisConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        redis: redisConnected ? 'connected' : 'disconnected',
      },
    };

    const statusCode = status.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(status);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'disconnected',
        redis: 'disconnected',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * API info endpoint
 * GET /api
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: config.appName,
    version: config.appVersion,
    environment: config.nodeEnv,
    endpoints: {
      health: '/api/health',
      quotes: {
        today: '/api/quotes/today?language=ko',
        random: '/api/quotes/random?language=ko',
        list: '/api/quotes?limit=20&offset=0',
        byId: '/api/quotes/:id',
        addLike: 'POST /api/quotes/:id/like',
        removeLike: 'DELETE /api/quotes/:id/like',
        likeStatus: '/api/quotes/:id/like-status',
        likedQuotes: '/api/quotes/liked?limit=50&offset=0',
        addBookmark: 'POST /api/quotes/:id/bookmark',
        removeBookmark: 'DELETE /api/quotes/:id/bookmark',
        bookmarkStatus: '/api/quotes/:id/bookmark-status',
      },
      bookmarks: {
        list: '/api/bookmarks?limit=50&offset=0',
        count: '/api/bookmarks/count',
      },
      seo: {
        sitemap: '/api/seo/sitemap',
        metadata: '/api/seo/meta/:quoteId',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Mount routes
 * IMPORTANT: Order matters! Specific routes must be mounted BEFORE parameterized routes.
 * Likes (/liked) and bookmarks (/bookmark) must come before quotes (/:id)
 */
router.use('/quotes', likesRouter); // Likes routes mounted under /quotes (BEFORE quotes router)
router.use('/quotes', bookmarksRouter); // Bookmark routes mounted under /quotes (BEFORE quotes router)
router.use('/quotes', quotesRouter); // Quotes router with /:id must be LAST
router.use('/bookmarks', bookmarksRouter); // Bookmark list routes
router.use('/seo', seoRouter); // SEO routes for sitemap and metadata

export default router;
