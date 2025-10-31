import { query } from '../config/database';
import {
  Quote,
  CreateQuoteInput,
  QuoteFilters,
  DailyQuote,
} from '../types/quote';
import { logger } from '../utils/logger';

export class QuoteRepository {
  /**
   * Get quote by ID
   */
  async findById(id: number): Promise<Quote | null> {
    try {
      const result = await query(
        'SELECT * FROM quotes WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding quote by ID', { id, error });
      throw error;
    }
  }

  /**
   * Get all quotes with filters
   */
  async findAll(filters: QuoteFilters = {}): Promise<Quote[]> {
    try {
      const {
        language,
        category,
        is_approved = true,
        limit = 20,
        offset = 0,
      } = filters;

      let queryText = 'SELECT * FROM quotes WHERE is_approved = $1';
      const params: any[] = [is_approved];
      let paramIndex = 2;

      if (language) {
        queryText += ` AND language = $${paramIndex}`;
        params.push(language);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      logger.error('Error finding all quotes', { filters, error });
      throw error;
    }
  }

  /**
   * Get random quote by language
   */
  async findRandom(language: string = 'ko'): Promise<Quote | null> {
    try {
      const result = await query(
        `SELECT * FROM quotes
         WHERE language = $1 AND is_approved = true
         ORDER BY RANDOM()
         LIMIT 1`,
        [language]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding random quote', { language, error });
      throw error;
    }
  }

  /**
   * Get today's quote for a specific language
   */
  async findTodayQuote(
    date: Date,
    language: string = 'ko'
  ): Promise<Quote | null> {
    try {
      const dateStr = date.toISOString().split('T')[0];

      const result = await query(
        `SELECT q.* FROM quotes q
         INNER JOIN daily_quotes dq ON q.id = dq.quote_id
         WHERE dq.date = $1 AND dq.language = $2`,
        [dateStr, language]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding today quote', { date, language, error });
      throw error;
    }
  }

  /**
   * Create a new quote
   */
  async create(input: CreateQuoteInput): Promise<Quote> {
    try {
      const {
        text,
        author,
        source = null,
        source_url = null,
        language = 'ko',
        category = null,
        is_public_domain = true,
      } = input;

      const result = await query(
        `INSERT INTO quotes (text, author, source, source_url, language, category, is_public_domain)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [text, author, source, source_url, language, category, is_public_domain]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating quote', { input, error });
      throw error;
    }
  }

  /**
   * Update quote views count
   */
  async incrementViews(id: number): Promise<void> {
    try {
      await query('UPDATE quotes SET views_count = views_count + 1 WHERE id = $1', [
        id,
      ]);
    } catch (error) {
      logger.error('Error incrementing views', { id, error });
      throw error;
    }
  }

  /**
   * Update quote likes count
   */
  async incrementLikes(id: number): Promise<void> {
    try {
      await query('UPDATE quotes SET likes_count = likes_count + 1 WHERE id = $1', [
        id,
      ]);
    } catch (error) {
      logger.error('Error incrementing likes', { id, error });
      throw error;
    }
  }

  /**
   * Get total count with filters
   */
  async count(filters: QuoteFilters = {}): Promise<number> {
    try {
      const { language, category, is_approved = true } = filters;

      let queryText = 'SELECT COUNT(*) as count FROM quotes WHERE is_approved = $1';
      const params: any[] = [is_approved];
      let paramIndex = 2;

      if (language) {
        queryText += ` AND language = $${paramIndex}`;
        params.push(language);
        paramIndex++;
      }

      if (category) {
        queryText += ` AND category = $${paramIndex}`;
        params.push(category);
      }

      const result = await query(queryText, params);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      logger.error('Error counting quotes', { filters, error });
      throw error;
    }
  }

  /**
   * Set daily quote for a specific date and language
   */
  async setDailyQuote(
    quoteId: number,
    date: Date,
    language: string = 'ko'
  ): Promise<DailyQuote> {
    try {
      const dateStr = date.toISOString().split('T')[0];

      const result = await query(
        `INSERT INTO daily_quotes (quote_id, date, language)
         VALUES ($1, $2, $3)
         ON CONFLICT (date, language) DO UPDATE
         SET quote_id = EXCLUDED.quote_id
         RETURNING *`,
        [quoteId, dateStr, language]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error setting daily quote', {
        quoteId,
        date,
        language,
        error,
      });
      throw error;
    }
  }
}

export default new QuoteRepository();
