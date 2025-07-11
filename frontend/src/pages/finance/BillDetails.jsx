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
  const [editMode, setEditMode] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
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
        setForm({
          vendorId: billRes.data.vendor?._id || billRes.data.vendorId || '',
          billNo: billRes.data.billNo || '',
          billDate: billRes.data.billDate ? billRes.data.billDate.slice(0, 10) : '',
          amount: billRes.data.amount || '',
          isPaid: billRes.data.isPaid || false,
        });
        setVendors(vendorsRes.data);
        // Always fetch vendor details in parallel
        let vId = '';
        if (billRes.data.vendor && typeof billRes.data.vendor === 'object' && billRes.data.vendor._id) {
          vId = billRes.data.vendor._id;
        } else if (typeof billRes.data.vendorId === 'string') {
          vId = billRes.data.vendorId;
        }
        console.log('DEBUG: vendorId for details fetch:', vId);
        if (vId) {
          vendorDetailsPromise = axiosInstance.get(`/api/finance/vendors/${vId}`)
            .then(vendorRes => {
              console.log('DEBUG: vendorDetails response:', vendorRes.data);
              // setVendorDetails(vendorRes.data); // This state is no longer needed
            })
            .catch((err) => {
              console.log('DEBUG: vendorDetails fetch error', err);
              // setVendorDetails(null); // This state is no longer needed
            });
        } else {
          // setVendorDetails(null); // This state is no longer needed
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message || 'Failed to fetch bill');
        setLoading(false);
      });
  }, [id]);

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (file) {
        // If a new file is selected, use FormData and POST to the same endpoint as add
        const formData = new FormData();
        formData.append('vendorId', form.vendorId);
        formData.append('billNo', form.billNo);
        formData.append('billDate', form.billDate);
        formData.append('amount', form.amount);
        formData.append('isPaid', form.isPaid === true || form.isPaid === 'true');
        formData.append('file', file);
        // Use POST to /api/finance/bills to create a new bill with file, or PATCH/PUT to update with file
        res = await axiosInstance.post(`/api/finance/bills`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // No new file, just update fields
        const updateData = {
          vendorId: form.vendorId,
          billNo: form.billNo,
          billDate: form.billDate,
          amount: form.amount,
          isPaid: form.isPaid === true || form.isPaid === 'true',
        };
        res = await axiosInstance.put(`/api/finance/bills/${bill._id || bill.id}`, updateData);
      }
      setBill(res.data);
      // Map vendorName from vendors list if available
      if (vendors.length > 0) {
        const vendorMap = {};
        vendors.forEach(v => { vendorMap[v._id] = v.name; });
        let vendorName = res.data.vendorId?.name || res.data.vendorId || res.data.vendor || '-';
        if (typeof res.data.vendorId === 'string' && vendorMap[res.data.vendorId]) {
          vendorName = vendorMap[res.data.vendorId];
        }
        setBill({ ...res.data, vendorName });
      } else {
        setBill(res.data);
      }
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update bill');
    } finally {
      setLoading(false);
    }
  };

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
        <StatCard title="Status" value={bill.isPaid ? 'Paid' : 'Pending'} icon={<FiCheckCircle className={`h-6 w-6 ${bill.isPaid ? 'text-green-500' : 'text-yellow-500'}`} />} valueColor={bill.isPaid ? 'text-green-600' : 'text-yellow-600'} />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Bill Information</h3>
        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                <Select
                  options={vendors.map(v => ({ value: v._id, label: v.name }))}
                  name="vendorId"
                  value={form.vendorId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill No *</label>
                <Input name="billNo" value={form.billNo} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill Date *</label>
                <Input type="date" name="billDate" value={form.billDate} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <Input type="number" min="1" name="amount" value={form.amount} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  name="isPaid"
                  value={form.isPaid === true || form.isPaid === 'true' ? 'true' : 'false'}
                  onChange={e => setForm(f => ({ ...f, isPaid: e.target.value === 'true' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="false">Pending</option>
                  <option value="true">Paid</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill File (PDF/JPG/PNG)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><strong>Vendor:</strong> {bill.vendorName}</div>
            <div><strong>Bill No:</strong> {bill.billNo}</div>
            <div><strong>Bill Date:</strong> {bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '-'}</div>
            <div><strong>Amount:</strong> ₹{bill.amount?.toLocaleString()}</div>
            <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{bill.isPaid ? 'Paid' : 'Pending'}</span></div>
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
        )}
        {/* After the main bill info, add payment details if bill.isPaid */}
        {!editMode && bill.isPaid && (
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
        <div className="flex gap-2 mt-8">
          <Button variant="secondary" onClick={() => navigate('/finance/bills')}>Back</Button>
          {!editMode && <Button variant="primary" onClick={handleEdit}>Edit</Button>}
          {!bill.isPaid && !editMode && (
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate(`/finance/bills/${bill._id || bill.id}/pay`)}>
              Mark as Paid
            </Button>
          )}
          {!editMode && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
        </div>
      </div>
    </div>
  );
} 