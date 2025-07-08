import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiBook, FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";

// Mock data
const mockAccounts = [
  { _id: '1', name: 'HDFC Bank', code: '1001', type: 'Asset', balance: 1250000 },
  { _id: '2', name: 'ICICI Bank', code: '1002', type: 'Asset', balance: 780000 },
  { _id: '3', name: 'Accounts Receivable', code: '1100', type: 'Asset', balance: 587000 },
  { _id: '4', name: 'Accounts Payable', code: '2000', type: 'Liability', balance: 325000 },
  { _id: '5', name: 'Office Rent Expense', code: '5001', type: 'Expense', balance: 50000 },
  { _id: '6', name: 'Consulting Revenue', code: '4001', type: 'Revenue', balance: 125000 },
];

const mockLedgerEntries = {
  '1': [ // HDFC Bank
    { id: 1, date: '2025-01-15', type: 'Credit', amount: 50000, narration: 'Client payment received', balance: 1250000 },
    { id: 2, date: '2025-01-14', type: 'Debit', amount: 25000, narration: 'Office rent payment', balance: 1200000 },
    { id: 3, date: '2025-01-13', type: 'Credit', amount: 15000, narration: 'Consulting fee received', balance: 1225000 },
    { id: 4, date: '2025-01-12', type: 'Debit', amount: 8000, narration: 'Utility bill payment', balance: 1210000 },
  ],
  '2': [ // ICICI Bank
    { id: 1, date: '2025-01-15', type: 'Credit', amount: 35000, narration: 'Software license payment', balance: 780000 },
    { id: 2, date: '2025-01-14', type: 'Debit', amount: 12000, narration: 'Team lunch expenses', balance: 745000 },
    { id: 3, date: '2025-01-13', type: 'Credit', amount: 22000, narration: 'Project milestone payment', balance: 757000 },
  ],
  '3': [ // Accounts Receivable
    { id: 1, date: '2025-01-15', type: 'Debit', amount: 75000, narration: 'Invoice raised to ABC Corp', balance: 587000 },
    { id: 2, date: '2025-01-14', type: 'Credit', amount: 50000, narration: 'Payment received from XYZ Ltd', balance: 512000 },
    { id: 3, date: '2025-01-13', type: 'Debit', amount: 45000, narration: 'Invoice raised to DEF Inc', balance: 562000 },
  ],
};

export default function LedgerView() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const totalPages = 2;

  // Fetch accounts on mount
  useEffect(() => {
    setTimeout(() => {
      setAccounts(mockAccounts);
        setLoading(false);
    }, 1000);
  }, []);

  // Fetch ledger entries when account changes
  useEffect(() => {
    if (!selectedAccount) {
      setEntries([]);
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setEntries(mockLedgerEntries[selectedAccount] || []);
        setLoading(false);
    }, 500);
  }, [selectedAccount]);

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Type', 
      accessor: 'type',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value, row }) => (
        <span className={`font-medium ${row.original.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.type === 'Credit' ? '+' : '-'}₹{value.toLocaleString()}
        </span>
      )
    },
    { 
      Header: 'Narration', 
      accessor: 'narration',
      Cell: ({ value }) => (
        <div className="max-w-xs">
          {value}
        </div>
      )
    },
    { 
      Header: 'Balance', 
      accessor: 'balance',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
  ];

  const selectedAccountData = accounts.find(acc => acc._id === selectedAccount);

  if (loading && !selectedAccount) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Ledger View"
        subtitle="View detailed ledger entries for any account"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Transactions", to: "/finance/transactions" },
          { label: "Ledger View" }
        ]}
      />

      {/* Account Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
        <Select
          options={accounts.map((a) => ({ value: a._id, label: `${a.name} (${a.code})` }))}
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        />
        </div>
      </div>

      {/* Account Summary */}
      {selectedAccountData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            title="Account Name"
            value={selectedAccountData.name}
            icon={<FiBook className="h-6 w-6 text-blue-500" />}
          />
          <Card
            title="Account Code"
            value={selectedAccountData.code}
            icon={<FiDollarSign className="h-6 w-6 text-green-500" />}
          />
          <Card
            title="Current Balance"
            value={`₹${selectedAccountData.balance.toLocaleString()}`}
            icon={<FiTrendingUp className="h-6 w-6 text-purple-500" />}
          />
        </div>
      )}

      {/* Ledger Entries Table */}
      {selectedAccount && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Ledger Entries</h3>
      </div>
      {loading ? (
        <Loader />
      ) : entries.length === 0 ? (
            <EmptyState message="No ledger entries found for this account." />
      ) : (
            <>
              <Table columns={columns} data={entries} />
              <div className="p-4 border-t border-gray-100">
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
