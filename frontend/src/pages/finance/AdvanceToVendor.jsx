import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiUsers, FiTrendingUp, FiCheckCircle, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";

const PAGE_SIZE = 10;

function getAdvancesSummary(advances, vendors) {
  const totalAdvances = advances.length;
  const totalAmount = advances.reduce((sum, a) => sum + (a.amount || 0), 0);
  const cleared = advances.filter(a => a.cleared).length;
  const uncleared = totalAdvances - cleared;
  const vendorCount = new Set(advances.map(a => a.vendorId)).size;
  return [
    { title: 'Total Advances', value: totalAdvances, icon: <FiTrendingUp className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Cleared', value: cleared, icon: <FiCheckCircle className="h-6 w-6 text-green-600" /> },
    { title: 'Vendors', value: vendorCount, icon: <FiUsers className="h-6 w-6 text-purple-500" /> },
  ];
}

export default function AdvanceToVendor() {
  const [advances, setAdvances] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorMap, setVendorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axiosInstance.get('/api/finance/vendors/advances'),
      axiosInstance.get('/api/finance/vendors')
    ])
      .then(([advRes, venRes]) => {
        setAdvances(advRes.data);
        setVendors(venRes.data);
        const map = {};
        venRes.data.forEach(v => { map[v._id] = v.name; });
        setVendorMap(map);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch advances or vendors');
        setLoading(false);
      });
  }, []);

  // Filtering logic
  const filteredAdvances = useMemo(() =>
    advances.filter(a =>
      (vendorMap[a.vendorId] || '').toLowerCase().includes(search.toLowerCase())
    ), [advances, vendorMap, search]
  );
  const totalPages = Math.max(1, Math.ceil(filteredAdvances.length / PAGE_SIZE));
  const paginated = filteredAdvances.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Delete Advance
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advance?')) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/api/finance/vendors/advances/${id}`);
      setAdvances(advances.filter(a => a._id !== id));
    } catch (e) {
      setError('Failed to delete advance');
    }
    setLoading(false);
  };

  // Table columns
  const columns = [
    { Header: 'Vendor', accessor: 'vendorId', Cell: ({ value }) => <div className="font-medium">{vendorMap[value] || value}</div> },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => `₹${value.toLocaleString()}` },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '' },
    { Header: 'Cleared', accessor: 'cleared', Cell: ({ value }) => value ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-yellow-600 font-semibold">No</span> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/advance-vendor/edit/${row.original._id}`)} icon={<FiEdit />} />
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original._id)} icon={<FiTrash2 />} />
        </div>
    ) }
  ];

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Advance To Vendor"
        subtitle="Manage vendor advances and track settlements"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Vendor and Purchase", to: "/finance/vendors" },
          { label: "Advance To Vendor" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {getAdvancesSummary(filteredAdvances, vendors).map(item => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search and Add Advance Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by vendor name..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/advance-vendor/add')}>
            <FiPlus className="w-4 h-4" /> Add Advance
          </Button>
        </div>
      </div>
      {/* Advances Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Advance Payments</h3>
        </div>
        {paginated.length === 0 ? (
          <EmptyState message="No advances found." />
        ) : (
          <>
            <Table columns={columns} data={paginated} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filteredAdvances.length} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
