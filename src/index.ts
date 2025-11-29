/**
 * Application entry point responsible for starting the HTTP server.
 */
import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
const port = env.PORT;

app.listen(port, () => {
  console.log(`Server listening on port ${port} (env: ${env.NODE_ENV})`);
});
