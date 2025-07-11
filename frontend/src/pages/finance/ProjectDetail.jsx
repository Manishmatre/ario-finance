import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/useAuth';
import { formatCurrency, formatDate } from '../../utils/helpers';
import axios from '../../utils/axios';
import { FiFileText, FiDollarSign, FiTrendingUp, FiCheckCircle, FiArrowLeft, FiPlus, FiLayers, FiUser, FiDownload } from 'react-icons/fi';
import StatCard from '../../components/ui/StatCard';

const TABS = [
  { key: 'info', label: 'Project Info', icon: <FiUser /> },
  { key: 'payments', label: 'Payments', icon: <FiDollarSign /> },
  // { key: 'ledger', label: 'Ledger', icon: <FiLayers /> },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('info');
  const { token } = useAuth();

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/api/finance/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(data);
      setPayments(data.payments || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch project details');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
    // eslint-disable-next-line
  }, [id]);

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/finance/projects/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProject();
      } catch (err) {
        alert('Error deleting payment');
      }
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      setLoading(true);
      await axios.delete(`/api/finance/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoading(false);
      navigate('/finance/projects');
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      setLoading(false);
    }
  };

  // Summary stats
  const totalPayments = payments.length;
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const budget = typeof project?.budget === 'number' ? project.budget : Number(project?.budget) || 0;
  const balance = budget - totalPaid;
  const summaryCards = [
    { title: 'Total Payments', value: totalPayments, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
    { title: 'Budget', value: formatCurrency(budget), icon: <FiTrendingUp className="h-6 w-6 text-purple-500" /> },
    { title: 'Received', value: formatCurrency(totalPaid), icon: <FiDollarSign className="h-6 w-6 text-green-600" /> },
    { title: 'Balance', value: formatCurrency(balance), icon: <FiCheckCircle className="h-6 w-6 text-red-500" /> },
  ];

  // Payments table columns
  const paymentColumns = [
    { Header: 'Date', accessor: 'paymentDate', Cell: ({ value }) => formatDate(value) },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Method', accessor: 'paymentMethod', Cell: ({ value }) => value?.replace('_', ' ') },
    { Header: 'Reference', accessor: 'referenceNumber', Cell: ({ value }) => value || '-' },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="primary" onClick={() => navigate(`/finance/projects/payments/${row.original._id}`)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => navigate(`/finance/projects/${id}/record-payment`)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDeletePayment(row.original._id)}>Delete</Button>
      </div>
    ) }
  ];

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!project) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Project Details: ${project.name}`}
        subtitle="View all information and payments for this project"
        breadcrumbs={[
          { label: 'Projects', to: '/finance/projects' },
          { label: 'Project Details' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <StatCard key={idx} title={card.title} value={card.value} icon={card.icon} />
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
            {tab === 'info' && `Project Information`}
            {tab === 'payments' && `Payments for ${project.name}`}
          </h3>
          {tab === 'payments' && (
            <Button size="sm" variant="primary" icon={<FiPlus />} onClick={() => navigate(`/finance/projects/${id}/record-payment`)}>Record Payment</Button>
          )}
        </div>
        <div className="p-2">
          {tab === 'info' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-2 mb-4 md:col-span-2">
                <Button size="sm" variant="primary" onClick={() => navigate(`/finance/projects/edit/${project._id || project.id}`)}>Edit Project</Button>
                <Button size="sm" variant="danger" onClick={handleDeleteProject}>Delete Project</Button>
              </div>
              <div><strong>Name:</strong> {project.name}</div>
              <div><strong>Client:</strong> {project.client}</div>
              <div><strong>Type:</strong> {project.type}</div>
              <div><strong>Status:</strong> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{project.status.replace('_', ' ')}</span></div>
              <div><strong>Budget:</strong> {formatCurrency(budget)}</div>
              <div><strong>Received:</strong> {formatCurrency(totalPaid)}</div>
              <div><strong>Balance:</strong> <span className={balance > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{formatCurrency(balance)}</span></div>
              <div><strong>Period:</strong> {formatDate(project.startDate)} {project.endDate ? ` - ${formatDate(project.endDate)}` : ' - Present'}</div>
              {project.description && <div className="md:col-span-2"><strong>Description:</strong> {project.description}</div>}
              {project.createdBy && <div><strong>Created By:</strong> {project.createdBy}</div>}
              {project.createdAt && <div><strong>Created At:</strong> {formatDate(project.createdAt)}</div>}
              {project.updatedAt && <div><strong>Updated At:</strong> {formatDate(project.updatedAt)}</div>}
            </div>
          )}
          {tab === 'payments' && (
            <div className="p-2">
              {payments.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No payments recorded yet.</div>
              ) : (
                <Table columns={paymentColumns} data={payments} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
