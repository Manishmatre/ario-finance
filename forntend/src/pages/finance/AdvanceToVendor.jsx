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
const vendors = [
  { id: '1', name: 'ABC Steels Pvt Ltd' },
  { id: '2', name: 'XYZ Electronics' },
  { id: '3', name: 'DEF Construction Materials' },
  { id: '4', name: 'GHI Office Supplies' },
  { id: '5', name: 'JKL Software Solutions' },
  { id: '6', name: 'MNO Logistics' },
];

const advanceHistoryData = [
  { 
    id: 1, 
    vendor: 'ABC Steels Pvt Ltd', 
    amount: 100000, 
    date: '2025-01-15',
    purpose: 'Advance for steel supplies',
    status: 'Pending',
    reference: 'ADV-2025-001',
    expectedReturn: '2025-02-15'
  },
  { 
    id: 2, 
    vendor: 'XYZ Electronics', 
    amount: 75000, 
    date: '2025-01-14',
    purpose: 'Advance for electronics equipment',
    status: 'Settled',
    reference: 'ADV-2025-002',
    expectedReturn: '2025-02-14'
  },
  { 
    id: 3, 
    vendor: 'DEF Construction Materials', 
    amount: 150000, 
    date: '2025-01-13',
    purpose: 'Advance for construction materials',
    status: 'Pending',
    reference: 'ADV-2025-003',
    expectedReturn: '2025-02-13'
  },
  { 
    id: 4, 
    vendor: 'GHI Office Supplies', 
    amount: 25000, 
    date: '2025-01-12',
    purpose: 'Advance for office supplies',
    status: 'Settled',
    reference: 'ADV-2025-004',
    expectedReturn: '2025-02-12'
  },
];

const advanceSummary = [
  { title: 'Total Advances', value: 350000, icon: <FiDollarSign className="h-6 w-6 text-blue-500" /> },
  { title: 'Pending Amount', value: 250000, icon: <FiTrendingUp className="h-6 w-6 text-red-500" /> },
  { title: 'Settled Amount', value: 100000, icon: <FiCalendar className="h-6 w-6 text-green-500" /> },
  { title: 'Vendors', value: 4, icon: <FiUsers className="h-6 w-6 text-purple-500" /> },
];

export default function AdvanceToVendor() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [advanceHistory, setAdvanceHistory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAdvanceHistory(advanceHistoryData);
      setLoading(false);
    }, 1000);
  }, []);

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      const newAdvance = {
        id: advanceHistory.length + 1,
        vendor: vendors.find(v => v.id === data.vendor)?.name || data.vendor,
        amount: parseFloat(data.amount),
        date: data.date,
        purpose: data.purpose,
        status: 'Pending',
        reference: `ADV-2025-${String(advanceHistory.length + 1).padStart(3, '0')}`,
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
      Header: 'Vendor', 
      accessor: 'vendor',
      Cell: ({ value }) => (
        <div className="font-medium">{value}</div>
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
        title="Advance To Vendor"
        subtitle="Manage vendor advances and track settlements"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Payables", to: "/finance/payables" },
          { label: "Advance To Vendor" }
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
          <h3 className="text-lg font-medium text-gray-800">Advance History</h3>
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
            <h3 className="text-lg font-bold mb-4">Record Vendor Advance</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <Select
                  options={vendors.map((v) => ({ value: v.id, label: v.name }))}
                  {...register("vendor", { required: true })}
                />
                {errors.vendor && <span className="text-red-500 text-sm">Required</span>}
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
