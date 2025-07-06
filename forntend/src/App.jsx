import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import FinanceLayout from './layouts/FinanceLayout';
import Dashboard from './pages/finance/FinanceDashboard';
import ChartOfAccounts from './pages/finance/ChartOfAccounts';
import JournalEntries from './pages/finance/JournalEntries';
import LedgerView from './pages/finance/LedgerView';
import AddTransaction from './pages/finance/AddTransaction';
import TransactionApproval from './pages/finance/TransactionApproval';
import PurchaseBills from './pages/finance/PurchaseBills';
import Vendors from './pages/finance/Vendors';  
import VendorLedger from './pages/finance/VendorLedger';
import AdvanceToVendor from './pages/finance/AdvanceToVendor';
import VendorPayments from './pages/finance/VendorPayments';
import Cashbook from './pages/finance/Cashbook';
import Bankbook from './pages/finance/Bankbook';
import PettyCashRegister from './pages/finance/PettyCashRegister';
import CashAdvanceToEmployee from './pages/finance/CashAdvanceToEmployee';
import CashReimbursement from './pages/finance/CashReimbursement';
import GRNMatching from './pages/finance/GRNMatching';

export default function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<FinanceLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<ChartOfAccounts />} />
            <Route path="/journal" element={<JournalEntries />} />
            <Route path="/ledger" element={<LedgerView />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/transaction-approval" element={<TransactionApproval />} />
            <Route path="/bills" element={<PurchaseBills />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendor-ledger" element={<VendorLedger />} />
            <Route path="/advance-vendor" element={<AdvanceToVendor />} />
            <Route path="/vendor-payments" element={<VendorPayments />} />
            <Route path="/cashbook" element={<Cashbook />} />
            <Route path="/bankbook" element={<Bankbook />} />
            <Route path="/petty-cash" element={<PettyCashRegister />} />
            <Route path="/cash-advance" element={<CashAdvanceToEmployee />} />
            <Route path="/cash-reimburse" element={<CashReimbursement />} />
            <Route path="/grn-matching" element={<GRNMatching />} />
            {/* Add login and other routes as needed */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
