const mongoose = require('mongoose');
const BankAccount = require('../models/BankAccount');
const TransactionLine = require('../models/TransactionLine');

// Optional: Audit log model (simple file log for now)
const fs = require('fs');
const AUDIT_LOG = 'bank_balance_audit.log';

// Connect to your MongoDB (update the URI as needed)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ariofinance';

// Set to false to disallow negative balances
const ALLOW_NEGATIVE_BALANCE = false;

function logAudit(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(AUDIT_LOG, entry);
}

async function recalculateBalances() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const accounts = await BankAccount.find();
  for (const account of accounts) {
    // Sum all transactions for this account
    const txns = await TransactionLine.find({ bankAccountId: account._id });
    const balance = txns.reduce((sum, txn) => sum + (txn.amount || 0), 0);
    const oldBalance = account.currentBalance;
    account.currentBalance = balance;
    await account.save();
    const msg = `Updated ${account.bankName} (${account.bankAccountNo}): Old Balance ₹${oldBalance} -> New Balance ₹${balance}`;
    console.log(msg);
    logAudit(msg);
    if (!ALLOW_NEGATIVE_BALANCE && balance < 0) {
      const warn = `WARNING: Negative balance for ${account.bankName} (${account.bankAccountNo}): ₹${balance}`;
      console.warn(warn);
      logAudit(warn);
    }
  }
  await mongoose.disconnect();
  console.log('All bank account balances recalculated.');
}

recalculateBalances().catch(err => {
  console.error('Error recalculating balances:', err);
  logAudit('ERROR: ' + err.message);
  process.exit(1);
}); 