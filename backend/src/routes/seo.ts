import { Router, Request, Response } from 'express';
import { query } from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/seo/sitemap
 * Get sitemap data (quotes and authors for dynamic sitemap generation)
 */
router.get(
  '/sitemap',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get approved quotes with high engagement (top 200)
      const quotes = await query(
        `SELECT id, updated_at
         FROM quotes
         WHERE is_approved = true AND is_public_domain = true
         ORDER BY likes_count DESC
         LIMIT 200`
      );

      // Get unique authors from approved quotes
      const authors = await query(
        `SELECT DISTINCT author
         FROM quotes
         WHERE is_approved = true`
      );

      res.json({
        success: true,
        data: {
          quotes: quotes.rows,
          authors: authors.rows,
        },
      });
    } catch (error) {
      logger.error('Failed to generate sitemap data', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate sitemap data',
      });
    }
  })
);

/**
 * GET /api/seo/meta/:quoteId
 * Get SEO metadata for a specific quote
 */
router.get(
  '/meta/:quoteId',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { quoteId } = req.params;

      const result = await query(
        `SELECT id, text, author, source, language
         FROM quotes
         WHERE id = $1`,
        [quoteId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Quote not found',
        });
      }

      const quote = result.rows[0];
      const title = `${quote.author}의 명언 - Author Clock`;
      const description =
        quote.text.length > 160
          ? quote.text.slice(0, 157) + '...'
          : quote.text;

      res.json({
        success: true,
        data: {
          title,
          description,
          ogUrl: `https://clock.jsnetworkcorp.com/quotes/${quote.id}`,
          author: quote.author,
          source: quote.source,
          language: quote.language,
        },
      });
    } catch (error) {
      logger.error('Failed to fetch quote metadata', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch quote metadata',
      });
    }
  })
);

export default router;
