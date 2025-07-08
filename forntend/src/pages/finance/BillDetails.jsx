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

export default function BillDetails() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get(`/api/finance/bills/${id}`),
      axiosInstance.get('/api/finance/vendors')
    ])
      .then(([billRes, vendorsRes]) => {
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
        });
        setVendors(vendorsRes.data);
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
      const updateData = {
        vendorId: form.vendorId,
        billNo: form.billNo,
        billDate: form.billDate,
        amount: form.amount,
      };
      const res = await axiosInstance.put(`/api/finance/bills/${bill._id || bill.id}`, updateData);
      setBill(res.data);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.patch(`/api/finance/bills/${bill._id || bill.id}/pay`);
      setBill(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to mark bill as paid');
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
        actions={[
          <Button key="add-bill" as={Link} to="/finance/bills/add" icon={<FiPlus />} className="bg-blue-600 hover:bg-blue-700 text-white">Add New Bill</Button>
        ]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card title="Vendor" value={bill.vendorName} icon={<FiFileText className="h-6 w-6 text-blue-500" />} />
        <Card title="Amount" value={`₹${bill.amount?.toLocaleString()}`} icon={<FiDollarSign className="h-6 w-6 text-green-500" />} />
        <Card title="Bill Date" value={bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '-'} icon={<FiCalendar className="h-6 w-6 text-yellow-500" />} />
        <Card title="Status" value={bill.isPaid ? 'Paid' : 'Pending'} icon={<FiCheckCircle className={`h-6 w-6 ${bill.isPaid ? 'text-green-500' : 'text-yellow-500'}`} />} />
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
            </div>
            <div className="flex gap-2 mt-8">
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
            {bill.fileUrl && <div><strong>Bill File:</strong> <a href={bill.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View/Download</a></div>}
            {bill.projectId && <div><strong>Project:</strong> {bill.projectId.name || bill.projectId}</div>}
            {bill.createdBy && <div><strong>Created By:</strong> {bill.createdBy}</div>}
            {bill.createdAt && <div><strong>Created At:</strong> {new Date(bill.createdAt).toLocaleString()}</div>}
            {bill.updatedAt && <div><strong>Updated At:</strong> {new Date(bill.updatedAt).toLocaleString()}</div>}
          </div>
        )}
        <div className="flex gap-2 mt-8">
          <Button variant="secondary" onClick={() => navigate('/finance/bills')}>Back</Button>
          {!editMode && <Button variant="primary" onClick={handleEdit}>Edit</Button>}
          {!bill.isPaid && !editMode && <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handlePay}>Mark as Paid</Button>}
          {!editMode && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
        </div>
      </div>
    </div>
  );
} 