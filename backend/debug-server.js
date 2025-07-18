const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Create a simple test server
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Test bank account route without auth
app.post('/test-bank-account', (req, res) => {
  console.log('Received data:', req.body);
  res.json({ message: 'Data received', data: req.body });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/SSK-finance')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(4001, () => {
      console.log('Debug server running on port 4001');
      console.log('Test with: curl http://localhost:4001/test');
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 