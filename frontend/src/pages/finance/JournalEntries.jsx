import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiFileText, FiDollarSign, FiCalendar, FiCheckCircle } from "react-icons/fi";

// Mock data
const journalEntriesData = [
  { 
    id: 1, 
    date: '2025-01-15', 
    debit: 'HDFC Bank', 
    credit: 'Consulting Revenue', 
    amount: 50000, 
    narration: 'Client payment received for Project Alpha',
    reference: 'JE-2025-001',
    status: 'Posted'
  },
  { 
    id: 2, 
    date: '2025-01-14', 
    debit: 'Office Rent Expense', 
    credit: 'HDFC Bank', 
    amount: 25000, 
    narration: 'Monthly office rent payment',
    reference: 'JE-2025-002',
    status: 'Posted'
  },
  { 
    id: 3, 
    date: '2025-01-13', 
    debit: 'Accounts Receivable', 
    credit: 'Consulting Revenue', 
    amount: 75000, 
    narration: 'Invoice raised to ABC Corp',
    reference: 'JE-2025-003',
    status: 'Posted'
  },
  { 
    id: 4, 
    date: '2025-01-12', 
    debit: 'Utility Expenses', 
    credit: 'ICICI Bank', 
    amount: 8000, 
    narration: 'Monthly utility bill payment',
    reference: 'JE-2025-004',
    status: 'Posted'
  },
  { 
    id: 5, 
    date: '2025-01-11', 
    debit: 'Software License Expense', 
    credit: 'ICICI Bank', 
    amount: 35000, 
    narration: 'Annual software license renewal',
    reference: 'JE-2025-005',
    status: 'Posted'
  },
  { 
    id: 6, 
    date: '2025-01-10', 
    debit: 'HDFC Bank', 
    credit: 'Accounts Receivable', 
    amount: 50000, 
    narration: 'Payment received from XYZ Ltd',
    reference: 'JE-2025-006',
    status: 'Posted'
  },
];

const journalSummary = [
  { title: 'Total Entries', value: 6, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
  { title: 'Total Debits', value: 243000, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Total Credits', value: 243000, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
  { title: 'Posted Entries', value: 6, icon: <FiCheckCircle className="h-6 w-6 text-purple-500" /> },
];

export default function JournalEntries() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEntries(journalEntriesData);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtered and paginated entries
  const filteredEntries = entries.filter(e =>
    e.reference.toLowerCase().includes(search.toLowerCase()) ||
    e.debit.toLowerCase().includes(search.toLowerCase()) ||
    e.credit.toLowerCase().includes(search.toLowerCase()) ||
    e.narration.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredEntries.length / pageSize) || 1;
  const paginatedEntries = filteredEntries.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      disableSort: false,
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Reference', 
      accessor: 'reference',
      disableSort: false,
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      Header: 'Debit Account', 
      accessor: 'debit',
      disableSort: false,
      Cell: ({ value }) => (
        <span className="text-red-600 font-medium">{value}</span>
      )
    },
    { 
      Header: 'Credit Account', 
      accessor: 'credit',
      disableSort: false,
      Cell: ({ value }) => (
        <span className="text-green-600 font-medium">{value}</span>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      disableSort: false,
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      disableSort: false,
      Cell: ({ value }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    { 
      Header: 'Narration', 
      accessor: 'narration',
      disableSort: false,
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Journal Entries"
        subtitle="View and manage all journal entries"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Transactions", to: "/finance/transactions" },
          { label: "Journal Entries" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {journalSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Debits') || summary.title.includes('Credits') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>
      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder="Search journal entries..."
          />
        </div>
      </div>
      {/* Table Section */}
      <Card>
        {loading ? <Loader /> : paginatedEntries.length === 0 ? <EmptyState message="No journal entries found." /> : (
          <Table
            columns={columns}
            data={paginatedEntries}
            stickyHeader={true}
            pageSize={pageSize}
            className="mt-2"
          />
        )}
        {/* Pagination */}
        {paginatedEntries.length > 0 && (
            <div className="p-4 border-t border-gray-100">
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        )}
      </Card>
    </div>
  );
}
