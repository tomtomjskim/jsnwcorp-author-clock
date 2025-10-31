/**
 * Quote entity from database
 */
export interface Quote {
  id: number;
  text: string;
  author: string;
  source: string | null;
  source_url: string | null;
  language: string;
  category: string | null;
  is_public_domain: boolean;
  is_approved: boolean;
  submitted_by: number | null;
  likes_count: number;
  views_count: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Quote creation input
 */
export interface CreateQuoteInput {
  text: string;
  author: string;
  source?: string | null;
  source_url?: string | null;
  language?: string;
  category?: string | null;
  is_public_domain?: boolean;
}

/**
 * Quote query filters
 */
export interface QuoteFilters {
  language?: string;
  category?: string;
  is_approved?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Daily quote entity
 */
export interface DailyQuote {
  id: number;
  quote_id: number;
  date: Date;
  language: string;
  created_at: Date;
}

/**
 * Quote with daily quote info
 */
export interface QuoteWithDaily extends Quote {
  is_today?: boolean;
  daily_quote_date?: Date;
}
