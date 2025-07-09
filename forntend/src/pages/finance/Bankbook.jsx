import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from "react-icons/fi";
import axiosInstance from '../../utils/axiosInstance';

function addRunningBalance(rows) {
  let balanceMap = {};
  // Sort by date ascending for running balance
  const sorted = [...rows].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.map(row => {
    const bankId = row.bankAccountId?._id || row.bankAccountId;
    if (!balanceMap[bankId]) balanceMap[bankId] = 0;
    // If vendorId is present, it's a payment (debit/outflow)
    const isDebit = !!row.vendorId;
    const isCredit = !row.vendorId;
    const debit = isDebit ? row.amount : 0;
    const credit = isCredit ? row.amount : 0;
    balanceMap[bankId] += credit - debit;
    return {
      ...row,
      type: isDebit ? 'Debit' : 'Credit',
      debit,
      credit,
      balance: balanceMap[bankId],
    };
  });
}

export default function Bankbook() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [bankbook, setBankbook] = useState([]);
  const [accountSummary, setAccountSummary] = useState([]);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/cash/cashbook?type=bank')
      .then(res => {
        const withBalance = addRunningBalance(res.data);
        setBankbook(withBalance);
        // Build account summary from transactions
        const summaryMap = {};
        withBalance.forEach(txn => {
          const acc = txn.bankAccountId;
          const bankId = acc?._id || acc;
          if (!summaryMap[bankId]) {
            summaryMap[bankId] = {
              name: acc?.bankName || '-',
              balance: 0,
              accountNo: acc?.bankAccountNo || '-',
              color: 'blue',
            };
          }
          summaryMap[bankId].balance = txn.balance;
        });
        setAccountSummary(Object.values(summaryMap));
        setLoading(false);
      })
      .catch(() => {
        setBankbook([]);
        setAccountSummary([]);
        setLoading(false);
      });
  }, []);

  const paginated = bankbook.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(bankbook.length / PAGE_SIZE);

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Bank', 
      accessor: 'bank',
      Cell: ({ row }) => {
        const acc = row.original.bankAccountId;
        return (
          <div>
            <div className="font-medium">{acc?.bankName || '-'}</div>
            <div className="text-sm text-gray-500">{acc?.bankAccountNo || '-'}</div>
          </div>
        );
      }
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value, row }) => (
        <span className={`font-medium ${row.original.type === 'Debit' ? 'text-red-600' : 'text-green-600'}`}>
          {row.original.type === 'Debit' ? '-' : '+'}₹{value.toLocaleString()}
        </span>
      )
    },
    { 
      Header: 'Type', 
      accessor: 'type',
      Cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.type === 'Debit' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {row.original.type === 'Debit' ? 'Withdrawal' : 'Deposit'}
        </span>
      )
    },
    { 
      Header: 'Narration', 
      accessor: 'narration',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">Ref: {row.original._id?.toString().slice(-6) || '-'}</div>
        </div>
      )
    },
    { 
      Header: 'Balance', 
      accessor: 'balance',
      Cell: ({ value }) => value ? `₹${value.toLocaleString()}` : '-'
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Bankbook"
        subtitle="Track all bank transactions and account balances"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Bankbook" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountSummary.map((account, index) => (
          <Card
            key={index}
            title={account.name}
            value={`₹${account.balance.toLocaleString()}`}
            subtitle={account.accountNo}
            icon={<FiCreditCard className={`h-6 w-6 text-${account.color}-500`} />}
          />
        ))}
      </div>

      {/* Bankbook Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Transaction History</h3>
        </div>
        {bankbook.length === 0 ? (
        <EmptyState message="No bankbook entries found." />
      ) : (
          <>
            <Table columns={columns} data={paginated} />
            <div className="p-4 border-t border-gray-100">
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
