import React, { useEffect, useState } from "react";
import Table from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { useForm, Controller } from "react-hook-form";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from '../../components/ui/PageHeading';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiCreditCard, FiPackage, FiTrendingUp, FiTrendingDown, FiEye, FiEdit, FiTrash2, FiMoreVertical, FiDownload, FiRefreshCw, FiX } from 'react-icons/fi';
import Pagination from '../../components/ui/Pagination';

// Mock data for accounts
const mockAccounts = [
  {
    _id: '1',
    bankName: 'State Bank of India',
    type: 'Current',
    accountHolder: 'SSK Pvt Ltd',
    bankAccountNo: '12345678901',
    ifsc: 'SBIN0000123',
    branchName: 'Connaught Place',
    status: 'active',
    openingBalance: 500000,
    currentBalance: 485000,
    interestRate: 4.5,
    lastTransaction: '2025-01-15',
  },
  {
    _id: '2',
    bankName: 'HDFC Bank',
    type: 'Savings',
    accountHolder: 'SSK Pvt Ltd',
    bankAccountNo: '98765432109',
    ifsc: 'HDFC0000456',
    branchName: 'Bandra West',
    status: 'active',
    openingBalance: 250000,
    currentBalance: 275000,
    interestRate: 6.5,
    lastTransaction: '2025-01-14',
  },
  {
    _id: '3',
    bankName: 'ICICI Bank',
    type: 'Current',
    accountHolder: 'SSK Pvt Ltd',
    bankAccountNo: '11223344556',
    ifsc: 'ICIC0000789',
    branchName: 'MG Road',
    status: 'inactive',
    openingBalance: 100000,
    currentBalance: 100000,
    interestRate: 4.0,
    lastTransaction: '2024-12-20',
  },
  {
    _id: '4',
    bankName: 'Axis Bank',
    type: 'Fixed Deposit',
    accountHolder: 'SSK Pvt Ltd',
    bankAccountNo: '55667788990',
    ifsc: 'UTIB0000111',
    branchName: 'Powai',
    status: 'active',
    openingBalance: 1000000,
    currentBalance: 1000000,
    interestRate: 7.5,
    lastTransaction: '2024-12-31',
  },
  {
    _id: '5',
    bankName: 'Punjab National Bank',
    type: 'Savings',
    accountHolder: 'SSK Pvt Ltd',
    bankAccountNo: '66778899001',
    ifsc: 'PUNB0123456',
    branchName: 'Karol Bagh',
    status: 'inactive',
    openingBalance: 75000,
    currentBalance: 75000,
    interestRate: 5.5,
    lastTransaction: '2024-11-15',
  },
];

// Calculate summary from accounts data
const calculateSummary = (accounts) => {
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  const activeAccounts = accounts.filter(acc => acc.status === 'active').length;
  const inactiveAccounts = accounts.filter(acc => acc.status === 'inactive').length;
  return [
    { title: 'Total Accounts', value: totalAccounts, icon: <FiCreditCard className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Balance', value: totalBalance, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Active Accounts', value: activeAccounts, icon: <FiTrendingUp className="h-6 w-6 text-green-500" /> },
    { title: 'Inactive Accounts', value: inactiveAccounts, icon: <FiTrendingDown className="h-6 w-6 text-yellow-500" /> },
  ];
};

const BALANCE_TYPES = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

const ACCOUNT_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'Current', label: 'Current Account' },
  { value: 'Savings', label: 'Savings Account' },
  { value: 'Fixed Deposit', label: 'Fixed Deposit' },
  { value: 'Recurring Deposit', label: 'Recurring Deposit' },
  { value: 'NRE', label: 'NRE Account' },
  { value: 'NRO', label: 'NRO Account' },
  { value: 'Other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'dormant', label: 'Dormant' },
  { value: 'frozen', label: 'Frozen' },
];

const BANK_OPTIONS = [
  { value: '', label: 'Select Bank' },
  { value: 'SBI', label: 'State Bank of India' },
  { value: 'HDFC', label: 'HDFC Bank' },
  { value: 'ICICI', label: 'ICICI Bank' },
  { value: 'Axis', label: 'Axis Bank' },
  { value: 'Kotak', label: 'Kotak Mahindra Bank' },
  { value: 'Yes Bank', label: 'Yes Bank' },
  { value: 'PNB', label: 'Punjab National Bank' },
  { value: 'Canara', label: 'Canara Bank' },
  { value: 'Bank of Baroda', label: 'Bank of Baroda' },
  { value: 'Union Bank', label: 'Union Bank of India' },
  { value: 'Other', label: 'Other Bank' },
];

export default function AllBankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCashDetails, setShowCashDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const navigate = useNavigate();

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/finance/bank-accounts");
      const bankAccounts = response.data.bankAccounts || [];
      setAccounts(bankAccounts);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch accounts");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Add account
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/finance/bank-accounts", data);
      toast.success("Account created");
      reset();
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
      toast.error(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // State for delete confirmation modal
  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    setActionLoading(true);
    try {
      if (accountToDelete._id === 'cash-account') {
        setShowDeleteModal(false);
        setActionLoading(false);
        return;
      }
      await axios.delete(`/api/finance/bank-accounts/${accountToDelete._id}/hard`);
      fetchAccounts();
    } catch (err) {
      // Optionally show error in modal UI
    } finally {
      setShowDeleteModal(false);
      setAccountToDelete(null);
      setActionLoading(false);
    }
  };

  // Cancel delete action
  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  // Toggle account status
  const toggleAccountStatus = async (account) => {
    if (!window.confirm(`Are you sure you want to ${account.status === 'active' ? 'deactivate' : 'activate'} this account?`)) return;
    setActionLoading(true);
    try {
      const newStatus = account.status === 'active' ? 'inactive' : 'active';
      await axios.patch(`/api/finance/bank-accounts/${account._id}`, { status: newStatus });
      toast.success(`Account ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update account status");
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh account balance (simulate)
  const refreshBalance = async (account) => {
    setActionLoading(true);
    try {
      // Simulate balance refresh - in real app, this would call bank API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Balance refreshed successfully");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to refresh balance");
    } finally {
      setActionLoading(false);
    }
  };

  // Download account statement
  const downloadStatement = async (account) => {
    setActionLoading(true);
    try {
      // Simulate statement download
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Statement download started");
    } catch (err) {
      toast.error("Failed to download statement");
    } finally {
      setActionLoading(false);
    }
  };

  const getCashAccount = () => accounts.find(acc => acc.type === 'Cash');

  // Filtering logic
  const filteredAccounts = accounts.filter(acc =>
    (acc.bankName?.toLowerCase().includes(search.toLowerCase()) ||
     acc.bankAccountNo?.toLowerCase().includes(search.toLowerCase()) ||
     acc.accountHolder?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / rowsPerPage));
  const paginatedAccounts = filteredAccounts.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Table columns for Employees style
  const columns = [
    { Header: 'Bank Name', accessor: 'bankName', Cell: ({ value }) => (<div className="font-medium">{value}</div>) },
    { Header: 'Account Number', accessor: 'bankAccountNo', Cell: ({ value }) => (<span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{value}</span>) },
    { Header: 'Account Holder', accessor: 'accountHolder' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Current Balance', accessor: 'currentBalance', Cell: ({ value }) => `₹${value?.toLocaleString()}` },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`px-2 py-1 rounded text-xs ${value==='active'?'bg-green-100 text-green-800':value==='inactive'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}`}>{value}</span> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => {
      const account = row.original;
      const isCashAccount = account.type === 'Cash';
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => isCashAccount ? setShowCashDetails(true) : navigate(`/finance/accounts/${account._id}`)}>View</Button>
          {!isCashAccount && <Button size="sm" variant="primary" onClick={() => navigate(`/finance/edit-bank-account/${account._id}`)}>Edit</Button>}
          <Button size="sm" variant="danger" onClick={() => handleDeleteClick(account)}>Delete</Button>
        </div>
      );
    } },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  // Determine grid columns for summary cards
  const summaryColCount = Math.min(4, calculateSummary(accounts).length);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="All Bank Accounts"
        subtitle="View and manage all your bank accounts"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "All Bank Accounts" }
        ]}
      />
      {/* Summary Cards */}
      <div className={`grid grid-cols-2 md:grid-cols-${summaryColCount} gap-4`}>
        {calculateSummary(accounts).map((summary, index) => (
          <Card key={index} className="flex items-center gap-4 p-4">
            <div>{summary.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{summary.title}</div>
              <div className="text-xl font-bold">{summary.title.includes('Balance') ? `₹${summary.value.toLocaleString()}` : summary.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search and Add Account Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by bank name, account number, or holder..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button key="add-account" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/add-bank-account')}>
            Add Bank Account
          </Button>
        </div>
      </div>
      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Bank Account Directory</h3>
        </div>
        {paginatedAccounts.length === 0 ? (
          <EmptyState message="No accounts found." />
        ) : (
          <>
            <Table columns={columns} data={paginatedAccounts} />
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
      {/* Cash Details Modal */}
      {showCashDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[600px] max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Cash in Hand Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cash</label>
                <p className="text-2xl font-bold text-green-600">₹{showCashDetails.currentBalance?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Opening Balance</label>
                <p className="text-lg text-gray-900">₹{showCashDetails.openingBalance?.toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Denomination Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(showCashDetails.denominations || {}).map(([denomination, count]) => (
                  <div key={denomination} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">₹{denomination}</span>
                    <span className="text-gray-600">{count} × ₹{denomination} = ₹{(count * parseInt(denomination)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Account Holder:</span>
                  <p className="text-gray-900">{showCashDetails.accountHolder}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Transaction:</span>
                  <p className="text-gray-900">{new Date(showCashDetails.lastTransaction).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="text-gray-900">{showCashDetails.status}</p>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="text-gray-900">{showCashDetails.branchName}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowCashDetails(false)} variant="secondary" className="flex-1">
                Close
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <FiTrendingDown className="h-4 w-4 mr-2" />
                Count Cash
              </Button>
            </div>
          </div>
        </div>
      )}
    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-lg w-full shadow-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Delete Account</h2>
      <p className="mb-6 text-gray-700 text-center">
        Are you sure you want to permanently delete
        <span className="font-semibold"> {accountToDelete?.bankName || 'this account'} </span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-4 justify-center">
        <Button
          variant="danger"
          onClick={confirmDeleteAccount}
          disabled={actionLoading}
        >
          {actionLoading ? 'Deleting...' : 'Delete'}
        </Button>
        <Button
          variant="secondary"
          onClick={cancelDeleteAccount}
          disabled={actionLoading}
        >
          Cancel
          </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}