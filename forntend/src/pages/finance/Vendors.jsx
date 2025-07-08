import React, { useState, useEffect } from "react";
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiUsers, FiDollarSign, FiMapPin, FiPhone, FiPlus } from "react-icons/fi";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

// Compute real summary stats from vendors
const getVendorsSummary = (vendors) => {
  const totalVendors = vendors.length;
  const totalOutstanding = vendors.reduce((sum, v) => sum + (v.outstanding || 0), 0);
  const activeVendors = vendors.filter(v => v.isActive !== false).length;
  const categories = new Set(vendors.map(v => v.category || '-')).size;
  return [
    { title: 'Total Vendors', value: totalVendors, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Outstanding', value: totalOutstanding, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
    { title: 'Active Vendors', value: activeVendors, icon: <FiMapPin className="h-6 w-6 text-green-500" /> },
    { title: 'Categories', value: categories, icon: <FiPhone className="h-6 w-6 text-purple-500" /> },
  ];
};

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/vendors')
      .then(res => {
        setVendors(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch vendors');
        setLoading(false);
      });
  }, []);

  // Delete Vendor
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      setLoading(true);
      axiosInstance.delete(`/api/finance/vendors/${id}`)
        .then(() => {
          setVendors(vendors.filter(v => v._id !== id && v.id !== id));
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to delete vendor');
          setLoading(false);
        });
    }
  };

  // Table columns
  const columns = [
    { Header: 'Vendor Name', accessor: 'name', Cell: ({ value }) => (<div className="font-medium">{value}</div>) },
    { Header: 'GST No', accessor: 'gstNo', Cell: ({ value }) => <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{value}</span> },
    { Header: 'Contact', accessor: 'phone', Cell: ({ value }) => (<div className="font-medium">{value}</div>) },
    { Header: 'Address', accessor: 'address', Cell: ({ value }) => (<div className="max-w-xs truncate" title={value}>{value}</div>) },
    { Header: 'Outstanding', accessor: 'outstanding', Cell: ({ value }) => <div className="font-medium text-red-600">9{value?.toLocaleString()}</div> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/vendors/${row.original._id || row.original.id}`)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => navigate('/finance/vendors/edit', { state: { vendor: row.original } })}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original._id || row.original.id)}>Delete</Button>
      </div>
    ) }
  ];

  // Filtering logic
  const filteredVendors = vendors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.gstNo?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / rowsPerPage));
  const paginatedVendors = filteredVendors.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Vendors"
        subtitle="Manage vendor information and track outstanding balances"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Vendors' }
        ]}
        actions={[
          <Button key="add-vendor" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/vendors/add')}>
            <FiPlus className="w-4 h-4" /> Add Vendor
          </Button>
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {getVendorsSummary(vendors).map((item, idx) => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.title === 'Total Outstanding' ? `9${item.value?.toLocaleString()}` : item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search and Add Vendor Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, GST, or phone..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button key="add-vendor" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/vendors/add')}>
            <FiPlus className="w-4 h-4" /> Add Vendor
          </Button>
        </div>
      </div>
      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Vendor Directory</h3>
        </div>
        {paginatedVendors.length === 0 ? (
          <EmptyState message="No vendors found." />
        ) : (
          <Table columns={columns} data={paginatedVendors} />
        )}
      </div>
    </div>
  );
}
