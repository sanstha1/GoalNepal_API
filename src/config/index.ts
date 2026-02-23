import dotenv from 'dotenv';
dotenv.config();

import app from '../app';
import { PORT, MONGODB_URI } from './env';
import { connectDatabase } from '../database/mangodb';

async function startServer() {
  try {
    await connectDatabase();

    const serverPort = PORT || 5050;

    app.listen(serverPort, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${serverPort}`);
      console.log(`MongoDB connected at: ${MONGODB_URI}`);
    });

  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
}

startServer();
