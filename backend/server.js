require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const vendorsRouter = require('./routes/vendors');
const billsRouter = require('./routes/bills');
const dashboardRouter = require('./routes/dashboard');
const cashRouter = require('./routes/cash');
const pettyCashRouter = require('./routes/pettyCash');
const grnRouter = require('./routes/grn');

const app = express();
app.use(express.json());

app.use('/api/finance/accounts', accountsRouter);
app.use('/api/finance/transactions', transactionsRouter);
app.use('/api/finance/vendors', vendorsRouter);
app.use('/api/finance/bills', billsRouter);
app.use('/api/finance/dashboard', dashboardRouter);
app.use('/api/finance/cash', cashRouter);
app.use('/api/finance/pettycash', pettyCashRouter);
app.use('/api/finance/grn', grnRouter);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
