import React, { useState, useEffect } from 'react';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import { FiBriefcase, FiDollarSign, FiUser, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/useAuth';
import { Modal } from '../../components/ui/Modal';
import ProjectForm from '../../components/finance/ProjectForm';
import { formatCurrency, formatDate } from '../../utils/helpers';

// Compute summary stats for projects
const getProjectsSummary = (projects) => {
  const totalProjects = projects.length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalReceived = projects.reduce((sum, p) => sum + (p.receivedAmount || 0), 0);
  const completed = projects.filter(p => p.status === 'completed').length;
  return [
    { title: 'Total Projects', value: totalProjects, icon: <FiBriefcase className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Budget', value: totalBudget, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Total Received', value: totalReceived, icon: <FiUser className="h-6 w-6 text-purple-500" /> },
    { title: 'Completed', value: completed, icon: <FiCheckCircle className="h-6 w-6 text-green-600" /> },
  ];
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const navigate = useNavigate();
  const { token } = useAuth();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/finance/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  // Table columns
  const columns = [
    { Header: 'Project Name', accessor: 'name', Cell: ({ value, row }) => (<Link to={`/finance/projects/${row.original._id}`} className="font-medium text-blue-600 hover:underline">{value}</Link>) },
    { Header: 'Client', accessor: 'client', Cell: ({ value }) => <span>{value}</span> },
    { Header: 'Type', accessor: 'type', Cell: ({ value }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${value === 'software' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{value}</span> },
    { Header: 'Budget', accessor: 'budget', Cell: ({ value }) => <span>{formatCurrency(value)}</span> },
    { Header: 'Received', accessor: 'receivedAmount', Cell: ({ value }) => <span>{formatCurrency(value)}</span> },
    { Header: 'Balance', accessor: row => (row.original.budget || 0) - (row.original.receivedAmount || 0), id: 'balance', Cell: ({ row }) => {
      const balance = (row.original.budget || 0) - (row.original.receivedAmount || 0);
      return <span className={balance > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{formatCurrency(balance)}</span>;
    } },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'completed' ? 'bg-green-100 text-green-800' : value === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{value.replace('_', ' ')}</span> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/projects/${row.original._id}`)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => navigate(`/finance/projects/${row.original._id}/edit`)}>Edit</Button>
      </div>
    ) }
  ];

  // Filtering logic
  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.client?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const paginatedProjects = filteredProjects.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Projects"
        subtitle="Manage your software and construction projects"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Projects' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {getProjectsSummary(projects).map((item) => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.title === 'Total Budget' || item.title === 'Total Received' ? `₹${item.value?.toLocaleString()}` : item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search and Add Project Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or client..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button key="add-project" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/projects/add')}>
            <FiPlus className="w-4 h-4" /> Add Project
          </Button>
        </div>
      </div>
      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Project Directory</h3>
        </div>
        {paginatedProjects.length === 0 ? (
          <EmptyState message="No projects found." />
        ) : (
          <Table columns={columns} data={paginatedProjects} />
        )}
      </div>
      {/* Pagination */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
