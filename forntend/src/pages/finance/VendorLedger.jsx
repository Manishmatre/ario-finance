import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { FiFileText } from 'react-icons/fi';
import Card from "../../components/ui/Card";
import { FiUsers, FiDollarSign, FiCalendar } from "react-icons/fi";
import PageHeading from "../../components/ui/PageHeading";

const PAGE_SIZE = 10;

const VendorLedger = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axiosInstance.get('/api/finance/vendors').then(res => setVendors(res.data));
  }, []);

  useEffect(() => {
    if (!selectedVendor) return;
    setLoading(true);
    axiosInstance.get(`/transactions?accountId=${selectedVendor}`).then(res => {
      setLedger(res.data);
      setTotal(res.data.length);
      setLoading(false);
    }).catch(() => {
      setLedger([]);
      setTotal(0);
      setLoading(false);
    });
  }, [selectedVendor]);

  const paginated = ledger.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const vendorSummary = [
    { title: 'Total Vendors', value: vendors.length, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Outstanding', value: 1735000, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
    { title: 'Total Bills', value: 8, icon: <FiFileText className="h-6 w-6 text-green-500" /> },
    { title: 'Overdue Amount', value: 450000, icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
  ];

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
            options={vendors.map(v => ({ value: v._id, label: v.name }))}
            value={selectedVendor}
            onChange={e => { setSelectedVendor(e.target.value); setPage(1); }}
            placeholder="Select Vendor"
            className="w-64"
          />
        </div>
      </div>

      {/* Vendor Ledger Table */}
      {loading ? <Loader /> : !selectedVendor ? <EmptyState text="Select a vendor to view ledger." /> : ledger.length === 0 ? <EmptyState text="No ledger entries found." /> : (
        <>
          <Table
            columns={[
              { label: 'Date', key: 'date' },
              { label: 'Debit Account', key: 'debitAccount' },
              { label: 'Credit Account', key: 'creditAccount' },
              { label: 'Amount', key: 'amount' },
              { label: 'Narration', key: 'narration' },
            ]}
            data={paginated.map(l => ({
              ...l,
              date: l.date ? l.date.slice(0, 10) : '',
              debitAccount: l.debitAccount,
              creditAccount: l.creditAccount,
            }))}
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
