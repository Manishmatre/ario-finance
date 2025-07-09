import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { useEffect as useEffect2 } from 'react';

export default function ExpenseForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [success, setSuccess] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      amount: '',
      category: '',
      description: '',
      paymentMethod: 'cash',
      referenceNo: '',
      notes: '',
      status: 'pending',
    }
  });

  // Fetch categories
  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/expenses/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch and set expense data in edit mode
  useEffect(() => {
    if (!isEditMode) return;
          setLoading(true);
    axiosInstance.get(`/api/finance/expenses/${id}`)
      .then(res => {
        const exp = res.data;
        setValue('date', exp.date ? exp.date.slice(0, 10) : '');
        setValue('amount', exp.amount || '');
        setValue('category', exp.category?._id || exp.category || '');
        setValue('description', exp.description || '');
        setValue('paymentMethod', exp.paymentMethod || 'cash');
        setValue('referenceNo', exp.referenceNo || '');
        setValue('notes', exp.notes || '');
        setValue('status', exp.status || 'pending');
        setSelectedCategory(exp.category?._id || exp.category || '');
        if (exp.receipt) {
          setReceiptPreview(exp.receipt);
        } else {
          setReceiptPreview(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isEditMode, id, setValue]);

  // Fetch bank accounts for dropdown
  useEffect2(() => {
    axiosInstance.get('/api/finance/bank-accounts?limit=100')
      .then(res => setBankAccounts(res.data.bankAccounts || []))
      .catch(() => setBankAccounts([]));
  }, []);

  // File upload/preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setReceiptPreview(null);
    }
  };

  // Minimal submit
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      if (file) formData.append('receipt', file);
      if (isEditMode) {
        await axiosInstance.put(`/api/finance/expenses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axiosInstance.post('/api/finance/expenses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSuccess(true);
      setTimeout(() => {
      navigate('/finance/expenses');
      }, 1200);
    } catch (err) {
      alert('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  // Watch category for conditional fields
  const category = watch('category');
  const paymentMethod = watch('paymentMethod');

  // Example: Show referenceNo only for 'Travel' or 'Supplies' category
  const showReference = category && ['travel', 'supplies'].includes(category.toLowerCase());
  const showBankDropdown = paymentMethod === 'bank_transfer';

  // Build options arrays for Select
  const categoryOptions = [{ value: '', label: 'Select category' }, ...categories.map(cat => ({ value: cat._id || cat.value || cat.name, label: cat.name || cat.label }))];
  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'other', label: 'Other' },
  ];
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
  ];
  const bankAccountOptions = [{ value: '', label: 'Select bank account' }, ...bankAccounts.map(acc => ({ value: acc._id, label: `${acc.bankName} - ${acc.bankAccountNo}` }))];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEditMode ? 'Edit Expense' : 'Add New Expense'}
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Expenses', to: '/finance/expenses' },
          { label: isEditMode ? 'Edit Expense' : 'Add New Expense' },
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Expense Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-800">Expense added successfully!</span>
                    </div>
                    </div>
                )}
          {loading && <Loader />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <Input type="date" {...register('date', { required: true })} />
                {errors.date && <span className="text-red-500 text-xs">Date is required</span>}
                    </div>
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input type="number" min="1" step="0.01" {...register('amount', { required: true })} />
                {errors.amount && <span className="text-red-500 text-xs">Amount is required</span>}
                    </div>
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <Select options={categoryOptions} {...register('category', { required: true })} value={category} onChange={e => { setValue('category', e.target.value); setSelectedCategory(e.target.value); }} />
                {errors.category && <span className="text-red-500 text-xs">Category is required</span>}
                    </div>
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <TextArea {...register('description', { required: true })} rows={2} />
                {errors.description && <span className="text-red-500 text-xs">Description is required</span>}
                    </div>
                    <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                <Select options={paymentMethodOptions} {...register('paymentMethod', { required: true })} />
                {errors.paymentMethod && <span className="text-red-500 text-xs">Payment method is required</span>}
                    </div>
              {showReference && (
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference No</label>
                  <Input {...register('referenceNo')} />
                  </div>
                )}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <Select options={statusOptions} {...register('status', { required: true })} />
                {errors.status && <span className="text-red-500 text-xs">Status is required</span>}
              </div>
              {showBankDropdown && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account *</label>
                  <Select options={bankAccountOptions} {...register('bankAccount', { required: showBankDropdown })} />
                  {errors.bankAccount && <span className="text-red-500 text-xs">Bank account is required for bank transfer</span>}
                  </div>
                )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt (Image/PDF, optional)</label>
                <Input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
                {receiptPreview && (
                  <img src={receiptPreview} alt="Receipt Preview" className="mt-2 max-h-32 rounded border" />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <TextArea {...register('notes')} rows={2} />
            </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/expenses')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
