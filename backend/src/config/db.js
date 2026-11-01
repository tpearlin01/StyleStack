const mongoose = require('mongoose');
const migrateData = require('../utils/migrate');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    console.log('[DB] MONGODB_URI not provided. Operating in JSON FALLBACK mode.');
    isConnected = false;
    return null;
  }

  try {
    const conn = await mongoose.connect(uri.trim(), {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[DB] MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log('[DB] Storage Mode: MONGODB_ATLAS (Primary)');

    // Set up connection event listeners
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[DB Warning] MongoDB disconnected. Engaging local JSON fallback.');
    });

    mongoose.connection.on('reconnected', () => {
      isConnected = true;
      console.log('[DB] MongoDB reconnected. Re-engaging MongoDB Atlas.');
    });

    // Run idempotent initial migration of JSON seed data into MongoDB
    try {
      await migrateData();
    } catch (migErr) {
      console.warn(`[DB Migration Warning] Initial migration note: ${migErr.message}`);
    }

    return conn;
  } catch (error) {
    console.error(`[DB Error] MongoDB Atlas connection failed (${error.message}).`);
    console.warn('[DB Mode] Falling back gracefully to local JSON fallback store.');
    isConnected = false;
    return null;
  }
};

const getIsConnected = () => isConnected && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.getIsConnected = getIsConnected;
module.exports.isMongoDBConnected = getIsConnected;
