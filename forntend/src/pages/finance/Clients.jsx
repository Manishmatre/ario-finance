import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import { FiUsers, FiPlus, FiPhone, FiMapPin, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const getClientsSummary = (clients) => [
  { title: 'Total Clients', value: clients.length, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
  { title: 'With Email', value: clients.filter(c => c.email).length, icon: <FiMail className="h-6 w-6 text-green-500" /> },
  { title: 'With Phone', value: clients.filter(c => c.phone).length, icon: <FiPhone className="h-6 w-6 text-purple-500" /> },
  { title: 'With Address', value: clients.filter(c => c.address).length, icon: <FiMapPin className="h-6 w-6 text-yellow-500" /> },
];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('/api/finance/clients')
      .then(res => {
        setClients(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch clients');
        setLoading(false);
      });
  }, []);

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setLoading(true);
      axios.delete(`/api/finance/clients/${id}`)
        .then(() => {
          setClients(clients.filter(c => c._id !== id));
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to delete client');
          setLoading(false);
        });
    }
  };

  const columns = [
    { Header: 'Name', accessor: 'name', Cell: ({ value }) => (<div className="font-medium">{value}</div>) },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Phone', accessor: 'phone' },
    { Header: 'Address', accessor: 'address', Cell: ({ value }) => (<div className="max-w-xs truncate" title={value}>{value}</div>) },
    { Header: 'GST No', accessor: 'gstNo' },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/clients/${row.original._id}`)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => navigate(`/finance/clients/edit/${row.original._id}`)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original._id)}>Delete</Button>
      </div>
    ) }
  ];

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Clients"
        subtitle="Manage client information and their projects"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Clients' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {getClientsSummary(clients).map((item) => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search and Add Client Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button key="add-client" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/clients/add')}>
            <FiPlus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>
      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Client Directory</h3>
        </div>
        {filteredClients.length === 0 ? (
          <EmptyState message="No clients found." />
        ) : (
          <Table columns={columns} data={filteredClients} />
        )}
      </div>
    </div>
  );
} 