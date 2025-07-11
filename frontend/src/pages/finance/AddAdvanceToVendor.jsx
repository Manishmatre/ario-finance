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
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorBalance, setVendorBalance] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [paymentType, setPaymentType] = useState('advance');
  const [isEdit, setIsEdit] = useState(!!id);
  const navigate = useNavigate();
  const [selectedBills, setSelectedBills] = useState([]);

  // Fetch vendors for dropdown
  useEffect(() => {
    axiosInstance.get('/api/finance/vendors')
      .then(res => setVendors(res.data))
      .catch(() => setVendors([]));
  }, []);

  // Ensure vendorId is set in form data when selectedVendor changes
  useEffect(() => {
    setValue('vendorId', selectedVendor);
  }, [selectedVendor, setValue]);

  // Fetch vendor balance and unpaid bills when vendor changes
  useEffect(() => {
    if (!selectedVendor) return;
    axiosInstance.get(`/api/finance/vendors/${selectedVendor}/ledger`).then(res => {
      const ledger = res.data;
      const balance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
      setVendorBalance(balance);
    });
    axiosInstance.get(`/api/finance/vendors/${selectedVendor}/bills`).then(res => {
      setUnpaidBills(res.data.filter(b => !b.isPaid));
    });
  }, [selectedVendor]);

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
      if (paymentType === 'advance') {
        await axiosInstance.post('/api/finance/vendors/payments', {
          vendorId: selectedVendor,
          amount: data.amount,
          date: data.date,
          type: 'advance',
        });
      } else if (paymentType === 'bill') {
        if (selectedBills.length === 0) {
          setError('Please select at least one bill to pay.');
          setLoading(false);
          return;
        }
        await axiosInstance.post('/api/finance/vendors/payments', {
          vendorId: selectedVendor,
          amount: data.amount,
          date: data.date,
          type: 'bill',
          bills: selectedBills,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/finance/vendor-payments');
      }, 1200);
      reset();
      setSelectedBills([]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEdit ? 'Edit Vendor Payment' : 'Add Vendor Payment'}
        subtitle={isEdit ? 'Update vendor payment details' : 'Record a new advance or bill payment to a vendor'}
        breadcrumbs={[
          { label: 'Payables', to: '/finance/payables' },
          { label: 'Vendor Payments', to: '/finance/vendor-payments' },
          { label: isEdit ? 'Edit Payment' : 'Add Payment' }
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
                  value={selectedVendor}
                  onChange={e => setSelectedVendor(e.target.value)}
                  placeholder="Select vendor"
                />
                {errors.vendorId && <span className="text-red-500 text-sm">Vendor is required</span>}
                {/* Register vendorId as a hidden input for react-hook-form */}
                <input type="hidden" {...register('vendorId', { required: true })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type *</label>
                <Select
                  options={[
                    { value: 'advance', label: 'Advance' },
                    { value: 'bill', label: 'Bill Payment' }
                  ]}
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                />
              </div>
            </div>
            {selectedVendor && (
              <div className="mb-4">
                <div className="text-sm text-gray-700">Vendor Outstanding Balance: <span className={vendorBalance < 0 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}>₹{vendorBalance?.toLocaleString()}</span></div>
              </div>
            )}
            {paymentType === 'bill' && unpaidBills.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Bill(s) to Pay</label>
                <div className="space-y-2">
                  {unpaidBills.map(bill => (
                    <div key={bill._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`bill-${bill._id}`}
                        name="bills"
                        value={bill._id}
                        checked={selectedBills.includes(bill._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedBills([...selectedBills, bill._id]);
                          } else {
                            setSelectedBills(selectedBills.filter(id => id !== bill._id));
                          }
                        }}
                      />
                      <label htmlFor={`bill-${bill._id}`}>{bill.billNo} - ₹{bill.amount?.toLocaleString()} (Due: {bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '-'})</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input type="number" min="1" {...register('amount', { required: true })} placeholder="Enter amount" />
                {errors.amount && <span className="text-red-500 text-sm">Amount is required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <Input type="date" {...register('date', { required: true })} />
                {errors.date && <span className="text-red-500 text-sm">Date is required</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/vendor-payments')}>Cancel</Button>
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