import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiPackage, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// Mock data
const grnData = [
  {
    id: 1,
    poRef: 'PO-2025-001',
    vendor: 'ABC Steels Ltd',
    grnNumber: 'GRN-2025-001',
    grnDate: '2025-01-15',
    billNumber: 'BILL-2025-001',
    billDate: '2025-01-16',
    amount: 125000,
    status: 'Matched',
    matchDate: '2025-01-17',
    matchedBy: 'Finance Manager',
    items: [
      { name: 'Steel Plates', qty: 50, rate: 2500 },
      { name: 'Steel Beams', qty: 20, rate: 3500 }
    ]
  },
  {
    id: 2,
    poRef: 'PO-2025-002',
    vendor: 'XYZ Cement Pvt Ltd',
    grnNumber: 'GRN-2025-002',
    grnDate: '2025-01-14',
    billNumber: null,
    billDate: null,
    amount: 85000,
    status: 'Pending',
    matchDate: null,
    matchedBy: null,
    items: [
      { name: 'Portland Cement', qty: 100, rate: 850 }
    ]
  },
  {
    id: 3,
    poRef: 'PO-2025-003',
    vendor: 'DEF Electronics',
    grnNumber: 'GRN-2025-003',
    grnDate: '2025-01-13',
    billNumber: 'BILL-2025-003',
    billDate: '2025-01-14',
    amount: 45000,
    status: 'Discrepancy',
    matchDate: '2025-01-15',
    matchedBy: 'Finance Manager',
    items: [
      { name: 'LED Monitors', qty: 10, rate: 4500 }
    ]
  },
  {
    id: 4,
    poRef: 'PO-2025-004',
    vendor: 'GHI Construction Materials',
    grnNumber: 'GRN-2025-004',
    grnDate: '2025-01-12',
    billNumber: 'BILL-2025-004',
    billDate: '2025-01-13',
    amount: 95000,
    status: 'Matched',
    matchDate: '2025-01-14',
    matchedBy: 'Finance Manager',
    items: [
      { name: 'Bricks', qty: 5000, rate: 19 }
    ]
  },
  {
    id: 5,
    poRef: 'PO-2025-005',
    vendor: 'JKL Office Supplies',
    grnNumber: 'GRN-2025-005',
    grnDate: '2025-01-11',
    billNumber: null,
    billDate: null,
    amount: 15000,
    status: 'Pending',
    matchDate: null,
    matchedBy: null,
    items: [
      { name: 'Office Chairs', qty: 15, rate: 1000 }
    ]
  }
];

const grnSummary = [
  { title: 'Total GRNs', value: 5, icon: <FiPackage className="h-6 w-6 text-blue-500" /> },
  { title: 'Matched', value: 2, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
  { title: 'Pending', value: 2, icon: <FiClock className="h-6 w-6 text-yellow-500" /> },
  { title: 'Discrepancies', value: 1, icon: <FiAlertCircle className="h-6 w-6 text-red-500" /> },
];

export default function GRNMatching() {
  const [loading, setLoading] = useState(true);
  const [grnMatches, setGrnMatches] = useState([]);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGrnMatches(grnData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMatch = (grn) => {
    setSelectedGrn(grn);
    setModalOpen(true);
  };

  const handleConfirmMatch = () => {
    // Update the GRN status
    setGrnMatches(prev => prev.map(grn => 
      grn.id === selectedGrn.id 
        ? { ...grn, status: 'Matched', matchDate: new Date().toISOString().split('T')[0], matchedBy: 'Current User' }
        : grn
    ));
    setModalOpen(false);
    setSelectedGrn(null);
  };

  const columns = [
    { 
      Header: 'PO Reference', 
      accessor: 'poRef',
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
      Header: 'GRN Number', 
      accessor: 'grnNumber',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
          {value}
        </span>
      )
    },
    { 
      Header: 'GRN Date', 
      accessor: 'grnDate',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Bill Number', 
      accessor: 'billNumber',
      Cell: ({ value }) => value ? (
        <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded text-green-800">
          {value}
        </span>
      ) : (
        <span className="text-gray-400">Not received</span>
      )
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => {
        const colors = {
          'Matched': 'bg-green-100 text-green-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Discrepancy': 'bg-red-100 text-red-800'
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
          <Button size="sm" variant="secondary" onClick={() => setSelectedGrn(row.original)}>
            View
          </Button>
          {row.original.status === 'Pending' && (
            <Button size="sm" onClick={() => handleMatch(row.original)}>
              Match
            </Button>
          )}
          {row.original.status === 'Discrepancy' && (
            <Button size="sm" variant="danger">
              Resolve
            </Button>
          )}
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
        title="GRN Matching"
        subtitle="Match Goods Received Notes with Purchase Bills"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "GRN Matching" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {grnSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* GRN Matching Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">GRN Matching Status</h3>
        </div>
        {grnMatches.length === 0 ? (
          <EmptyState message="No GRN records found." />
        ) : (
          <Table columns={columns} data={grnMatches} />
        )}
      </div>

      {/* GRN Details Modal */}
      {selectedGrn && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[600px] max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">GRN Details - {selectedGrn.grnNumber}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">PO Reference</label>
                <p className="text-sm text-gray-900">{selectedGrn.poRef}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <p className="text-sm text-gray-900">{selectedGrn.vendor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GRN Date</label>
                <p className="text-sm text-gray-900">{new Date(selectedGrn.grnDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                <p className="text-sm text-gray-900">₹{selectedGrn.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                <p className="text-sm text-gray-900">{selectedGrn.billNumber || 'Not received'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-sm text-gray-900">{selectedGrn.status}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Items Received</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedGrn.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.qty}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">₹{item.rate}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">₹{(item.qty * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setSelectedGrn(null)} variant="secondary" className="flex-1">
                Close
              </Button>
              {selectedGrn.status === 'Pending' && (
                <Button onClick={handleConfirmMatch} className="flex-1">
                  Confirm Match
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Confirmation Modal */}
      {modalOpen && selectedGrn && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Match GRN with Bill</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to match GRN {selectedGrn.grnNumber} with the corresponding bill?
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setModalOpen(false)} variant="secondary" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmMatch} className="flex-1">
                Confirm Match
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
