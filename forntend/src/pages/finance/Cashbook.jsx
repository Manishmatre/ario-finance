import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiBriefcase, FiPackage, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

// Mock data
const cashbookData = [
  { 
    id: 1, 
    date: '2025-01-15', 
    amount: 25000, 
    type: 'In', 
    narration: 'Cash received from petty cash reimbursement',
    category: 'Reimbursement',
    reference: 'REIM-2025-001',
    balance: 125000,
    denominations: {
      '2000': 10,
      '500': 8,
      '200': 5,
      '100': 10,
      '50': 20,
      '20': 25,
      '10': 50,
      '5': 100,
      '2': 250,
      '1': 500
    }
  },
  { 
    id: 2, 
    date: '2025-01-14', 
    amount: 15000, 
    type: 'Out', 
    narration: 'Office supplies purchase',
    category: 'Supplies',
    reference: 'SUP-2025-001',
    balance: 100000,
    denominations: {
      '2000': 5,
      '500': 8,
      '200': 5,
      '100': 10,
      '50': 20,
      '20': 25,
      '10': 50,
      '5': 100,
      '2': 250,
      '1': 500
    }
  },
  { 
    id: 3, 
    date: '2025-01-13', 
    amount: 5000, 
    type: 'In', 
    narration: 'Cash advance returned by employee',
    category: 'Advance',
    reference: 'ADV-2025-001',
    balance: 115000,
    denominations: {
      '2000': 2,
      '500': 2,
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0
    }
  },
  { 
    id: 4, 
    date: '2025-01-12', 
    amount: 8000, 
    type: 'Out', 
    narration: 'Team lunch expenses',
    category: 'Food',
    reference: 'FOOD-2025-001',
    balance: 110000,
    denominations: {
      '2000': 3,
      '500': 4,
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0
    }
  },
  { 
    id: 5, 
    date: '2025-01-11', 
    amount: 12000, 
    type: 'In', 
    narration: 'Cash payment from client',
    category: 'Payment',
    reference: 'PAY-2025-001',
    balance: 118000,
    denominations: {
      '2000': 6,
      '500': 0,
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0
    }
  },
  { 
    id: 6, 
    date: '2025-01-10', 
    amount: 3000, 
    type: 'Out', 
    narration: 'Transportation expenses',
    category: 'Transport',
    reference: 'TRANS-2025-001',
    balance: 106000,
    denominations: {
      '2000': 1,
      '500': 2,
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0
    }
  },
];

// Current cash drawer state
const currentCashDrawer = {
  total: 125000,
  denominations: {
    '2000': 15,
    '500': 20,
    '200': 10,
    '100': 20,
    '50': 40,
    '20': 50,
    '10': 100,
    '5': 200,
    '2': 500,
    '1': 1000
  },
  lastCounted: '2025-01-15T14:30:00Z',
  countedBy: 'Cashier - Rajesh Kumar',
  notes: 'All denominations verified and counted'
};

const cashSummary = [
  { title: 'Opening Balance', value: 100000, icon: <FiDollarSign className="h-6 w-6 text-blue-500" /> },
  { title: 'Total Cash In', value: 42000, icon: <FiTrendingUp className="h-6 w-6 text-green-500" /> },
  { title: 'Total Cash Out', value: 26000, icon: <FiTrendingDown className="h-6 w-6 text-red-500" /> },
  { title: 'Current Balance', value: 125000, icon: <FiBriefcase className="h-6 w-6 text-purple-500" /> },
];

export default function Cashbook() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [cashbook, setCashbook] = useState([]);
  const [showCashDrawer, setShowCashDrawer] = useState(false);
  const [showDenominations, setShowDenominations] = useState(false);
  const totalPages = 2;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCashbook(cashbookData);
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
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value, row }) => (
        <span className={`font-medium ${row.original.type === 'In' ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.type === 'In' ? '+' : '-'}₹{value.toLocaleString()}
        </span>
      )
    },
    { 
      Header: 'Type', 
      accessor: 'type',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      Header: 'Category', 
      accessor: 'category',
      Cell: ({ value }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
    { 
      Header: 'Actions', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => setShowDenominations(row.original)}
        >
          View Details
        </Button>
      )
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Cashbook"
        subtitle="Track all cash transactions and balances"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Accounts", to: "/finance/accounts" },
          { label: "Cashbook" }
        ]}
        action={
          <Button 
            onClick={() => setShowCashDrawer(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <FiPackage className="h-4 w-4 mr-2" />
            Cash Drawer
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cashSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={`₹${summary.value.toLocaleString()}`}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Cashbook Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Cash Transaction History</h3>
        </div>
        {cashbook.length === 0 ? (
        <EmptyState message="No cashbook entries found." />
      ) : (
          <>
            <Table columns={columns} data={cashbook} />
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Cash Drawer Modal */}
      {showCashDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[600px] max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Cash Drawer Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cash</label>
                <p className="text-2xl font-bold text-green-600">₹{currentCashDrawer.total.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Counted</label>
                <p className="text-sm text-gray-900">{new Date(currentCashDrawer.lastCounted).toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500">by {currentCashDrawer.countedBy}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Denomination Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(currentCashDrawer.denominations).map(([denomination, count]) => (
                  <div key={denomination} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">₹{denomination}</span>
                    <span className="text-gray-600">{count} × ₹{denomination} = ₹{(count * parseInt(denomination)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                {currentCashDrawer.notes}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setShowCashDrawer(false)} variant="secondary" className="flex-1">
                Close
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Re-count Cash
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Denominations Modal */}
      {showDenominations && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[500px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Transaction Details - {showDenominations.reference}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-sm text-gray-900">{new Date(showDenominations.date).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="text-sm text-gray-900">₹{showDenominations.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-sm text-gray-900">{showDenominations.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900">{showDenominations.category}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Denomination Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(showDenominations.denominations).map(([denomination, count]) => (
                  <div key={denomination} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">₹{denomination}</span>
                    <span className="text-gray-600">{count} notes</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Narration</h4>
              <p className="text-sm text-gray-600">{showDenominations.narration}</p>
            </div>

            <Button onClick={() => setShowDenominations(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
