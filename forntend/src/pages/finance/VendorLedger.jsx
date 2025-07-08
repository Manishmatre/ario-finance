import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { FiFileText, FiUsers, FiDollarSign, FiTrendingUp, FiCheckCircle, FiCalendar, FiLayers, FiDownload } from 'react-icons/fi';
import Card from "../../components/ui/Card";
import PageHeading from "../../components/ui/PageHeading";
import Button from '../../components/ui/Button';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 10;

const downloadCSV = (rows) => {
  if (!rows || !rows.length) return;
  const headers = ['Date', 'Type', 'Note', 'Debit', 'Credit', 'Ref'];
  const csvRows = [headers.join(',')];
  rows.forEach(row => {
    csvRows.push([
      row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
      row.type || '',
      row.note || '',
      row.debit ? row.debit : '',
      row.credit ? row.credit : '',
      row.ref || ''
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
    ['Date', 'Type', 'Note', 'Debit', 'Credit', 'Ref']
  ];
  rows.forEach(row => {
    wsData.push([
      row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
      row.type || '',
      row.note || '',
      row.debit ? row.debit : '',
      row.credit ? row.credit : '',
      row.ref || ''
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
    row.ref || ''
  ]);
  autoTable(doc, {
    head: [['Date', 'Type', 'Note', 'Debit', 'Credit', 'Ref']],
    body: tableData,
    startY: 42,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  doc.save('vendor_ledger.pdf');
};

const VendorLedger = () => {
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    setVendorsLoading(true);
    setVendorsError(null);
    axiosInstance.get('/api/finance/vendors')
      .then(res => {
        setVendors(res.data);
        setVendorsLoading(false);
      })
      .catch(err => {
        setVendors([]);
        setVendorsError('Failed to fetch vendors');
        setVendorsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedVendor) {
      setLedger([]);
      setVendor(null);
      setTotal(0);
      return;
    }
    setLoading(true);
    Promise.all([
      axiosInstance.get(`/api/finance/vendors/${selectedVendor}`),
      axiosInstance.get(`/api/finance/vendors/${selectedVendor}/ledger`)
    ])
      .then(([vendorRes, ledgerRes]) => {
        setVendor(vendorRes.data);
        setLedger(ledgerRes.data);
        setTotal(ledgerRes.data.length);
        setLoading(false);
      })
      .catch(() => {
        setLedger([]);
        setVendor(null);
        setTotal(0);
        setLoading(false);
      });
  }, [selectedVendor]);

  const paginated = ledger.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary for selected vendor
  const totalBills = ledger.filter(e => e.type === 'Bill').length;
  const totalAdvances = ledger.filter(e => e.type === 'Advance').length;
  const totalBillAmount = ledger.filter(e => e.type === 'Bill').reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAdvanceAmount = ledger.filter(e => e.type === 'Advance').reduce((sum, e) => sum + (e.amount || 0), 0);
  const outstanding = totalBillAmount - totalAdvanceAmount;
  const lastBillDate = ledger.filter(e => e.type === 'Bill').reduce((latest, e) => e.date && new Date(e.date) > new Date(latest) ? e.date : latest, null);

  const vendorSummary = [
    { title: 'Total Bills', value: totalBills, icon: <FiFileText className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Advances', value: totalAdvances, icon: <FiTrendingUp className="h-6 w-6 text-purple-500" /> },
    { title: 'Outstanding', value: outstanding, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
    { title: 'Last Bill Date', value: lastBillDate ? new Date(lastBillDate).toLocaleDateString('en-IN') : '-', icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Vendor Ledger"
        subtitle="Track vendor transactions and outstanding balances"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Vendor Ledger" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Amount') || summary.title.includes('Outstanding')
              ? `₹${summary.value?.toLocaleString()}`
              : summary.value?.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Vendor Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Vendor</label>
          {vendorsLoading ? (
            <div className="text-gray-500">Loading vendors...</div>
          ) : vendorsError ? (
            <div className="text-red-500">{vendorsError}</div>
          ) : vendors.length === 0 ? (
            <div className="text-gray-500">No vendors found. Please add a vendor first.</div>
          ) : (
            <Select
              options={vendors.map(v => ({ value: v._id, label: v.name }))}
              value={selectedVendor}
              onChange={e => { setSelectedVendor(e.target.value); setPage(1); }}
              placeholder="Select Vendor"
              className="w-64"
            />
          )}
        </div>
      </div>

      {/* Download Buttons */}
      {selectedVendor && ledger.length > 0 && (
        <div className="flex justify-end mb-2 gap-2">
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadCSV(ledger)}>
            Download CSV
          </Button>
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadExcel(ledger, vendor)}>
            Download Excel
          </Button>
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadPDF(ledger, vendor)}>
            Download PDF
          </Button>
        </div>
      )}

      {/* Vendor Ledger Table */}
      {loading ? <Loader /> : !selectedVendor ? <EmptyState text="Select a vendor to view ledger." /> : ledger.length === 0 ? (
        <EmptyState text="No ledger entries found for this vendor." />
      ) : (
        <>
          <Table
            columns={[
              { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
              { Header: 'Type', accessor: 'type' },
              { Header: 'Note', accessor: 'note' },
              { Header: 'Debit', accessor: 'debit', Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-' },
              { Header: 'Credit', accessor: 'credit', Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-' },
              { Header: 'Ref', accessor: 'ref' },
            ]}
            data={paginated.map((row, i) => ({ ...row, _id: row._id || `${row.type}-${row.date}-${i}` }))}
          />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default VendorLedger;
