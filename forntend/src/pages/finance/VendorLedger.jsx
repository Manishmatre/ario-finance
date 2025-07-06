import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiUsers, FiDollarSign, FiFileText, FiCalendar } from "react-icons/fi";
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

const vendorLedgerData = {
  '1': [ // ABC Steels
    { id: 1, date: '2025-01-15', billNo: 'INV-2025-001', amount: 295000, type: 'Bill', narration: 'Steel supplies for Project Alpha', balance: 295000 },
    { id: 2, date: '2025-01-10', billNo: 'PAY-2025-001', amount: 150000, type: 'Payment', narration: 'Partial payment made', balance: 145000 },
    { id: 3, date: '2025-01-05', billNo: 'INV-2025-002', amount: 180000, type: 'Bill', narration: 'Additional steel supplies', balance: 325000 },
  ],
  '2': [ // XYZ Electronics
    { id: 1, date: '2025-01-14', billNo: 'INV-2025-003', amount: 177000, type: 'Bill', narration: 'Electronics equipment', balance: 177000 },
    { id: 2, date: '2025-01-08', billNo: 'PAY-2025-002', amount: 177000, type: 'Payment', narration: 'Full payment made', balance: 0 },
  ],
  '3': [ // DEF Construction
    { id: 1, date: '2025-01-13', billNo: 'INV-2025-004', amount: 590000, type: 'Bill', narration: 'Construction materials', balance: 590000 },
    { id: 2, date: '2025-01-12', billNo: 'INV-2025-005', amount: 250000, type: 'Bill', narration: 'Cement and aggregates', balance: 840000 },
  ],
};

const vendorSummary = [
  { title: 'Total Vendors', value: 6, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
  { title: 'Total Outstanding', value: 1735000, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Total Bills', value: 8, icon: <FiFileText className="h-6 w-6 text-green-500" /> },
  { title: 'Overdue Amount', value: 450000, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
];

export default function VendorLedger() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [ledger, setLedger] = useState([]);
  const totalPages = 2;

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      setLedger(vendorLedgerData[selectedVendor] || []);
    } else {
      setLedger([]);
    }
  }, [selectedVendor]);

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Reference', 
      accessor: 'billNo',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      Header: 'Type', 
      accessor: 'type',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Bill' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value, row }) => (
        <span className={`font-medium ${row.original.type === 'Bill' ? 'text-red-600' : 'text-green-600'}`}>
          {row.original.type === 'Bill' ? '+' : '-'}₹{value.toLocaleString()}
        </span>
      )
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
      Header: 'Balance', 
      accessor: 'balance',
      Cell: ({ value }) => (
        <span className={`font-medium ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
          ₹{value.toLocaleString()}
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
        title="Vendor Ledger"
        subtitle="Track vendor transactions and outstanding balances"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Payables", to: "/finance/payables" },
          { label: "Vendor Ledger" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorSummary.map((summary, index) => (
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

      {/* Vendor Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Vendor</label>
          <Select
            options={vendors.map((v) => ({ value: v.id, label: v.name }))}
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          />
        </div>
      </div>

      {/* Vendor Ledger Table */}
      {selectedVendor && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">
              Ledger for {vendors.find(v => v.id === selectedVendor)?.name}
            </h3>
          </div>
          {ledger.length === 0 ? (
            <EmptyState message="No ledger entries found for this vendor." />
          ) : (
            <>
              <Table columns={columns} data={ledger} />
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
