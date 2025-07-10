import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import { FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/useAuth';

export default function AddClient() {
  const { id: clientId } = useParams();
  const isEdit = !!clientId;
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, company } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios.get(`/api/finance/clients/${clientId}`)
        .then(res => {
          const c = res.data;
          setValue('name', c.name || '');
          setValue('email', c.email || '');
          setValue('phone', c.phone || '');
          setValue('address', c.address || '');
          setValue('gstNo', c.gstNo || '');
          setValue('company', c.company || '');
        })
        .catch(() => setError('Failed to fetch client'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, clientId, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        tenantId: (user && user.tenantId) || (company && company._id) || undefined,
      };
      if (isEdit) {
        await axios.put(`/api/finance/clients/${clientId}`, payload);
      } else {
        await axios.post('/api/finance/clients', payload);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/clients');
      }, 1200);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || (isEdit ? 'Failed to update client' : 'Failed to add client'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEdit ? 'Edit Client' : 'Add Client'}
        subtitle={isEdit ? 'Update client details' : 'Create a new client record'}
        breadcrumbs={[
          { label: 'Clients', to: '/finance/clients' },
          { label: isEdit ? 'Edit Client' : 'Add Client' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Client Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Client {isEdit ? 'updated' : 'added'} successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                <Input {...register('name', { required: true })} placeholder="Enter client name" />
                {errors.name && <span className="text-red-500 text-sm">Client name is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <Input {...register('email')} placeholder="Enter email" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input {...register('phone')} placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input {...register('address')} placeholder="Enter address" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST No</label>
                <Input {...register('gstNo')} placeholder="Enter GST number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <Input {...register('company')} placeholder="Enter company name" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/clients')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Client' : 'Add Client')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 