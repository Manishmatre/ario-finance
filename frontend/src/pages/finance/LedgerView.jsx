import React, { useState, useEffect } from "react";
import axiosInstance from '../../utils/axiosInstance';
import Table from "../../components/ui/Table";
import Select from "../../components/ui/Select";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import Button from '../../components/ui/Button';
import { FiBook, FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 10;

const downloadCSV = (rows) => {
  if (!rows || !rows.length) return;
  const headers = ['Date', 'Type', 'Narration', 'Debit', 'Credit', 'Balance'];
  const csvRows = [headers.join(',')];
  rows.forEach(row => {
    csvRows.push([
      row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
      row.type || '',
      row.narration || '',
      row.debit ? row.debit : '',
      row.credit ? row.credit : '',
      row.balance ? row.balance : ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
  });
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  saveAs(blob, 'ledger.csv');
};

const downloadExcel = (rows, account) => {
  if (!rows || !rows.length) return;
  const wsData = [
    [`Account: ${account?.name || ''}`],
    [`Code: ${account?.code || ''}`],
    [`Type: ${account?.type || ''}`],
    [],
    ['Date', 'Type', 'Narration', 'Debit', 'Credit', 'Balance']
  ];
  rows.forEach(row => {
    wsData.push([
      row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
      row.type || '',
      row.narration || '',
      row.debit ? row.debit : '',
      row.credit ? row.credit : '',
      row.balance ? row.balance : ''
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'ledger.xlsx');
};

const downloadPDF = (rows, account) => {
  if (!rows || !rows.length) return;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Account: ${account?.name || ''}`, 10, 10);
  doc.setFontSize(10);
  doc.text(`Code: ${account?.code || ''}`, 10, 18);
  doc.text(`Type: ${account?.type || ''}`, 10, 24);
  doc.text('Ledger:', 10, 32);
  const tableData = rows.map(row => [
    row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
    row.type || '',
    row.narration || '',
    row.debit ? row.debit : '',
    row.credit ? row.credit : '',
    row.balance ? row.balance : ''
  ]);
  autoTable(doc, {
    head: [['Date', 'Type', 'Narration', 'Debit', 'Credit', 'Balance']],
    body: tableData,
    startY: 36,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  doc.save('ledger.pdf');
};

const addRunningBalance = (rows, accountId) => {
  let balance = 0;
  // Sort by date ascending for running balance
  const sorted = [...rows].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.map(row => {
    // Use backend-provided debit/credit/type directly
    const debit = row.debit ? Math.abs(Number(row.debit)) : 0;
    const credit = row.credit ? Math.abs(Number(row.credit)) : 0;
    balance += credit - debit;
    return {
      ...row,
      debit,
      credit,
      balance,
    };
  });
};

export default function LedgerView() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [account, setAccount] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/bank-accounts')
      .then(res => {
        setAccounts(res.data.bankAccounts || []);
        setLoading(false);
      })
      .catch(() => {
        setAccounts([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedAccount) {
      setEntries([]);
      setAccount(null);
      setTotal(0);
      return;
    }
    setLoading(true);
    const acc = accounts.find(a => a._id === selectedAccount);
    setAccount(acc);
    axiosInstance.get(`/api/finance/bank-accounts/${selectedAccount}/ledger`)
      .then(res => {
        setEntries(res.data || []);
        setTotal((res.data || []).length);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setTotal(0);
        setLoading(false);
      });
  }, [selectedAccount, accounts]);

  const ledgerWithBalance = addRunningBalance(entries, selectedAccount);
  const paginated = ledgerWithBalance.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary for selected account
  const totalDebits = ledgerWithBalance.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredits = ledgerWithBalance.reduce((sum, e) => sum + (e.credit || 0), 0);
  const currentBalance = ledgerWithBalance.length > 0 ? ledgerWithBalance[ledgerWithBalance.length - 1].balance : 0;

  const accountSummary = [
    { title: 'Bank Name', value: account?.bankName || '-', icon: <FiBook className="h-6 w-6 text-blue-500" /> },
    { title: 'Account No', value: account?.bankAccountNo || '-', icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Total Debits', value: `₹${totalDebits.toLocaleString()}` , icon: <FiTrendingUp className="h-6 w-6 text-purple-500" /> },
    { title: 'Total Credits', value: `₹${totalCredits.toLocaleString()}` , icon: <FiTrendingDown className="h-6 w-6 text-red-500" /> },
    { title: 'Current Balance', value: `₹${currentBalance.toLocaleString()}` , icon: <FiDollarSign className="h-6 w-6 text-blue-700" /> },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Ledger View"
        subtitle="View detailed ledger entries for any account"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Ledger View" }
        ]}
      />

      {/* Summary Cards */}
      {account && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {accountSummary.map((summary, index) => (
            <Card
              key={index}
              title={summary.title}
              value={summary.value}
              icon={summary.icon}
            />
          ))}
        </div>
      )}

      {/* Account Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
          <Select
            options={accounts.map((a) => ({ value: a._id, label: `${a.bankName} (${a.bankAccountNo})` }))}
            value={selectedAccount}
            onChange={(e) => { setSelectedAccount(e.target.value); setPage(1); }}
            placeholder="Select Bank Account"
            className="w-64"
          />
        </div>
      </div>

      {/* Download Buttons */}
      {selectedAccount && ledgerWithBalance.length > 0 && (
        <div className="flex justify-end mb-2 gap-2">
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadCSV(ledgerWithBalance)}>
            Download CSV
          </Button>
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadExcel(ledgerWithBalance, account)}>
            Download Excel
          </Button>
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadPDF(ledgerWithBalance, account)}>
            Download PDF
          </Button>
        </div>
      )}

      {/* Ledger Entries Table */}
      {loading ? <Loader /> : !selectedAccount ? <EmptyState message="Select an account to view ledger." /> : ledgerWithBalance.length === 0 ? (
        <EmptyState message="No ledger entries found for this account." />
      ) : (
        <>
          <Table
            columns={[
              { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
              { Header: 'Type', accessor: 'type' },
              { Header: 'Note', accessor: 'narration' },
              { Header: 'Debit', accessor: 'debit', Cell: ({ value }) => value ? `₹${Math.abs(Number(value)).toLocaleString()}` : '-' },
              { Header: 'Credit', accessor: 'credit', Cell: ({ value }) => value ? `₹${Math.abs(Number(value)).toLocaleString()}` : '-' },
              { Header: 'Ref', accessor: '_id', Cell: ({ value }) => value ? value.toString().slice(-6) : '-' },
              { Header: 'Balance', accessor: 'balance', Cell: ({ value }) => <span className={value < 0 ? 'text-red-600 font-bold' : 'text-green-700 font-bold'}>{`₹${value?.toLocaleString()}`}</span> },
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
}
