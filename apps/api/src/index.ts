import { createApp } from './app.js';
import { env } from './config/env.js';
import { checkDbConnection } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  const app = createApp();

  const isDbConnected = await checkDbConnection();
  if (isDbConnected) {
    logger.info('✅ PostgreSQL connected successfully');
  } else {
    logger.warn('⚠️ Warning: Initial PostgreSQL connection check failed');
  }

  app.listen(env.PORT, () => {
    logger.info(`🚀 Timora API server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`🌐 Allowed CORS origins: ${env.CORS_ORIGINS}`);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Server startup failed');
  process.exit(1);
});
