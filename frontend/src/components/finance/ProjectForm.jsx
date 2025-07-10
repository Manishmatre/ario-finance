import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/useAuth';
import axios from '../../utils/axios';
import Select from '../../components/ui/Select';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
  { value: 'software', label: 'Software' },
  { value: 'construction', label: 'Construction' },
];

export default function ProjectForm({ project, onSuccess, onCancel }) {
  const isEdit = !!project;
  const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      name: '',
      client: '',
      type: 'software',
      startDate: '',
      endDate: '',
      budget: '',
      description: '',
      status: 'planning',
    }
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user, company } = useAuth();
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);

  useEffect(() => {
    if (isEdit && project) {
      setValue('name', project.name || '');
      setValue('client', project.client || '');
      setValue('type', project.type || 'software');
      setValue('startDate', project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
      setValue('endDate', project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
      setValue('budget', project.budget || '');
      setValue('description', project.description || '');
      setValue('status', project.status || 'planning');
    }
  }, [isEdit, project, setValue]);

  useEffect(() => {
    setClientsLoading(true);
    setClientsError(null);
    axios.get('/api/finance/clients')
      .then(res => {
        setClients(res.data);
        setClientsLoading(false);
      })
      .catch(err => {
        setClientsError('Failed to fetch clients');
        setClientsLoading(false);
      });
  }, []);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    // Ensure tenantId is present
    const tenantId = (user && user.tenantId) || (company && company._id);
    if (!tenantId) {
      setError('Tenant ID is missing. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const payload = {
        name: data.name,
        client: data.client,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        description: data.description,
        status: data.status,
        tenantId,
      };
      console.log('Submitting project payload:', payload);
      console.log('User:', user, 'Company:', company);
      if (isEdit) {
        await axios.put(`/api/finance/projects/${project._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('/api/finance/projects', payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        reset();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.message || (isEdit ? 'Failed to update project' : 'Failed to add project'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800">{isEdit ? 'Edit Project' : 'Add Project'}</h3>
      </div>
      <div className="p-6">
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">Project {isEdit ? 'updated' : 'added'} successfully!</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
              <Input {...register('name', { required: true })} placeholder="Enter project name" />
              {errors.name && <span className="text-red-500 text-sm">Project name is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              {clientsLoading ? (
                <div className="text-gray-500 text-sm py-2">Loading clients...</div>
              ) : clientsError ? (
                <div className="text-red-500 text-sm py-2">{clientsError}</div>
              ) : (
                <Select
                  options={clients.map(c => ({ value: c.name, label: `${c.name}${c.email ? ` (${c.email})` : ''}` }))}
                  value={watch('client')}
                  onChange={e => setValue('client', e.target.value)}
                  error={errors.client}
                  {...register('client', { required: true })}
                />
              )}
              {errors.client && <span className="text-red-500 text-sm">Client is required</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Type *</label>
              <select {...register('type', { required: true })} className="border rounded px-3 py-2 w-full">
                {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select {...register('status', { required: true })} className="border rounded px-3 py-2 w-full">
                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <Input type="date" {...register('startDate')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <Input type="date" {...register('endDate')} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
              <Input type="number" min="0" step="0.01" {...register('budget')} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input as="textarea" rows={3} {...register('description')} placeholder="Project details..." />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Project' : 'Add Project')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
