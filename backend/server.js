// Entry point for starting the Express server. Only starts the app and reads PORT from .env
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require('cors');

dotenv.config();
connectDB();

const app = require('./app');
// const adminRoutes = require('./routes/adminRoutes'); // Remove this line

const PORT = process.env.PORT;

if (!PORT) {
  throw new Error('PORT must be defined in .env file');
}

const allowedOrigins = [
  'http://localhost:3000', // local react
  'https://YOUR_NETLIFY_URL.netlify.app', // netlify prod
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy: This origin is not allowed.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// app.use('/api/admin', adminRoutes); // Remove this line

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));