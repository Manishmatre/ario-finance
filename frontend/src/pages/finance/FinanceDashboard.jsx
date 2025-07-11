  import React, { useEffect, useState } from 'react';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/useAuth';
import axios from '../../utils/axios';
// Removed: import { io } from 'socket.io-client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, CurrencyRupeeIcon, BanknotesIcon, CreditCardIcon, ScaleIcon } from '@heroicons/react/24/outline';
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/ui/Table';

// Removed: const socket = io(import.meta.env.VITE_API_URL || 'https://ariofinance-backend.onrender.com');

export default function FinanceDashboard() {
  const [kpis, setKpis] = useState({
    cashInHand: 0,
    budgetVsActual: 0,
    payables: 0,
    receivables: 0,
    totalIncome: 0,
    totalExpense: 0,
  });

  const [monthlyData, setMonthlyData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [accountBalances, setAccountBalances] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTxn, setSearchTxn] = useState("");
  const [txnPage, setTxnPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch KPIs
        const kpiResponse = await axios.get('/api/finance/dashboard/kpis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKpis(kpiResponse.data);

        // Fetch recent transactions (limit 10)
        const txnResponse = await axios.get('/api/finance/transactions', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1 }
        });
        setRecentTransactions(txnResponse.data.slice(0, 10));

        // Fetch bank accounts
        const bankResponse = await axios.get('/api/finance/bank-accounts', {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 10 }
        });
        setAccountBalances(bankResponse.data.bankAccounts);

        // Fetch bills
        const billsResponse = await axios.get('/api/finance/bills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter upcoming bills (not paid and due date in future)
        const upcoming = billsResponse.data.filter(bill => !bill.isPaid && new Date(bill.billDate) >= new Date());
        setUpcomingBills(upcoming);

        // Fetch expense reports for all-time data
        const startDate = "2000-01-01T00:00:00.000Z";
        const endDate = new Date().toISOString();
        const reportsResponse = await axios.get('/api/finance/expenses/reports', {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate }
        });
        // Map expense breakdown from reports by category
        const pieData = reportsResponse.data.byCategory.map(cat => ({
          name: cat.categoryName,
          value: Math.abs(cat.totalAmount),
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        }));
        setExpenseCategories(pieData);
        // Map budget data from reports by category
        const budget = reportsResponse.data.byCategory.map(cat => ({
          name: cat.categoryName,
          used: Math.abs(cat.totalAmount),
          total: 100000, // Placeholder total budget
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        }));
        setBudgetData(budget);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Removed all socket event listeners and cleanup
  }, [token]);

  // Prepare monthlyData for Income vs Expenses chart
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await axios.get('/api/finance/dashboard/monthly-income-expense', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMonthlyData(response.data);
        // Set default year to the year with the most data
        const years = [...new Set(response.data.map(item => item.year))];
        if (years.length > 0 && !selectedYear) {
          // Find year with most months
          const yearCounts = years.map(y => ({ year: y, count: response.data.filter(i => i.year === y).length }));
          const maxYear = yearCounts.reduce((a, b) => (a.count > b.count ? a : b), yearCounts[0]).year;
          setSelectedYear(maxYear);
        }
      } catch (err) {
        // fallback: keep previous
      }
    };
    if (token) fetchMonthlyData();
  }, [token]);

  // Filter monthlyData for selected year
  const yearsAvailable = [...new Set(monthlyData.map(item => item.year))];
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const found = monthlyData.find(m => m.year === selectedYear && m.month === i + 1);
    return {
      name: new Date(2000, i, 1).toLocaleString('default', { month: 'short' }),
      income: found ? found.income : 0,
      expense: found ? found.expense : 0
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const txnColumns = [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : '-' },
    { Header: 'Type', accessor: 'type', Cell: ({ row }) => getTxnType(row.original) },
    { Header: 'Description', accessor: 'narration', Cell: ({ value }) => value || '-' },
    { Header: 'Entity', accessor: 'entity', Cell: ({ row }) => getTxnEntity(row.original) },
    { Header: 'Amount', accessor: 'amount', align: 'right', Cell: ({ value, row }) => {
      const isDebit = isTxnDebit(row.original);
      return (
        <span className={isDebit ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
          {(isDebit ? '-' : '+') + '₹' + Math.abs(value).toLocaleString()}
        </span>
      );
    } },
  ];
  const filteredRecentTxns = recentTransactions.filter(txn => {
    const type = getTxnType(txn).toLowerCase();
    const entity = getTxnEntity(txn).toLowerCase();
    return (
      (txn.narration?.toLowerCase().includes(searchTxn.toLowerCase()) ||
        type.includes(searchTxn.toLowerCase()) ||
        entity.includes(searchTxn.toLowerCase()))
    );
  });
  function getTxnType(txn) {
    if (txn.narration?.toLowerCase().includes('expense')) return 'Expense';
    if (txn.narration?.toLowerCase().includes('salary')) return 'Salary';
    if (txn.narration?.toLowerCase().includes('advance')) return 'Advance';
    if (txn.narration?.toLowerCase().includes('payment received')) return 'Income';
    if (txn.narration?.toLowerCase().includes('bill')) return 'Bill Payment';
    if (txn.projectId) return 'Project';
    if (txn.vendorId) return 'Vendor';
    return 'Other';
  }
  function getTxnEntity(txn) {
    if (txn.vendorName) return txn.vendorName;
    if (txn.projectName) return txn.projectName;
    if (txn.employeeName) return txn.employeeName;
    return '-';
  }

  function isTxnDebit(txn) {
    const narration = txn.narration?.toLowerCase() || '';
    // Treat as debit if expense, salary, advance, bill payment, or negative amount
    if (narration.includes('expense') || narration.includes('salary') || narration.includes('advance') || narration.includes('bill')) return true;
    if (txn.amount < 0) return true;
    return false;
  }

  // Calculate total expenses for the pie chart
  const totalExpenseForPie = expenseCategories.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Finance Dashboard"
        subtitle="Overview of your financial performance"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Dashboard" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`₹${(kpis.cashInHand ?? 0).toLocaleString()}`}
          icon={<CurrencyRupeeIcon className="h-6 w-6 text-blue-500" />}
          tooltip="Sum of all bank and cash balances."
        />
        <StatCard
          title="Total Income"
          value={`₹${(kpis.totalIncome ?? 0).toLocaleString()}`}
          icon={<ArrowUpIcon className="h-6 w-6 text-green-500" />}
          tooltip="All income received this period."
        />
        <StatCard
          title="Total Expenses"
          value={`₹${(kpis.totalExpense ?? 0).toLocaleString()}`}
          icon={<ArrowDownIcon className="h-6 w-6 text-red-500" />}
          tooltip="All expenses paid this period."
        />
        <StatCard
          title="Budget vs Actual"
          value={`${((kpis.budgetVsActual ?? 0) * 100).toFixed(1)}%`}
          icon={<ScaleIcon className="h-6 w-6 text-purple-500" />}
          tooltip="How your spending compares to your budget."
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 focus:outline-none outline-none" tabIndex={-1}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Income vs Expenses</h3>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedYear || ''}
              onChange={e => setSelectedYear(Number(e.target.value))}
            >
              {yearsAvailable.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#4ade80" />
                <Bar dataKey="expense" name="Expense" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Expense Breakdown Pie */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center lg:col-span-1 focus:outline-none outline-none" tabIndex={-1}>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={expenseCategories}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center mt-4 gap-2">
          {expenseCategories.map((cat, idx) => {
            const percent = totalExpenseForPie > 0 ? ((cat.value / totalExpenseForPie) * 100).toFixed(1) : 0;
            return (
              <span key={cat.name} className="flex items-center text-xs">
                <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: cat.color }}></span>
                {cat.name} <span className="ml-1 text-gray-500">{percent}% (₹{cat.value.toLocaleString()})</span>
              </span>
            );
          })}
          </div>
        </div>
        {/* Account Balances */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-between lg:col-span-1 focus:outline-none outline-none" tabIndex={-1}>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Balances</h3>
          <div className="space-y-4">
            {accountBalances.map((account) => (
              <div key={account._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{account.bankName || account.name}</p>
                  <p className="text-sm text-gray-500">{account.bankAccountNo || account.accountNo}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{(account.currentBalance ?? account.balance ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Available Balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Bills Only */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 my-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Bills</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-blue-50 cursor-pointer" onClick={() => navigate(`/finance/bills/${bill._id}`)}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(bill.billDate || bill.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">{bill.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-red-600">-₹{(bill.amount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {bill.status ? (typeof bill.status === 'string' && bill.status.length > 0 ? bill.status.charAt(0).toUpperCase() + bill.status.slice(1) : '-') : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions & Recent Activities */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
          <input
            type="text"
            value={searchTxn || ''}
            onChange={e => { setSearchTxn(e.target.value); setTxnPage(1); }}
            placeholder="Search by description, type, or entity..."
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
        </div>
        <Table
          data={filteredRecentTxns}
          columns={txnColumns}
          pageSize={8}
          onRowClick={row => navigate(`/finance/transactions/${row._id}`)}
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
