import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { PORT, MONGODB_URI } from './config/env';
import { connectDatabase } from './database/mangodb';

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`MongoDB connected at: ${MONGODB_URI}`);
    });
  } catch (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
}

startServer();
