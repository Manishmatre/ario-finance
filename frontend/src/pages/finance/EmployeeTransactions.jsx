import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Card from '../../components/ui/Card';
import PageHeading from '../../components/ui/PageHeading';
import { FiList, FiDollarSign, FiCheckCircle, FiPlus, FiSearch, FiCalendar } from 'react-icons/fi';
import axiosInstance from '../../utils/axiosInstance';
import EmployeeTransactionFilters from '../../components/finance/EmployeeTransactionFilters';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FiDownload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../components/ui/Modal';

const getTransactionsSummary = (transactions) => {
  const total = transactions.length;
  const salary = transactions.filter(t => t.type === 'salary').reduce((sum, t) => sum + (t.amount || 0), 0);
  const advance = transactions.filter(t => t.type === 'advance').reduce((sum, t) => sum + (t.amount || 0), 0);
  return [
    { title: 'Total Transactions', value: total, icon: <FiList className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Salary Paid', value: `₹${salary.toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Total Advances', value: `₹${advance.toLocaleString()}`, icon: <FiCheckCircle className="h-6 w-6 text-purple-500" /> },
  ];
};

export default function EmployeeTransactions() {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filters, setFilters] = useState({ name: '', type: '', dateFrom: '', dateTo: '' });
  const [viewTxn, setViewTxn] = useState(null);
  const navigate = useNavigate();
  const [editTxn, setEditTxn] = useState(null);

  // Fetch transactions with filters
  const fetchTransactions = (params = {}) => {
    setLoading(true);
    const query = new URLSearchParams(params).toString();
    axiosInstance.get(`/api/finance/employees/transactions/all${query ? `?${query}` : ''}`)
      .then(res => setTransactions(res.data || []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    setLoading(true);
    axiosInstance.get(`/api/finance/employees/transactions/all${Object.keys(filters).length ? '?' + new URLSearchParams(filters).toString() : ''}`)
      .then(res => {
        // Attach index and type to each transaction
        const txns = [];
        (res.data || []).forEach((txn, i) => {
          txns.push({ ...txn, index: txn.index ?? i, type: txn.type });
        });
        setTransactions(txns);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [filters]);

  // Filtering logic (search is now handled by backend filter)
  const filtered = transactions;
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Filter form submit
  const onFilter = data => {
    setFilters({
      name: data.employeeName || '',
      type: data.type || '',
      dateFrom: data.dateFrom || '',
      dateTo: data.dateTo || '',
    });
    setPage(1);
  };

  // Export helpers
  const downloadCSV = (rows) => {
    if (!rows || !rows.length) return;
    const headers = ['Employee', 'Type', 'Amount', 'Date', 'Status', 'Notes', 'Payment Mode'];
    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      csvRows.push([
        row.employeeName || '',
        row.type || '',
        row.amount || '',
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.status || '',
        row.notes || '',
        row.paymentMode || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, 'employee_transactions.csv');
  };

  const downloadExcel = (rows) => {
    if (!rows || !rows.length) return;
    const wsData = [
      ['Employee', 'Type', 'Amount', 'Date', 'Status', 'Notes', 'Payment Mode']
    ];
    rows.forEach(row => {
      wsData.push([
        row.employeeName || '',
        row.type || '',
        row.amount || '',
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.status || '',
        row.notes || '',
        row.paymentMode || ''
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'employee_transactions.xlsx');
  };

  const downloadPDF = (rows) => {
    if (!rows || !rows.length) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Employee Transactions', 10, 10);
    autoTable(doc, {
      head: [['Employee', 'Type', 'Amount', 'Date', 'Status', 'Notes', 'Payment Mode']],
      body: rows.map(row => [
        row.employeeName || '',
        row.type || '',
        row.amount || '',
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.status || '',
        row.notes || '',
        row.paymentMode || ''
      ]),
      startY: 18,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save('employee_transactions.pdf');
  };

  const printTable = (rows) => {
    const printWindow = window.open('', '', 'width=900,height=700');
    const html = `
      <html><head><title>Employee Transactions</title></head><body>
      <h2>Employee Transactions</h2>
      <table border="1" cellpadding="5" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th>Employee</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th><th>Notes</th><th>Payment Mode</th>
        </tr></thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${row.employeeName || ''}</td>
              <td>${row.type || ''}</td>
              <td>${row.amount || ''}</td>
              <td>${row.date ? new Date(row.date).toLocaleDateString('en-IN') : ''}</td>
              <td>${row.status || ''}</td>
              <td>${row.notes || ''}</td>
              <td>${row.paymentMode || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      </body></html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleView = (txn) => setViewTxn(txn);
  const handleEdit = (txn) => setEditTxn(txn);
  const handleDelete = async (txn) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setLoading(true);
    try {
      await axiosInstance.delete(`/api/finance/employees/${txn.employeeId}/${txn.type}/${txn.index}`);
      setViewTxn(null);
      fetchTransactions(filters);
    } catch (err) {
      alert('Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (updated) => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/api/finance/employees/${editTxn.employeeId}/${editTxn.type}/${editTxn.index}`, updated);
      setEditTxn(null);
      fetchTransactions(filters);
    } catch (err) {
      alert('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: 'Employee', accessor: 'employeeName', Cell: ({ value }) => (<div className="font-medium">{value}</div>) },
    { Header: 'Type', accessor: 'type', Cell: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1) },
    { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => `₹${value?.toLocaleString()}` },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
    { Header: 'Status', accessor: 'status', Cell: ({ value }) => <span className={`px-2 py-1 rounded text-xs ${value==='paid'?'bg-green-100 text-green-800':value==='pending'?'bg-yellow-100 text-yellow-800':'bg-red-100 text-red-800'}`}>{value}</span> },
    { Header: 'Notes', accessor: 'notes' },
    { Header: 'Payment Mode', accessor: 'paymentMode' },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => handleView(row.original)}>View</Button>
        <Button size="sm" variant="primary" onClick={() => handleEdit(row.original)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original)}>Delete</Button>
      </div>
    ) },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Employee Transactions"
        subtitle="Track all employees' salary and advance transactions."
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Employee Transactions' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {getTransactionsSummary(transactions).map((item, idx) => (
          <Card key={item.title} className="flex items-center gap-4 p-4">
            <div>{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-bold">{item.value}</div>
            </div>
          </Card>
        ))}
      </div>
      {/* Filter Bar and Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 mt-4">
        <div className="flex flex-1 items-center gap-2">
          <EmployeeTransactionFilters filters={filters} setFilters={setFilters} reset={reset} setPage={setPage} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={() => downloadCSV(filtered)}><FiDownload className="inline mr-1" /> CSV</Button>
          <Button size="sm" variant="outline" onClick={() => downloadExcel(filtered)}><FiDownload className="inline mr-1" /> Excel</Button>
          <Button size="sm" variant="outline" onClick={() => downloadPDF(filtered)}><FiDownload className="inline mr-1" /> PDF</Button>
          <Button size="sm" variant="outline" onClick={() => printTable(filtered)}><FiDownload className="inline mr-1" /> Print</Button>
          <Button key="add-transaction" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-10 min-w-[150px] ml-2" onClick={() => navigate('/finance/employee-transactions/add')}>
            <FiPlus className="w-4 h-4" /> Add Transaction
          </Button>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Employee Transactions</h3>
        </div>
        {paginated.length === 0 ? (
          <EmptyState message="No employee transactions found." />
        ) : (
          <Table columns={columns} data={paginated} />
        )}
      </div>
      {/* View Transaction Modal */}
      <Modal open={!!viewTxn} onClose={() => setViewTxn(null)} title="Transaction Details">
        {viewTxn && (
          <div className="p-4 space-y-2">
            <div><strong>Employee:</strong> {viewTxn.employeeName}</div>
            <div><strong>Type:</strong> {viewTxn.type}</div>
            <div><strong>Amount:</strong> ₹{viewTxn.amount?.toLocaleString()}</div>
            <div><strong>Date:</strong> {viewTxn.date ? new Date(viewTxn.date).toLocaleDateString('en-IN') : '-'}</div>
            <div><strong>Status:</strong> {viewTxn.status}</div>
            <div><strong>Notes:</strong> {viewTxn.notes}</div>
            <div><strong>Payment Mode:</strong> {viewTxn.paymentMode}</div>
            <div className="flex gap-2 pt-4">
              <Button variant="danger" onClick={() => handleDelete(viewTxn)}>Delete</Button>
              <Button variant="secondary" onClick={() => setViewTxn(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
      {/* Edit Transaction Modal */}
      <Modal open={!!editTxn} onClose={() => setEditTxn(null)} title="Edit Transaction">
        {editTxn && (
          <form className="p-4 space-y-2" onSubmit={e => { e.preventDefault(); handleEditSave(editTxn); }}>
            <div><strong>Employee:</strong> {editTxn.employeeName}</div>
            <div><strong>Type:</strong> {editTxn.type}</div>
            <div>
              <label>Amount:</label>
              <input type="number" className="border rounded px-2 py-1 ml-2" value={editTxn.amount} onChange={e => setEditTxn({ ...editTxn, amount: Number(e.target.value) })} required />
            </div>
            <div>
              <label>Date:</label>
              <input type="date" className="border rounded px-2 py-1 ml-2" value={editTxn.date ? new Date(editTxn.date).toISOString().slice(0,10) : ''} onChange={e => setEditTxn({ ...editTxn, date: e.target.value })} required />
            </div>
            <div>
              <label>Status:</label>
              <input type="text" className="border rounded px-2 py-1 ml-2" value={editTxn.status} onChange={e => setEditTxn({ ...editTxn, status: e.target.value })} required />
            </div>
            <div>
              <label>Notes:</label>
              <input type="text" className="border rounded px-2 py-1 ml-2" value={editTxn.notes} onChange={e => setEditTxn({ ...editTxn, notes: e.target.value })} />
            </div>
            <div>
              <label>Payment Mode:</label>
              <input type="text" className="border rounded px-2 py-1 ml-2" value={editTxn.paymentMode} onChange={e => setEditTxn({ ...editTxn, paymentMode: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="primary" type="submit">Save Changes</Button>
              <Button variant="secondary" onClick={() => setEditTxn(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
} 