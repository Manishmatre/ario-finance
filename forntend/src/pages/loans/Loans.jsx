import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter, FiSearch, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiPieChart, FiFileText, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import axiosInstance from '../../utils/axiosInstance';
import PageHeading from '../../components/ui/PageHeading';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

const Loans = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    loanType: '',
    search: ''
  });
  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    totalAmount: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalRepayments: 0,
    totalInterest: 0
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchLoanStats();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/finance/loans', {
        params: {
          status: filters.status,
          loanType: filters.loanType,
          search: filters.search
        }
      });
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanStats = async () => {
    try {
      const stats = await axiosInstance.get('/api/finance/loans/stats');
      setLoanStats(stats.data);
    } catch (error) {
      console.error('Error fetching loan stats:', error);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters({ status: '', loanType: '', search: '' });
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/api/finance/loans/${id}/status`, {
        status: 'APPROVED'
      });
      fetchLoans();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const columns = [
    {
      Header: 'Loan Number',
      accessor: 'loanNumber',
      className: 'text-center'
    },
    {
      Header: 'Applicant',
      accessor: 'applicant.name',
      className: 'text-left'
    },
    {
      Header: 'Loan Type',
      accessor: 'loanType',
      className: 'text-center'
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: ({ value }) => `₹${value.toLocaleString()}`,
      className: 'text-right'
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          value === 'APPLIED' ? 'bg-yellow-100 text-yellow-800' :
          value === 'APPROVED' ? 'bg-green-100 text-green-800' :
          value === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
          value === 'REPAYING' ? 'bg-purple-100 text-purple-800' :
          value === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value.replace('_', ' ')}
        </span>
      ),
      className: 'text-center'
    },
    {
      Header: 'Monthly Installment',
      accessor: 'monthlyInstallment',
      Cell: ({ value }) => `₹${value.toLocaleString()}`,
      className: 'text-right'
    },
    {
      Header: 'Remaining Balance',
      accessor: 'remainingBalance',
      Cell: ({ value }) => `₹${value.toLocaleString()}`,
      className: 'text-right'
    },
    {
      Header: 'Actions',
      accessor: '_id',
      Cell: ({ value, row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/finance/loans/${value}`)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Button>
          {row.original.status === 'APPLIED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApprove(value)}
              className="text-green-600 hover:text-green-800"
            >
              Approve
            </Button>
          )}
        </div>
      ),
      className: 'text-center'
    }
  ];

  // Filtered and paginated loans
  const filteredLoans = loans.filter(loan =>
    (filters.status === '' || loan.status === filters.status) &&
    (filters.loanType === '' || loan.loanType === filters.loanType) &&
    (
      loan.loanNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      loan.applicant?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      loan.loanType?.toLowerCase().includes(filters.search.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filteredLoans.length / pageSize) || 1;
  const paginatedLoans = filteredLoans.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Loan Management"
        subtitle="Overview of your loan portfolio"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Loans" }
        ]}
      />

      {/* Loan Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card 
          title="Total Loans" 
          value={loanStats.totalLoans}
          icon={<FiPieChart className="h-6 w-6 text-blue-500" />}
          trend="up"
          trendValue="12.5%"
        />
        <Card 
          title="Total Amount" 
          value={`₹${loanStats.totalAmount.toLocaleString()}`}
          icon={<FiTrendingUp className="h-6 w-6 text-green-500" />}
          trend="up"
          trendValue="8.2%"
        />
        <Card 
          title="Active Loans" 
          value={loanStats.activeLoans}
          icon={<FiTrendingDown className="h-6 w-6 text-red-500" />}
          trend="down"
          trendValue="3.4%"
        />
        <Card 
          title="Overdue Loans" 
          value={loanStats.overdueLoans}
          icon={<FiFileText className="h-6 w-6 text-yellow-500" />}
          trend="up"
          trendValue="1.2%"
        />
      </div>

      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="APPLIED">Applied</option>
            <option value="APPROVED">Approved</option>
            <option value="DISBURSED">Disbursed</option>
            <option value="REPAYING">Repaying</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            name="loanType"
            value={filters.loanType}
            onChange={handleFilterChange}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="Term Loan">Term Loan</option>
            <option value="Working Capital">Working Capital</option>
            <option value="Equipment">Equipment</option>
            <option value="Vehicle">Vehicle</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder="Search loans..."
          />
          <Button variant="outline" onClick={handleReset}><FiRefreshCw className="mr-2" />Reset</Button>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button onClick={() => navigate('/finance/loans/new')} className="bg-blue-600 hover:bg-blue-700 text-white"><FiPlus className="mr-2" />Add Loan</Button>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        {loading ? <Loader /> : paginatedLoans.length === 0 ? <EmptyState message="No loans found." /> : (
          <Table
            columns={columns}
            data={paginatedLoans}
            stickyHeader={true}
            pageSize={pageSize}
            className="mt-2"
          />
        )}
        {/* Pagination */}
        {paginatedLoans.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Loans;

