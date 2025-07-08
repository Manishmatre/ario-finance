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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/finance/lenders/add')}
            icon={<FiPlus />}
            variant="primary"
          >
            Add New Lender
          </Button>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search lenders..."
                value={filters.search}
                onChange={handleInputChange}
                name="search"
                className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FiSearch className="absolute right-3 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : lenders.length === 0 ? (
        <EmptyState
          title="No Lenders Found"
          description="You haven't added any lenders yet. Click the button below to add a new lender."
          icon={<FiDatabase className="h-12 w-12 text-gray-400" />}
          action={
            <Button
              onClick={() => navigate('/finance/lenders/add')}
              icon={<FiPlus />}
              variant="primary"
            >
              Add New Lender
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <Table
            data={lenders}
            columns={[
              {
                Header: 'Name',
                accessor: 'name',
                Cell: ({ value }) => (
                  <span className="font-medium">{value}</span>
                )
              },
              {
                Header: 'Type',
                accessor: 'type',
              },
              {
                Header: 'Status',
                accessor: 'status',
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
              },
              {
                Header: 'Phone',
                accessor: 'phone',
              },
              {
                Header: 'Actions',
                accessor: '_id',
                Cell: ({ value, row }) => (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      icon={<FiEdit2 />}
                      onClick={() => handleEdit(value)}
                      className="text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      color="red"
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(value)}
                      className="text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default Lenders;
