import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from "react-icons/fi";

// Mock data
const bankbookData = [
  { 
    id: 1, 
    date: '2025-01-15', 
    amount: 50000, 
    bank: 'HDFC Bank', 
    accountNo: 'XXXX-XXXX-7890',
    type: 'Deposit', 
    narration: 'Client payment received for Project Alpha',
    balance: 1250000,
    reference: 'INV-2025-001'
  },
  { 
    id: 2, 
    date: '2025-01-14', 
    amount: 25000, 
    bank: 'ICICI Bank', 
    accountNo: 'XXXX-XXXX-4567',
    type: 'Withdrawal', 
    narration: 'Office rent payment',
    balance: 780000,
    reference: 'RENT-2025-01'
  },
  { 
    id: 3, 
    date: '2025-01-13', 
    amount: 15000, 
    bank: 'SBI', 
    accountNo: 'XXXX-XXXX-1234',
    type: 'Deposit', 
    narration: 'Consulting fee from ABC Corp',
    balance: 320000,
    reference: 'CONS-2025-003'
  },
  { 
    id: 4, 
    date: '2025-01-12', 
    amount: 8000, 
    bank: 'HDFC Bank', 
    accountNo: 'XXXX-XXXX-7890',
    type: 'Withdrawal', 
    narration: 'Utility bill payment',
    balance: 1200000,
    reference: 'UTIL-2025-01'
  },
  { 
    id: 5, 
    date: '2025-01-11', 
    amount: 35000, 
    bank: 'ICICI Bank', 
    accountNo: 'XXXX-XXXX-4567',
    type: 'Deposit', 
    narration: 'Software license renewal payment',
    balance: 755000,
    reference: 'SOFT-2025-002'
  },
  { 
    id: 6, 
    date: '2025-01-10', 
    amount: 12000, 
    bank: 'SBI', 
    accountNo: 'XXXX-XXXX-1234',
    type: 'Withdrawal', 
    narration: 'Team lunch expenses',
    balance: 305000,
    reference: 'EXP-2025-001'
  },
];

const accountSummary = [
  { name: 'HDFC Bank', balance: 1250000, accountNo: 'XXXX-XXXX-7890', color: 'blue' },
  { name: 'ICICI Bank', balance: 780000, accountNo: 'XXXX-XXXX-4567', color: 'green' },
  { name: 'SBI', balance: 320000, accountNo: 'XXXX-XXXX-1234', color: 'purple' },
];

export default function Bankbook() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [bankbook, setBankbook] = useState([]);
  const totalPages = 3;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBankbook(bankbookData);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Bank', 
      accessor: 'bank',
      Cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.bank}</div>
          <div className="text-sm text-gray-500">{row.original.accountNo}</div>
        </div>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value, row }) => (
        <span className={`font-medium ${row.original.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.type === 'Deposit' ? '+' : '-'}₹{value.toLocaleString()}
        </span>
      )
    },
    { 
      Header: 'Type', 
      accessor: 'type',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      Header: 'Narration', 
      accessor: 'narration',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">Ref: {row.original.reference}</div>
        </div>
      )
    },
    { 
      Header: 'Balance', 
      accessor: 'balance',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Bankbook"
        subtitle="Track all bank transactions and account balances"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Accounts", to: "/finance/accounts" },
          { label: "Bankbook" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountSummary.map((account, index) => (
          <Card
            key={index}
            title={account.name}
            value={`₹${account.balance.toLocaleString()}`}
            subtitle={account.accountNo}
            icon={<FiCreditCard className={`h-6 w-6 text-${account.color}-500`} />}
          />
        ))}
      </div>

      {/* Bankbook Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Transaction History</h3>
        </div>
        {bankbook.length === 0 ? (
        <EmptyState message="No bankbook entries found." />
      ) : (
          <>
            <Table columns={columns} data={bankbook} />
            <div className="p-4 border-t border-gray-100">
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
