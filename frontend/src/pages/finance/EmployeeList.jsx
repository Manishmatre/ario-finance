import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Pagination from '../../components/ui/Pagination';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { FiUsers, FiUser, FiDollarSign, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const getEmployeesSummary = (employees) => {
  const total = employees.length;
  const active = employees.filter(e => e.status === 'active').length;
  const inactive = employees.filter(e => e.status === 'inactive').length;
  const terminated = employees.filter(e => e.status === 'terminated').length;
  const totalSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  return [
    { title: 'Total Employees', value: total, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
    { title: 'Active', value: active, icon: <FiUser className="h-6 w-6 text-green-500" /> },
    { title: 'Inactive', value: inactive, icon: <FiUser className="h-6 w-6 text-yellow-500" /> },
    { title: 'Terminated', value: terminated, icon: <FiUser className="h-6 w-6 text-red-500" /> },
    { title: 'Total Salary', value: `₹${totalSalary.toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-purple-500" /> },
  ];
};

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/employees')
      .then(res => setEmployees(res.data || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtering logic
  const filteredEmployees = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.phone?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / rowsPerPage));
  const paginated = filteredEmployees.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Delete Employee
  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setLoading(true);
      axiosInstance.delete(`/api/finance/employees/${id}`)
        .then(() => {
          setEmployees(employees.filter(e => e._id !== id && e.id !== id));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  const columns = [
    { Header: 'Name', accessor: 'name', Cell: ({ value }) => (<div className="font-medium">{value}</div>) },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Phone', accessor: 'phone' },
    { Header: 'Department', accessor: 'department' },
    { Header: 'Designation', accessor: 'designation' },
    { Header: 'Salary', accessor: 'salary', Cell: ({ value }) => `₹${value?.toLocaleString()}` },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`px-2 py-1 rounded text-xs ${value==='active'?'bg-green-100 text-green-800':value==='inactive'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}`}>{value}</span> },
    { Header: 'Join Date', accessor: 'joinDate', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/employees/${row.original._id}`)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => navigate(`/finance/employees/edit/${row.original._id}`)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original._id)}>Delete</Button>
      </div>
    ) },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Employees"
        subtitle="Manage employee information and salary records"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employees' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {getEmployeesSummary(employees).map((item, idx) => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Search and Add Employee Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, or phone..."
          className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button key="add-employee" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2" onClick={() => navigate('/finance/employees/add')}>
            <FiPlus className="w-4 h-4" /> Add Employee
          </Button>
        </div>
      </div>
      {/* Employees Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Employee Directory</h3>
        </div>
        {paginated.length === 0 ? (
          <EmptyState message="No employees found." />
        ) : (
          <Table columns={columns} data={paginated} />
        )}
      </div>
    </div>
  );
} 