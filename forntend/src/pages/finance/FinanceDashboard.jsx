  import React, { useEffect, useState } from 'react';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../contexts/useAuth';
import axios from '../../utils/axios';
// Removed: import { io } from 'socket.io-client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, CurrencyRupeeIcon, BanknotesIcon, CreditCardIcon, ScaleIcon } from '@heroicons/react/24/outline';
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";

// Removed: const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');

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

  const { token } = useAuth();

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

        // Fetch expense categories
        const categoriesResponse = await axios.get('/api/finance/expenses/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Map categories to pie chart format
        const pieData = categoriesResponse.data.map(cat => ({
          name: cat.name,
          value: 1, // Placeholder, real values from reports
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
        }));
        setExpenseCategories(pieData);

        // Fetch expense reports for budget data
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
        const reportsResponse = await axios.get('/api/finance/expenses/reports', {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate, endDate }
        });
        // Map budget data from reports by category
        const budget = reportsResponse.data.byCategory.map(cat => ({
          name: cat.categoryName,
          used: cat.totalAmount,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          title="Total Balance" 
          value={`₹${(kpis.cashInHand ?? 0).toLocaleString()}`} 
          icon={<CurrencyRupeeIcon className="h-6 w-6 text-blue-500" />}
          trend="up"
          trendValue="12.5%"
        />
        <Card 
          title="Total Income" 
          value={`₹${(kpis.totalIncome ?? 0).toLocaleString()}`} 
          icon={<ArrowUpIcon className="h-6 w-6 text-green-500" />}
          trend="up"
          trendValue="8.2%"
        />
        <Card 
          title="Total Expenses" 
          value={`₹${(kpis.totalExpense ?? 0).toLocaleString()}`} 
          icon={<ArrowDownIcon className="h-6 w-6 text-red-500" />}
          trend="down"
          trendValue="3.4%"
        />
        <Card 
          title="Budget vs Actual" 
          value={`${((kpis.budgetVsActual ?? 0) * 100).toFixed(1)}%`} 
          icon={<ScaleIcon className="h-6 w-6 text-purple-500" />}
          trend={kpis.budgetVsActual >= 0.8 ? "up" : "down"}
          trendValue={`${(((kpis.budgetVsActual ?? 0) - 0.8) * 100).toFixed(1)}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 focus:outline-none outline-none" tabIndex={-1}>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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
          {expenseCategories.map((cat, idx) => (
            <span key={cat.name} className="flex items-center text-xs">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ background: cat.color }}></span>
              {cat.name}
            </span>
          ))}
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
                <tr key={bill._id} className="hover:bg-gray-50">
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {typeof transaction.status === 'string' && transaction.status.length > 0
                        ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                        : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
