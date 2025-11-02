import { Router } from 'express';
import * as quoteController from '../controllers/quoteController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateQuery, schemas } from '../middleware/validator';
import { optionalSessionAuth } from '../middleware/sessionAuth';

const router = Router();

/**
 * GET /api/quotes/today
 * Get today's quote for a specific language
 */
router.get(
  '/today',
  optionalSessionAuth,
  validateQuery(schemas.language),
  asyncHandler(quoteController.getTodayQuote)
);

/**
 * GET /api/quotes/random
 * Get a random quote for a specific language
 */
router.get(
  '/random',
  optionalSessionAuth,
  validateQuery(schemas.language),
  asyncHandler(quoteController.getRandomQuote)
);

/**
 * GET /api/quotes
 * Get list of quotes with pagination and filters
 */
router.get(
  '/',
  optionalSessionAuth,
  validateQuery(schemas.pagination),
  asyncHandler(quoteController.getQuotes)
);

/**
 * GET /api/quotes/:id
 * Get a specific quote by ID
 */
router.get('/:id', optionalSessionAuth, asyncHandler(quoteController.getQuoteById));

/**
 * POST /api/quotes
 * Create a new quote (Phase 2 - requires authentication)
 */
// router.post(
//   '/',
//   validate(schemas.createQuote),
//   asyncHandler(quoteController.createQuote)
// );

/**
 * POST /api/quotes/today/refresh
 * Refresh today's quote cache (admin only)
 */
// router.post(
//   '/today/refresh',
//   validateQuery(schemas.language),
//   asyncHandler(quoteController.refreshTodayQuote)
// );

export default router;
