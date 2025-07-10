import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeading from '../../components/ui/PageHeading';
import Loader from '../../components/ui/Loader';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function AdvanceToEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: {
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      reason: '',
      status: 'pending',
    }
  });
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post(`/api/finance/employees/${id}/advance`, data);
      setSuccess(true);
      reset();
      setTimeout(() => {
        setSuccess(false);
        navigate(`/finance/employees/${id}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add advance');
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 max-w-2xl mx-auto">
      <PageHeading
        title="Add Advance To Employee"
        subtitle="Record a new cash advance for this employee"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employees', to: '/finance/employees' },
          { label: 'Add Advance' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Advance Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">Advance added successfully!</span>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input type="number" min="1" {...register('amount', { required: true })} placeholder="Enter amount" />
                {errors.amount && <span className="text-red-500 text-xs">Amount is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <Input type="date" {...register('date', { required: true })} />
                {errors.date && <span className="text-red-500 text-xs">Date is required</span>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
                <Input {...register('reason', { required: true })} placeholder="Enter purpose" />
                {errors.reason && <span className="text-red-500 text-xs">Purpose is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select {...register('status')} className="w-full border-gray-300 rounded-md">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? <Loader size="sm" /> : 'Add Advance'}</Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 