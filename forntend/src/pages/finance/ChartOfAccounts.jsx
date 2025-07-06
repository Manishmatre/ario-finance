import React, { useEffect, useState } from "react";
import Table from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import PageHeading from '../../components/ui/PageHeading';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { MoneyInput } from '../../components/ui/MoneyInput';
import { Link, useNavigate } from 'react-router-dom';

// Mock data for accounts
const mockAccounts = [
  {
    _id: '1',
    bankName: 'State Bank of India',
    type: 'Current',
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: '12345678901',
    ifsc: 'SBIN0000123',
    branchName: 'Connaught Place',
    status: 'active',
  },
  {
    _id: '2',
    bankName: 'HDFC Bank',
    type: 'Savings',
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: '98765432109',
    ifsc: 'HDFC0000456',
    branchName: 'Bandra West',
    status: 'active',
  },
  {
    _id: '3',
    bankName: 'ICICI Bank',
    type: 'Current',
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: '11223344556',
    ifsc: 'ICIC0000789',
    branchName: 'MG Road',
    status: 'inactive',
  },
  {
    _id: '4',
    bankName: 'Axis Bank',
    type: 'Other',
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: '55667788990',
    ifsc: 'UTIB0000111',
    branchName: 'Powai',
    status: 'active',
  },
  {
    _id: '5',
    bankName: 'Punjab National Bank',
    type: 'Savings',
    accountHolder: 'Ario Pvt Ltd',
    bankAccountNo: '66778899001',
    ifsc: 'PUNB0123456',
    branchName: 'Karol Bagh',
    status: 'inactive',
  },
];

const BALANCE_TYPES = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

const ACCOUNT_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'current', label: 'Current' },
  { value: 'savings', label: 'Savings' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ChartOfAccounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
  const type = watch('type');
  const navigate = useNavigate();

  // Fetch accounts
  const fetchAccounts = () => {
    setLoading(true);
    axios
      .get("/api/finance/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAccounts(res.data.accounts && res.data.accounts.length > 0 ? res.data.accounts : mockAccounts);
        setLoading(false);
      })
      .catch(() => {
        setAccounts(mockAccounts);
        setError("Showing mock data. Backend unavailable.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line
  }, [token]);

  // Add account
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "/api/finance/accounts",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Account created");
      reset();
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
      toast.error(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    setLoading(true);
    try {
      await axios.patch(
        `/api/finance/accounts/${id}`,
        { deleted: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Account deleted");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Chart of Accounts"
        subtitle="Manage your accounts and categories"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Chart of Accounts" }
        ]}
      />
      <div className="flex justify-end mb-2">
        <Button onClick={() => navigate('/finance/add-bank-account')}>Add Account</Button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <Loader />
      ) : accounts.length === 0 ? (
        <EmptyState message="No accounts found." />
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Accounts</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Holder</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IFSC</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{a.bankName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{a.type}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{a.accountHolder}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{a.bankAccountNo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{a.ifsc}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{a.branchName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 capitalize">{a.status || 'Active'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Button variant="danger" onClick={() => deleteAccount(a._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}