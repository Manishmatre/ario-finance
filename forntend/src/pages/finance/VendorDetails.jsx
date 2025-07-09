import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import axiosInstance from '../../utils/axiosInstance';
import { FiFileText, FiDollarSign, FiTrendingUp, FiCheckCircle, FiArrowLeft, FiPlus, FiLayers, FiUser, FiCreditCard } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload } from 'react-icons/fi';

const TABS = [
  { key: 'info', label: 'Vendor Info', icon: <FiUser /> },
  { key: 'bank', label: 'Bank Accounts', icon: <FiCreditCard /> },
  { key: 'bills', label: 'Bills', icon: <FiFileText /> },
  { key: 'advances', label: 'Advances', icon: <FiTrendingUp /> },
  { key: 'ledger', label: 'Ledger', icon: <FiLayers /> },
];

export default function VendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [bills, setBills] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axiosInstance.get(`/api/finance/vendors/${id}`),
      axiosInstance.get(`/api/finance/vendors/${id}/bills`),
      axiosInstance.get(`/api/finance/vendors/${id}/advances`),
      axiosInstance.get(`/api/finance/vendors/${id}/ledger`)
    ])
      .then(([vendorRes, billsRes, advancesRes, ledgerRes]) => {
        setVendor(vendorRes.data);
        setBills(billsRes.data);
        setAdvances(advancesRes.data);
        setLedger(ledgerRes.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch vendor details');
        setLoading(false);
      });
  }, [id]);

  // Summary stats
  const totalBills = bills.length;
  const totalAdvances = advances.length;
  const totalBillAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalAdvanceAmount = advances.reduce((sum, a) => sum + (a.amount || 0), 0);
  const paidAmount = bills.filter(b => b.isPaid).reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingAmount = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + (b.amount || 0), 0);
  const outstanding = totalBillAmount - totalAdvanceAmount - paidAmount;

  const summaryCards = [
    { title: 'Total Bills', value: totalBills, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Advances', value: totalAdvances, icon: <FiTrendingUp className="h-6 w-6 text-purple-500" /> },
    { title: 'Outstanding', value: outstanding, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
    { title: 'Paid Amount', value: paidAmount, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
  ];

  const billColumns = [
    { Header: 'Bill No', accessor: 'billNo', Cell: ({ value }) => <span className="font-medium">{value}</span> },
    { Header: 'Bill Date', accessor: 'billDate', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => <span>₹{value?.toLocaleString()}</span> },
    { Header: 'Status', accessor: 'isPaid', Cell: ({ value }) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{value ? 'Paid' : 'Pending'}</span> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/bills/${row.original._id || row.original.id}`)}>View</Button>
      </div>
    ) }
  ];

  const advanceColumns = [
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => <span>₹{value?.toLocaleString()}</span> },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Cleared', accessor: 'cleared', Cell: ({ value }) => value ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-yellow-600 font-semibold">No</span> },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => null }
  ];

  const ledgerColumns = [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Note', accessor: 'note' },
    { Header: 'Debit', accessor: 'debit', Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-' },
    { Header: 'Credit', accessor: 'credit', Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-' },
    { Header: 'Bill/Invoice No', accessor: 'ref', Cell: ({ row }) => row.original.billNo || row.original.invoiceNo || row.original.ref || '-' },
    { Header: 'Balance', accessor: 'balance', Cell: ({ value }) => value !== undefined ? `₹${value.toLocaleString()}` : '-' },
  ];

  // Ledger download helpers (copied from VendorLedger)
  const downloadCSV = (rows) => {
    if (!rows || !rows.length) return;
    const headers = ['Date', 'Type', 'Note', 'Debit', 'Credit', 'Ref', 'Balance'];
    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      csvRows.push([
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.type || '',
        row.note || '',
        row.debit ? row.debit : '',
        row.credit ? row.credit : '',
        row.ref || '',
        row.balance !== undefined ? row.balance : ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_ledger.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const downloadExcel = (rows, vendor) => {
    if (!rows || !rows.length) return;
    const wsData = [
      [`Vendor: ${vendor?.name || ''}`],
      [`GST No: ${vendor?.gstNo || ''}`],
      [`Phone: ${vendor?.phone || ''}`],
      [`Address: ${vendor?.address || ''}`],
      [],
      ['Date', 'Type', 'Note', 'Debit', 'Credit', 'Ref', 'Balance']
    ];
    rows.forEach(row => {
      wsData.push([
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.type || '',
        row.note || '',
        row.debit ? row.debit : '',
        row.credit ? row.credit : '',
        row.ref || '',
        row.balance !== undefined ? row.balance : ''
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'vendor_ledger.xlsx');
  };
  const downloadPDF = (rows, vendor) => {
    if (!rows || !rows.length) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Vendor: ${vendor?.name || ''}`, 10, 10);
    doc.setFontSize(10);
    doc.text(`GST No: ${vendor?.gstNo || ''}`, 10, 18);
    doc.text(`Phone: ${vendor?.phone || ''}`, 10, 24);
    doc.text(`Address: ${vendor?.address || ''}`, 10, 30);
    doc.text('Ledger:', 10, 38);
    const tableData = rows.map(row => [
      row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
      row.type || '',
      row.note || '',
      row.debit ? row.debit : '',
      row.credit ? row.credit : '',
      row.ref || '',
      row.balance !== undefined ? row.balance : ''
    ]);
    autoTable(doc, {
      head: [['Date', 'Type', 'Note', 'Debit', 'Credit', 'Ref', 'Balance']],
      body: tableData,
      startY: 42,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save('vendor_ledger.pdf');
  };
  const addRunningBalance = (rows) => {
    let balance = 0;
    return rows.map(row => {
      balance += (row.debit || 0) - (row.credit || 0);
      return { ...row, balance };
    });
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!vendor) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Vendor Details: ${vendor.name}`}
        subtitle="View all information, bills, advances, and ledger for this vendor"
        breadcrumbs={[
          { label: 'Vendors', to: '/finance/vendors' },
          { label: 'Vendor Details' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} title={card.title} value={card.title.includes('Amount') || card.title === 'Outstanding' ? `₹${card.value?.toLocaleString()}` : card.value} icon={card.icon} />
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <Button key={t.key} variant={tab === t.key ? 'primary' : 'outline'} onClick={() => setTab(t.key)} icon={t.icon}>{t.label}</Button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">
            {tab === 'info' && `Vendor Information`}
            {tab === 'bank' && `Bank Accounts`}
            {tab === 'bills' && `Bills for ${vendor.name}`}
            {tab === 'advances' && `Advances for ${vendor.name}`}
            {tab === 'ledger' && `Ledger for ${vendor.name}`}
          </h3>
        </div>
        <div className="p-2">
          {tab === 'info' && (
            <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><strong>Name:</strong> {vendor.name}</div>
          <div><strong>GST No:</strong> {vendor.gstNo}</div>
          <div><strong>Phone:</strong> {vendor.phone}</div>
          <div><strong>Address:</strong> {vendor.address}</div>
          {vendor.createdBy && <div><strong>Created By:</strong> {vendor.createdBy}</div>}
          {vendor.createdAt && <div><strong>Created At:</strong> {new Date(vendor.createdAt).toLocaleString()}</div>}
          {vendor.updatedAt && <div><strong>Updated At:</strong> {new Date(vendor.updatedAt).toLocaleString()}</div>}
        </div>
              {/* Payment Modes */}
              {Array.isArray(vendor.paymentModes) && vendor.paymentModes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold mb-2">Preferred Payment Modes</h4>
                  <ul className="flex flex-wrap gap-2">
                    {vendor.paymentModes.map((mode, idx) => (
                      <li key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{mode}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {tab === 'bank' && Array.isArray(vendor.bankAccounts) && vendor.bankAccounts.length > 0 && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendor.bankAccounts.map((acc, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="font-medium text-blue-700 mb-1">{acc.bankName || 'Bank'}</div>
                    <div><strong>Account Holder:</strong> {acc.accountHolder}</div>
                    <div><strong>Account Number:</strong> {acc.accountNumber}</div>
                    <div><strong>IFSC:</strong> {acc.ifsc}</div>
                    <div><strong>Branch:</strong> {acc.branch}</div>
                    {acc.notes && <div><strong>Notes:</strong> {acc.notes}</div>}
                  </Card>
                ))}
      </div>
        </div>
          )}
          {tab === 'bills' && (
          <Table columns={billColumns} data={bills} />
        )}
          {tab === 'advances' && (
            <Table columns={advanceColumns} data={advances} />
          )}
          {tab === 'ledger' && (
            <>
              {ledger.length > 0 && (
                <div className="flex justify-end mb-2 gap-2">
                  <Button variant="outline" icon={<FiDownload />} onClick={() => downloadCSV(addRunningBalance(ledger), vendor)}>
                    Download CSV
                  </Button>
                  <Button variant="outline" icon={<FiDownload />} onClick={() => downloadExcel(addRunningBalance(ledger), vendor)}>
                    Download Excel
                  </Button>
                  <Button variant="outline" icon={<FiDownload />} onClick={() => downloadPDF(addRunningBalance(ledger), vendor)}>
                    Download PDF
                  </Button>
                </div>
              )}
              <Table columns={ledgerColumns} data={addRunningBalance(ledger)} />
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-8">
        <Button variant="secondary" icon={<FiArrowLeft />} onClick={() => navigate('/finance/vendors')}>Back</Button>
      </div>
    </div>
  );
} 