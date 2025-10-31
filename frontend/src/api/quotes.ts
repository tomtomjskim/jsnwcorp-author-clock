import { apiClient } from './client';
import type { Quote, ApiResponse, Language } from '../types/quote';

export const quotesApi = {
  /**
   * Get today's quote
   */
  async getTodayQuote(language: Language = 'ko'): Promise<Quote> {
    const response = await apiClient.get<ApiResponse<Quote>>('/quotes/today', {
      params: { language },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch today quote');
    }

    return response.data.data;
  },

  /**
   * Get random quote
   */
  async getRandomQuote(language: Language = 'ko'): Promise<Quote> {
    const response = await apiClient.get<ApiResponse<Quote>>('/quotes/random', {
      params: { language },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch random quote');
    }

    return response.data.data;
  },

  /**
   * Get quote by ID
   */
  async getQuoteById(id: number): Promise<Quote> {
    const response = await apiClient.get<ApiResponse<Quote>>(`/quotes/${id}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch quote');
    }

    return response.data.data;
  },
};

export default quotesApi;
