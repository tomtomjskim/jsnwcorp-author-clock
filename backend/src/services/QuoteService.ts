import quoteRepository, { QuoteRepository } from '../repositories/QuoteRepository';
import * as cache from '../config/redis';
import { Quote, QuoteFilters, CreateQuoteInput } from '../types/quote';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export class QuoteService {
  constructor(private repository: QuoteRepository) {}

  /**
   * Get today's quote with caching
   */
  async getTodayQuote(language: string = 'ko'): Promise<Quote | null> {
    try {
      const today = new Date();
      const cacheKey = `daily:quote:${language}:${today.toISOString().split('T')[0]}`;

      // Try to get from cache
      const cached = await cache.getJSON<Quote>(cacheKey);
      if (cached) {
        logger.debug('Daily quote from cache', { language });
        return cached;
      }

      // Get from database
      let quote = await this.repository.findTodayQuote(today, language);

      // If no daily quote set, pick a random one and set it
      if (!quote) {
        logger.info('No daily quote found, selecting random', { language });
        quote = await this.repository.findRandom(language);

        if (quote) {
          // Set as today's quote
          await this.repository.setDailyQuote(quote.id, today, language);
        }
      }

      // Cache the result
      if (quote) {
        await cache.setJSON(cacheKey, quote, config.cache.dailyQuoteTTL);
        // Increment views
        await this.repository.incrementViews(quote.id);
      }

      return quote;
    } catch (error) {
      logger.error('Error getting today quote', { language, error });
      throw error;
    }
  }

  /**
   * Get random quote with caching
   */
  async getRandomQuote(language: string = 'ko'): Promise<Quote | null> {
    try {
      const quote = await this.repository.findRandom(language);

      if (quote) {
        // Increment views
        await this.repository.incrementViews(quote.id);
      }

      return quote;
    } catch (error) {
      logger.error('Error getting random quote', { language, error });
      throw error;
    }
  }

  /**
   * Get quote by ID
   */
  async getQuoteById(id: number): Promise<Quote | null> {
    try {
      const quote = await this.repository.findById(id);

      if (quote) {
        // Increment views
        await this.repository.incrementViews(quote.id);
      }

      return quote;
    } catch (error) {
      logger.error('Error getting quote by ID', { id, error });
      throw error;
    }
  }

  /**
   * Get quotes list with pagination
   */
  async getQuotes(filters: QuoteFilters) {
    try {
      const [quotes, total] = await Promise.all([
        this.repository.findAll(filters),
        this.repository.count(filters),
      ]);

      const limit = filters.limit || 20;
      const offset = filters.offset || 0;

      return {
        quotes,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + quotes.length < total,
        },
      };
    } catch (error) {
      logger.error('Error getting quotes list', { filters, error });
      throw error;
    }
  }

  /**
   * Create a new quote
   */
  async createQuote(input: CreateQuoteInput): Promise<Quote> {
    try {
      const quote = await this.repository.create(input);
      logger.info('Quote created', { id: quote.id });
      return quote;
    } catch (error) {
      logger.error('Error creating quote', { input, error });
      throw error;
    }
  }

  /**
   * Refresh today's quote cache (for manual refresh)
   */
  async refreshTodayQuoteCache(language: string = 'ko'): Promise<void> {
    try {
      const today = new Date();
      const cacheKey = `daily:quote:${language}:${today.toISOString().split('T')[0]}`;

      // Delete cache
      await cache.del(cacheKey);

      // Regenerate cache
      await this.getTodayQuote(language);

      logger.info('Today quote cache refreshed', { language });
    } catch (error) {
      logger.error('Error refreshing today quote cache', { language, error });
      throw error;
    }
  }
}

export default new QuoteService(quoteRepository);
