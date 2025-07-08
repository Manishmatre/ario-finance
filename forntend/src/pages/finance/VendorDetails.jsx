import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import axiosInstance from '../../utils/axiosInstance';
import { FiFileText, FiDollarSign, FiCalendar, FiCheckCircle, FiArrowLeft, FiPlus } from 'react-icons/fi';

export default function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get(`/api/finance/vendors/${id}`),
      axiosInstance.get('/api/finance/bills')
    ])
      .then(([vendorRes, billsRes]) => {
        setVendor(vendorRes.data);
        // Filter bills for this vendor
        const vendorBills = billsRes.data.filter(b => {
          if (b.vendorId?._id) return b.vendorId._id === id;
          if (typeof b.vendorId === 'string') return b.vendorId === id;
          return false;
        });
        setBills(vendorBills);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch vendor details');
        setLoading(false);
      });
  }, [id]);

  // Compute summary stats
  const now = new Date();
  const totalBills = bills.length;
  const pendingAmount = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + (b.amount || 0), 0);
  const paidAmount = bills.filter(b => b.isPaid).reduce((sum, b) => sum + (b.amount || 0), 0);
  const lastBillDate = bills.length > 0 ? new Date(Math.max(...bills.map(b => new Date(b.billDate || 0)))).toLocaleDateString('en-IN') : '-';

  const summaryCards = [
    { title: 'Total Bills', value: totalBills, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
    { title: 'Pending Amount', value: pendingAmount, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
    { title: 'Paid Amount', value: paidAmount, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
    { title: 'Last Bill Date', value: lastBillDate, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
  ];

  const billColumns = [
    { Header: 'Bill No', accessor: 'billNo', Cell: ({ value }) => <span className="font-medium">{value}</span> },
    { Header: 'Bill Date', accessor: 'billDate', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => <span>₹{value?.toLocaleString()}</span> },
    { Header: 'Status', accessor: 'isPaid', Cell: ({ value }) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{value ? 'Paid' : 'Pending'}</span> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/bills/${row.original._id || row.original.id}`)}>View</Button>
      </div>
    ) }
  ];

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!vendor) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Vendor Details: ${vendor.name}`}
        subtitle="View all information and bills for this vendor"
        breadcrumbs={[
          { label: 'Vendors', to: '/finance/vendors' },
          { label: 'Vendor Details' }
        ]}
        actions={[
          <Button key="add-bill" as={Link} to="/finance/bills/add" icon={<FiPlus />} className="bg-blue-600 hover:bg-blue-700 text-white">Add Bill</Button>
        ]}
      />
      {/* Vendor Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} title={card.title} value={card.title.includes('Amount') ? `₹${card.value.toLocaleString()}` : card.value} icon={card.icon} />
        ))}
      </div>
      {/* Vendor Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Vendor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><strong>Name:</strong> {vendor.name}</div>
          <div><strong>GST No:</strong> {vendor.gstNo}</div>
          <div><strong>Phone:</strong> {vendor.phone}</div>
          <div><strong>Address:</strong> {vendor.address}</div>
          {vendor.createdBy && <div><strong>Created By:</strong> {vendor.createdBy}</div>}
          {vendor.createdAt && <div><strong>Created At:</strong> {new Date(vendor.createdAt).toLocaleString()}</div>}
          {vendor.updatedAt && <div><strong>Updated At:</strong> {new Date(vendor.updatedAt).toLocaleString()}</div>}
        </div>
      </div>
      {/* Vendor Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">Bills for {vendor.name}</h3>
        </div>
        {bills.length === 0 ? (
          <div className="p-6 text-gray-500">No bills found for this vendor.</div>
        ) : (
          <Table columns={billColumns} data={bills} />
        )}
      </div>
      <div className="flex gap-2 mt-8">
        <Button variant="secondary" icon={<FiArrowLeft />} onClick={() => navigate('/finance/vendors')}>Back</Button>
      </div>
    </div>
  );
} 