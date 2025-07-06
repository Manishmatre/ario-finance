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
import EditTransaction from './pages/finance/EditTransaction';
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
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset/:token" element={<ResetPassword />} />

          {/* Protected finance routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<FinanceLayout />}>
              <Route path="/finance" element={<Dashboard />} />
              <Route path="/finance/accounts" element={<ChartOfAccounts />} />
              <Route path="/finance/journal" element={<JournalEntries />} />
              <Route path="/finance/ledger" element={<LedgerView />} />
              <Route path="/finance/add-transaction" element={<AddTransaction />} />
              <Route path="/finance/edit-transaction" element={<EditTransaction />} />
              <Route path="/finance/transaction-approval" element={<TransactionApproval />} />
              <Route path="/finance/bills" element={<PurchaseBills />} />
              <Route path="/finance/vendors" element={<Vendors />} />
              <Route path="/finance/vendor-ledger" element={<VendorLedger />} />
              <Route path="/finance/advance-vendor" element={<AdvanceToVendor />} />
              <Route path="/finance/vendor-payments" element={<VendorPayments />} />
              <Route path="/finance/cashbook" element={<Cashbook />} />
              <Route path="/finance/bankbook" element={<Bankbook />} />
              <Route path="/finance/petty-cash" element={<PettyCashRegister />} />
              <Route path="/finance/cash-advance" element={<CashAdvanceToEmployee />} />
              <Route path="/finance/cash-reimburse" element={<CashReimbursement />} />
              <Route path="/finance/grn-matching" element={<GRNMatching />} />
              <Route path="*" element={<Navigate to="/finance" />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
