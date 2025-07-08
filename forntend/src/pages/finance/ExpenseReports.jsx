import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiBarChart2, FiPieChart, FiDollarSign, FiCheck } from 'react-icons/fi';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import PageHeading from '../../components/ui/PageHeading';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

// Mock data for reports
const mockReportData = {
  summary: {
    totalAmount: 6900,
    approvedAmount: 1200,
    averageMonthly: 2300,
    count: 3,
  },
  byCategory: [
    { _id: 'Supplies', totalAmount: 1200, count: 1 },
    { _id: 'Travel', totalAmount: 3500, count: 1 },
    { _id: 'Entertainment', totalAmount: 2200, count: 1 },
  ],
  byMonth: [
    { _id: { year: 2025, month: 7 }, totalAmount: 6900, count: 3 },
  ],
};

// Mock data for summary cards
const summary = [
  { title: 'Total Expenses', value: 6900, icon: <FiBarChart2 className="h-6 w-6 text-blue-500" /> },
  { title: 'Approved', value: 1200, icon: <FiBarChart2 className="h-6 w-6 text-green-500" /> },
  { title: 'Pending', value: 3500, icon: <FiBarChart2 className="h-6 w-6 text-yellow-500" /> },
  { title: 'Rejected', value: 2200, icon: <FiBarChart2 className="h-6 w-6 text-gray-500" /> },
];

// Mock data for pie chart
const expenseCategories = [
  { name: 'Supplies', value: 1200, color: '#3b82f6' },
  { name: 'Travel', value: 3500, color: '#10b981' },
  { name: 'Entertainment', value: 2200, color: '#f59e0b' },
];

// Safe default for reportData
const safeReportData = data => ({
  summary: data?.summary || { totalAmount: 0, approvedAmount: 0, averageMonthly: 0, count: 0 },
  byCategory: Array.isArray(data?.byCategory) ? data.byCategory : [],
  byMonth: Array.isArray(data?.byMonth) ? data.byMonth : [],
});

export default function ExpenseReports() {
  const [reportDataRaw, setReportDataRaw] = useState(mockReportData);
  const reportData = safeReportData(reportDataRaw);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'category', // 'category' or 'month'
  });
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      const response = await axios.get(`/api/finance/expenses/reports?${params.toString()}`);
      setReportDataRaw(response.data);
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error('Failed to load expense report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [filters.startDate, filters.endDate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateRangeChange = (range) => {
    const today = new Date();
    let start, end;
    
    switch (range) {
      case 'this_month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'last_month':
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'last_3_months':
        start = subMonths(today, 3);
        end = today;
        break;
      case 'last_6_months':
        start = subMonths(today, 6);
        end = today;
        break;
      case 'this_year':
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      default:
        start = subMonths(today, 6);
        end = today;
    }
    
    setFilters(prev => ({
      ...prev,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    }));
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Expense Reports"
        subtitle="Analyze and visualize your expense data"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Expense Reports" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((item, idx) => (
          <Card key={idx} title={item.title} value={`₹${item.value.toLocaleString()}`} icon={item.icon} />
        ))}
      </div>
      <Card>
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <FiFilter className="inline mr-2" />
            Filter Report
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <Select
                value={`${filters.startDate} to ${filters.endDate}`}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                options={[
                  { value: 'this_month', label: 'This Month' },
                  { value: 'last_month', label: 'Last Month' },
                  { value: 'last_3_months', label: 'Last 3 Months' },
                  { value: 'last_6_months', label: 'Last 6 Months' },
                  { value: 'this_year', label: 'This Year' },
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <Select
                name="groupBy"
                value={filters.groupBy}
                onChange={handleFilterChange}
                options={[
                  { value: 'category', label: 'Category' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </div>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader />
            </div>
          ) : (
            <>
              {/* Category-wise Breakdown */}
              <Card>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Category-wise Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % of Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.byCategory?.length > 0 ? (
                        reportData.byCategory.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item._id}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {((item.totalAmount / reportData.summary.totalAmount) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                            No category data available for the selected period
                          </td>
                        </tr>
                      )}
                      {reportData.summary.totalAmount > 0 && (
                        <tr className="bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            ₹{reportData.summary.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            100%
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
