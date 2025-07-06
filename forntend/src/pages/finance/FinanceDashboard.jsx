import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, CurrencyRupeeIcon, BanknotesIcon, CreditCardIcon, ScaleIcon } from '@heroicons/react/24/outline';

// Mock data
const monthlyData = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
];

const recentTransactions = [
  { id: 1, date: '2025-07-06', description: 'Office Rent', amount: 50000, type: 'expense', status: 'completed' },
  { id: 2, date: '2025-07-05', description: 'Client Payment', amount: 125000, type: 'income', status: 'completed' },
  { id: 3, date: '2025-07-04', description: 'Software Subscription', amount: 15000, type: 'expense', status: 'pending' },
  { id: 4, date: '2025-07-03', description: 'Consulting Fee', amount: 45000, type: 'income', status: 'completed' },
];

const accountBalances = [
  { name: 'HDFC Bank', balance: 1250000, accountNo: 'XXXX-XXXX-7890' },
  { name: 'ICICI Bank', balance: 780000, accountNo: 'XXXX-XXXX-4567' },
  { name: 'SBI', balance: 320000, accountNo: 'XXXX-XXXX-1234' },
];

export default function FinanceDashboard() {
  const [kpis, setKpis] = useState({
    cashInHand: 0,
    budgetVsActual: 0,
    payables: 0,
    receivables: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // Mock API response
        setTimeout(() => {
          setKpis({
            cashInHand: 1250000,
            budgetVsActual: 0.85,
            payables: 325000,
            receivables: 587000,
            totalIncome: 2450000,
            totalExpense: 1875000,
          });
          setLoading(false);
        }, 1000);
        
        // Real API call would look like:
        // const response = await axios.get('/api/finance/dashboard', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setKpis(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-gray-800">Finance Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your financial performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          title="Total Balance" 
          value={`₹${kpis.cashInHand?.toLocaleString() || '0'}`} 
          icon={<CurrencyRupeeIcon className="h-6 w-6 text-blue-500" />}
          trend="up"
          trendValue="12.5%"
        />
        <Card 
          title="Total Income" 
          value={`₹${kpis.totalIncome?.toLocaleString() || '0'}`} 
          icon={<ArrowUpIcon className="h-6 w-6 text-green-500" />}
          trend="up"
          trendValue="8.2%"
        />
        <Card 
          title="Total Expenses" 
          value={`₹${kpis.totalExpense?.toLocaleString() || '0'}`} 
          icon={<ArrowDownIcon className="h-6 w-6 text-red-500" />}
          trend="down"
          trendValue="3.4%"
        />
        <Card 
          title="Budget vs Actual" 
          value={`${(kpis.budgetVsActual * 100)?.toFixed(1) || '0'}%`} 
          icon={<ScaleIcon className="h-6 w-6 text-purple-500" />}
          trend={kpis.budgetVsActual >= 0.8 ? "up" : "down"}
          trendValue={`${((kpis.budgetVsActual - 0.8) * 100)?.toFixed(1)}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
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

        {/* Account Balances */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Account Balances</h3>
          <div className="space-y-4">
            {accountBalances.map((account) => (
              <div key={account.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="text-sm text-gray-500">{account.accountNo}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{account.balance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Available Balance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
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
                <tr key={transaction.id} className="hover:bg-gray-50">
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
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
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
