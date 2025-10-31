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
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

export type Language = 'ko' | 'en' | 'ja' | 'zh';
