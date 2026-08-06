require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./db/index');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5005;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { error: 'Too many requests from this IP. Please try again later.' }
});
app.use('/api/', limiter);

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Majlis Al Oud Google Review Reward System',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if in production
const frontendBuildPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Majlis Al Oud Backend API is running.');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const { seedDatabase } = require('./db/seed');

// Initialize DB and start server
initDB().then(async () => {
  console.log('✔ Database connection established and tables verified.');
  try {
    await seedDatabase();
  } catch (sErr) {
    console.warn('Seed sync warning:', sErr.message);
  }
  app.listen(PORT, () => {
    console.log(`🚀 Majlis Al Oud Backend running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Fatal Database Initialization Error:', err);
});
