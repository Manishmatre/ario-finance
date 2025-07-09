import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function AddEmployeeTransaction() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState('salary');

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/employees')
      .then(res => setEmployees(res.data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { employeeId, type, amount, date, status, notes, month, year } = data;
      let payload, endpoint;
      if (type === 'advance') {
        payload = { amount, date, status, reason: notes };
        endpoint = `/api/finance/employees/${employeeId}/advance`;
      } else {
        payload = { amount, status, paidDate: date, notes, month: Number(month), year: Number(year) };
        endpoint = `/api/finance/employees/${employeeId}/salary`;
      }
      await axiosInstance.post(endpoint, payload);
      setSuccess(true);
      setTimeout(() => navigate('/finance/employee-transactions'), 1200);
      reset();
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 max-w-xl mx-auto">
      <PageHeading
        title="Add Employee Transaction"
        subtitle="Record a new salary or advance transaction for an employee."
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employee Transactions', to: '/finance/employee-transactions' },
          { label: 'Add Transaction' }
        ]}
      />
      <Card>
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">Transaction added successfully!</div>}
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <Select
              {...register('employeeId', { required: true })}
              options={employees.map(e => ({ value: e._id, label: e.name }))}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <Select
              {...register('type', { required: true, onChange: e => setTransactionType(e.target.value) })}
              value={transactionType}
              onChange={e => { setTransactionType(e.target.value); setValue('type', e.target.value); }}
              options={[
                { value: 'salary', label: 'Salary' },
                { value: 'advance', label: 'Advance' },
              ]}
              className="w-full"
              required
            />
          </div>
          {transactionType === 'salary' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                <Select
                  {...register('month', { required: true })}
                  options={[
                    { value: 1, label: 'January' },
                    { value: 2, label: 'February' },
                    { value: 3, label: 'March' },
                    { value: 4, label: 'April' },
                    { value: 5, label: 'May' },
                    { value: 6, label: 'June' },
                    { value: 7, label: 'July' },
                    { value: 8, label: 'August' },
                    { value: 9, label: 'September' },
                    { value: 10, label: 'October' },
                    { value: 11, label: 'November' },
                    { value: 12, label: 'December' },
                  ]}
                  className="w-full"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  {...register('year', { required: true })}
                  className="w-full"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <Input
              type="number"
              min="1"
              step="0.01"
              {...register('amount', { required: true })}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <Input
              type="date"
              {...register('date', { required: true })}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <Select
              {...register('status', { required: true })}
              options={transactionType === 'advance'
                ? [
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]
                : [
                  { value: 'paid', label: 'Paid' },
                  { value: 'unpaid', label: 'Unpaid' },
                ]}
              className="w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <Input
              {...register('notes')}
              className="w-full"
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add Transaction</Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 