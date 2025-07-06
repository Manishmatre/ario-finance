import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Table from "../../components/ui/Table";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiDollarSign, FiUsers, FiCalendar, FiTrendingUp } from "react-icons/fi";
import Select from "../../components/ui/Select";

// Mock data
const employees = [
  { id: '1', name: 'Rajesh Kumar', department: 'Admin' },
  { id: '2', name: 'Priya Sharma', department: 'HR' },
  { id: '3', name: 'Amit Patel', department: 'Sales' },
  { id: '4', name: 'Lakshmi Devi', department: 'IT' },
  { id: '5', name: 'Suresh Reddy', department: 'Marketing' },
  { id: '6', name: 'Meera Joshi', department: 'Finance' },
];

const employeeAdvanceData = [
  { 
    id: 1, 
    employee: 'Rajesh Kumar', 
    department: 'Admin',
    amount: 15000, 
    date: '2025-01-15',
    purpose: 'Travel expenses for client meeting',
    status: 'Pending',
    reference: 'EMP-ADV-2025-001',
    expectedReturn: '2025-02-15'
  },
  { 
    id: 2, 
    employee: 'Priya Sharma', 
    department: 'HR',
    amount: 8000, 
    date: '2025-01-14',
    purpose: 'Office supplies purchase',
    status: 'Settled',
    reference: 'EMP-ADV-2025-002',
    expectedReturn: '2025-02-14'
  },
  { 
    id: 3, 
    employee: 'Amit Patel', 
    department: 'Sales',
    amount: 25000, 
    date: '2025-01-13',
    purpose: 'Sales conference expenses',
    status: 'Pending',
    reference: 'EMP-ADV-2025-003',
    expectedReturn: '2025-02-13'
  },
  { 
    id: 4, 
    employee: 'Lakshmi Devi', 
    department: 'IT',
    amount: 12000, 
    date: '2025-01-12',
    purpose: 'Software license purchase',
    status: 'Settled',
    reference: 'EMP-ADV-2025-004',
    expectedReturn: '2025-02-12'
  },
];

const advanceSummary = [
  { title: 'Total Advances', value: 60000, icon: <FiDollarSign className="h-6 w-6 text-blue-500" /> },
  { title: 'Pending Amount', value: 40000, icon: <FiTrendingUp className="h-6 w-6 text-red-500" /> },
  { title: 'Settled Amount', value: 20000, icon: <FiCalendar className="h-6 w-6 text-green-500" /> },
  { title: 'Employees', value: 4, icon: <FiUsers className="h-6 w-6 text-purple-500" /> },
];

export default function CashAdvanceToEmployee() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [advanceHistory, setAdvanceHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAdvanceHistory(employeeAdvanceData);
      setLoading(false);
    }, 1000);
  }, []);

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      const newAdvance = {
        id: advanceHistory.length + 1,
        employee: employees.find(e => e.id === data.employee)?.name || data.employee,
        department: employees.find(e => e.id === data.employee)?.department || 'General',
        amount: parseFloat(data.amount),
        date: data.date,
        purpose: data.purpose,
        status: 'Pending',
        reference: `EMP-ADV-2025-${String(advanceHistory.length + 1).padStart(3, '0')}`,
        expectedReturn: data.expectedReturn
      };
      setAdvanceHistory([newAdvance, ...advanceHistory]);
      setLoading(false);
      setSuccess(true);
      setModalOpen(false);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const columns = [
    { 
      Header: 'Reference', 
      accessor: 'reference',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      Header: 'Employee', 
      accessor: 'employee',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.department}</div>
        </div>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Purpose', 
      accessor: 'purpose',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      Header: 'Expected Return', 
      accessor: 'expectedReturn',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Cash Advance To Employee"
        subtitle="Manage employee cash advances and track settlements"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Cash Advance To Employee" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {advanceSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Amount') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Add Advance Button */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Record Advance
        </Button>
      </div>

      {/* Advance History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Employee Advance History</h3>
        </div>
        {advanceHistory.length === 0 ? (
          <EmptyState message="No advance records found." />
        ) : (
          <Table columns={columns} data={advanceHistory} />
        )}
      </div>

      {/* Add Advance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[500px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Record Employee Advance</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <Select
                  options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }))}
                  {...register("employee", { required: true })}
                />
                {errors.employee && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register("amount", { required: true })} 
                />
                {errors.amount && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register("purpose", { required: true })} 
                />
                {errors.purpose && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Advance Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    {...register("date", { required: true })} 
                  />
                  {errors.date && <span className="text-red-500 text-sm">Required</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    {...register("expectedReturn", { required: true })} 
                  />
                  {errors.expectedReturn && <span className="text-red-500 text-sm">Required</span>}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Advance'}
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Advance recorded successfully!
        </div>
      )}
    </div>
  );
}
