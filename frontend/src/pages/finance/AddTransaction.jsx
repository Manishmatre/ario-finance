import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/ui/Select";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/useAuth";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiCalendar, FiFileText, FiCheckCircle } from "react-icons/fi";

export default function AddTransaction() {
  const { token } = useAuth();
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const watchDebitAccount = watch("debitAccount");
  const watchCreditAccount = watch("creditAccount");

  // Always fetch accounts from API
  useEffect(() => {
    setLoading(true);
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
        setAccounts([]);
      });
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
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
      setTimeout(() => setSuccess(false), 3000);
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
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
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
    </div>
  );
}
