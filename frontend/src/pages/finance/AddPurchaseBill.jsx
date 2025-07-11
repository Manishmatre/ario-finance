import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import { FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Select from '../../components/ui/Select';
import { useWatch } from 'react-hook-form';

export default function AddPurchaseBill() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { register, handleSubmit, reset, formState: { errors }, setValue, control, watch } = useForm();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();
  const paymentMode = useWatch({ control, name: 'paymentMode' });

  // Fetch vendors and bank accounts for dropdowns
  useEffect(() => {
    axiosInstance.get('/api/finance/vendors')
      .then(res => setVendors(res.data))
      .catch(() => setVendors([]));
    axiosInstance.get('/api/finance/bank-accounts')
      .then(res => setBankAccounts(res.data.bankAccounts || []))
      .catch(() => setBankAccounts([]));
  }, []);

  // Fetch bill data if editing
  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    axiosInstance.get(`/api/finance/bills/${id}`)
      .then(res => {
        const bill = res.data;
        setValue('vendor', bill.vendorId?._id || bill.vendorId || '');
        setValue('billNo', bill.billNo || '');
        setValue('billDate', bill.billDate ? bill.billDate.slice(0, 10) : '');
        setValue('amount', bill.amount || '');
        setPaymentStatus(bill.paymentStatus || (bill.isPaid ? 'paid' : 'pending'));
        setPayments(bill.payments || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isEditMode, id, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('vendorId', data.vendor);
      formData.append('billNo', data.billNo);
      formData.append('billDate', data.billDate);
      formData.append('amount', data.amount);
      if (data.file && data.file[0]) {
        formData.append('file', data.file[0]);
      }
      let res;
      if (isEditMode) {
        res = await axiosInstance.put(`/api/finance/bills/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axiosInstance.post('/api/finance/bills', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setSuccess(true);
      setPaymentStatus(res.data.paymentStatus || 'pending');
      setPayments(res.data.payments || []);
      setTimeout(() => {
        navigate('/finance/bills');
      }, 1200);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add Purchase Bill"
        subtitle="Create a new purchase bill record"
        breadcrumbs={[
          { label: 'Purchase Bills', to: '/finance/bills' },
          { label: 'Add Bill' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Bill Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Bill added successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                <Select
                  options={vendors.map(v => ({ value: v._id, label: v.name }))}
                  {...register('vendor', { required: true })}
                  placeholder="Select vendor"
                />
                {errors.vendor && <span className="text-red-500 text-sm">Vendor is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill No *</label>
                <Input {...register('billNo', { required: true })} placeholder="Enter bill number" />
                {errors.billNo && <span className="text-red-500 text-sm">Bill number is required</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill Date *</label>
                <Input type="date" {...register('billDate', { required: true })} />
                {errors.billDate && <span className="text-red-500 text-sm">Bill date is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input type="number" min="1" {...register('amount', { required: true })} placeholder="Enter amount" />
                {errors.amount && <span className="text-red-500 text-sm">Amount is required</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bill File (PDF/JPG/PNG)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('file')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/bills')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Add Bill'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {success && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800 font-medium">Payment Status: {paymentStatus}</span>
        </div>
      )}
    </div>
  );
} 