import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import { formatCurrency, formatDate } from '../../utils/helpers';
import axiosInstance from '../../utils/axiosInstance';
import { FiCreditCard, FiCheckCircle, FiEdit, FiTrash2, FiRepeat } from 'react-icons/fi';

const TABS = [
  { key: 'info', label: 'Account Info', icon: <FiCreditCard /> },
  { key: 'transactions', label: 'Transactions', icon: <FiRepeat /> },
];

export default function BankAccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('info');

  const fetchAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/finance/bank-accounts/${id}`);
      setAccount(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch account details');
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // Try to fetch transactions, fallback to ledger if needed
      const { data } = await axiosInstance.get(`/api/finance/bank-accounts/${id}/ledger`);
      setTransactions(data || []);
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAccount();
      fetchTransactions();
    }
    // eslint-disable-next-line
  }, [id]);

  const handleEdit = () => {
    navigate(`/finance/edit-bank-account/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/api/finance/bank-accounts/${id}`);
      setLoading(false);
      navigate('/finance/accounts');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  // Summary cards
  const summaryCards = account ? [
    { title: 'Current Balance', value: formatCurrency(account.currentBalance), icon: <FiCreditCard className="h-6 w-6 text-green-600" /> },
    { title: 'Status', value: account.status, icon: <FiCheckCircle className="h-6 w-6 text-blue-500" /> },
    { title: 'Account Type', value: account.type, icon: <FiCreditCard className="h-6 w-6 text-purple-500" /> },
    { title: 'Interest Rate', value: account.interestRate ? `${account.interestRate}%` : 'N/A', icon: <FiCreditCard className="h-6 w-6 text-yellow-500" /> },
  ] : [];

  // Transactions columns
  const transactionColumns = [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => formatDate(value) },
    { Header: 'Description', accessor: 'narration' },
    { Header: 'Amount', accessor: 'amount', Cell: ({ row }) => formatCurrency(Math.abs(row.original.debit || row.original.credit || 0)) },
    { Header: 'Type', accessor: 'type', Cell: ({ row }) => row.original.debit ? 'Debit' : 'Credit' },
    { Header: 'Reference', accessor: 'reference' },
    { Header: 'Balance', accessor: 'balance', Cell: ({ value }) => formatCurrency(value) },
  ];

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!account) return null;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Bank Account Details: ${account.bankName}`}
        subtitle="View all information and transactions for this bank account"
        breadcrumbs={[
          { label: 'Accounts', to: '/finance/accounts' },
          { label: 'Bank Account Details' }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <StatCard key={idx} title={card.title} value={card.value} icon={card.icon} />
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
            {tab === 'info' && `Account Information`}
            {tab === 'transactions' && `Transactions for ${account.bankName}`}
          </h3>
          {tab === 'info' && (
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={handleEdit}><FiEdit className="mr-1" /> Edit</Button>
              <Button size="sm" variant="danger" onClick={handleDelete}><FiTrash2 className="mr-1" /> Delete</Button>
            </div>
          )}
        </div>
        <div className="p-2">
          {tab === 'info' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><strong>Bank Name:</strong> {account.bankName}</div>
              <div><strong>Account Type:</strong> {account.type}</div>
              <div><strong>Account Holder:</strong> {account.accountHolder}</div>
              <div><strong>Account Number:</strong> {account.bankAccountNo}</div>
              <div><strong>IFSC Code:</strong> {account.ifsc}</div>
              <div><strong>Branch Name:</strong> {account.branchName}</div>
              <div><strong>Status:</strong> <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{account.status}</span></div>
              <div><strong>Interest Rate:</strong> {account.interestRate ? `${account.interestRate}%` : 'N/A'}</div>
              <div><strong>Current Balance:</strong> {formatCurrency(account.currentBalance)}</div>
              {account.accountCode && <div><strong>Account Code:</strong> {account.accountCode}</div>}
              {account.features && (
                <div className="md:col-span-2">
                  <strong>Features:</strong>
                  <ul className="list-disc ml-6">
                    <li>Internet Banking: {account.features.internetBanking ? 'Yes' : 'No'}</li>
                    <li>Mobile Banking: {account.features.mobileBanking ? 'Yes' : 'No'}</li>
                    <li>Debit Card: {account.features.debitCard ? 'Yes' : 'No'}</li>
                    <li>Cheque Book: {account.features.chequeBook ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              )}
              {account.notes && <div className="md:col-span-2"><strong>Notes:</strong> {account.notes}</div>}
              {account.lastTransactionDate && <div><strong>Last Transaction:</strong> {formatDate(account.lastTransactionDate)}</div>}
              {account.createdAt && <div><strong>Created At:</strong> {formatDate(account.createdAt)}</div>}
              {account.updatedAt && <div><strong>Updated At:</strong> {formatDate(account.updatedAt)}</div>}
            </div>
          )}
          {tab === 'transactions' && (
            <div className="p-2">
              {transactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No transactions found.</div>
              ) : (
                <Table columns={transactionColumns} data={transactions} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 