import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import axios from '../../utils/axios';
import { FiFileText, FiDollarSign, FiTrendingUp, FiCheckCircle, FiArrowLeft, FiPlus, FiLayers, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const TABS = [
  { key: 'info', label: 'Client Info', icon: <FiUser /> },
  { key: 'projects', label: 'Projects', icon: <FiFileText /> },
  { key: 'payments', label: 'Payments', icon: <FiDollarSign /> },
];

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/finance/clients/${id}`)
      .then(clientRes => {
        setClient(clientRes.data);
        // Only fetch projects, not payments (since /api/finance/payments does not exist)
        return axios.get(`/api/finance/projects?clientId=${id}`);
      })
      .then((projectsRes) => {
        setProjects(projectsRes.data);
        setPayments([]); // No payments for now
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch client details');
        setLoading(false);
      });
  }, [id]);

  const summaryCards = [
    { title: 'Total Projects', value: projects.length, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Payments', value: payments.length, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Email', value: client?.email || '-', icon: <FiMail className="h-6 w-6 text-purple-500" /> },
    { title: 'Phone', value: client?.phone || '-', icon: <FiPhone className="h-6 w-6 text-yellow-500" /> },
  ];

  const projectColumns = [
    { Header: 'Project Name', accessor: 'name' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Budget', accessor: 'budget' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/projects/${row.original._id}`)}>View</Button>
    ) }
  ];

  const paymentColumns = [
    { Header: 'Amount', accessor: 'amount' },
    { Header: 'Date', accessor: 'paymentDate' },
    { Header: 'Method', accessor: 'paymentMethod' },
    { Header: 'Reference', accessor: 'referenceNumber' },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!client) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Client Details: ${client.name}`}
        subtitle="View all information, projects, and payments for this client"
        breadcrumbs={[
          { label: 'Clients', to: '/finance/clients' },
          { label: 'Client Details' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <Button key={t.key} variant={tab === t.key ? 'primary' : 'outline'} onClick={() => setTab(t.key)} icon={t.icon}>{t.label}</Button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">
            {tab === 'info' && `Client Information`}
            {tab === 'projects' && `Projects for ${client.name}`}
            {tab === 'payments' && `Payments for ${client.name}`}
          </h3>
        </div>
        <div className="p-2">
          {tab === 'info' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><strong>Name:</strong> {client.name}</div>
              <div><strong>Email:</strong> {client.email}</div>
              <div><strong>Phone:</strong> {client.phone}</div>
              <div><strong>Address:</strong> {client.address}</div>
              <div><strong>GST No:</strong> {client.gstNo}</div>
              <div><strong>Company:</strong> {client.company}</div>
            </div>
          )}
          {tab === 'projects' && (
            <div className="p-2">
              <Table columns={projectColumns} data={projects} />
            </div>
          )}
          {tab === 'payments' && (
            <div className="p-2">
              <Table columns={paymentColumns} data={payments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 