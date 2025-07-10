import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiPlus, FiPaperclip, FiEye } from "react-icons/fi";
import axiosInstance from '../../utils/axiosInstance';

const approvalSummary = [
  { title: 'Pending Approval', value: 5, icon: <FiClock className="h-6 w-6 text-yellow-500" /> },
  { title: 'Total Amount', value: 95000, icon: <FiDollarSign className="h-6 w-6 text-blue-500" /> },
  { title: 'High Priority', value: 2, icon: <FiXCircle className="h-6 w-6 text-red-500" /> },
  { title: 'Departments', value: 5, icon: <FiCheckCircle className="h-6 w-6 text-green-500" /> },
];

export default function TransactionApproval() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState({ project: '', type: '', status: '', search: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch all data (simulate for now)
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API calls
    setTimeout(() => {
      setTransactions([]); // TODO: Fill with real data
      setProjects([
        { value: '', label: 'All Projects' },
        { value: 'proj1', label: 'Tower A' },
        { value: 'proj2', label: 'Tower B' },
      ]);
      setVendors([
        { value: '', label: 'All Vendors' },
        { value: 'vendor1', label: 'ABC Cement' },
        { value: 'vendor2', label: 'XYZ Steel' },
      ]);
      setEmployees([
        { value: '', label: 'All Employees' },
        { value: 'emp1', label: 'John Doe' },
        { value: 'emp2', label: 'Jane Smith' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Filtered transactions (placeholder logic)
  const filtered = transactions.filter(txn => {
    if (filter.project && txn.project !== filter.project) return false;
    if (filter.type && txn.type !== filter.type) return false;
    if (filter.status && txn.status !== filter.status) return false;
    if (filter.search && !(
      txn.reference?.toLowerCase().includes(filter.search.toLowerCase()) ||
      txn.narration?.toLowerCase().includes(filter.search.toLowerCase())
    )) return false;
    return true;
  });

  const columns = [
    { Header: 'Date', accessor: 'date' },
    { Header: 'Reference', accessor: 'reference' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Project', accessor: 'projectName' },
    { Header: 'Cost Code', accessor: 'costCode' },
    { Header: 'Vendor/Client/Employee', accessor: 'partyName' },
    { Header: 'Debit Account', accessor: 'debitAccount' },
    { Header: 'Credit Account', accessor: 'creditAccount' },
    { Header: 'Amount', accessor: 'amount' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Attachment', accessor: 'attachment', Cell: ({ value }) => value ? <FiPaperclip /> : null },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <Button size="sm" icon={<FiEye />} onClick={() => { setSelectedTransaction(row.original); setShowDetailsModal(true); }}>Details</Button>
    ) },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Transactions"
        subtitle="All project-related financial transactions"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Transactions" }
        ]}
      />
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
          <Select options={projects} value={filter.project} onChange={e => setFilter(f => ({ ...f, project: e.target.value }))} />
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <Select options={[
            { value: '', label: 'All Types' },
            { value: 'Payment', label: 'Payment' },
            { value: 'Receipt', label: 'Receipt' },
            { value: 'Transfer', label: 'Transfer' },
            { value: 'Journal', label: 'Journal' },
          ]} value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} />
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <Select options={[
            { value: '', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'Settled', label: 'Settled' },
          ]} value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} />
        </div>
        <div className="w-64">
          <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
          <Input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} placeholder="Reference, narration..." />
        </div>
        <div className="flex-1 text-right">
          <Button icon={<FiPlus />} onClick={() => setShowAddModal(true)}>Add Transaction</Button>
        </div>
      </div>
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">All Transactions</h3>
        </div>
        {loading ? <Loader /> : filtered.length === 0 ? <EmptyState message="No transactions found." /> : (
          <Table columns={columns} data={filtered} />
        )}
      </div>
      {/* Add Transaction Modal (placeholder) */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Transaction">
        <div className="p-4">Add Transaction Form (to be implemented)</div>
      </Modal>
      {/* Transaction Details Modal (placeholder) */}
      <Modal open={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Transaction Details">
        <div className="p-4">Transaction Details (to be implemented)</div>
      </Modal>
    </div>
  );
}