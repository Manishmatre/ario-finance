import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MoneyInput } from "../../components/ui/MoneyInput";
import Select from "../../components/ui/Select";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiCalendar, FiFileText, FiCheckCircle } from "react-icons/fi";

// Mock accounts data
const mockAccounts = [
  { _id: '1', name: 'Cash in Hand', code: '1001', type: 'Asset' },
  { _id: '2', name: 'Bank of India', code: '1002', type: 'Asset' },
  { _id: '3', name: 'HDFC Bank', code: '1003', type: 'Asset' },
  { _id: '4', name: 'ICICI Bank', code: '1004', type: 'Asset' },
  { _id: '5', name: 'Accounts Receivable', code: '1100', type: 'Asset' },
  { _id: '6', name: 'Inventory', code: '1200', type: 'Asset' },
  { _id: '7', name: 'Fixed Assets', code: '1300', type: 'Asset' },
  { _id: '8', name: 'Accounts Payable', code: '2000', type: 'Liability' },
  { _id: '9', name: 'Bank Loans', code: '2100', type: 'Liability' },
  { _id: '10', name: 'Capital', code: '3000', type: 'Equity' },
  { _id: '11', name: 'Sales Revenue', code: '4000', type: 'Revenue' },
  { _id: '12', name: 'Cost of Goods Sold', code: '5000', type: 'Expense' },
  { _id: '13', name: 'Operating Expenses', code: '6000', type: 'Expense' },
  { _id: '14', name: 'Salary Expenses', code: '6100', type: 'Expense' },
  { _id: '15', name: 'Rent Expenses', code: '6200', type: 'Expense' },
];

const transactionSummary = [
  { title: 'Total Transactions', value: 156, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
  { title: 'This Month', value: 23, icon: <FiCalendar className="h-6 w-6 text-green-500" /> },
  { title: 'Total Amount', value: 2845000, icon: <FiDollarSign className="h-6 w-6 text-purple-500" /> },
  { title: 'Pending Approval', value: 5, icon: <FiCheckCircle className="h-6 w-6 text-yellow-500" /> },
];

export default function AddTransaction() {
  const { token } = useAuth();
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [useMockData, setUseMockData] = useState(true);

  const watchDebitAccount = watch("debitAccount");
  const watchCreditAccount = watch("creditAccount");

  // Fetch accounts for dropdowns
  useEffect(() => {
    setLoading(true);
    if (useMockData) {
      // Use mock data
      setTimeout(() => {
        setAccounts(mockAccounts);
        setLoading(false);
      }, 500);
    } else {
      // Use real API
    axios
      .get("/api/finance/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAccounts(res.data.accounts || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
          // Fallback to mock data if API fails
          setAccounts(mockAccounts);
      });
    }
  }, [token, useMockData]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (useMockData) {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Transaction added successfully");
        reset();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Real API call
      await axios.post(
        "/api/finance/transactions",
        {
          ...data,
          amount: Number(data.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Transaction added successfully");
      reset();
      setSuccess(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const getAccountType = (accountId) => {
    const account = accounts.find(a => a._id === accountId);
    return account?.type;
  };

  const validateAccounts = () => {
    if (watchDebitAccount && watchCreditAccount) {
      const debitType = getAccountType(watchDebitAccount);
      const creditType = getAccountType(watchCreditAccount);
      
      if (debitType === creditType) {
        return "Debit and Credit accounts should be of different types";
      }
    }
    return null;
  };

  const accountValidationError = validateAccounts();

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add Transaction"
        subtitle="Create new journal entries and transactions"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Add Transaction" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {transactionSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Amount') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Transaction Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">New Transaction</h3>
        </div>
        <div className="p-6">
          {loading && <Loader />}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Transaction added successfully!</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Debit Account *</label>
                <Select
                  options={accounts.map((a) => ({ 
                    value: a._id, 
                    label: `${a.name} (${a.code}) - ${a.type}` 
                  }))}
                  {...register("debitAccount", { required: true })}
                  placeholder="Select debit account"
                />
                {errors.debitAccount && (
                  <span className="text-red-500 text-sm">Debit account is required</span>
                )}
              </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Account *</label>
          <Select
                  options={accounts.map((a) => ({ 
                    value: a._id, 
                    label: `${a.name} (${a.code}) - ${a.type}` 
                  }))}
            {...register("creditAccount", { required: true })}
                  placeholder="Select credit account"
          />
                {errors.creditAccount && (
                  <span className="text-red-500 text-sm">Credit account is required</span>
                )}
              </div>
            </div>

            {accountValidationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-red-700 text-sm">{accountValidationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                <MoneyInput 
                  {...register("amount", { required: true, min: 0.01 })} 
                  placeholder="0.00"
                />
                {errors.amount && (
                  <span className="text-red-500 text-sm">Valid amount is required</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date *</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register("date", { required: true })} 
                />
                {errors.date && (
                  <span className="text-red-500 text-sm">Transaction date is required</span>
                )}
              </div>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Code</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., CC001, PROJECT-A"
                  {...register("costCode")} 
                />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="e.g., INV-001, PO-2025-001"
                  {...register("reference")} 
                />
              </div>
        </div>

        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Narration/Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="3"
                placeholder="Enter transaction description or narration..."
                {...register("narration")} 
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading || !!accountValidationError}>
                {loading ? 'Adding Transaction...' : 'Add Transaction'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => reset()}
                className="flex-1"
                disabled={loading}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Mock Data Toggle */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
        <div>
            <h4 className="text-sm font-medium text-gray-900">Data Source</h4>
            <p className="text-sm text-gray-500">Toggle between mock data and API</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {useMockData ? 'Mock Data' : 'API'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
