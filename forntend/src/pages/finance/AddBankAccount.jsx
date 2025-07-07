import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import PageHeading from "../../components/ui/PageHeading";
import { MoneyInput } from "../../components/ui/MoneyInput";
import { Card } from "../../components/ui/Card";
import { FiCheckCircle } from "react-icons/fi";
import api from "../../utils/axios";

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



export default function AddBankAccount() {
  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const watchBankName = watch("bankName");
  const watchAccountType = watch("type");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Form data received:', data);
      
      // Prepare the data for API
      const bankAccountData = {
        bankName: data.bankName,
        type: data.type,
        accountHolder: data.accountHolder,
        bankAccountNo: data.bankAccountNo,
        ifsc: data.ifsc,
        branchName: data.branchName,
        currentBalance: parseFloat(data.currentBalance) || 0,
        status: data.status,
        interestRate: data.interestRate ? parseFloat(data.interestRate) : 0,
        features: {
          internetBanking: data.features?.internetBanking || false,
          mobileBanking: data.features?.mobileBanking || false,
          debitCard: data.features?.debitCard || false,
          chequeBook: data.features?.chequeBook || false
        },
        notes: data.notes
      };

      console.log('Prepared data for API:', bankAccountData);

      // Make API call using axios
      const response = await api.post('/api/finance/bank-accounts', bankAccountData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/accounts');
      }, 1200);
      reset();
    } catch (error) {
      console.error('Failed to add account:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create bank account';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add Bank Account"
        subtitle="Create new bank account with opening balance"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Chart of Accounts", to: "/finance/accounts" },
          { label: "Add Bank Account" }
        ]}
      />



      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Bank Account Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Bank account added successfully!</span>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Bank Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                <Select
                  options={BANK_OPTIONS}
                  {...register("bankName", { required: true })}
                  placeholder="Select bank"
                />
                {errors.bankName && (
                  <span className="text-red-500 text-sm">Bank name is required</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
                <Select
                  options={ACCOUNT_TYPES}
                  {...register("type", { required: true })}
                  placeholder="Select account type"
                />
                {errors.type && (
                  <span className="text-red-500 text-sm">Account type is required</span>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter account holder name"
                  {...register("accountHolder", { required: true })}
                />
                {errors.accountHolder && (
                  <span className="text-red-500 text-sm">Account holder name is required</span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter account number"
                  {...register("bankAccountNo", { required: true })}
                />
                {errors.bankAccountNo && (
                  <span className="text-red-500 text-sm">Account number is required</span>
                )}
              </div>
            </div>

            {/* Bank Codes and Branch Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" 
                  placeholder="e.g., SBIN0001234"
                  {...register("ifsc", { required: true, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/ })}
                />
                {errors.ifsc && (
                  <span className="text-red-500 text-sm">
                    {errors.ifsc.type === 'pattern' ? 'Invalid IFSC format' : 'IFSC code is required'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Enter branch name"
                  {...register("branchName", { required: true })}
                />
                {errors.branchName && (
                  <span className="text-red-500 text-sm">Branch name is required</span>
                )}
              </div>
            </div>

            {/* Balance Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Balance Information</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Balance (₹) *</label>
                <MoneyInput 
                  {...register("currentBalance", { required: true, min: 0 })} 
                  placeholder="0.00"
                />
                {errors.currentBalance && (
                  <span className="text-red-500 text-sm">Current balance is required</span>
                )}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Status *</label>
                <Select
                  options={STATUS_OPTIONS}
                  {...register("status", { required: true })}
                  placeholder="Select status"
                />
                {errors.status && (
                  <span className="text-red-500 text-sm">Status is required</span>
                )}
              </div>
              
              {watchAccountType && ['Savings', 'Fixed Deposit', 'Recurring Deposit', 'NRE', 'NRO'].includes(watchAccountType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="e.g., 4.5"
                    {...register("interestRate")}
                  />
                </div>
              )}
            </div>

            {/* Account Features */}
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

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="3"
                placeholder="Any additional notes about this account..."
                {...register("notes")} 
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Adding Account...' : 'Add Bank Account'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/finance/accounts')}
                className="flex-1"
                disabled={loading}
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