const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('[DB] Running in offline mock mode');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('[DB] Running in offline mock mode');
  }
};

module.exports = connectDB;
