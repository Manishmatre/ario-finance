import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import { FiUser, FiTrendingUp, FiDollarSign, FiCheckCircle, FiPlus, FiLayers, FiCreditCard, FiDownload } from 'react-icons/fi';

const TABS = [
  { key: 'info', label: 'Employee Info', icon: <FiUser /> },
  { key: 'bank', label: 'Bank Account', icon: <FiCreditCard /> },
  { key: 'advances', label: 'Advances', icon: <FiTrendingUp /> },
  { key: 'salary', label: 'Salary', icon: <FiDollarSign /> },
  { key: 'ledger', label: 'Ledger', icon: <FiLayers /> },
];

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosInstance.get(`/api/finance/employees/${id}`),
      axiosInstance.get(`/api/finance/employees/${id}/ledger`).catch(() => ({ data: [] }))
    ])
      .then(([empRes, ledgerRes]) => {
        setEmployee(empRes.data);
        setLedger(ledgerRes.data || []);
        setLoading(false);
      })
      .catch(() => {
        setEmployee(null);
        setLedger([]);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loader />;
  if (!employee) return <div className="p-4 text-red-500">Employee not found</div>;

  // Summary stats
  const totalAdvances = (employee.advances || []).length;
  const totalAdvanceAmount = (employee.advances || []).reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalSalaryPaid = (employee.salaries || []).filter(s => s.status === 'paid').reduce((sum, s) => sum + (s.amount || 0), 0);
  const status = employee.status;
  const summaryCards = [
    { title: 'Total Advances', value: totalAdvances, icon: <FiTrendingUp className="h-6 w-6 text-purple-500" /> },
    { title: 'Advance Amount', value: `₹${totalAdvanceAmount.toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Salary Paid', value: `₹${totalSalaryPaid.toLocaleString()}`, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
    { title: 'Status', value: status, icon: <FiUser className="h-6 w-6 text-gray-500" /> },
  ];

  const profileFields = [
    { label: 'Name', value: employee.name },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone },
    { label: 'Department', value: employee.department },
    { label: 'Designation', value: employee.designation },
    { label: 'Salary', value: `₹${employee.salary?.toLocaleString()}` },
    { label: 'Join Date', value: employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('en-IN') : '-' },
    { label: 'Status', value: employee.status },
  ];

  const advanceColumns = [
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => `₹${value?.toLocaleString()}` },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Reason', accessor: 'reason' },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`px-2 py-1 rounded text-xs ${value==='approved'?'bg-green-100 text-green-800':value==='pending'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}`}>{value}</span> },
    { Header: 'Payment Mode', accessor: 'paymentMode' },
  ];

  const salaryColumns = [
    { Header: 'Month', accessor: 'month', Cell: ({ value }) => value ? value.toString().padStart(2, '0') : '-' },
    { Header: 'Year', accessor: 'year' },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => `₹${value?.toLocaleString()}` },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`px-2 py-1 rounded text-xs ${value==='paid'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>{value}</span> },
    { Header: 'Paid Date', accessor: 'paidDate', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Notes', accessor: 'notes' },
    { Header: 'Payment Mode', accessor: 'paymentMode' },
  ];

  // Ledger columns (if ledger endpoint exists)
  const ledgerColumns = [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Note', accessor: 'note' },
    { Header: 'Debit', accessor: 'debit', Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-' },
    { Header: 'Credit', accessor: 'credit', Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-' },
    { Header: 'Ref', accessor: 'ref' },
    { Header: 'Balance', accessor: 'balance', Cell: ({ value }) => value !== undefined ? `₹${value.toLocaleString()}` : '-' },
  ];

  // Add running balance to ledger
  const addRunningBalance = (rows) => {
    let balance = 0;
    return rows.map(row => {
      balance += (row.debit || 0) - (row.credit || 0);
      return { ...row, balance };
    });
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Employee Details: ${employee.name}`}
        subtitle="View all information, advances, salary, and ledger for this employee"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employees', to: '/finance/employees' },
          { label: employee.name }
        ]}
        right={<Button onClick={() => navigate(`/finance/employees/edit/${id}`)}>Edit</Button>}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
            {tab === 'info' && `Employee Information`}
            {tab === 'bank' && `Bank Account`}
            {tab === 'advances' && `Advances for ${employee.name}`}
            {tab === 'salary' && `Salary for ${employee.name}`}
            {tab === 'ledger' && `Ledger for ${employee.name}`}
          </h3>
          {tab === 'advances' && (
            <Button size="sm" variant="primary" icon={<FiPlus />} onClick={() => navigate(`/finance/employee-transactions/add?employeeId=${id}&type=advance`)}>Add Advance</Button>
          )}
          {tab === 'salary' && (
            <Button size="sm" variant="primary" icon={<FiPlus />} onClick={() => navigate(`/finance/employee-transactions/add?employeeId=${id}&type=salary`)}>Add Salary</Button>
          )}
        </div>
        <div className="p-2">
          {tab === 'info' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {profileFields.map((f, i) => (
                <div key={i}><strong>{f.label}:</strong> {f.value}</div>
              ))}
              {employee.createdBy && <div><strong>Created By:</strong> {employee.createdBy}</div>}
              {employee.createdAt && <div><strong>Created At:</strong> {new Date(employee.createdAt).toLocaleString()}</div>}
              {employee.updatedAt && <div><strong>Updated At:</strong> {new Date(employee.updatedAt).toLocaleString()}</div>}
            </div>
          )}
          {tab === 'bank' && (
            <div className="p-4">
              <Card className="p-4">
                <div className="font-medium text-blue-700 mb-1">{employee.bankName || 'Bank'}</div>
                <div><strong>Account Holder:</strong> {employee.bankAccountHolder || '-'}</div>
                <div><strong>Account Number:</strong> {employee.bankAccountNo || '-'}</div>
                <div><strong>IFSC:</strong> {employee.ifsc || '-'}</div>
                <div><strong>Branch:</strong> {employee.branch || '-'}</div>
                {employee.bankNotes && <div><strong>Notes:</strong> {employee.bankNotes}</div>}
              </Card>
            </div>
          )}
          {tab === 'advances' && (
            <Table columns={advanceColumns} data={employee.advances || []} />
          )}
          {tab === 'salary' && (
            <Table columns={salaryColumns} data={employee.salaries || []} />
          )}
          {tab === 'ledger' && (
            <Table columns={ledgerColumns} data={addRunningBalance(ledger)} />
          )}
        </div>
      </div>
    </div>
  );
} 