import React, { useEffect, useState } from "react";
import Table from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from '../../components/ui/PageHeading';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { Card } from '../../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiCreditCard, FiPackage, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

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

const accountSummary = [
  { title: 'Total Accounts', value: 6, icon: <FiCreditCard className="h-6 w-6 text-blue-500" /> },
  { title: 'Total Balance', value: 1985000, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
  { title: 'Cash in Hand', value: 125000, icon: <FiPackage className="h-6 w-6 text-purple-500" /> },
  { title: 'Bank Balance', value: 1860000, icon: <FiTrendingUp className="h-6 w-6 text-yellow-500" /> },
];

const BALANCE_TYPES = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

const ACCOUNT_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'current', label: 'Current' },
  { value: 'savings', label: 'Savings' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ChartOfAccounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCashDetails, setShowCashDetails] = useState(false);
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
  const type = watch('type');
  const navigate = useNavigate();

  // Fetch accounts
  const fetchAccounts = () => {
    setLoading(true);
    axios
      .get("/api/finance/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAccounts(res.data.accounts && res.data.accounts.length > 0 ? res.data.accounts : mockAccounts);
        setLoading(false);
      })
      .catch(() => {
        setAccounts(mockAccounts);
        setError("Showing mock data. Backend unavailable.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line
  }, [token]);

  // Add account
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "/api/finance/accounts",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // Delete account
  const deleteAccount = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    setLoading(true);
    try {
      await axios.patch(
        `/api/finance/accounts/${id}`,
        { deleted: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Account deleted");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
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
        </div>
      )
    },
    { 
      Header: 'Account Number', 
      accessor: 'bankAccountNo',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      Header: 'IFSC Code', 
      accessor: 'ifsc',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
          {value}
        </span>
      )
    },
    { 
      Header: 'Opening Balance', 
      accessor: 'openingBalance',
      Cell: ({ value }) => `₹${value?.toLocaleString() || '0'}`
    },
    { 
      Header: 'Current Balance', 
      accessor: 'currentBalance',
      Cell: ({ value, row }) => {
        const change = value - row.original.openingBalance;
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
    },
    { 
      Header: 'Interest Rate', 
      accessor: 'interestRate',
      Cell: ({ value }) => value ? `${value}%` : 'N/A'
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
      Cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.type === 'Cash' ? (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => setShowCashDetails(row.original)}
            >
              View Cash
            </Button>
          ) : (
            <Button size="sm" variant="secondary">View</Button>
          )}
          <Button 
            size="sm" 
            variant="danger"
            onClick={() => deleteAccount(row.original._id)}
          >
            Delete
          </Button>
        </div>
      )
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
        {accountSummary.map((summary, index) => (
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
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
    </div>
  );
}