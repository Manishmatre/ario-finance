import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Loader from '../../components/ui/Loader';
import axiosInstance from '../../utils/axiosInstance';

export default function MakeBillPaid() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bill, setBill] = useState(null);
  const [vendor, setVendor] = useState(null);
  // 1. Update form state to include all possible fields
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    axiosInstance.get(`/api/finance/bills/${id}`)
      .then(billRes => {
        setBill(billRes.data);
        setForm(f => ({ ...f, amount: billRes.data.amount || '' }));
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
        console.log('DEBUG: vendorId for MakeBillPaid:', vId);
        if (vId) {
          axiosInstance.get(`/api/finance/vendors/${vId}`)
            .then(vendorRes => {
              console.log('DEBUG: vendor response:', vendorRes.data);
              setVendor(vendorRes.data);
            })
            .catch((err) => {
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
      .catch(err => setError('Failed to fetch bill'))
      .finally(() => setLoading(false));
  }, [id]);

  // 2. Remove extraFields usage, use form state for all fields
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // 3. Update handleSubmit to use only form state
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        isPaid: true,
        ourBankAccount: form.ourBankAccount,
        paymentMode: form.paymentMode || 'NEFT',
        amount: form.amount,
        narration: form.notes,
      };
      const res = await axiosInstance.patch(`/api/finance/bills/${id}/pay`, payload);
      setSuccess(true);
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
        title={`Mark Bill as Paid`}
        subtitle={`Bill No: ${bill.billNo}`}
        breadcrumbs={[
          { label: 'Purchase Bills', to: '/finance/bills' },
          { label: 'Mark as Paid' }
        ]}
      />
      <div className="max-w-lg mx-auto">
        <Card title="Mark as Paid">
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">Bill marked as paid!</div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-lg font-medium text-gray-700 mb-4">Are you sure you want to mark this bill as paid?</div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/finance/bills')}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : 'Mark as Paid'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 