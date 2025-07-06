import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiDollarSign, FiMapPin, FiUsers, FiCalendar } from "react-icons/fi";

// Mock data
const pettyCashData = [
  { 
    id: 1, 
    site: 'Mumbai Office', 
    custodian: 'Rajesh Kumar',
    opening: 50000, 
    closing: 35000, 
    date: '2025-01-15', 
    expenses: 15000,
    notes: 'Office supplies, team lunch, transport',
    status: 'Active'
  },
  { 
    id: 2, 
    site: 'Delhi Branch', 
    custodian: 'Priya Sharma',
    opening: 30000, 
    closing: 22000, 
    date: '2025-01-15', 
    expenses: 8000,
    notes: 'Stationery, refreshments',
    status: 'Active'
  },
  { 
    id: 3, 
    site: 'Bangalore Site', 
    custodian: 'Amit Patel',
    opening: 40000, 
    closing: 28000, 
    date: '2025-01-15', 
    expenses: 12000,
    notes: 'Site maintenance, tools',
    status: 'Active'
  },
  { 
    id: 4, 
    site: 'Chennai Office', 
    custodian: 'Lakshmi Devi',
    opening: 25000, 
    closing: 18000, 
    date: '2025-01-15', 
    expenses: 7000,
    notes: 'Printing, courier charges',
    status: 'Active'
  },
  { 
    id: 5, 
    site: 'Hyderabad Branch', 
    custodian: 'Suresh Reddy',
    opening: 35000, 
    closing: 25000, 
    date: '2025-01-15', 
    expenses: 10000,
    notes: 'Travel expenses, meals',
    status: 'Active'
  },
  { 
    id: 6, 
    site: 'Pune Site', 
    custodian: 'Meera Joshi',
    opening: 20000, 
    closing: 15000, 
    date: '2025-01-15', 
    expenses: 5000,
    notes: 'Minor repairs, cleaning supplies',
    status: 'Active'
  },
];

const pettyCashSummary = [
  { title: 'Total Sites', value: 6, icon: <FiMapPin className="h-6 w-6 text-blue-500" /> },
  { title: 'Total Custodians', value: 6, icon: <FiUsers className="h-6 w-6 text-green-500" /> },
  { title: 'Total Opening Balance', value: 200000, icon: <FiDollarSign className="h-6 w-6 text-purple-500" /> },
  { title: 'Total Expenses', value: 57000, icon: <FiCalendar className="h-6 w-6 text-red-500" /> },
];

export default function PettyCashRegister() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pettyCash, setPettyCash] = useState([]);
  const totalPages = 2;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPettyCash(pettyCashData);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { 
      Header: 'Site', 
      accessor: 'site',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">Custodian: {row.original.custodian}</div>
        </div>
      )
    },
    { 
      Header: 'Opening Balance', 
      accessor: 'opening',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Expenses', 
      accessor: 'expenses',
      Cell: ({ value }) => (
        <span className="text-red-600 font-medium">₹{value.toLocaleString()}</span>
      )
    },
    { 
      Header: 'Closing Balance', 
      accessor: 'closing',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    { 
      Header: 'Notes', 
      accessor: 'notes',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
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
        title="Petty Cash Register"
        subtitle="Manage petty cash across all sites and locations"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Accounts", to: "/finance/accounts" },
          { label: "Petty Cash Register" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pettyCashSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Balance') || summary.title.includes('Expenses') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Petty Cash Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Site-wise Petty Cash Summary</h3>
        </div>
        {pettyCash.length === 0 ? (
          <EmptyState message="No petty cash entries found." />
        ) : (
          <>
            <Table columns={columns} data={pettyCash} />
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
