const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[App Startup Warning] Database connection error:', err.message);
  }

  // When started directly (e.g. `node app.js`, `npm start`, or Azure App Service entry)
  if (require.main === module && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, HOST, () => {
      console.log(`[StyleStack Backend] Server running on http://${HOST}:${PORT}`);
    });
  }
};

if (require.main === module && process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
