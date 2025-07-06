import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiDollarSign, FiFileText, FiCalendar, FiCheckCircle } from "react-icons/fi";

// Mock data
const unpaidBillsData = [
  { 
    id: 1, 
    billNo: "INV-2025-001", 
    vendor: "ABC Steels Pvt Ltd", 
    amount: 295000,
    dueDate: '2025-02-15',
    billDate: '2025-01-15',
    category: 'Steel Supplies',
    daysOverdue: 0,
    status: 'Pending'
  },
  { 
    id: 2, 
    billNo: "INV-2025-002", 
    vendor: "XYZ Electronics", 
    amount: 177000,
    dueDate: '2025-02-14',
    billDate: '2025-01-14',
    category: 'Electronics',
    daysOverdue: 0,
    status: 'Pending'
  },
  { 
    id: 3, 
    billNo: "INV-2025-003", 
    vendor: "DEF Construction Materials", 
    amount: 590000,
    dueDate: '2025-02-13',
    billDate: '2025-01-13',
    category: 'Construction',
    daysOverdue: 0,
    status: 'Pending'
  },
  { 
    id: 4, 
    billNo: "INV-2025-004", 
    vendor: "JKL Software Solutions", 
    amount: 212400,
    dueDate: '2025-02-11',
    billDate: '2025-01-11',
    category: 'Software',
    daysOverdue: 0,
    status: 'Pending'
  },
  { 
    id: 5, 
    billNo: "INV-2025-005", 
    vendor: "GHI Office Supplies", 
    amount: 53100,
    dueDate: '2025-01-25',
    billDate: '2025-01-12',
    category: 'Office Supplies',
    daysOverdue: 5,
    status: 'Overdue'
  },
  { 
    id: 6, 
    billNo: "INV-2025-006", 
    vendor: "MNO Logistics", 
    amount: 112100,
    dueDate: '2025-01-28',
    billDate: '2025-01-10',
    category: 'Logistics',
    daysOverdue: 2,
    status: 'Overdue'
  },
];

const paymentSummary = [
  { title: 'Total Pending', value: 1440600, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Overdue Amount', value: 165200, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
  { title: 'Total Bills', value: 6, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
  { title: 'Vendors', value: 6, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
];

export default function VendorPayments() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [bills, setBills] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBills(unpaidBillsData);
      setLoading(false);
    }, 1000);
  }, []);

  const handlePaySelected = () => {
    if (selectedBills.length === 0) return;
    
    setLoading(true);
    setTimeout(() => {
      setBills(bills.filter(bill => !selectedBills.includes(bill.id)));
      setSelectedBills([]);
      setLoading(false);
      setSuccess(true);
      setModalOpen(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handleSelectBill = (billId) => {
    setSelectedBills(prev => 
      prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const columns = [
    { 
      Header: 'Select', 
      accessor: 'select',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedBills.includes(row.original.id)}
          onChange={() => handleSelectBill(row.original.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    { 
      Header: 'Bill Details', 
      accessor: 'billNo',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.vendor}</div>
        </div>
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
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Due Date', 
      accessor: 'dueDate',
      Cell: ({ value, row }) => {
        const dueDate = new Date(value);
        const isOverdue = row.original.daysOverdue > 0;
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {dueDate.toLocaleDateString('en-IN')}
            {isOverdue && <div className="text-xs text-red-500">{row.original.daysOverdue} days overdue</div>}
          </span>
        );
      }
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => {
        const colors = {
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
  ];

  if (loading) {
    return <Loader />;
  }

  const totalSelectedAmount = bills
    .filter(bill => selectedBills.includes(bill.id))
    .reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Vendor Payments"
        subtitle="Process payments for outstanding vendor bills"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Payables", to: "/finance/payables" },
          { label: "Vendor Payments" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentSummary.map((summary, index) => (
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

      {/* Payment Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedBills.length} bills selected
          </span>
          {selectedBills.length > 0 && (
            <span className="text-sm font-medium text-gray-800">
              Total: ₹{totalSelectedAmount.toLocaleString()}
            </span>
          )}
        </div>
        {selectedBills.length > 0 && (
          <Button 
            onClick={() => setModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            Pay Selected Bills
          </Button>
        )}
      </div>

      {/* Unpaid Bills Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Unpaid Bills</h3>
        </div>
        {bills.length === 0 ? (
          <EmptyState message="No unpaid bills found." />
        ) : (
          <Table columns={columns} data={bills} />
        )}
      </div>

      {/* Payment Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Payment</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Selected Bills:</div>
                {bills
                  .filter(bill => selectedBills.includes(bill.id))
                  .map(bill => (
                    <div key={bill.id} className="flex justify-between text-sm">
                      <span>{bill.billNo} - {bill.vendor}</span>
                      <span className="font-medium">₹{bill.amount.toLocaleString()}</span>
                    </div>
                  ))
                }
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount:</span>
                    <span>₹{totalSelectedAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={handlePaySelected}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Payment processed successfully!
        </div>
      )}
    </div>
  );
}
