import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import { FiDollarSign, FiCalendar, FiFileText, FiCheckCircle, FiArrowLeft } from "react-icons/fi";

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

// Mock transaction data
const mockTransaction = {
  id: 'TXN-2025-001',
  debitAccount: '2',
  creditAccount: '11',
  amount: 50000,
  date: '2025-01-15',
  costCode: 'CC001',
  reference: 'INV-2025-001',
  narration: 'Payment received for invoice INV-2025-001 from ABC Company',
  status: 'Posted',
  createdBy: 'Finance Manager',
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-15T10:30:00Z'
};

const transactionSummary = [
  { title: 'Transaction ID', value: 'TXN-2025-001', icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
  { title: 'Amount', value: 50000, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
  { title: 'Date', value: '15 Jan 2025', icon: <FiCalendar className="h-6 w-6 text-purple-500" /> },
  { title: 'Status', value: 'Posted', icon: <FiCheckCircle className="h-6 w-6 text-yellow-500" /> },
];

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [accounts, setAccounts] = useState([]);

  const watchDebitAccount = watch("debitAccount");
  const watchCreditAccount = watch("creditAccount");

  useEffect(() => {
    // Simulate API call to fetch transaction
    setTimeout(() => {
      setTransaction(mockTransaction);
      setAccounts(mockAccounts);
      
      // Set form default values
      reset({
        debitAccount: mockTransaction.debitAccount,
        creditAccount: mockTransaction.creditAccount,
        amount: mockTransaction.amount,
        date: mockTransaction.date,
        costCode: mockTransaction.costCode,
        reference: mockTransaction.reference,
        narration: mockTransaction.narration
      });
      
      setLoading(false);
    }, 1000);
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update transaction
      setTransaction(prev => ({
        ...prev,
        ...data,
        amount: Number(data.amount),
        updatedAt: new Date().toISOString()
      }));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    } finally {
      setSaving(false);
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

  if (loading) {
    return <Loader />;
  }

  if (!transaction) {
    return (
      <div className="space-y-4 px-2 sm:px-4">
        <PageHeading
          title="Transaction Not Found"
          subtitle="The requested transaction could not be found"
          breadcrumbs={[
            { label: "Finance", to: "/finance" },
            { label: "Edit Transaction" }
          ]}
        />
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <p className="text-gray-600">Transaction with ID {id} was not found.</p>
          <Button onClick={() => navigate('/finance')} className="mt-4">
            Back to Finance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Edit Transaction"
        subtitle="Modify transaction details and journal entries"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Edit Transaction" }
        ]}
        action={
          <Button 
            variant="secondary" 
            onClick={() => navigate('/finance')}
            className="flex items-center gap-2"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Finance
          </Button>
        }
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
          <h3 className="text-lg font-medium text-gray-800">Edit Transaction - {transaction.id}</h3>
        </div>
        <div className="p-6">
          {saving && <Loader />}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Transaction updated successfully!</span>
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
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="0.00"
                  {...register("amount", { required: true, min: 0.01 })} 
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

            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Transaction Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
                  <span className="text-gray-500">Created by:</span>
                  <p className="text-gray-900">{transaction.createdBy}</p>
        </div>
        <div>
                  <span className="text-gray-500">Created on:</span>
                  <p className="text-gray-900">{new Date(transaction.createdAt).toLocaleString('en-IN')}</p>
        </div>
    <div>
                  <span className="text-gray-500">Last updated:</span>
                  <p className="text-gray-900">{new Date(transaction.updatedAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={saving || !!accountValidationError}>
                {saving ? 'Updating Transaction...' : 'Update Transaction'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/finance')}
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
