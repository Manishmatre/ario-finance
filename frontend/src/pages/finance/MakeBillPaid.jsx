import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Loader from '../../components/ui/Loader';
import axiosInstance from '../../utils/axiosInstance';
import { FiCheckCircle } from 'react-icons/fi';

export default function MakeBillPaid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bill, setBill] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState({
    bankAccount: '',
    ourBankAccount: '',
    amount: '',
    paymentMode: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: '',
    chequeNo: '',
    chequeDate: '',
    txnId: '',
  });
  const [companyBanks, setCompanyBanks] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [payments, setPayments] = useState([]);

  // Helper: which payment modes require a bank account (backend expects these exact values)
  const paymentModesRequiringBank = ['NEFT', 'RTGS', 'IMPS', 'UPI', 'Cheque'];

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance.get(`/api/finance/bills/${id}`)
      .then(billRes => {
        setBill(billRes.data);
        setForm(f => ({ ...f, amount: billRes.data.amount || '' }));
        setPaymentStatus(billRes.data.paymentStatus || (billRes.data.isPaid ? 'paid' : 'pending'));
        setPayments(billRes.data.payments || []);
        // Robust vendorId resolution
        let vId = '';
        if (billRes.data.vendorId && typeof billRes.data.vendorId === 'object' && billRes.data.vendorId._id) {
          vId = billRes.data.vendorId._id;
        } else if (typeof billRes.data.vendorId === 'string') {
          vId = billRes.data.vendorId;
        } else if (billRes.data.vendor && typeof billRes.data.vendor === 'object' && billRes.data.vendor._id) {
          vId = billRes.data.vendor._id;
        } else if (typeof billRes.data.vendor === 'string') {
          vId = billRes.data.vendor;
        }
        if (vId) {
          axiosInstance.get(`/api/finance/vendors/${vId}`)
            .then(vendorRes => {
              setVendor(vendorRes.data);
            })
            .catch(() => {
              setVendor(null);
              setError('Failed to fetch vendor details');
            });
        } else {
          setVendor(null);
          setError('No vendor found for this bill.');
        }
        // Fetch company bank accounts
        axiosInstance.get('/api/finance/bank-accounts?limit=100')
          .then(res => setCompanyBanks(res.data.bankAccounts || []))
          .catch(() => setCompanyBanks([]));
      })
      .catch(() => setError('Failed to fetch bill'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validate bank account for required payment modes
    if (paymentModesRequiringBank.includes(form.paymentMode) && !form.ourBankAccount) {
      setLoading(false);
      setError('Bank account is required for this payment mode');
      return;
    }
    try {
      const payload = {
        isPaid: true,
        ourBankAccount: form.ourBankAccount,
        paymentMode: form.paymentMode || 'NEFT',
        amount: form.amount,
        paymentDate: form.paymentDate,
        narration: form.notes,
        vendorBankAccount: (vendor && Array.isArray(vendor.bankAccounts) && form.vendorBankAccount !== undefined && vendor.bankAccounts[form.vendorBankAccount]) ? vendor.bankAccounts[form.vendorBankAccount] : undefined,
      };
      const res = await axiosInstance.patch(`/api/finance/bills/${id}/pay`, payload);
      setSuccess(true);
      setPaymentStatus(res.data.paymentStatus || 'paid');
      setPayments(res.data.payments || []);
      setTimeout(() => {
        navigate('/finance/bills');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to mark bill as paid');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!bill) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Record Bill Payment"
        subtitle={`Bill No: ${bill.billNo}`}
        breadcrumbs={[
          { label: 'Purchase Bills', to: '/finance/bills' },
          { label: 'Record Payment' }
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Payment Details</h3>
        </div>
        <div className="p-6">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-800">Payment recorded!</span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
                <Input type="number" min="1" max={bill.amount} name="amount" value={form.amount} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                <Input type="date" name="paymentDate" value={form.paymentDate} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                <Select
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  options={[
                    { value: '', label: 'Select Payment Mode' },
                    { value: 'NEFT', label: 'Bank Transfer (NEFT)' },
                    { value: 'RTGS', label: 'Bank Transfer (RTGS)' },
                    { value: 'IMPS', label: 'Bank Transfer (IMPS)' },
                    { value: 'UPI', label: 'UPI' },
                    { value: 'Cheque', label: 'Cheque' },
                    { value: 'Cash', label: 'Cash' },
                  ]}
                  required
                />
              </div>
              {paymentModesRequiringBank.includes(form.paymentMode) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account *</label>
                  <Select
                    name="ourBankAccount"
                    value={companyBanks.length === 1 ? companyBanks[0]._id : form.ourBankAccount}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Bank Account' },
                      ...companyBanks.map(b => ({ value: b._id, label: `${b.bankName} (${b.bankAccountNo})` }))
                    ]}
                    required
                  />
                </div>
              )}
              {vendor && Array.isArray(vendor.bankAccounts) && vendor.bankAccounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Bank Account (optional)</label>
                  <Select
                    name="vendorBankAccount"
                    value={form.vendorBankAccount || ''}
                    onChange={handleChange}
                    options={vendor.bankAccounts.map((b, idx) => ({
                      value: idx,
                      label: `${b.bankName} (${b.accountNumber})${b.accountHolder ? ' - ' + b.accountHolder : ''}`
                    }))}
                    placeholder="Select vendor bank account"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/bills')}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Bill Details</h3>
        </div>
        <div className="p-6 space-y-2">
          <div><strong>Vendor:</strong> {bill.vendorId?.name || bill.vendorName || '-'}</div>
          <div><strong>Bill No:</strong> {bill.billNo}</div>
          <div><strong>Bill Date:</strong> {bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '-'}</div>
          <div><strong>Amount:</strong> ₹{bill.amount?.toLocaleString()}</div>
          <div><strong>Payment Status:</strong> <span className="font-semibold capitalize">{paymentStatus}</span></div>
        </div>
        {payments && payments.length > 0 && (
          <div className="p-6 pt-0">
            <h4 className="text-md font-semibold mb-2">Payment History</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Mode</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Bank</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">₹{p.amount?.toLocaleString()}</td>
                      <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString('en-IN') : '-'}</td>
                      <td className="px-4 py-2">{p.paymentMode || '-'}</td>
                      <td className="px-4 py-2">{p.bankAccount || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 