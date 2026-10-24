import mongoose from 'mongoose';
import { config } from './env.js';

let memServer = null;

export const connectDB = async () => {
  // Test runs must never connect to a developer's or production MongoDB URI.
  if (config.env === 'test') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memServer = await MongoMemoryServer.create();
    return mongoose.connect(memServer.getUri());
  }
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection failed: ${error.message}`);
    
    throw error;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memServer) {
      await memServer.stop();
    }
    console.log('[Database] MongoDB connection closed');
  } catch (err) {
    console.error('[Database] Error closing MongoDB connection:', err);
  }
};
