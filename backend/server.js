require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const bankAccountsRouter = require('./routes/bankAccounts');
const transactionsRouter = require('./routes/transactions');
const vendorsRouter = require('./routes/vendors');
const billsRouter = require('./routes/bills');
const expensesRouter = require('./routes/expenses');
const dashboardRouter = require('./routes/dashboard');
const subscriptionRouter = require('./routes/subscription');
const cashRouter = require('./routes/cash');
const pettyCashRouter = require('./routes/pettyCash');
const grnRouter = require('./routes/grn');
const purchaseOrderRouter = require('./routes/purchaseOrder');
const productRouter = require('./routes/product');
const loanRouter = require('./routes/loan');
const projectRouter = require('./routes/projectRoutes');
const clientRouter = require('./routes/clientRoutes');
const plansRouter = require('./routes/plans');

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://ariofinance-frontned.vercel.app' , 'https://ariofinance.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
// Set io instance globally using socket.js
const { setIO } = require('./socket');
setIO(io);

// Enable CORS with specific options
const corsOptions = {
  origin: ['http://localhost:5173', 'https://ariofinance-frontned.vercel.app', 'https://ariofinance.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

app.use('/api/finance/bank-accounts', bankAccountsRouter);
app.use('/api/finance/lenders', require('./routes/lenderRoutes'));
app.use('/api/finance/transactions', transactionsRouter);
app.use('/api/finance/vendors', vendorsRouter);
app.use('/api/finance/bills', billsRouter);
app.use('/api/finance/expenses', expensesRouter);
app.use('/api/finance/dashboard', dashboardRouter);
app.use('/api/finance/cash', cashRouter);
app.use('/api/finance/petty-cash', pettyCashRouter);
app.use('/api/finance/products', productRouter);
app.use('/api/finance/purchase-orders', purchaseOrderRouter);
app.use('/api/finance/grns', grnRouter);
app.use('/api/finance/loans', loanRouter);
app.use('/api/finance/projects', projectRouter);
app.use('/api/finance/employees', require('./routes/employees'));
app.use('/api/finance/clients', clientRouter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/subscription', subscriptionRouter);
app.use('/api/plans', plansRouter);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
