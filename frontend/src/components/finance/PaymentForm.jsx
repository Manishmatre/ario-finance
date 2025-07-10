import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/useAuth';
import axios from '../../utils/axios';

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'check', label: 'Check' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
];

export default function PaymentForm({ projectId, payment, onSuccess, onCancel }) {
  const isEdit = !!payment;
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      amount: '',
      paymentDate: '',
      paymentMethod: 'bank_transfer',
      referenceNumber: '',
      bankAccountId: '',
      notes: ''
    }
  });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const { data } = await axios.get('/api/finance/bank-accounts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBankAccounts(data);
        if (data.length === 1) {
          setValue('bankAccountId', data[0]._id);
        }
      } catch {}
    };
    fetchBankAccounts();
  }, [token, setValue]);

  useEffect(() => {
    if (isEdit && payment) {
      setValue('amount', payment.amount || '');
      setValue('paymentDate', payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '');
      setValue('paymentMethod', payment.paymentMethod || 'bank_transfer');
      setValue('referenceNumber', payment.referenceNumber || '');
      setValue('bankAccountId', payment.bankAccountId?._id || '');
      setValue('notes', payment.notes || '');
    } else {
      setValue('paymentDate', new Date().toISOString().split('T')[0]);
    }
  }, [isEdit, payment, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    try {
      const url = isEdit
        ? `/api/finance/projects/payments/${payment._id}`
        : `/api/finance/projects/${projectId}/payments`;
      const method = isEdit ? 'put' : 'post';
      await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        reset();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || (isEdit ? 'Failed to update payment' : 'Failed to add payment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800">{isEdit ? 'Edit Payment' : 'Record Payment'}</h3>
      </div>
      <div className="p-6">
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">Payment {isEdit ? 'updated' : 'added'} successfully!</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <Input type="number" min="0.01" step="0.01" {...register('amount', { required: true })} placeholder="0.00" />
              {errors.amount && <span className="text-red-500 text-sm">Amount is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
              <Input type="date" {...register('paymentDate', { required: true })} />
              {errors.paymentDate && <span className="text-red-500 text-sm">Date is required</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select {...register('paymentMethod', { required: true })} className="border rounded px-3 py-2 w-full">
                {PAYMENT_METHODS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
              <Input {...register('referenceNumber')} placeholder="e.g. Check #, UPI Ref, etc." />
            </div>
          </div>
          {bankAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
              <select {...register('bankAccountId')} className="border rounded px-3 py-2 w-full">
                <option value="">Select Bank Account</option>
                {bankAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} - {account.accountNumber} ({account.bankName})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <Input as="textarea" rows={3} {...register('notes')} placeholder="Any additional notes about this payment" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Payment' : 'Add Payment')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
