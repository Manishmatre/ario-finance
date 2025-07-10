import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeading from '../../components/ui/PageHeading';
import Loader from '../../components/ui/Loader';

export default function PayEmployeeSalary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      month: '',
      year: '',
      amount: '',
      status: 'paid',
      paidDate: new Date().toISOString().slice(0, 10),
      notes: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post(`/api/finance/employees/${id}/salary`, data);
      navigate(`/finance/employees/${id}`);
    } catch (err) {
      alert('Failed to add salary record');
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 max-w-xl mx-auto">
      <PageHeading
        title="Pay Employee Salary"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employees', to: '/finance/employees' },
          { label: 'Pay Salary' }
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
            <Input type="number" min="1" max="12" {...register('month', { required: true })} />
            {errors.month && <span className="text-red-500 text-xs">Month is required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
            <Input type="number" min="2000" max="2100" {...register('year', { required: true })} />
            {errors.year && <span className="text-red-500 text-xs">Year is required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
            <Input type="number" min="1" {...register('amount', { required: true })} />
            {errors.amount && <span className="text-red-500 text-xs">Amount is required</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select {...register('status')} className="w-full border-gray-300 rounded-md">
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paid Date</label>
            <Input type="date" {...register('paidDate')} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <Input {...register('notes')} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader size="sm" /> : 'Add Salary'}</Button>
        </div>
      </form>
    </div>
  );
} 