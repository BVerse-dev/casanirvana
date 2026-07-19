import app from './app';
import dotenv from 'dotenv';
import { captureException, flushObservability } from './lib/observability';
import { logger } from './lib/logger';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  logger.info('server.started', {
    port: PORT,
    url: `http://localhost:${PORT}`,
  });
});

process.on('unhandledRejection', (reason) => {
  captureException(reason, { mechanism: 'unhandled_rejection' });
});

process.on('uncaughtException', async (error) => {
  captureException(error, { mechanism: 'uncaught_exception' });
  await flushObservability();
  process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    logger.info('server.shutdown.requested', { signal });
    server.close(async () => {
      await flushObservability();
      logger.info('server.shutdown.completed', { signal });
      process.exit(0);
    });
  });
}
