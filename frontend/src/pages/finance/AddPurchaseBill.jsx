import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import { FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Select from '../../components/ui/Select';
import { useWatch } from 'react-hook-form';

export default function AddPurchaseBill() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { register, handleSubmit, reset, formState: { errors }, setValue, control, watch } = useForm();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [payments, setPayments] = useState([]);
  const navigate = useNavigate();

  // Fetch vendors for dropdown
  useEffect(() => {
    axiosInstance.get('/api/finance/vendors')
      .then(res => setVendors(res.data))
      .catch(() => setVendors([]));
  }, []);

  // Watch vendor selection and set selectedVendor
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'vendor') {
        const selected = vendors.find(v => v._id === value.vendor);
        setSelectedVendor(selected || null);
        if (selected) {
          setValue('gstinSupplier', selected.gstNo || '');
        } else {
          setValue('gstinSupplier', '');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [vendors, setValue, watch]);

  // Fetch bill data if editing
  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    axiosInstance.get(`/api/finance/bills/${id}`)
      .then(res => {
        const bill = res.data;
        setValue('vendor', bill.vendorId?._id || bill.vendorId || '');
        setValue('gstinSupplier', bill.gstinSupplier || '');
        setValue('billNo', bill.billNo || '');
        setValue('billDate', bill.billDate ? bill.billDate.slice(0, 10) : '');
        setValue('invoiceType', bill.invoiceType || '');
        setValue('reverseCharge', bill.reverseCharge ? 'true' : 'false');
        setValue('gstRate', bill.gstRate || '');
        setValue('taxableValue', bill.taxableValue || '');
        setValue('taxAmount.integratedTax', bill.taxAmount?.integratedTax || '');
        setValue('taxAmount.centralTax', bill.taxAmount?.centralTax || '');
        setValue('taxAmount.stateTax', bill.taxAmount?.stateTax || '');
        setValue('taxAmount.cess', bill.taxAmount?.cess || '');
        setValue('total', bill.total || '');
        setPaymentStatus(bill.paymentStatus || (bill.isPaid ? 'paid' : 'pending'));
        setPayments(bill.payments || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isEditMode, id, setValue]);

  // Auto-calculation logic
  const taxableValue = useWatch({ control, name: 'taxableValue' }) || 0;
  const gstRate = useWatch({ control, name: 'gstRate' }) || 0;
  const cess = useWatch({ control, name: 'taxAmount.cess' }) || 0;
  const reverseCharge = useWatch({ control, name: 'reverseCharge' });

  // Bidirectional auto-calculation logic
  const integratedTax = useWatch({ control, name: 'taxAmount.integratedTax' }) || '';
  const centralTax = useWatch({ control, name: 'taxAmount.centralTax' }) || '';
  const stateTax = useWatch({ control, name: 'taxAmount.stateTax' }) || '';
  const total = useWatch({ control, name: 'total' }) || '';

  // Helper to parse float safely
  const pf = v => parseFloat(v) || 0;

  // Helper to determine if GST fields should be required
  const isGSTRequired = !selectedVendor?.cashOnly;

  // Main calculation effect
  useEffect(() => {
    // If user edits taxableValue or gstRate, recalc taxes and total
    if (document.activeElement.name === 'taxableValue' || document.activeElement.name === 'gstRate') {
      const tValue = pf(taxableValue);
      const gRate = pf(gstRate);
      const cessValue = pf(cess);
      let iTax = 0, cTax = 0, sTax = 0;
      if (tValue > 0 && gRate > 0) {
        if (reverseCharge === 'false') {
          iTax = (tValue * gRate) / 100;
        } else {
          cTax = (tValue * gRate) / 200;
          sTax = (tValue * gRate) / 200;
        }
      }
      setValue('taxAmount.integratedTax', iTax ? iTax.toFixed(2) : '');
      setValue('taxAmount.centralTax', cTax ? cTax.toFixed(2) : '');
      setValue('taxAmount.stateTax', sTax ? sTax.toFixed(2) : '');
      setValue('total', (tValue + iTax + cTax + sTax + cessValue).toFixed(2));
    }
    // If user edits integratedTax, recalc taxableValue and total
    else if (document.activeElement.name === 'taxAmount.integratedTax') {
      const iTax = pf(integratedTax);
      const gRate = pf(gstRate);
      const cessValue = pf(cess);
      let tValue = 0;
      if (gRate > 0) tValue = (iTax * 100) / gRate;
      setValue('taxableValue', tValue ? tValue.toFixed(2) : '');
      setValue('centralTax', '');
      setValue('stateTax', '');
      setValue('total', (tValue + iTax + cessValue).toFixed(2));
    }
    // If user edits centralTax or stateTax, recalc taxableValue and total
    else if (document.activeElement.name === 'taxAmount.centralTax' || document.activeElement.name === 'taxAmount.stateTax') {
      const cTax = pf(centralTax);
      const sTax = pf(stateTax);
      const gRate = pf(gstRate);
      const cessValue = pf(cess);
      let tValue = 0;
      if (gRate > 0) tValue = (cTax + sTax) * 200 / gRate;
      setValue('taxableValue', tValue ? tValue.toFixed(2) : '');
      setValue('integratedTax', '');
      setValue('total', (tValue + cTax + sTax + cessValue).toFixed(2));
    }
    // If user edits total, recalc taxes and taxableValue (assume taxes are correct, back-calc taxable)
    else if (document.activeElement.name === 'total') {
      const totalValue = pf(total);
      const cessValue = pf(cess);
      // Try to back-calc taxableValue
      let tValue = totalValue - pf(integratedTax) - pf(centralTax) - pf(stateTax) - cessValue;
      setValue('taxableValue', tValue > 0 ? tValue.toFixed(2) : '');
    }
  }, [taxableValue, gstRate, integratedTax, centralTax, stateTax, total, cess, reverseCharge, setValue]);

  const onSubmit = async data => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('vendorId', data.vendor);
      formData.append('gstinSupplier', data.gstinSupplier);
      formData.append('billNo', data.billNo);
      formData.append('billDate', data.billDate);
      formData.append('invoiceType', data.invoiceType);
      formData.append('reverseCharge', data.reverseCharge);
      formData.append('gstRate', data.gstRate);
      formData.append('taxableValue', data.taxableValue);
      formData.append('taxAmount[integratedTax]', data.taxAmount?.integratedTax || '');
      formData.append('taxAmount[centralTax]', data.taxAmount?.centralTax || '');
      formData.append('taxAmount[stateTax]', data.taxAmount?.stateTax || '');
      formData.append('taxAmount[cess]', data.taxAmount?.cess || '');
      formData.append('total', data.total);
      if (data.file && data.file[0]) {
        formData.append('file', data.file[0]);
      }
      let res;
      if (isEditMode) {
        res = await axiosInstance.put(`/api/finance/bills/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axiosInstance.post('/api/finance/bills', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setSuccess(true);
      setPaymentStatus(res.data.paymentStatus || 'pending');
      setPayments(res.data.payments || []);
      setTimeout(() => {
        navigate('/finance/bills');
      }, 1200);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Saving...</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add Purchase Bill/Invoice"
        subtitle="Create a new purchase bill/invoice record"
        breadcrumbs={[
          { label: 'Purchase Bills', to: '/finance/bills' },
          { label: 'Add Bill' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Bill/Invoice Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Bill added successfully!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Supplier Section */}
            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-blue-700">Supplier (Official Name)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier (Official Name) *</label>
                  <Select
                    options={[
                      { value: '', label: 'Select Vendor' },
                      ...vendors.map(v => ({ value: v._id, label: v.name + (v.cashOnly ? ' (Cash Only)' : '') }))
                    ]}
                    {...register('vendor', { required: true })}
                    placeholder="Select vendor"
                  />
                  {errors.vendor && <span className="text-red-500 text-sm">Supplier is required</span>}
                  {selectedVendor?.cashOnly && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Cash Only (No GST)</span>
                  )}
                </div>
                {!selectedVendor?.cashOnly && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN of Supplier *</label>
                    <Input {...register('gstinSupplier', { required: isGSTRequired })} placeholder="Auto-filled from supplier selection" />
                    {isGSTRequired && errors.gstinSupplier && <span className="text-red-500 text-sm">GSTIN is required</span>}
                  </div>
                )}
              </div>
            </div>
            {/* Invoice Section */}
            {!selectedVendor?.cashOnly && (
              <>
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-blue-700">Bill/Invoice Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bill/Invoice No *</label>
                      <Input {...register('billNo', { required: true })} placeholder="Enter bill/invoice number" />
                      {errors.billNo && <span className="text-red-500 text-sm">Bill/Invoice number is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bill/Invoice Date *</label>
                      <Input type="date" {...register('billDate', { required: true })} />
                      {errors.billDate && <span className="text-red-500 text-sm">Bill/Invoice date is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
                      <Input {...register('invoiceType')} placeholder="Enter invoice type" />
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-blue-700">GST Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reverse Charge *</label>
                      <Select
                        options={[
                          { value: 'false', label: 'No' },
                          { value: 'true', label: 'Yes' }
                        ]}
                        {...register('reverseCharge', { required: true })}
                        placeholder="Reverse charge?"
                      />
                      {errors.reverseCharge && <span className="text-red-500 text-sm">Reverse charge is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Rate (%) *</label>
                      <Input type="number" min="0" step="0.01" {...register('gstRate', { required: true })} placeholder="Enter GST rate" />
                      {errors.gstRate && <span className="text-red-500 text-sm">GST rate is required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Taxable Value (₹) *</label>
                      <Input type="number" min="0" {...register('taxableValue', { required: true })} placeholder="Enter taxable value" />
                      {errors.taxableValue && <span className="text-red-500 text-sm">Taxable value is required</span>}
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-blue-700">Tax Amounts</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Integrated Tax (₹)</label>
                      <Input type="number" min="0" {...register('taxAmount.integratedTax')} placeholder="Integrated tax" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Central Tax (₹)</label>
                      <Input type="number" min="0" {...register('taxAmount.centralTax')} placeholder="Central tax" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State/UT Tax (₹)</label>
                      <Input type="number" min="0" {...register('taxAmount.stateTax')} placeholder="State/UT tax" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cess (₹)</label>
                      <Input type="number" min="0" {...register('taxAmount.cess')} placeholder="Cess" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Invoice Value (₹) *</label>
                      <Input type="number" min="0" {...register('total', { required: true })} placeholder="Enter total invoice value" />
                      {errors.total && <span className="text-red-500 text-sm">Total invoice value is required</span>}
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* File Upload - always show for all vendors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bill/Invoice (PDF, JPG, PNG)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('file')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {/* If cashOnly, show only amount, billNo, billDate, and payment mode as Cash */}
            {selectedVendor?.cashOnly && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bill No *</label>
                  <Input {...register('billNo', { required: true })} placeholder="Enter bill number" />
                  {errors.billNo && <span className="text-red-500 text-sm">Bill No is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bill Date *</label>
                  <Input type="date" {...register('billDate', { required: true })} />
                  {errors.billDate && <span className="text-red-500 text-sm">Bill Date is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <Input type="number" step="0.01" {...register('total', { required: true })} placeholder="Enter amount" />
                  {errors.total && <span className="text-red-500 text-sm">Amount is required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                  <Input value="Cash" disabled readOnly />
                </div>
              </div>
            )}
            {/* Preview Section */}
            <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <h4 className="font-semibold mb-2 text-blue-700">Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="block text-gray-600">Taxable Value</span>
                  <span className="font-bold text-lg">₹ {parseFloat(taxableValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div>
                  <span className="block text-gray-600">GSTs (Integrated / Central + State/UT)</span>
                  <span className="font-bold text-lg">
                    ₹ {parseFloat(integratedTax || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    {((parseFloat(centralTax) || 0) > 0 || (parseFloat(stateTax) || 0) > 0) && (
                      <>
                        {' / '}
                        ₹ {parseFloat(centralTax || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} + ₹ {parseFloat(stateTax || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-600">Total Invoice Value</span>
                  <span className="font-bold text-lg">₹ {parseFloat(total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/bills')}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Add Bill'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {success && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800 font-medium">Payment Status: {paymentStatus}</span>
        </div>
      )}
    </div>
  );
} 