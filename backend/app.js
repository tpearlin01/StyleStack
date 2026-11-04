const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const fs = require('fs');
const express = require('express');

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Resolve frontend build directory:
// Checks standalone bundle (./dist) or monorepo path (../frontend/dist)
const distPath = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, '../frontend/dist');

app.use(express.static(distPath));

// Express 5 catch-all route for SPA client-side routing
app.get('{*path}', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please build the frontend first.');
  }
});

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
