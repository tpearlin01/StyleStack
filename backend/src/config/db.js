const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('[DB] MONGODB_URI not provided. Running in offline fallback mode with local JSON store.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[DB] MongoDB connection failed (${error.message}). Falling back gracefully to local JSON store.`);
    isConnected = false;
    return null;
  }
};

const getIsConnected = () => isConnected;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getIsConnected = getIsConnected;

