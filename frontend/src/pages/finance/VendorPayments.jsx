import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useForm } from 'react-hook-form';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import { FiDollarSign, FiCalendar, FiPlus, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import StatCard from '../../components/ui/StatCard';

const PAGE_SIZE = 10;

const VendorPayments = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    axiosInstance.get('/api/finance/vendors').then(res => setVendors(res.data));
  }, []);

  useEffect(() => {
    if (!selectedVendor) return;
    setLoading(true);
    axiosInstance.get(`/transactions?accountId=${selectedVendor}`).then(res => {
      // Filter only payment transactions (credit to vendor)
      setPayments(res.data.filter(t => t.amount < 0 || t.creditAccount === selectedVendor));
      setTotal(res.data.length);
      setLoading(false);
    }).catch(() => {
      setPayments([]);
      setTotal(0);
      setLoading(false);
    });
  }, [selectedVendor]);

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/transactions', {
        date: data.date,
        debitAccount: data.debitAccount,
        creditAccount: selectedVendor,
        amount: data.amount,
        narration: data.narration,
      });
      setModalOpen(false);
      reset();
      setTimeout(() => {
        // refetch
        axiosInstance.get(`/transactions?accountId=${selectedVendor}`).then(res => {
          setPayments(res.data.filter(t => t.amount < 0 || t.creditAccount === selectedVendor));
          setTotal(res.data.length);
        });
      }, 500);
    } catch {}
  };

  const paginated = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getSummary = (payments) => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const lastDate = payments.length > 0 ? new Date(Math.max(...payments.map(p => new Date(p.date || 0)))).toLocaleDateString('en-IN') : '-';
    return [
      { title: 'Total Payments', value: totalPayments, icon: <FiPlus className="h-6 w-6 text-blue-500" /> },
      { title: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
      { title: 'Last Payment', value: lastDate, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
    ];
  };

  const downloadCSV = (rows) => {
    if (!rows || !rows.length) return;
    const headers = ['Date', 'Debit Account', 'Credit Account', 'Amount', 'Narration'];
    const csvRows = [headers.join(',')];
    rows.forEach(row => {
      csvRows.push([
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.debitAccount || '',
        row.creditAccount || '',
        row.amount || '',
        row.narration || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_payments.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows, vendor) => {
    if (!rows || !rows.length) return;
    const wsData = [
      [vendor ? `Vendor: ${vendor.label}` : 'All Vendors'],
      [],
      ['Date', 'Debit Account', 'Credit Account', 'Amount', 'Narration']
    ];
    rows.forEach(row => {
      wsData.push([
        row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
        row.debitAccount || '',
        row.creditAccount || '',
        row.amount || '',
        row.narration || ''
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'vendor_payments.xlsx');
  };

  const downloadPDF = (rows, vendor) => {
    if (!rows || !rows.length) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(vendor ? `Vendor: ${vendor.label}` : 'All Vendors', 10, 10);
    doc.setFontSize(10);
    doc.text('Payments:', 10, 18);
    const tableData = rows.map(row => [
      row.date ? new Date(row.date).toLocaleDateString('en-IN') : '',
      row.debitAccount || '',
      row.creditAccount || '',
      row.amount || '',
      row.narration || ''
    ]);
    autoTable(doc, {
      head: [['Date', 'Debit Account', 'Credit Account', 'Amount', 'Narration']],
      body: tableData,
      startY: 22,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save('vendor_payments.pdf');
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Vendor Payments"
        subtitle="Manage and track payments made to vendors"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Vendor Payments' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {getSummary(payments).map((item, idx) => (
          <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
        ))}
      </div>
      {/* Vendor Filter and Export */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            options={vendors.map(v => ({ value: v._id, label: v.name }))}
            value={selectedVendor}
            onChange={e => { setSelectedVendor(e.target.value); setPage(1); }}
            placeholder="Select Vendor"
            className="w-64"
          />
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadCSV(payments)}>Download CSV</Button>
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadExcel(payments, vendors.find(v => v._id === selectedVendor))}>Download Excel</Button>
          <Button variant="outline" icon={<FiDownload />} onClick={() => downloadPDF(payments, vendors.find(v => v._id === selectedVendor))}>Download PDF</Button>
        </div>
      </div>
      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Payments</h3>
        </div>
        {loading ? <Loader /> : !selectedVendor ? <EmptyState text="Select a vendor to view payments." /> : payments.length === 0 ? <EmptyState text="No payments found." /> : (
          <>
            <Table
              columns={[
                { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '-' },
                { Header: 'Debit Account', accessor: 'debitAccount' },
                { Header: 'Credit Account', accessor: 'creditAccount' },
                { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => value ? `₹${Number(value).toLocaleString()}` : '-' },
                { Header: 'Narration', accessor: 'narration' },
              ]}
              data={paginated.map((p, i) => ({ ...p, _id: p._id || i }))}
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
      {/* Add Payment Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Add Vendor Payment">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Date</label>
            <input className="input" type="date" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Debit Account</label>
            <input className="input" {...register('debitAccount', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Amount</label>
            <input className="input" type="number" step="0.01" {...register('amount', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Narration</label>
            <input className="input" {...register('narration')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit">Add Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorPayments;
