import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config, validateEnv } from './config/env';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { startSessionCleanupJob, runInitialCleanup } from './jobs/sessionCleanup';

// Validate environment variables
try {
  validateEnv();
  logger.info('Environment variables validated');
} catch (error) {
  logger.error('Environment validation failed', error);
  process.exit(1);
}

// Create Express application
const app: Application = express();

// Trust proxy (for nginx)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
); // CORS
app.use(compression()); // Gzip compression
app.use(express.json()); // JSON parser
app.use(express.urlencoded({ extended: true })); // URL-encoded parser

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Mount API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Author Clock API',
    version: config.appVersion,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to database
    logger.info('Connecting to database...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Connect to Redis
    logger.info('Connecting to Redis...');
    await connectRedis();

    // Run initial session cleanup
    logger.info('Running initial session cleanup...');
    await runInitialCleanup();

    // Start scheduled session cleanup job (daily at 3 AM)
    startSessionCleanupJob();

    // Start Express server
    const port = config.port;
    app.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 Author Clock API started`, {
        port,
        environment: config.nodeEnv,
        pid: process.pid,
      });
      logger.info(`📖 API Documentation: http://localhost:${port}/api`);
      logger.info(`❤️  Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  // Add cleanup logic here (close database connections, etc.)
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
