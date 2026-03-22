require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const env = require('./src/config/env');

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
