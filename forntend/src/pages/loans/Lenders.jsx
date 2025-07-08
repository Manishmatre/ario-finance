import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import { FiPlus, FiEdit2, FiTrash2, FiDatabase, FiUsers, FiDollarSign, FiMapPin, FiPhone, FiSearch } from 'react-icons/fi';
import Pagination from '../../components/ui/Pagination';

const lenderSummary = [
  { title: 'Total Lenders', value: 0, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
  { title: 'Active Lenders', value: 0, icon: <FiDatabase className="h-6 w-6 text-green-500" /> },
  { title: 'Total Loans', value: 0, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Bank Lenders', value: 0, icon: <FiMapPin className="h-6 w-6 text-purple-500" /> },
];

const Lenders = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLender, setSelectedLender] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    loanType: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchLenders = async () => {
    try {
      const response = await axiosInstance.get('/api/finance/lenders', {
        params: filters
      });
      const { lenders, stats } = response.data;
      setLenders(lenders);
      
      // Update summary stats from API response
      lenderSummary[0].value = stats.total;
      lenderSummary[1].value = stats.active;
      lenderSummary[2].value = stats.totalLoans;
      lenderSummary[3].value = stats.banks;
    } catch (error) {
      console.error('Error fetching lenders:', error);
      setError('Failed to load lenders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/finance/lenders', formData);
      setShowAddForm(false);
      fetchLenders();
    } catch (error) {
      console.error('Error adding lender:', error);
    }
  };

  const handleEdit = (lenderId) => {
    navigate(`/finance/lenders/add/${lenderId}`);
  };

  const handleDelete = async (lenderId) => {
    if (window.confirm('Are you sure you want to delete this lender?')) {
      try {
        await axiosInstance.delete(`/api/finance/lenders/${lenderId}`);
        setLenders(lenders.filter(l => l._id !== lenderId));
        fetchLenders(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting lender:', error);
        setError('Failed to delete lender');
      }
    }
  };

  useEffect(() => {
    fetchLenders();
  }, []);

  // Filtered and paginated lenders
  const filteredLenders = lenders.filter(lender =>
    lender.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
    lender.type?.toLowerCase().includes(filters.search.toLowerCase()) ||
    lender.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
    lender.phone?.toLowerCase().includes(filters.search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredLenders.length / pageSize) || 1;
  const paginatedLenders = filteredLenders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Lenders Management"
        subtitle="Manage your company's lenders"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Lenders" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {lenderSummary.map((item, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center">
              {item.icon}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            placeholder="Search lenders..."
            value={filters.search}
            onChange={handleInputChange}
            name="search"
            className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button
            onClick={() => navigate('/finance/lenders/add')}
            icon={<FiPlus />}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add New Lender
          </Button>
        </div>
      </div>
      {/* Table Section */}
      <Card>
        {loading ? <Loader /> : paginatedLenders.length === 0 ? (
          <EmptyState
            title="No Lenders Found"
            description="You haven't added any lenders yet. Click the button below to add a new lender."
            icon={<FiDatabase className="h-12 w-12 text-gray-400" />}
            action={
              <Button
                onClick={() => navigate('/finance/lenders/add')}
                icon={<FiPlus />}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add New Lender
              </Button>
            }
          />
        ) : (
          <Table
            data={paginatedLenders}
            columns={[
              {
                Header: 'Name',
                accessor: 'name',
                disableSort: false,
                Cell: ({ value }) => (
                  <span className="font-medium">{value}</span>
                )
              },
              {
                Header: 'Type',
                accessor: 'type',
                disableSort: false
              },
              {
                Header: 'Status',
                accessor: 'status',
                disableSort: false,
                Cell: ({ value }) => (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {value}
                  </span>
                )
              },
              {
                Header: 'Email',
                accessor: 'email',
                disableSort: false
              },
              {
                Header: 'Phone',
                accessor: 'phone',
                disableSort: false
              },
              {
                Header: 'Actions',
                accessor: '_id',
                disableSort: true,
                Cell: ({ value }) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/finance/lenders/${value}`)}
                      title="View"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleEdit(value)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(value)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                )
              }
            ]}
            stickyHeader={true}
            pageSize={pageSize}
            className="mt-2"
          />
        )}
        {/* Pagination */}
        {paginatedLenders.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Lenders;
