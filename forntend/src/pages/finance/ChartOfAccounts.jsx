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

// Mock data for accounts
const mockAccounts = [
  {
    _id: '1',
    bankName: 'State Bank of India',
    type: 'Current',
    accountHolder: 'Ario Pvt Ltd',
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
    accountHolder: 'Ario Pvt Ltd',
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
    accountHolder: 'Ario Pvt Ltd',
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
    accountHolder: 'Ario Pvt Ltd',
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
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: '66778899001',
    ifsc: 'PUNB0123456',
    branchName: 'Karol Bagh',
    status: 'inactive',
    openingBalance: 75000,
    currentBalance: 75000,
    interestRate: 5.5,
    lastTransaction: '2024-11-15',
  },
  {
    _id: '6',
    bankName: 'Cash in Hand',
    type: 'Cash',
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: 'CASH001',
    ifsc: 'N/A',
    branchName: 'Office',
    status: 'active',
    openingBalance: 100000,
    currentBalance: 125000,
    interestRate: 0,
    lastTransaction: '2025-01-15',
    denominations: {
      '2000': 15,
      '500': 20,
      '200': 10,
      '100': 20,
      '50': 40,
      '20': 50,
      '10': 100,
      '5': 200,
      '2': 500,
      '1': 1000
    }
  },
];

// Calculate summary from accounts data
const calculateSummary = (accounts) => {
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  const cashAccount = accounts.find(acc => acc.type === 'Cash');
  const cashBalance = cashAccount ? cashAccount.currentBalance : 0;
  const bankBalance = totalBalance - cashBalance;
  
  return [
    { title: 'Total Accounts', value: totalAccounts, icon: <FiCreditCard className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Balance', value: totalBalance, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Cash in Hand', value: cashBalance, icon: <FiPackage className="h-6 w-6 text-purple-500" /> },
    { title: 'Bank Balance', value: bankBalance, icon: <FiTrendingUp className="h-6 w-6 text-yellow-500" /> },
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

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCashDetails, setShowCashDetails] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
  const type = watch('type');
  const navigate = useNavigate();

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/finance/bank-accounts");
      const bankAccounts = response.data.bankAccounts || [];
      
      // Add cash account to the list
      const cashAccount = {
        _id: 'cash-account',
        bankName: 'Cash in Hand',
        type: 'Cash',
        accountHolder: 'Ario Pvt Ltd',
        bankAccountNo: 'CASH001',
        ifsc: 'N/A',
        branchName: 'Office',
        status: 'active',
        openingBalance: 100000,
        currentBalance: 125000,
        interestRate: 0,
        lastTransaction: '2025-01-15',
        denominations: {
          '2000': 15,
          '500': 20,
          '200': 10,
          '100': 20,
          '50': 40,
          '20': 50,
          '10': 100,
          '5': 200,
          '2': 500,
          '1': 1000
        }
      };
      
      setAccounts([...bankAccounts, cashAccount]);
        setLoading(false);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
      setAccounts(mockAccounts);
      setError("Showing mock data. Backend unavailable.");
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

  // Edit account (update)
  const onEditSubmit = async (data) => {
    if (!selectedAccount || !selectedAccount._id) return;
    setActionLoading(true);
    setError("");
    try {
      await axios.patch(`/api/finance/bank-accounts/${selectedAccount._id}`, data);
      toast.success("Account updated successfully");
      setShowEditModal(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update account");
      toast.error(err.response?.data?.error || "Failed to update account");
    } finally {
      setActionLoading(false);
    }
  };

  // View account details
  const viewAccountDetails = (account) => {
    setSelectedAccount(account);
    setShowAccountDetails(true);
  };

  // Edit account
  const editAccount = (account) => {
    setSelectedAccount(account);
    reset(account); // Reset form fields with selected account data
    setShowEditModal(true);
  };

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Show delete confirmation modal
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

  const columns = [
    { 
      Header: 'Bank/Account Name', 
      accessor: 'bankName',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.type}</div>
          {row.original.accountHolder && (
            <div className="text-xs text-gray-400">{row.original.accountHolder}</div>
          )}
        </div>
      )
    },
    { 
      Header: 'Account Number', 
      accessor: 'bankAccountNo',
      Cell: ({ value, row }) => (
        <div>
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {value}
          </span>
          {row.original.accountCode && (
            <div className="text-xs text-gray-500 mt-1">Code: {row.original.accountCode}</div>
          )}
        </div>
      )
    },
    { 
      Header: 'IFSC Code', 
      accessor: 'ifsc',
      Cell: ({ value, row }) => (
        <div>
          <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
            {value}
          </span>
          {row.original.branchName && row.original.type !== 'Cash' && (
            <div className="text-xs text-gray-500 mt-1">{row.original.branchName}</div>
          )}
        </div>
      )
    },
    { 
      Header: 'Current Balance', 
      accessor: 'currentBalance',
      Cell: ({ value, row }) => {
        // For real bank accounts, we don't have opening balance, so just show current balance
        if (row.original.type === 'Cash') {
          const change = value - (row.original.openingBalance || 0);
          const changePercent = row.original.openingBalance > 0 ? (change / row.original.openingBalance * 100) : 0;
          return (
            <div>
              <div className="font-medium">₹{value?.toLocaleString() || '0'}</div>
              <div className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change.toLocaleString()} ({changePercent.toFixed(1)}%)
              </div>
            </div>
          );
        }
        return (
          <div className="font-medium">₹{value?.toLocaleString() || '0'}</div>
        );
      }
    },
    { 
      Header: 'Interest Rate', 
      accessor: 'interestRate',
      Cell: ({ value, row }) => (
        <div>
          <div>{value ? `${value}%` : 'N/A'}</div>
          {row.original.lastTransactionDate && (
            <div className="text-xs text-gray-500">
              Last: {new Date(row.original.lastTransactionDate).toLocaleDateString('en-IN')}
            </div>
          )}
        </div>
      )
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      Header: 'Actions', 
      accessor: 'actions',
      Cell: ({ row }) => {
        const account = row.original;
        const isCashAccount = account.type === 'Cash';
        
        return (
          <div className="flex flex-wrap items-center gap-1">
            {/* View Button */}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => isCashAccount ? setShowCashDetails(account) : viewAccountDetails(account)}
              disabled={actionLoading}
              title="View Details"
            >
              <FiEye className="h-3 w-3" />
            </Button>

            {/* Edit Button - Only for bank accounts */}
            {!isCashAccount && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => editAccount(account)}
                disabled={actionLoading}
                title="Edit Account"
              >
                <FiEdit className="h-3 w-3" />
              </Button>
            )}

            {/* Status Toggle Button */}
            <Button 
              size="sm" 
              variant={account.status === 'active' ? 'success' : 'warning'}
              onClick={() => toggleAccountStatus(account)}
              disabled={actionLoading}
              title={`${account.status === 'active' ? 'Deactivate' : 'Activate'} Account`}
            >
              {account.status === 'active' ? '✓' : '✗'}
            </Button>

            {/* Refresh Balance Button */}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => refreshBalance(account)}
              disabled={actionLoading}
              title="Refresh Balance"
            >
              <FiRefreshCw className="h-3 w-3" />
            </Button>

            {/* Download Statement Button - Only for bank accounts */}
            {!isCashAccount && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => downloadStatement(account)}
                disabled={actionLoading}
                title="Download Statement"
              >
                <FiDownload className="h-3 w-3" />
              </Button>
            )}

            {/* Delete Button */}
            <Button 
              size="sm" 
              variant="danger"
              onClick={() => handleDeleteClick(account)}
              disabled={actionLoading}
              title="Delete Account"
            >
              <FiTrash2 className="h-3 w-3" />
            </Button>
          </div>
        );
      }
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Chart of Accounts"
        subtitle="Manage your accounts and categories"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Chart of Accounts" }
        ]}
        action={
          <Button onClick={() => navigate('/finance/add-bank-account')}>
            Add Bank Account
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {calculateSummary(accounts).map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Balance') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}
      
      {accounts.length === 0 ? (
        <EmptyState message="No accounts found." />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Bank Accounts & Cash</h3>
          </div>
          <Table columns={columns} data={accounts} />
        </div>
      )}

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

      {/* Bank Account Details Modal */}
      {showAccountDetails && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[700px] max-w-4xl shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Bank Account Details</h3>
              <Button onClick={() => setShowAccountDetails(false)} variant="secondary" size="sm">
                <FiX className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                <p className="text-3xl font-bold text-green-600">₹{selectedAccount.currentBalance?.toLocaleString()}</p>
          </div>
          <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedAccount.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAccount.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bank Name:</span>
                    <span className="font-medium">{selectedAccount.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Type:</span>
                    <span className="font-medium">{selectedAccount.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Holder:</span>
                    <span className="font-medium">{selectedAccount.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Number:</span>
                    <span className="font-mono font-medium">{selectedAccount.bankAccountNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">IFSC Code:</span>
                    <span className="font-mono font-medium">{selectedAccount.ifsc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Branch Name:</span>
                    <span className="font-medium">{selectedAccount.branchName}</span>
                  </div>
                  {selectedAccount.accountCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Code:</span>
                      <span className="font-mono font-medium">{selectedAccount.accountCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Account Features</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest Rate:</span>
                    <span className="font-medium">{selectedAccount.interestRate ? `${selectedAccount.interestRate}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Internet Banking:</span>
                    <span className={`font-medium ${selectedAccount.features?.internetBanking ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAccount.features?.internetBanking ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mobile Banking:</span>
                    <span className={`font-medium ${selectedAccount.features?.mobileBanking ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAccount.features?.mobileBanking ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Debit Card:</span>
                    <span className={`font-medium ${selectedAccount.features?.debitCard ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAccount.features?.debitCard ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cheque Book:</span>
                    <span className={`font-medium ${selectedAccount.features?.chequeBook ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAccount.features?.chequeBook ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {selectedAccount.lastTransactionDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Transaction:</span>
                      <span className="font-medium">{new Date(selectedAccount.lastTransactionDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedAccount.notes && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedAccount.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setShowAccountDetails(false)} variant="secondary" size="md">
                Close
              </Button>
              <Button onClick={() => editAccount(selectedAccount)} variant="primary" size="md">
                <FiEdit className="h-4 w-4 mr-2" />
                Edit Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bank Account Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[800px] max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Bank Account</h3>
              <Button onClick={() => setShowEditModal(false)} variant="secondary" size="sm">
                <FiX className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <Select
                    options={BANK_OPTIONS}
                    
                    {...register("bankName")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <Select
                    options={ACCOUNT_TYPES}
                    
                    {...register("type")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder</label>
                  <Input
                    
                    {...register("accountHolder")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <Input
                    
                    {...register("bankAccountNo")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <Input
                    
                    {...register("ifsc")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <Input
                    
                    {...register("branchName")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance</label>
                  <Input
                    type="number"
                    step="0.01"
                    
                    {...register("currentBalance")}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select
                    options={STATUS_OPTIONS}
                    
                    {...register("status")}
                  />
                </div>
              </div>

              {watch('type') && ['Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO'].includes(watch('type')) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    
                    {...register("interestRate")}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Features</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      
                      {...register("features.internetBanking")}
                    />
                    <span className="text-sm">Internet Banking</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      
                      {...register("features.mobileBanking")}
                    />
                    <span className="text-sm">Mobile Banking</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      
                      {...register("features.debitCard")}
                    />
                    <span className="text-sm">Debit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="mr-2" 
                      
                      {...register("features.chequeBook")}
                    />
                    <span className="text-sm">Cheque Book</span>
                  </label>
                </div>
              </div>

          <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  rows="3"
                  
                  {...register("notes")} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  className="font-medium shadow-sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Update Account'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="md" 
                  className="font-medium shadow-sm"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
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