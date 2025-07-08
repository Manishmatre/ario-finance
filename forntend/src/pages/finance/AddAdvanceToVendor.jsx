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

export default function AddAdvanceToVendor() {
  const { id } = useParams();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [isEdit, setIsEdit] = useState(!!id);
  const navigate = useNavigate();

  // Fetch vendors for dropdown
  useEffect(() => {
    axiosInstance.get('/api/finance/vendors')
      .then(res => setVendors(res.data))
      .catch(() => setVendors([]));
  }, []);

  // If editing, fetch advance and prefill
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      setLoading(true);
      axiosInstance.get(`/api/finance/vendors/advances/${id}`)
        .then(res => {
          const adv = res.data;
          setValue('vendorId', adv.vendorId);
          setValue('amount', adv.amount);
          setValue('date', adv.date ? adv.date.slice(0, 10) : '');
        })
        .catch(() => setError('Failed to fetch advance'))
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await axiosInstance.put(`/api/finance/vendors/advances/${id}`, data);
      } else {
        await axiosInstance.post('/api/finance/vendors/advances', data);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/advance-vendor');
      }, 1200);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save advance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEdit ? 'Edit Advance To Vendor' : 'Add Advance To Vendor'}
        subtitle={isEdit ? 'Update advance payment details' : 'Record a new advance payment to a vendor'}
        breadcrumbs={[
          { label: 'Payables', to: '/finance/payables' },
          { label: 'Advance To Vendor', to: '/finance/advance-vendor' },
          { label: isEdit ? 'Edit Advance' : 'Add Advance' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Advance Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Advance added successfully!</span>
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
                  {...register('vendorId', { required: true })}
                  placeholder="Select vendor"
                />
                {errors.vendorId && <span className="text-red-500 text-sm">Vendor is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input type="number" min="1" {...register('amount', { required: true })} placeholder="Enter amount" />
                {errors.amount && <span className="text-red-500 text-sm">Amount is required</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <Input type="date" {...register('date', { required: true })} />
                {errors.date && <span className="text-red-500 text-sm">Date is required</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/advance-vendor')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? (isEdit ? 'Saving...' : 'Saving...') : (isEdit ? 'Update Advance' : 'Add Advance')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 