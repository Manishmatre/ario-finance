import React, { useState, useEffect } from "react";
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import PageHeading from "../../components/ui/PageHeading";
import { Card } from "../../components/ui/Card";
import { FiUsers, FiDollarSign, FiMapPin, FiPhone } from "react-icons/fi";
import { useForm } from 'react-hook-form';

// Mock data
const vendorsData = [
  { 
    id: 1, 
    name: 'ABC Steels Pvt Ltd', 
    gstNo: '27AABCA1234A1Z5', 
    phone: '+91 98765 43210',
    email: 'accounts@abcsteels.com',
    address: 'Mumbai, Maharashtra',
    category: 'Steel Supplier',
    balance: 125000,
    status: 'Active',
    lastTransaction: '2025-01-15'
  },
  { 
    id: 2, 
    name: 'XYZ Electronics', 
    gstNo: '29BABCE5678B2Z9', 
    phone: '+91 87654 32109',
    email: 'info@xyzelectronics.com',
    address: 'Bangalore, Karnataka',
    category: 'Electronics',
    balance: 75000,
    status: 'Active',
    lastTransaction: '2025-01-14'
  },
  { 
    id: 3, 
    name: 'DEF Construction Materials', 
    gstNo: '33CABCF9012C3Z3', 
    phone: '+91 76543 21098',
    email: 'sales@defconstruction.com',
    address: 'Chennai, Tamil Nadu',
    category: 'Construction',
    balance: 200000,
    status: 'Active',
    lastTransaction: '2025-01-13'
  },
  { 
    id: 4, 
    name: 'GHI Office Supplies', 
    gstNo: '07DABCH3456D4Z7', 
    phone: '+91 65432 10987',
    email: 'orders@ghioffice.com',
    address: 'Delhi, NCR',
    category: 'Office Supplies',
    balance: 45000,
    status: 'Active',
    lastTransaction: '2025-01-12'
  },
  { 
    id: 5, 
    name: 'JKL Software Solutions', 
    gstNo: '12EABCI7890E5Z1', 
    phone: '+91 54321 09876',
    email: 'billing@jklsoftware.com',
    address: 'Hyderabad, Telangana',
    category: 'Software',
    balance: 180000,
    status: 'Active',
    lastTransaction: '2025-01-11'
  },
  { 
    id: 6, 
    name: 'MNO Logistics', 
    gstNo: '36FABCJ1234F6Z6', 
    phone: '+91 43210 98765',
    email: 'accounts@mnologistics.com',
    address: 'Pune, Maharashtra',
    category: 'Logistics',
    balance: 95000,
    status: 'Active',
    lastTransaction: '2025-01-10'
  },
];

const vendorSummary = [
  { title: 'Total Vendors', value: 6, icon: <FiUsers className="h-6 w-6 text-blue-500" /> },
  { title: 'Total Outstanding', value: 720000, icon: <FiDollarSign className="h-6 w-6 text-red-500" /> },
  { title: 'Active Vendors', value: 6, icon: <FiMapPin className="h-6 w-6 text-green-500" /> },
  { title: 'Categories', value: 6, icon: <FiPhone className="h-6 w-6 text-purple-500" /> },
];

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVendors(vendorsData);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    { 
      Header: 'Vendor Name', 
      accessor: 'name',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.category}</div>
        </div>
      )
    },
    { 
      Header: 'GST No', 
      accessor: 'gstNo',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      Header: 'Contact', 
      accessor: 'phone',
      Cell: ({ value, row }) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      )
    },
    { 
      Header: 'Address', 
      accessor: 'address',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      Header: 'Balance', 
      accessor: 'balance',
      Cell: ({ value }) => (
        <span className={`font-medium ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
          ₹{value.toLocaleString()}
        </span>
      )
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    { 
      Header: 'Last Transaction', 
      accessor: 'lastTransaction',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Actions', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary">View</Button>
          <Button size="sm" variant="danger">Delete</Button>
        </div>
      )
    }
  ];

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      setVendors([...vendors, { ...data, id: vendors.length + 1, status: 'Active', balance: 0 }]);
      setLoading(false);
      setModalOpen(false);
      reset();
    }, 800);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Vendors"
        subtitle="Manage vendor information and track outstanding balances"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Payables", to: "/finance/payables" },
          { label: "Vendors" }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendorSummary.map((summary, index) => (
          <Card
            key={index}
            title={summary.title}
            value={summary.title.includes('Outstanding') 
              ? `₹${summary.value.toLocaleString()}` 
              : summary.value.toString()}
            icon={summary.icon}
          />
        ))}
      </div>

      {/* Add Vendor Button */}
      <div className="flex justify-between items-center">
        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Add Vendor
        </Button>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Vendor Directory</h3>
        </div>
        {vendors.length === 0 ? (
          <EmptyState message="No vendors found." />
        ) : (
          <Table columns={columns} data={vendors} />
        )}
      </div>

      {/* Add Vendor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 min-w-[400px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Add New Vendor</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register('name', { required: true })} 
                />
                {errors.name && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register('gstNo', { required: true })} 
                />
                {errors.gstNo && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register('phone', { required: true })} 
                />
                {errors.phone && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register('email', { required: true })} 
                />
                {errors.email && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register('address', { required: true })} 
                />
                {errors.address && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register('category', { required: true })} 
                />
                {errors.category && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="submit" className="flex-1">Add Vendor</Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
