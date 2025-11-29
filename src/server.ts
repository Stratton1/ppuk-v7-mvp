import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const port = env.PORT;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port} (env: ${env.NODE_ENV})`);
});

const handleShutdown = (signal: NodeJS.Signals): void => {
  console.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => process.exit(0));
};

const handleUnexpectedError = (error: unknown): void => {
  console.error('Unexpected error occurred. Shutting down.', error);
  server.close(() => process.exit(1));
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);
process.on('unhandledRejection', handleUnexpectedError);
process.on('uncaughtException', handleUnexpectedError);
