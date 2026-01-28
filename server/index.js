require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const databaseRoutes = require('./routes/database');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database once (for serverless, this runs on cold start)
let dbInitialized = false;
const ensureDatabase = async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return res.status(500).json({ error: 'Database initialization failed' });
    }
  }
  next();
};

// Apply database middleware to all routes except health check
app.use((req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }
  return ensureDatabase(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/database', databaseRoutes);

// --- NEW PREDICTION ENDPOINT ---
app.post('/api/predict', async (req, res) => {
  try {
    const { smiles, protein_sequence } = req.body;
    
    // The URL of your Hugging Face Space (Python Model)
    const HF_API_URL = 'https://abdoir-drug-target-binding-affinity.hf.space/predict';

    // Forward the request to Hugging Face
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smiles, protein_sequence }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Return the prediction to your frontend
    res.json(data);

  } catch (error) {
    console.error('Prediction Proxy Error:', error);
    res.status(500).json({ error: 'Failed to connect to prediction model' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await initDatabase();
      dbInitialized = true;
      console.log('Database initialized successfully');
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    }
  };
  
  startServer();
}

// Export for Vercel
module.exports = app;