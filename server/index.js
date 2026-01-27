require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const databaseRoutes = require('./routes/database');
// Add node-fetch if you haven't (npm install node-fetch) 
// or use standard fetch if on Node 18+
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// ... (Keep your Setup Admin code here) ...

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});