import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { FiUser, FiTrendingUp, FiDollarSign, FiCheckCircle, FiPlus } from 'react-icons/fi';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/api/finance/employees/${id}`)
      .then(res => setEmployee(res.data))
      .catch(() => setEmployee(null))
      .finally(() => setLoading(false));
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

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Employee Details: ${employee.name}`}
        subtitle="View all information, advances, and salary for this employee"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employees', to: '/finance/employees' },
          { label: employee.name }
        ]}
        right={<Button onClick={() => navigate(`/finance/employees/edit/${id}`)}>Edit</Button>}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((item, idx) => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4 mt-4">
        <button className={`px-4 py-2 ${tab==='profile'?'border-b-2 border-blue-600 font-bold':''}`} onClick={() => setTab('profile')}>Profile</button>
        <button className={`px-4 py-2 ${tab==='advances'?'border-b-2 border-blue-600 font-bold':''}`} onClick={() => setTab('advances')}>Advances</button>
        <button className={`px-4 py-2 ${tab==='salary'?'border-b-2 border-blue-600 font-bold':''}`} onClick={() => setTab('salary')}>Salary</button>
      </div>
      {tab === 'profile' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map((f, i) => (
              <div key={i}>
                <div className="text-xs text-gray-500 mb-1">{f.label}</div>
                <div className="text-base font-medium text-gray-800">{f.value}</div>
              </div>
            ))}
          </div>
          {/* Bank Account Details Section */}
          {(employee.bankAccountHolder || employee.bankName || employee.bankAccountNo || employee.ifsc || employee.branch || employee.bankNotes) && (
            <div className="mt-8">
              <h4 className="text-md font-semibold mb-4">Bank Account Details (for payments)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Account Holder</div>
                  <div className="text-base font-medium text-gray-800">{employee.bankAccountHolder || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Bank Name</div>
                  <div className="text-base font-medium text-gray-800">{employee.bankName || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Account Number</div>
                  <div className="text-base font-medium text-gray-800">{employee.bankAccountNo || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">IFSC Code</div>
                  <div className="text-base font-medium text-gray-800">{employee.ifsc || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Branch</div>
                  <div className="text-base font-medium text-gray-800">{employee.branch || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Notes</div>
                  <div className="text-base font-medium text-gray-800">{employee.bankNotes || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
      {tab === 'advances' && (
        <Card className="p-6">
          <div className="flex justify-between mb-2 items-center">
            <h3 className="text-lg font-semibold">Advances</h3>
            <Button onClick={() => navigate(`/finance/employees/${id}/advance`)}><FiPlus className="inline mr-1" /> Add Advance</Button>
          </div>
          <Table columns={advanceColumns} data={employee.advances || []} />
        </Card>
      )}
      {tab === 'salary' && (
        <Card className="p-6">
          <div className="flex justify-between mb-2 items-center">
            <h3 className="text-lg font-semibold">Salary History</h3>
            <Button onClick={() => navigate(`/finance/employees/${id}/salary`)}><FiPlus className="inline mr-1" /> Add Salary</Button>
          </div>
          <Table columns={salaryColumns} data={employee.salaries || []} />
        </Card>
      )}
    </div>
  );
} 