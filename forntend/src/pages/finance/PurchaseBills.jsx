import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiFileText, FiDollarSign, FiCalendar, FiCheckCircle } from "react-icons/fi";

// Mock data
const purchaseBillsData = [
  { 
    id: 1, 
    vendor: "ABC Steels Pvt Ltd", 
    billNo: "INV-2025-001", 
    billDate: '2025-01-15',
    dueDate: '2025-02-15',
    amount: 250000, 
    gstAmount: 45000,
    totalAmount: 295000,
    isPaid: false,
    status: 'Pending',
    category: 'Steel Supplies',
    reference: 'PO-2025-001'
  },
  { 
    id: 2, 
    vendor: "XYZ Electronics", 
    billNo: "INV-2025-002", 
    billDate: '2025-01-14',
    dueDate: '2025-02-14',
    amount: 150000, 
    gstAmount: 27000,
    totalAmount: 177000,
    isPaid: false,
    status: 'Pending',
    category: 'Electronics',
    reference: 'PO-2025-002'
  },
  { 
    id: 3, 
    vendor: "DEF Construction Materials", 
    billNo: "INV-2025-003", 
    billDate: '2025-01-13',
    dueDate: '2025-02-13',
    amount: 500000, 
    gstAmount: 90000,
    totalAmount: 590000,
    isPaid: false,
    status: 'Pending',
    category: 'Construction',
    reference: 'PO-2025-003'
  },
  { 
    id: 4, 
    vendor: "GHI Office Supplies", 
    billNo: "INV-2025-004", 
    billDate: '2025-01-12',
    dueDate: '2025-02-12',
    amount: 45000, 
    gstAmount: 8100,
    totalAmount: 53100,
    isPaid: true,
    status: 'Paid',
    category: 'Office Supplies',
    reference: 'PO-2025-004'
  },
  { 
    id: 5, 
    vendor: "JKL Software Solutions", 
    billNo: "INV-2025-005", 
    billDate: '2025-01-11',
    dueDate: '2025-02-11',
    amount: 180000, 
    gstAmount: 32400,
    totalAmount: 212400,
    isPaid: false,
    status: 'Pending',
    category: 'Software',
    reference: 'PO-2025-005'
  },
  { 
    id: 6, 
    vendor: "MNO Logistics", 
    billNo: "INV-2025-006", 
    billDate: '2025-01-10',
    dueDate: '2025-02-10',
    amount: 95000, 
    gstAmount: 17100,
    totalAmount: 112100,
    isPaid: true,
    status: 'Paid',
    category: 'Logistics',
    reference: 'PO-2025-006'
  },
];

const billsSummary = [
  { title: 'Total Bills', value: 6, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
  { title: 'Pending Amount', value: 1286400, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Paid Amount', value: 165200, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
  { title: 'Overdue Bills', value: 2, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
];

export default function PurchaseBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBills(purchaseBillsData);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { 
      Header: 'Vendor', 
      accessor: 'vendor',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.category}</div>
        </div>
      )
    },
    { 
      Header: 'Bill Details', 
      accessor: 'billNo',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">Ref: {row.original.reference}</div>
        </div>
      )
    },
    { 
      Header: 'Bill Date', 
      accessor: 'billDate',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Due Date', 
      accessor: 'dueDate',
      Cell: ({ value, row }) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today && !row.original.isPaid;
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {dueDate.toLocaleDateString('en-IN')}
          </span>
        );
      }
    },
    { 
      Header: 'Amount', 
      accessor: 'totalAmount',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">₹{value.toLocaleString()}</div>
          <div className="text-sm text-gray-500">GST: ₹{row.original.gstAmount.toLocaleString()}</div>
        </div>
      )
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value, row }) => {
        const colors = {
          'Paid': 'bg-green-100 text-green-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Overdue': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
            {value}
          </span>
        );
      }
    },
    { 
      Header: 'Actions', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary">View</Button>
          {!row.original.isPaid && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700">Pay</Button>
          )}
          <Button size="sm" variant="danger">Delete</Button>
        </div>
      )
    }
  ];

  const handleUpload = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setBills([...bills, { 
        id: bills.length + 1, 
        vendor: "New Vendor", 
        billNo: "INV-2025-007", 
        billDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        amount: 50000, 
        gstAmount: 9000,
        totalAmount: 59000,
        isPaid: false,
        status: 'Pending',
        category: 'General',
        reference: 'PO-2025-007'
      }]);
      setLoading(false);
      setSuccess(true);
      setModalOpen(false);
    }, 1000);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Purchase Bills"
        subtitle="Manage and track all purchase bills and payments"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Payables", to: "/finance/payables" },
          { label: "Purchase Bills" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {billsSummary.map((summary, index) => (
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

      {/* Upload Bill Button */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Upload Bill
        </Button>
      </div>

      {/* Purchase Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Purchase Bills</h3>
        </div>
        {bills.length === 0 ? (
          <EmptyState message="No purchase bills found." />
        ) : (
          <Table columns={columns} data={bills} />
        )}
      </div>

      {/* Upload Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[500px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Upload Purchase Bill</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill File (PDF/JPG)</label>
                <input 
                  type="file" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  required 
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Upload Bill</Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
            {success && <div className="text-green-600 mt-2 text-center">Bill uploaded successfully!</div>}
          </div>
        </div>
      )}
    </div>
  );
}
