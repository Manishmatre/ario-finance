import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiBarChart2, FiPieChart, FiDollarSign, FiCheck, FiClock, FiX } from 'react-icons/fi';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import PageHeading from '../../components/ui/PageHeading';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';

// Safe default for reportData
const safeReportData = data => ({
  summary: data?.summary || { totalAmount: 0, approvedAmount: 0, averageMonthly: 0, count: 0 },
  byCategory: Array.isArray(data?.byCategory) ? data.byCategory : [],
  byMonth: Array.isArray(data?.byMonth) ? data.byMonth : [],
});

export default function ExpenseReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    groupBy: 'category', // 'category' or 'month'
  });
  const [categories, setCategories] = useState([]);
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      
      const response = await axios.get(`/api/finance/expenses/reports?${params.toString()}`);
      setReportData(safeReportData(response.data));
    } catch (err) {
      console.error('Error fetching report data:', err);
      toast.error('Failed to load expense report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [filters.startDate, filters.endDate, filters.groupBy]);

  // Fetch categories for lookup
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/finance/expenses/categories');
        setCategories(response.data || []);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

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

  // Helper to get category name from ID
  const getCategoryName = (catId, fallback) => {
    if (!catId) return fallback || '-';
    const found = categories.find(c => c._id === catId);
    return found ? found.name : (fallback || catId);
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportData?.summary ? (
          <>
            <Card 
              title="Total Expenses" 
              value={`₹${(reportData.summary.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
              icon={<FiDollarSign className="h-6 w-6 text-blue-500" />} 
            />
            <Card 
              title="Approved" 
              value={`₹${(reportData.summary.approvedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
              icon={<FiCheck className="h-6 w-6 text-green-500" />} 
            />
            <Card 
              title="Pending" 
              value={`₹${(reportData.summary.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
              icon={<FiClock className="h-6 w-6 text-yellow-500" />} 
            />
            <Card 
              title="Rejected" 
              value={`₹${(reportData.summary.rejectedAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
              icon={<FiX className="h-6 w-6 text-red-500" />} 
            />
          </>
        ) : (
          <div className="col-span-4 flex justify-center items-center h-32">
            <Loader />
          </div>
        )}
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
              {/* Expense Breakdown */}
              <Card>
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {filters.groupBy === 'category' ? 'Category-wise' : 'Monthly'} Breakdown
                  </h3>
                </div>
                <div className="p-4">
                  {(reportData && ((filters.groupBy === 'category' && reportData.byCategory?.length > 0) || (filters.groupBy === 'month' && reportData.byMonth?.length > 0))) ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {filters.groupBy === 'category' ? 'Category' : 'Month'}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Count
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              % of Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData[filters.groupBy === 'category' ? 'byCategory' : 'byMonth']?.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {filters.groupBy === 'category' ? (
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.categoryName || getCategoryName(item._id, 'Unknown')}
                                    </div>
                                  ) : (
                                    <div className="text-sm font-medium text-gray-900">
                                      {`${item._id.year}-${item._id.month.toString().padStart(2, '0')}`}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                ₹{(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                {item.count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {((item.totalAmount / (reportData.summary.totalAmount || 1)) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                          {reportData.summary.totalAmount > 0 && (
                            <tr className="bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                Total
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                ₹{(reportData.summary.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                {reportData.summary.count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                100%
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-gray-400 mb-4">
                        <FiDollarSign className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-500 mb-2">
                        No Expense Data Available
                      </h3>
                      <p className="text-gray-400 text-center">
                        {filters.groupBy === 'category' 
                          ? 'No expenses found in the selected categories'
                          : 'No expenses found in the selected time period'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
