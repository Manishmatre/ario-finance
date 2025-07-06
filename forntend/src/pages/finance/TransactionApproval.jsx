import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from "react-icons/fi";

// Mock data
const pendingTransactionsData = [
  { 
    id: 1, 
    date: '2025-01-15', 
    amount: 25000, 
    narration: 'Office supplies purchase - Stationery and printer cartridges',
    submittedBy: 'Rajesh Kumar',
    department: 'Admin',
    category: 'Office Supplies',
    reference: 'TXN-2025-001',
    isApproved: false,
    priority: 'High'
  },
  { 
    id: 2, 
    date: '2025-01-15', 
    amount: 15000, 
    narration: 'Team lunch expenses for project milestone celebration',
    submittedBy: 'Priya Sharma',
    department: 'HR',
    category: 'Food & Entertainment',
    reference: 'TXN-2025-002',
    isApproved: false,
    priority: 'Medium'
  },
  { 
    id: 3, 
    date: '2025-01-14', 
    amount: 8000, 
    narration: 'Transportation expenses for client meeting',
    submittedBy: 'Amit Patel',
    department: 'Sales',
    category: 'Travel',
    reference: 'TXN-2025-003',
    isApproved: false,
    priority: 'Medium'
  },
  { 
    id: 4, 
    date: '2025-01-14', 
    amount: 35000, 
    narration: 'Software license renewal for development tools',
    submittedBy: 'Lakshmi Devi',
    department: 'IT',
    category: 'Software',
    reference: 'TXN-2025-004',
    isApproved: false,
    priority: 'High'
  },
  { 
    id: 5, 
    date: '2025-01-13', 
    amount: 12000, 
    narration: 'Marketing materials and promotional items',
    submittedBy: 'Suresh Reddy',
    department: 'Marketing',
    category: 'Marketing',
    reference: 'TXN-2025-005',
    isApproved: false,
    priority: 'Low'
  },
];

const approvalSummary = [
  { title: 'Pending Approval', value: 5, icon: <FiClock className="h-6 w-6 text-yellow-500" /> },
  { title: 'Total Amount', value: 95000, icon: <FiDollarSign className="h-6 w-6 text-blue-500" /> },
  { title: 'High Priority', value: 2, icon: <FiXCircle className="h-6 w-6 text-red-500" /> },
  { title: 'Departments', value: 5, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
];

export default function TransactionApproval() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPending(pendingTransactionsData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = id => {
    setPending(pending.map(txn => 
      txn.id === id ? { ...txn, isApproved: true } : txn
    ));
  };

  const handleReject = id => {
    setPending(pending.filter(txn => txn.id !== id));
  };

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
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
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Submitted By', 
      accessor: 'submittedBy',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.department}</div>
        </div>
      )
    },
    { 
      Header: 'Category', 
      accessor: 'category',
      Cell: ({ value }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    { 
      Header: 'Priority', 
      accessor: 'priority',
      Cell: ({ value }) => {
        const colors = {
          'High': 'bg-red-100 text-red-800',
          'Medium': 'bg-yellow-100 text-yellow-800',
          'Low': 'bg-green-100 text-green-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
            {value}
          </span>
        );
      }
    },
    { 
      Header: 'Narration', 
      accessor: 'narration',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      Header: 'Actions', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => handleApprove(row.original.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
          <Button 
            size="sm"
            variant="danger" 
            onClick={() => handleReject(row.original.id)}
          >
            Reject
          </Button>
        </div>
      )
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Transaction Approval"
        subtitle="Review and approve pending financial transactions"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Transactions", to: "/finance/transactions" },
          { label: "Transaction Approval" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {approvalSummary.map((summary, index) => (
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

      {/* Pending Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Pending Transactions</h3>
        </div>
        {pending.length === 0 ? (
          <EmptyState message="No pending transactions to approve." />
        ) : (
          <Table columns={columns} data={pending} />
        )}
      </div>
    </div>
  );
}
