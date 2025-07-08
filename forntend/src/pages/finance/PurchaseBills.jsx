import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiFileText, FiDollarSign, FiCalendar, FiCheckCircle } from "react-icons/fi";
import axiosInstance from '../../utils/axiosInstance';
import { useForm } from 'react-hook-form';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import { useNavigate } from 'react-router-dom';

const billsSummary = [
  { title: 'Total Bills', value: 6, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
  { title: 'Pending Amount', value: 1286400, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Paid Amount', value: 165200, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
  { title: 'Overdue Bills', value: 2, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
];

export default function PurchaseBills() {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get('/api/finance/bills'),
      axiosInstance.get('/api/finance/vendors')
    ])
      .then(([billsRes, vendorsRes]) => {
        const vendorMap = {};
        vendorsRes.data.forEach(v => { vendorMap[v._id] = v.name; });
        // Map vendorId to name if not populated
        const mappedBills = billsRes.data.map(bill => {
          let vendorName = bill.vendorId?.name || bill.vendorId || bill.vendor || '-';
          if (typeof bill.vendorId === 'string' && vendorMap[bill.vendorId]) {
            vendorName = vendorMap[bill.vendorId];
          }
          return { ...bill, vendorName };
        });
        setBills(mappedBills);
        setVendors(vendorsRes.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch bills');
        setLoading(false);
      });
  }, []);

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      setLoading(true);
      axiosInstance.delete(`/api/finance/bills/${id}`)
        .then(() => {
          setBills(bills.filter(b => b._id !== id && b.id !== id));
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to delete bill');
          setLoading(false);
        });
    }
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setEditModalOpen(true);
    reset(bill);
  };

  const handleUpdateBill = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/api/finance/bills/${editingBill._id || editingBill.id}`, data);
      setBills(bills.map(b => (b._id === res.data._id ? res.data : b)));
      setEditModalOpen(false);
      setEditingBill(null);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update bill');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (bill) => {
    try {
      setLoading(true);
      const res = await axiosInstance.patch(`/api/finance/bills/${bill._id || bill.id}/pay`);
      setBills(bills.map(b => (b._id === res.data._id ? res.data : b)));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to mark bill as paid');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      Header: 'Vendor',
      accessor: 'vendorName',
      Cell: ({ row }) => <div className="font-medium">{row.original.vendorName}</div>
    },
    { 
      Header: 'Bill No', 
      accessor: 'billNo',
      Cell: ({ value }) => <div className="font-medium">{value}</div>
    },
    { 
      Header: 'Bill Date', 
      accessor: 'billDate',
      Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : ''
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value }) => <div className="font-medium">₹{value?.toLocaleString()}</div>
    },
    { 
      Header: 'Status', 
      accessor: 'isPaid',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {value ? 'Paid' : 'Pending'}
        </span>
      )
    },
    { 
      Header: 'Actions', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/bills/${row.original._id || row.original.id}`)}>View</Button>
          <Button size="sm" variant="primary" onClick={() => handleEditBill(row.original)}>Edit</Button>
          {!row.original.isPaid && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handlePayBill(row.original)}>Pay</Button>
          )}
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.original._id || row.original.id)}>Delete</Button>
        </div>
      )
    }
  ];

  const handleUpload = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setBills([...bills, { 
        id: bills.length + 1, 
        vendor: "New Vendor", 
        billNo: "INV-2025-007", 
        billDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        amount: 50000, 
        gstAmount: 9000,
        totalAmount: 59000,
        isPaid: false,
        status: 'Pending',
        category: 'General',
        reference: 'PO-2025-007'
      }]);
      setLoading(false);
      setSuccess(true);
      setModalOpen(false);
    }, 1000);
  };

  const handleAddBill = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post('/api/finance/bills', data);
      setBills([res.data, ...bills]);
      setModalOpen(false);
      reset();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add bill');
    } finally {
      setLoading(false);
    }
  };

  // Search and pagination logic
  const filteredBills = bills.filter(b =>
    (b.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      b.billNo?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.max(1, Math.ceil(filteredBills.length / rowsPerPage));
  const paginatedBills = filteredBills.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExportCSV = () => {
    const exportData = filteredBills.map(bill => ({
      Vendor: bill.vendorName,
      'Bill No': bill.billNo,
      'Bill Date': bill.billDate ? new Date(bill.billDate).toLocaleDateString('en-IN') : '',
      Amount: bill.amount,
      Status: bill.isPaid ? 'Paid' : 'Pending',
    }));
    const ws = XLSXUtils.json_to_sheet(exportData);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, 'PurchaseBills');
    XLSXWriteFile(wb, 'purchase_bills.csv');
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Purchase Bills"
        subtitle="Manage and track all your purchase bills"
        actions={[
          <Button onClick={() => navigate('/finance/bills/add')} className="bg-blue-600 hover:bg-blue-700 text-white">
            Add New Bill
          </Button>,
          <Button key="export-csv" variant="outline" className="ml-2" onClick={handleExportCSV}>Export CSV</Button>
        ]}
      />

      {/* Search and Pagination Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by vendor or bill number..."
          className="border rounded px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <div className="flex gap-2 justify-end mt-2 md:mt-0">
          <button
            className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Previous</button>
          <span className="px-4 py-1 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {billsSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Amount') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Purchase Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Bills Directory</h3>
        </div>
        {paginatedBills.length === 0 ? (
          <EmptyState message="No purchase bills found." />
        ) : (
          <Table columns={columns} data={paginatedBills} />
        )}
      </div>

      {/* Upload Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Add New Bill</h3>
            <form onSubmit={handleSubmit(handleAddBill)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('vendor', { required: true })} />
                {errors.vendor && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill No</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('billNo', { required: true })} />
                {errors.billNo && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('billDate', { required: true })} />
                {errors.billDate && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('amount', { required: true, min: 1 })} />
                {errors.amount && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Add Bill</Button>
                <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); reset(); }} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bill Modal */}
      {editModalOpen && editingBill && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Edit Bill</h3>
            <form onSubmit={handleSubmit(handleUpdateBill)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('vendor', { required: true })} />
                {errors.vendor && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill No</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('billNo', { required: true })} />
                {errors.billNo && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('billDate', { required: true })} />
                {errors.billDate && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('amount', { required: true, min: 1 })} />
                {errors.amount && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Update Bill</Button>
                <Button type="button" variant="secondary" onClick={() => { setEditModalOpen(false); setEditingBill(null); reset(); }} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
