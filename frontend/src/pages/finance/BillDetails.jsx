import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import axiosInstance from '../../utils/axiosInstance';
import { FiFileText, FiDollarSign, FiCalendar, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { Modal } from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';

export default function BillDetails() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    // Fetch bill, vendors, and vendorDetails in parallel
    let billId = id;
    let billData = null;
    let vendorsData = null;
    let vendorDetailsPromise = null;
    Promise.all([
      axiosInstance.get(`/api/finance/bills/${billId}`),
      axiosInstance.get('/api/finance/vendors')
    ])
      .then(([billRes, vendorsRes]) => {
        billData = billRes.data;
        vendorsData = vendorsRes.data;
        const vendorMap = {};
        vendorsRes.data.forEach(v => { vendorMap[v._id] = v.name; });
        let vendorName = billRes.data.vendorId?.name || billRes.data.vendorId || billRes.data.vendor || '-';
        if (typeof billRes.data.vendorId === 'string' && vendorMap[billRes.data.vendorId]) {
          vendorName = vendorMap[billRes.data.vendorId];
        }
        setBill({ ...billRes.data, vendorName });
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message || 'Failed to fetch bill');
        setLoading(false);
      });
  }, [id]);

  const handleEdit = () => navigate(`/finance/bills/edit/${bill._id || bill.id}`);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/finance/bills/${bill._id || bill.id}`);
      setLoading(false);
      navigate('/finance/bills');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete bill');
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!bill) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Bill Details: ${bill.billNo}`}
        subtitle="View, edit, or delete this purchase bill"
        breadcrumbs={[
          { label: 'Purchase Bills', to: '/finance/bills' },
          { label: 'Bill Details' }
        ]}
        // Removed actions prop to eliminate Add New Bill button
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Vendor" value={bill.vendorName} icon={<FiFileText className="h-6 w-6 text-blue-500" />} />
        <StatCard title="Amount" value={`₹${bill.amount?.toLocaleString()}`} icon={<FiDollarSign className="h-6 w-6 text-green-500" />} valueColor="text-green-600" />
        <StatCard title="Bill Date" value={bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '-'} icon={<FiCalendar className="h-6 w-6 text-yellow-500" />} />
        <StatCard title="Status" value={bill.paymentStatus ? bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1) : (bill.isPaid ? 'Paid' : 'Pending')} icon={<FiCheckCircle className={`h-6 w-6 ${bill.paymentStatus === 'paid' || bill.isPaid ? 'text-green-500' : bill.paymentStatus === 'partial' ? 'text-yellow-500' : 'text-yellow-500'}`} />} valueColor={bill.paymentStatus === 'paid' || bill.isPaid ? 'text-green-600' : bill.paymentStatus === 'partial' ? 'text-yellow-600' : 'text-yellow-600'} />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Bill Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><strong>Vendor:</strong> {bill.vendorName}</div>
            <div><strong>Bill No:</strong> {bill.billNo}</div>
            <div><strong>Bill Date:</strong> {bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '-'}</div>
            <div><strong>Amount:</strong> ₹{bill.amount?.toLocaleString()}</div>
            <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.paymentStatus === 'paid' || bill.isPaid ? 'bg-green-100 text-green-800' : bill.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-yellow-100 text-yellow-800'}`}>{bill.paymentStatus ? bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1) : (bill.isPaid ? 'Paid' : 'Pending')}</span></div>
            {bill.fileUrl && /^https?:\/\//.test(bill.fileUrl) && (
              <div><strong>Bill File:</strong> <a href={bill.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View/Download</a></div>
            )}
            {bill.fileUrl && !/^https?:\/\//.test(bill.fileUrl) && (
              <div><strong>Bill File:</strong> <span className="text-gray-400">Invalid file URL</span></div>
            )}
            {bill.projectId && <div><strong>Project:</strong> {bill.projectId.name || bill.projectId}</div>}
            {bill.createdBy && <div><strong>Created By:</strong> {bill.createdBy}</div>}
            {bill.createdAt && <div><strong>Created At:</strong> {new Date(bill.createdAt).toLocaleString()}</div>}
            {bill.updatedAt && <div><strong>Updated At:</strong> {new Date(bill.updatedAt).toLocaleString()}</div>}
          </div>
        {/* After the main bill info, add payment details if bill.isPaid */}
        {!bill.isPaid && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-green-700 mb-2">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Payment Mode:</strong> {bill.paymentMode || <span className="text-gray-400">-</span>}</div>
              <div><strong>Our Bank Account:</strong> {bill.ourBankAccountName || bill.ourBankAccount || <span className="text-gray-400">-</span>}</div>
              <div><strong>Vendor Bank Account:</strong> {bill.vendorBankAccountName || bill.vendorBankAccount || <span className="text-gray-400">-</span>}</div>
              <div><strong>Reference/UTR:</strong> {bill.reference || <span className="text-gray-400">-</span>}</div>
              <div><strong>Payment Date:</strong> {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('en-IN') : <span className="text-gray-400">-</span>}</div>
              {bill.relatedTxnId && (
                <div><strong>Transaction ID:</strong> {bill.relatedTxnId}</div>
              )}
            </div>
            {bill.relatedTxnId && (
              <div className="mt-2">
                <Button variant="outline" onClick={() => navigate(`/finance/transactions/${bill.relatedTxnId}`)}>
                  View Transaction
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Payment History Section */}
        {bill.payments && bill.payments.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Payment History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Mode</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Bank</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Vendor Bank Account</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.payments.map((p, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">₹{p.amount?.toLocaleString()}</td>
                      <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString('en-IN') : '-'}</td>
                      <td className="px-4 py-2">{p.paymentMode || '-'}</td>
                      <td className="px-4 py-2">{p.bankAccount || '-'}</td>
                      <td className="px-4 py-2">
                        {p.vendorBankAccount ?
                          `${p.vendorBankAccount.bankName || ''} (${p.vendorBankAccount.accountNumber || ''})${p.vendorBankAccount.accountHolder ? ' - ' + p.vendorBankAccount.accountHolder : ''}`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-8">
          <Button variant="secondary" onClick={() => navigate('/finance/bills')}>Back</Button>
          <Button variant="primary" onClick={handleEdit}>Edit</Button>
          {!bill.isPaid && (
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate(`/finance/bills/${bill._id || bill.id}/pay`)}>
              Mark as Paid
            </Button>
          )}
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </div>
    </div>
  );
} 