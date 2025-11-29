/**
 * Loads environment variables and exposes normalized config values.
 */
import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value?: string): number => {
  const port = Number(value);
  if (Number.isInteger(port) && port > 0) {
    return port;
  }
  return 3000;
};

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const PORT = parsePort(process.env.PORT);

export const env = {
  NODE_ENV,
  PORT,
};
