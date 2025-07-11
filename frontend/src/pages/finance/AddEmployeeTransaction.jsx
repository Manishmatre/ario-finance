import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { useWatch } from 'react-hook-form';

const PAYMENT_MODE_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cheque', label: 'Cheque' },
];

export default function AddEmployeeTransaction() {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [transactionType, setTransactionType] = useState('salary');
  const [companyBanks, setCompanyBanks] = useState([]);
  const paymentMode = useWatch({ control, name: 'paymentMode' });
  const selectedEmployeeId = useWatch({ control, name: 'employeeId' });
  const selectedEmployee = employees.find(e => e._id === selectedEmployeeId);
  const location = useLocation();

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'paid', label: 'Paid' }
  ];

  // Read query params for employeeId and type
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const employeeId = params.get('employeeId');
    const type = params.get('type');
    if (employeeId) setValue('employeeId', employeeId);
    if (type) {
      setTransactionType(type);
      setValue('type', type);
    }
  }, [location.search, setValue]);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/employees')
      .then(res => setEmployees(res.data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
    axiosInstance.get('/api/finance/bank-accounts')
      .then(res => setCompanyBanks(res.data.bankAccounts || []))
      .catch(() => setCompanyBanks([]));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { employeeId, type, amount, date, status, notes, month, year, paymentMode, companyBankId, employeeBankName, upiId, chequeNo } = data;
      let payload, endpoint;
      if (type === 'advance') {
        payload = { amount, date, status, reason: notes, paymentMode, companyBankId, employeeBankName, upiId, chequeNo };
        endpoint = `/api/finance/employees/${employeeId}/advance`;
      } else if (type === 'other') {
        payload = { amount, date, status, description: notes, paymentMode, companyBankId, employeeBankName, upiId, chequeNo };
        endpoint = `/api/finance/employees/${employeeId}/other`;
      } else {
        payload = { amount, status, paidDate: date, notes, month: Number(month), year: Number(year), paymentMode, companyBankId, employeeBankName, upiId, chequeNo };
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
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add Employee Transaction"
        subtitle="Record a new salary or advance transaction for an employee."
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employee Transactions', to: '/finance/employee-transactions' },
          { label: 'Add Transaction' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Transaction Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Transaction added successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                <Select
                  {...register('employeeId', { required: true })}
                  options={employees.map(e => ({ value: e._id, label: e.name }))}
                  value={selectedEmployeeId || ''}
                  onChange={e => setValue('employeeId', e.target.value)}
                  className="w-full"
                  required
                />
                {errors.employeeId && <span className="text-red-500 text-sm">Employee is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <Select
                  {...register('type', { required: true, onChange: e => setTransactionType(e.target.value) })}
                  value={transactionType}
                  onChange={e => { setTransactionType(e.target.value); setValue('type', e.target.value); }}
                  options={[
                    { value: 'salary', label: 'Salary Payment' },
                    { value: 'advance', label: 'Advance Salary' },
                    { value: 'other', label: 'Other Employee Expense' },
                  ]}
                  className="w-full"
                  required
                />
                {errors.type && <span className="text-red-500 text-sm">Type is required</span>}
              </div>
            </div>
            {/* Payment Mode Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                <Select
                  {...register('paymentMode', { required: true })}
                  options={PAYMENT_MODE_OPTIONS}
                  className="w-full"
                  required
                />
                {errors.paymentMode && <span className="text-red-500 text-sm">Payment mode is required</span>}
              </div>
            </div>
            {/* Dynamic fields based on payment mode */}
            {paymentMode === 'bank_transfer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Bank Account *</label>
                  <Select
                    {...register('companyBankId', { required: true })}
                    options={companyBanks.map(b => ({ value: b._id, label: `${b.bankName} (${b.bankAccountNo})` }))}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Bank</label>
                  <Select
                    {...register('employeeBankName')}
                    options={selectedEmployee ? [
                      { value: selectedEmployee.bankName, label: selectedEmployee.bankName },
                      selectedEmployee.customBankName ? { value: selectedEmployee.customBankName, label: selectedEmployee.customBankName } : null
                    ].filter(Boolean) : []}
                    className="w-full"
                  />
                </div>
              </div>
            )}
            {paymentMode === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
                <Input {...register('upiId', { required: true })} placeholder="Enter UPI ID" className="w-full" />
              </div>
            )}
            {paymentMode === 'cheque' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Number *</label>
                <Input {...register('chequeNo', { required: true })} placeholder="Enter Cheque Number" className="w-full" />
              </div>
            )}
            {/* In the form, add status select and reason/description for advance/other */}
            {(transactionType === 'advance' || transactionType === 'other') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason / Description *</label>
                  <Input
                    {...register('notes', { required: true })}
                    placeholder={transactionType === 'advance' ? 'Reason for advance' : 'Description of expense'}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <Select
                    {...register('status', { required: true })}
                    options={statusOptions}
                    className="w-full"
                    required
                  />
                  {errors.status && <span className="text-red-500 text-sm">Status is required</span>}
                </div>
              </div>
            )}
            {/* For salary, keep existing fields */}
            {transactionType === 'salary' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
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
                  {errors.month && <span className="text-red-500 text-sm">Month is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <Input {...register('year', { required: true })} placeholder="Year" className="w-full" />
                  {errors.year && <span className="text-red-500 text-sm">Year is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <Input {...register('notes')} placeholder="Notes (optional)" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <Select
                    {...register('status', { required: true })}
                    options={statusOptions}
                    className="w-full"
                    required
                  />
                  {errors.status && <span className="text-red-500 text-sm">Status is required</span>}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  {...register('amount', { required: true })}
                  className="w-full"
                  required
                />
                {errors.amount && <span className="text-red-500 text-sm">Amount is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <Input
                  type="date"
                  {...register('date', { required: true })}
                  className="w-full"
                  required
                />
                {errors.date && <span className="text-red-500 text-sm">Date is required</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/employee-transactions')}>Cancel</Button>
              <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Add Transaction'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 