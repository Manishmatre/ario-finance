import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import { FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Select from '../../components/ui/Select';
import { toast } from 'react-toastify';

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const PAYMENT_MODE_OPTIONS = [
  'NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque', 'Cash', 'Card', 'Wallet', 'Other'
];

const BANK_OPTIONS = [
  { value: '', label: 'Select Bank' },
  { value: 'SBI', label: 'State Bank of India' },
  { value: 'HDFC', label: 'HDFC Bank' },
  { value: 'ICICI', label: 'ICICI Bank' },
  { value: 'Axis', label: 'Axis Bank' },
  { value: 'Kotak', label: 'Kotak Mahindra Bank' },
  { value: 'Yes Bank', label: 'Yes Bank' },
  { value: 'PNB', label: 'Punjab National Bank' },
  { value: 'Canara', label: 'Canara Bank' },
  { value: 'Bank of Baroda', label: 'Bank of Baroda' },
  { value: 'Union Bank', label: 'Union Bank of India' },
  { value: 'Other', label: 'Other (Specify)' },
];

export default function AddVendor() {
  const { id: vendorId } = useParams();
  const isEdit = !!vendorId;
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      bankAccounts: [{}],
      paymentModes: []
    }
  });
  const { fields: bankAccountFields, append: appendBankAccount, remove: removeBankAccount } = useFieldArray({
    control,
    name: 'bankAccounts'
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [cashOnly, setCashOnly] = useState(false);

  React.useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axiosInstance.get(`/api/finance/vendors/${vendorId}`)
        .then(res => {
          const v = res.data;
          setValue('name', v.name || '');
          setValue('gstNo', v.gstNo || '');
          setValue('phone', v.phone || '');
          setValue('address', v.address || '');
          setValue('bankAccounts', Array.isArray(v.bankAccounts) && v.bankAccounts.length > 0 ? v.bankAccounts : [{}]);
          setValue('paymentModes', Array.isArray(v.paymentModes) ? v.paymentModes : []);
          setCashOnly(!!v.cashOnly);
        })
        .catch(err => setError('Failed to fetch vendor'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, vendorId, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: data.name,
        gstNo: data.gstNo,
        phone: data.phone,
        address: data.address,
        bankAccounts: data.bankAccounts?.filter(acc => acc.accountHolder || acc.bankName || acc.accountNumber || acc.ifsc || acc.branch || acc.notes),
        paymentModes: data.paymentModes || [],
        cashOnly: cashOnly
      };
      if (isEdit) {
        await axiosInstance.put(`/api/finance/vendors/${vendorId}`, payload);
        toast.success('Vendor updated successfully');
      } else {
        await axiosInstance.post('/api/finance/vendors', payload);
        toast.success('Vendor added successfully');
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/vendors');
      }, 1200);
      reset();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || (isEdit ? 'Failed to update vendor' : 'Failed to add vendor');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEdit ? 'Edit Vendor' : 'Add Vendor'}
        subtitle={isEdit ? 'Update vendor details' : 'Create a new vendor record'}
        breadcrumbs={[
          { label: 'Vendors', to: '/finance/vendors' },
          { label: isEdit ? 'Edit Vendor' : 'Add Vendor' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Vendor Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Vendor added successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                <Input {...register('name', { required: true })} placeholder="Enter vendor name" />
                {errors.name && <span className="text-red-500 text-sm">Vendor name is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                <Input {...register('gstNo')} placeholder="Enter GST number" disabled={cashOnly} />
              </div>
            </div>
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" checked={cashOnly} onChange={e => setCashOnly(e.target.checked)} />
                <span className="ml-2 text-sm text-gray-700 font-medium">Cash Only (No GST)</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <Input {...register('phone')} placeholder="Enter phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input {...register('address')} placeholder="Enter address" />
              </div>
            </div>
            {/* Bank Accounts Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-md font-semibold mb-4 flex items-center justify-between">Bank Account Details (for payments)
                <Button type="button" variant="outline" onClick={() => appendBankAccount({})}>Add Another</Button>
              </h4>
              {bankAccountFields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 border-b border-gray-100 pb-4 relative">
                  <button type="button" className="absolute top-0 right-0 text-red-500 text-xs" onClick={() => removeBankAccount(idx)} disabled={bankAccountFields.length === 1}>Remove</button>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder</label>
                    <Input {...register(`bankAccounts.${idx}.accountHolder`)} placeholder="Enter account holder name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                    <Select
                      options={BANK_OPTIONS}
                      {...register(`bankAccounts.${idx}.bankName`)}
                      value={control._formValues?.bankAccounts?.[idx]?.bankName || ''}
                      onChange={e => {
                        setValue(`bankAccounts.${idx}.bankName`, e.target.value);
                      }}
                    />
                    {control._formValues?.bankAccounts?.[idx]?.bankName === 'Other' && (
                      <Input className="mt-2" {...register(`bankAccounts.${idx}.customBankName`)} placeholder="Enter bank name" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <Input {...register(`bankAccounts.${idx}.accountNumber`)} placeholder="Enter account number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                    <Input {...register(`bankAccounts.${idx}.ifsc`)} placeholder="Enter IFSC code" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <Input {...register(`bankAccounts.${idx}.branch`)} placeholder="Enter branch name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <Input {...register(`bankAccounts.${idx}.notes`)} placeholder="Any notes (optional)" />
                  </div>
                </div>
              ))}
            </div>
            {/* Payment Modes Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-md font-semibold mb-4">Preferred Payment Modes</h4>
              <div className="flex flex-wrap gap-4">
                {PAYMENT_MODE_OPTIONS.map(mode => (
                  <label key={mode} className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" value={mode} {...register('paymentModes')} className="accent-blue-600" />
                    {mode}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/vendors')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Vendor' : 'Add Vendor')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 