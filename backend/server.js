require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');

const formRoutes = require('./routes/formRoutes');
const aiRoutes = require('./routes/aiRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const authRoutes = require('./routes/authRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const {
  errorHandler,
  notFoundHandler
} = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

/*
 * CORS
 * Local development:
 * Allows Vite frontend whether it runs on port 5173, 5174, etc.
 */
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

/*
 * Body parser
 */
app.use(
  express.json({
    limit: '1mb'
  })
);

/*
 * Authentication routes
 * Rate limited for security.
 */
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
  }),
  authRoutes
);

/*
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok'
    }
  });
});

/*
 * API routes
 */
app.use('/api/forms', formRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/applications', applicationRoutes);

/*
 * 404 handler
 */
app.use(notFoundHandler);

/*
 * Global error handler
 */
app.use(errorHandler);

/*
 * Start server
 */
async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Forma AI backend listening on http://localhost:${PORT}`
      );
    });
  } catch (err) {
    console.error(
      'Failed to start server:',
      err.message
    );

    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;