import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiDownload, FiRefreshCw, FiSearch, FiCheck, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import PageHeading from '../../components/ui/PageHeading';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

export default function Expenses() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    status: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/finance/expenses/categories');
        setCategories(response.data || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/finance/expenses', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          category: filters.category,
          status: filters.status,
          search: filters.search,
        }
      });
      
      if (response.data) {
        // Handle different response structures
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setExpenses(data);
        setTotal(data.length);
      } else {
        setExpenses([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch expenses');
      setExpenses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/finance/expenses/${id}`);
      toast.success('Expense deleted successfully');
      // Refresh the list after deletion
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.response?.data?.error || 'Failed to delete expense');
    }
  };

  // Summary cards
  const summaryCards = [
    { title: 'Total Expenses', value: `₹${expenses?.length > 0 ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`, icon: <FiDownload className="h-6 w-6 text-red-500" /> },
    { title: 'Approved', value: `₹${expenses?.length > 0 ? expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`, icon: <FiCheck className="h-6 w-6 text-green-500" /> },
    { title: 'Pending', value: `₹${expenses?.length > 0 ? expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`, icon: <FiRefreshCw className="h-6 w-6 text-yellow-500" /> },
    { title: 'Rejected', value: `₹${expenses?.length > 0 ? expenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`, icon: <FiFilter className="h-6 w-6 text-gray-500" /> },
  ];

  // Helper to get category name from ID
  const getCategoryName = (cat) => {
    if (!cat) return '-';
    if (typeof cat === 'object' && cat.name) return cat.name;
    // If cat is an ID, look up in categories
    const found = categories.find(c => c._id === cat);
    return found ? found.name : cat;
  };

  // Table columns
  const columns = [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? format(new Date(value), 'dd MMM yyyy') : '-' },
    { Header: 'Description', accessor: 'description' },
    { Header: 'Category', accessor: 'category', Cell: ({ value }) => getCategoryName(value) },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => `₹${value?.toLocaleString()}` },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'approved' ? 'bg-green-100 text-green-800' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        value === 'rejected' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ) },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/expenses/${row.original._id || row.original.id}`)}><FiEye /></Button>
        <Button size="sm" variant="primary" onClick={() => navigate(`/finance/expenses/${row.original._id || row.original.id}/edit`)}><FiEdit /></Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original._id || row.original.id)}><FiTrash2 /></Button>
      </div>
    ) }
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Expenses"
        subtitle="Track and manage all your business expenses"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Expenses" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </div>
      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
            className="border rounded px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
            className="border rounded px-3 py-2 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder="End Date"
          />
          <select
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">All Categories</option>
            <option value="salary">Salary</option>
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="supplies">Supplies</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder="Search expenses..."
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button onClick={() => navigate('/finance/expenses/new')} className="bg-blue-600 hover:bg-blue-700 text-white"><FiPlus className="mr-2" />Add Expense</Button>
          <Button key="export-csv" variant="outline" className="ml-2" onClick={() => alert('Export (mock)')}><FiDownload className="mr-2" />Export CSV</Button>
        </div>
      </div>
      {/* Table Section */}
      <Card>
        {loading ? <Loader /> : expenses.length === 0 ? <EmptyState message="No expenses found." /> : (
          <Table columns={columns} data={expenses} />
        )}
      </Card>
    </div>
  );
}
