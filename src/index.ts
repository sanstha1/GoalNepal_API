import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { PORT, MONGODB_URI } from './config/env';
import { connectDatabase } from './database/mangodb';

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Server accessible at http://192.168.10.74:${PORT}`);
      console.log(`MongoDB connected at: ${MONGODB_URI}`);
    });
  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
}

startServer();