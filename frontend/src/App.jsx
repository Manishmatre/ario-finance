import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import FinanceLayout from './layouts/FinanceLayout';
import Dashboard from './pages/finance/FinanceDashboard';
import AllBankAccounts from './pages/finance/AllBankAccounts';
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
import Loans from './pages/loans/Loans';
import LoanApplication from './pages/loans/LoanApplication';
import LoanDetails from './pages/loans/LoanDetails';
import LoanAnalysis from './pages/loans/LoanAnalysis';
import LoanDocuments from './pages/loans/LoanDocuments';
import Lenders from './pages/loans/Lenders';
import AddLender from './pages/loans/AddLender';
import PettyCashRegister from './pages/finance/PettyCashRegister';
// import CashAdvanceToEmployee from './pages/finance/CashAdvanceToEmployee';
import CashReimbursement from './pages/finance/CashReimbursement';
import GRNList from './pages/finance/GRNList';
import GRNForm from './pages/finance/GRNForm';
import GRNMatchBill from './pages/finance/GRNMatchBill';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddBankAccount from './pages/finance/AddBankAccount';
import Settings from './pages/finance/Settings';
import Profile from './pages/finance/Profile';
// Expense Management
import Expenses from './pages/finance/Expenses';
import ExpenseForm from './pages/finance/ExpenseForm';
import ExpenseDetails from './pages/finance/ExpenseDetails';
import ExpenseCategories from './pages/finance/ExpenseCategories';
import ExpenseReports from './pages/finance/ExpenseReports';
import AddVendor from './pages/finance/AddVendor';
import VendorDetails from './pages/finance/VendorDetails';
import AddPurchaseBill from './pages/finance/AddPurchaseBill';
import BillDetails from './pages/finance/BillDetails';
import LenderDetails from './pages/loans/LenderDetails';
import AddAdvanceToVendor from './pages/finance/AddAdvanceToVendor';
import Bankbook from './pages/finance/Bankbook';
import MakeBillPaid from './pages/finance/MakeBillPaid';
import EmployeeList from './pages/finance/EmployeeList';
import AddEmployee from './pages/finance/AddEmployee';
import EmployeeDetails from './pages/finance/EmployeeDetails';
import EmployeeTransactions from './pages/finance/EmployeeTransactions';
import AddEmployeeTransaction from './pages/finance/AddEmployeeTransaction';
import Projects from './pages/finance/Projects';
import ProjectDetail from './pages/finance/ProjectDetail';
import AddProject from './pages/finance/AddProject';
import Clients from './pages/finance/Clients';
import AddClient from './pages/finance/AddClient';
import ClientDetails from './pages/finance/ClientDetails';
import RecordProjectPayment from './pages/finance/RecordProjectPayment';
import ProjectPaymentDetails from './pages/finance/ProjectPaymentDetails';
import BankAccountDetails from './pages/finance/BankAccountDetails';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
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
              <Route path="/finance/accounts" element={<AllBankAccounts />} />
              <Route path="/finance/accounts/:id" element={<BankAccountDetails />} />
              <Route path="/finance/add-bank-account" element={<AddBankAccount />} />
              <Route path="/finance/edit-bank-account/:id" element={<AddBankAccount />} />
              
              {/* Expense Management Routes */}
              <Route path="/finance/expenses" element={<Expenses />} />
              <Route path="/finance/expenses/new" element={<ExpenseForm />} />
              <Route path="/finance/expenses/:id" element={<ExpenseDetails />} />
              <Route path="/finance/expenses/:id/edit" element={<ExpenseForm />} />
              <Route path="/finance/expenses/categories" element={<ExpenseCategories />} />
              <Route path="/finance/expenses/reports" element={<ExpenseReports />} />
              <Route path="/finance/journal" element={<JournalEntries />} />
              <Route path="/finance/ledger" element={<LedgerView />} />
              <Route path="/finance/add-transaction" element={<AddTransaction />} />
              <Route path="/finance/edit-transaction" element={<EditTransaction />} />
              <Route path="/finance/transaction-approval" element={<TransactionApproval />} />
              <Route path="/finance/bills" element={<PurchaseBills />} />
              <Route path="/finance/bills/add" element={<AddPurchaseBill />} />
              <Route path="/finance/bills/:id" element={<BillDetails />} />
              <Route path="/finance/bills/:id/pay" element={<MakeBillPaid />} />
              <Route path="/finance/vendors" element={<Vendors />} />
              <Route path="/finance/vendor-ledger" element={<VendorLedger />} />
              <Route path="/finance/advance-vendor" element={<AdvanceToVendor />} />
              <Route path="/finance/advance-vendor/add" element={<AddAdvanceToVendor />} />
              <Route path="/finance/advance-vendor/edit/:id" element={<AddAdvanceToVendor />} />
              <Route path="/finance/vendor-payments" element={<VendorPayments />} />
              <Route path="/finance/cashbook" element={<Cashbook />} />
              <Route path="/finance/petty-cash" element={<PettyCashRegister />} />
              <Route path="/finance/cash-reimburse" element={<CashReimbursement />} />
              <Route path="/finance/grns" element={<GRNList />} />
              <Route path="/finance/grns/new" element={<GRNForm />} />
              <Route path="/finance/grns/:id" element={<GRNForm />} />
              <Route path="/finance/grns/:id/match" element={<GRNMatchBill />} />
              <Route path="/finance/settings" element={<Settings />} />
              <Route path="/finance/profile" element={<Profile />} />
              <Route path="/finance/vendors/add" element={<AddVendor />} />
              <Route path="/finance/vendors/edit/:id" element={<AddVendor />} />
              <Route path="/finance/vendors/:id" element={<VendorDetails />} />
              {/* Loan Management Routes */}
              <Route path="/finance/loans" element={<Loans />} />
              <Route path="/finance/loans/apply" element={<LoanApplication />} />
              <Route path="/finance/loans/:id/documents" element={<LoanDocuments />} />
              <Route path="/finance/loans/:id/analysis" element={<LoanAnalysis />} />
              <Route path="/finance/lenders" element={<Lenders />} />
              <Route path="/finance/lenders/add/:id?" element={<AddLender />} />
              <Route path="/finance/lenders/:id" element={<LenderDetails />} />
              <Route path="/finance/bankbook" element={<Bankbook />} />
              {/* Employee Management Routes */}
              <Route path="/finance/employees" element={<EmployeeList />} />
              <Route path="/finance/employees/add" element={<AddEmployee />} />
              <Route path="/finance/employees/edit/:id" element={<AddEmployee />} />
              <Route path="/finance/employees/:id" element={<EmployeeDetails />} />
              <Route path="/finance/employee-transactions" element={<EmployeeTransactions />} />
              <Route path="/finance/employee-transactions/add" element={<AddEmployeeTransaction />} />
              
              {/* Project Management Routes */}
              <Route path="/finance/projects" element={<Projects />} />
              <Route path="/finance/projects/add" element={<AddProject />} />
              <Route path="/finance/projects/edit/:id" element={<AddProject />} />
              <Route path="/finance/projects/:id" element={<ProjectDetail />} />
              <Route path="/finance/projects/:id/record-payment" element={<RecordProjectPayment />} />
              <Route path="/finance/projects/payments/:id" element={<ProjectPaymentDetails />} />
              
              {/* Client Management Routes */}
              <Route path="/finance/clients" element={<Clients />} />
              <Route path="/finance/clients/add" element={<AddClient />} />
              <Route path="/finance/clients/edit/:id" element={<AddClient />} />
              <Route path="/finance/clients/:id" element={<ClientDetails />} />

              <Route path="*" element={<Navigate to="/finance" />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
