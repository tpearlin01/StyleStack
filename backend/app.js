const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Connect to MongoDB if MONGODB_URI is provided, with graceful fallback to local JSON store
connectDB();

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// When started directly (e.g. `node app.js`, `npm start`, or Azure App Service entry)
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`[StyleStack Backend] Server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;

