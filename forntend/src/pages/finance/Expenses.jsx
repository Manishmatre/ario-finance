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
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortState, setSortState] = useState({
    column: 'date',
    direction: 'desc'
  });
  const navigate = useNavigate();

  const handleSort = (column) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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
          page: currentPage,
          limit: 10,
          sort: sortState.column,
          order: sortState.direction
        }
      });
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        setExpenses(response.data);
        setTotal(response.data.length);
      } else if (response.data && response.data.data) {
        setExpenses(response.data.data);
        setTotal(response.data.total || response.data.data.length);
      } else {
        setExpenses([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
      setExpenses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [filters, currentPage, sortState]);

  const handleDelete = (id) => {
    // implement delete logic here
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Expenses"
        subtitle="Track and manage all your business expenses"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Expenses" }
        ]}
        actions={[
          <Button
            key="add-expense"
            variant="primary"
            onClick={() => navigate('/finance/expenses/new')}
          >
            <FiPlus className="mr-2" /> Add Expense
          </Button>,
          <Button
            key="export"
            variant="outline"
            onClick={() => alert('Export (mock)')}
          >
            <FiDownload className="mr-2" /> Export
          </Button>
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          title="Total Expenses" 
          value={`₹${expenses?.length > 0 ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`} 
          icon={<FiDownload className="h-6 w-6 text-red-500" />} 
        />
        <Card 
          title="Approved" 
          value={`₹${expenses?.length > 0 ? expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`} 
          icon={<FiCheck className="h-6 w-6 text-green-500" />} 
        />
        <Card 
          title="Pending" 
          value={`₹${expenses?.length > 0 ? expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`} 
          icon={<FiRefreshCw className="h-6 w-6 text-yellow-500" />} 
        />
        <Card 
          title="Rejected" 
          value={`₹${expenses?.length > 0 ? expenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString() : '0'}`} 
          icon={<FiFilter className="h-6 w-6 text-gray-500" />} 
        />
      </div>
      {/* Filters Section */}
      <Card>
        <div className="p-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="border rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="border rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="End Date"
            />
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="border rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
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
              className="border rounded px-3 py-2 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search expenses..."
              />
            </div>
            <Button variant="outline" onClick={() => setFilters({ startDate: '', endDate: '', category: '', status: '', search: '' })}>
              <FiRefreshCw className="mr-2" /> Reset
            </Button>
          </div>
        </div>
      </Card>
      {/* Expenses Table */}
      <Card>
        <div className="p-4 space-y-4">
          {loading ? (
            <Loader />
          ) : (
            <Table
              data={expenses}
              columns={[
                {
                  Header: 'Date',
                  accessor: 'date',
                  Cell: ({ value }) => format(new Date(value), 'MMM d, yyyy'),
                  className: 'text-center whitespace-nowrap',
                  disableSort: false
                },
                {
                  Header: 'Description',
                  accessor: 'description',
                  className: 'text-left whitespace-normal',
                  disableSort: false
                },
                {
                  Header: 'Category',
                  accessor: 'category',
                  className: 'text-left',
                  disableSort: false
                },
                {
                  Header: 'Amount',
                  accessor: 'amount',
                  Cell: ({ value }) => `₹${value.toLocaleString()}`,
                  className: 'text-right whitespace-nowrap',
                  disableSort: false
                },
                {
                  Header: 'Status',
                  accessor: 'status',
                  Cell: ({ value }) => (
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      value === 'approved' ? 'bg-green-100 text-green-800' :
                      value === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                  ),
                  className: 'text-center whitespace-nowrap',
                  disableSort: false
                },
                {
                  Header: 'Actions',
                  accessor: '_id',
                  className: 'text-center whitespace-nowrap',
                  Cell: ({ value, row }) => (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/finance/expenses/${value}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEye className="mr-1" /> View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/finance/expenses/${value}/edit`)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <FiEdit className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        color="red"
                        onClick={() => handleDelete(value)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </Button>
                    </div>
                  ),
                  className: 'text-center',
                  disableSort: true
                }
              ]}
              className="mt-4"
              onRowClick={(row) => navigate(`/finance/expenses/${row._id}`)}
              loading={loading}
              emptyMessage="No expenses found"
              stickyHeader={true}
              pageSize={10}
              defaultSort={{ column: 'date', direction: 'desc' }}
            />
          )}
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Showing {expenses?.length || 0} of {total || 0} expenses
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={total ? Math.ceil(total / 10) : 1}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
