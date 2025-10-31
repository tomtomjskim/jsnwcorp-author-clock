import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment configuration
export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'maindb',
    user: process.env.POSTGRES_USER || 'author_clock_user',
    password: process.env.POSTGRES_PASSWORD || '',
    schema: process.env.POSTGRES_SCHEMA || 'author_clock',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Cache TTL (in seconds)
  cache: {
    dailyQuoteTTL: parseInt(process.env.CACHE_TTL_DAILY_QUOTE || '86400', 10), // 24 hours
    randomQuoteTTL: parseInt(process.env.CACHE_TTL_RANDOM_QUOTE || '3600', 10), // 1 hour
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // App Info
  appName: 'Author Clock API',
  appVersion: '1.0.0',
} as const;

// Validate required environment variables
export function validateEnv(): void {
  const required = [
    'POSTGRES_HOST',
    'POSTGRES_DB',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'REDIS_HOST',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

export default config;
