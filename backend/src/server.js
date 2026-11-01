const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Server Startup Warning] Database connection error:', err.message);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, HOST, () => {
      console.log(`[StyleStack Backend] Server running on http://${HOST}:${PORT}`);
    });
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
