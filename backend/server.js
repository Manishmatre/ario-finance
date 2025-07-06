require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const vendorsRouter = require('./routes/vendors');
const billsRouter = require('./routes/bills');
const dashboardRouter = require('./routes/dashboard');
const cashRouter = require('./routes/cash');
const pettyCashRouter = require('./routes/pettyCash');
const grnRouter = require('./routes/grn');

// Ensure required environment variables are set
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set. Using a default secret for development.');
  process.env.JWT_SECRET = 'dev-secret-change-this-in-production';
}

if (!process.env.MONGO_URI) {
  console.warn('WARNING: MONGO_URI is not set. Using default local MongoDB connection.');
  process.env.MONGO_URI = 'mongodb://localhost:27017/ario-finance';
}

const app = express();

// Enable CORS with specific options
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Parse JSON bodies
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/finance/accounts', accountsRouter);
app.use('/api/finance/transactions', transactionsRouter);
app.use('/api/finance/vendors', vendorsRouter);
app.use('/api/finance/bills', billsRouter);
app.use('/api/finance/dashboard', dashboardRouter);
app.use('/api/finance/cash', cashRouter);
app.use('/api/finance/pettycash', pettyCashRouter);
app.use('/api/finance/grn', grnRouter);
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
