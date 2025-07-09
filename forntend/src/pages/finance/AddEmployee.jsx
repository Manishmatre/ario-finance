import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeading from '../../components/ui/PageHeading';
import Loader from '../../components/ui/Loader';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import CreatableSelect from '../../components/ui/CreatableSelect';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' },
];

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select department' },
  { value: 'Admin', label: 'Admin' },
  { value: 'HR', label: 'HR' },
  { value: 'Sales', label: 'Sales' },
  { value: 'IT', label: 'IT' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Finance', label: 'Finance' },
];
const DESIGNATION_OPTIONS = [
  { value: '', label: 'Select designation' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Executive', label: 'Executive' },
  { value: 'Assistant', label: 'Assistant' },
  { value: 'Officer', label: 'Officer' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Analyst', label: 'Analyst' },
  { value: 'Clerk', label: 'Clerk' },
  { value: 'Intern', label: 'Intern' },
];

export default function AddEmployee() {
  const { id: employeeId } = useParams();
  const isEdit = !!employeeId;
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting }, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      designation: '',
      salary: '',
      joinDate: '',
      status: 'active',
    }
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axiosInstance.get(`/api/finance/employees/${employeeId}`)
        .then(res => {
          const e = res.data;
          setValue('name', e.name || '');
          setValue('email', e.email || '');
          setValue('phone', e.phone || '');
          setValue('department', e.department || '');
          setValue('designation', e.designation || '');
          setValue('salary', e.salary || '');
          setValue('joinDate', e.joinDate ? e.joinDate.slice(0, 10) : '');
          setValue('status', e.status || 'active');
        })
        .catch(() => setError('Failed to fetch employee'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, employeeId, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await axiosInstance.patch(`/api/finance/employees/${employeeId}`, data);
      } else {
        await axiosInstance.post('/api/finance/employees', data);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/employees');
      }, 1200);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || err.message || (isEdit ? 'Failed to update employee' : 'Failed to add employee'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-8 max-w-4xl mx-auto">
      <PageHeading
        title={isEdit ? 'Edit Employee' : 'Add Employee'}
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employees', to: '/finance/employees' },
          { label: isEdit ? 'Edit Employee' : 'Add Employee' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Employee Details</h3>
        </div>
        <div className="p-8">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">{isEdit ? 'Employee updated successfully!' : 'Employee added successfully!'}</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <FiAlertTriangle className="h-5 w-5 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Personal Information */}
            <div>
              <h4 className="text-md font-semibold mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <Input {...register('name', { required: true })} placeholder="Enter employee name" />
                  {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Input type="email" {...register('email', { required: true })} placeholder="Enter email" />
                  {errors.email && <span className="text-red-500 text-xs">Email is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <Input {...register('phone', { required: true })} placeholder="Enter phone number" />
                  {errors.phone && <span className="text-red-500 text-xs">Phone is required</span>}
                </div>
              </div>
            </div>
            {/* Job Details */}
            <div>
              <h4 className="text-md font-semibold mb-4">Job Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <CreatableSelect options={DEPARTMENT_OPTIONS} value={watch('department')} onChange={e => setValue('department', e.target.value)} placeholder="Select or type department" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <CreatableSelect options={DESIGNATION_OPTIONS} value={watch('designation')} onChange={e => setValue('designation', e.target.value)} placeholder="Select or type designation" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                  <Input type="number" min="0" {...register('salary', { required: true })} placeholder="Enter salary" />
                  {errors.salary && <span className="text-red-500 text-xs">Salary is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
                  <Input type="date" {...register('joinDate', { required: true })} />
                  {errors.joinDate && <span className="text-red-500 text-xs">Join date is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Select options={STATUS_OPTIONS} {...register('status')} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting || loading}>{isSubmitting || loading ? <Loader size="sm" /> : isEdit ? 'Update Employee' : 'Add Employee'}</Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/finance/employees')} disabled={isSubmitting || loading}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 