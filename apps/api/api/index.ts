import { createApp } from '../src/app.js';
import { checkDbConnection } from '../src/config/database.js';

const app = createApp();

// Optional: check connection on initial cold start
checkDbConnection().catch((err) => {
  console.warn('Initial PostgreSQL connection check failed', err);
});

// IMPORTANT: Export the app directly so Vercel can route incoming HTTP requests
export default app;