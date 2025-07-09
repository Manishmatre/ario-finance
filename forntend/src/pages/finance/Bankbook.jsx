import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from "react-icons/fi";
import axiosInstance from '../../utils/axiosInstance';

export default function Bankbook() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [bankbook, setBankbook] = useState([]);
  const [accountSummary, setAccountSummary] = useState([]);
  const totalPages = 1;

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/api/finance/cash/cashbook?type=bank')
      .then(res => {
        setBankbook(res.data);
        // Build account summary from transactions
        const summaryMap = {};
        res.data.forEach(txn => {
          // Use creditAccount for deposits, debitAccount for withdrawals
          const acc = txn.debitAccount.name === 'Bank' ? txn.debitAccount : txn.creditAccount;
          if (!summaryMap[acc._id]) {
            summaryMap[acc._id] = {
              name: acc.name,
              balance: 0,
              accountNo: acc.code,
              color: 'blue',
            };
          }
          summaryMap[acc._id].balance += txn.amount;
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

  const columns = [
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Bank', 
      accessor: 'bank',
      Cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.debitAccount?.name === 'Bank' ? row.original.debitAccount?.name : row.original.creditAccount?.name}</div>
          <div className="text-sm text-gray-500">{row.original.debitAccount?.code || row.original.creditAccount?.code}</div>
        </div>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value, row }) => (
        <span className={`font-medium ${row.original.debitAccount?.name === 'Bank' ? 'text-red-600' : 'text-green-600'}`}>
          {row.original.debitAccount?.name === 'Bank' ? '-' : '+'}₹{value.toLocaleString()}
        </span>
      )
    },
    { 
      Header: 'Type', 
      accessor: 'type',
      Cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.debitAccount?.name === 'Bank' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {row.original.debitAccount?.name === 'Bank' ? 'Withdrawal' : 'Deposit'}
        </span>
      )
    },
    { 
      Header: 'Narration', 
      accessor: 'narration',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">Ref: {row.original.reference || '-'}</div>
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
          { label: "Accounts", to: "/finance/accounts" },
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
            <Table columns={columns} data={bankbook} />
            <div className="p-4 border-t border-gray-100">
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
