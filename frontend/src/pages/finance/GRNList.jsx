import React, { useState, useEffect } from 'react';
import { FiFilter, FiDownload, FiSearch, FiRefreshCw } from 'react-icons/fi';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeading from '../../components/ui/PageHeading';
import Table from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Link } from 'react-router-dom';

export default function GRNList() {
  const [loading, setLoading] = useState(true);
  const [grns, setGRNs] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    vendorId: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [vendors, setVendors] = useState([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/finance/grns?${params.toString()}`);
      setGRNs(response.data);
    } catch (err) {
      console.error('Error fetching GRNs:', err);
      toast.error('Failed to load GRNs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/finance/vendors');
      setVendors(response.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      toast.error('Failed to load vendors');
    }
  };

  useEffect(() => {
    fetchGRNs();
    fetchVendors();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.vendorId) params.append('vendorId', filters.vendorId);

      const response = await axios.get(`/api/finance/grns/report?${params.toString()}`);
      // Handle export (implement actual export functionality)
      toast.success('Export initiated');
    } catch (err) {
      console.error('Error exporting GRNs:', err);
      toast.error('Failed to export GRNs');
    } finally {
      setIsExporting(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    matched: 'bg-green-100 text-green-800',
    partially_matched: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="GRN Management"
        description="Manage Goods Received Notes"
        actions={[
          <Button
            key="export"
            variant="outline"
            className="flex items-center"
            onClick={handleExport}
            disabled={isExporting}
          >
            <FiDownload className="mr-2" /> Export
          </Button>,
          <Button
            key="filter"
            variant="outline"
            className="flex items-center"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <FiFilter className="mr-2" /> Filter
          </Button>
        ]}
      />

      <Card>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by GRN number, PO ref, or bill number..."
                  className="pl-10"
                  value={filters.search}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  status: '',
                  vendorId: '',
                  startDate: '',
                  endDate: '',
                  search: ''
                });
                fetchGRNs();
              }}
            >
              <FiRefreshCw className="mr-2" /> Clear Filters
            </Button>
          </div>

          <Table
            data={grns}
            columns={[
              {
                Header: 'GRN Number',
                accessor: 'grnNumber',
                Cell: ({ value }) => (
                  <Link to={`/finance/grns/${value}`} className="text-blue-600 hover:text-blue-800">
                    {value}
                  </Link>
                )
              },
              {
                Header: 'PO Ref',
                accessor: 'poRef'
              },
              {
                Header: 'Vendor',
                accessor: 'vendor.name'
              },
              {
                Header: 'Date',
                accessor: 'grnDate',
                Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy')
              },
              {
                Header: 'Total Amount',
                accessor: 'totalAmount',
                Cell: ({ value }) => `₹${value?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`
              },
              {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ value }) => (
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )
              },
              {
                Header: 'Actions',
                Cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <Link to={`/finance/grns/${row.original._id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {row.original.status === 'pending' && (
                      <Link to={`/finance/grns/${row.original._id}/match`}>
                        <Button variant="outline" size="sm" className="bg-green-100 text-green-800 hover:bg-green-200">
                          Match Bill
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              }
            ]}
          />
        </div>
      </Card>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter GRNs"
      >
        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select
                value={filters.status}
                onChange={handleFilterChange}
                name="status"
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'matched', label: 'Matched' },
                  { value: 'partially_matched', label: 'Partially Matched' },
                  { value: 'completed', label: 'Completed' }
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <Select
                value={filters.vendorId}
                onChange={handleFilterChange}
                name="vendorId"
                options={[
                  { value: '', label: 'All Vendors' },
                  ...vendors.map(vendor => ({
                    value: vendor._id,
                    label: vendor.name
                  }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                fetchGRNs();
                setIsFilterModalOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
