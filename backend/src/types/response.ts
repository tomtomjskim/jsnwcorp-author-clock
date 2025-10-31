/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
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

/**
 * Paginated response
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
  };
}
