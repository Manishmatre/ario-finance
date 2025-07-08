import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Loader from '../../components/ui/Loader';
import PageHeading from '../../components/ui/PageHeading';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const BankAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    type: '',
    accountHolder: '',
    bankAccountNo: '',
    ifsc: '',
    branchName: '',
    currentBalance: '',
    status: 'active'
  });

  const fetchAccounts = async () => {
    try {
      const response = await axiosInstance.get('/api/finance/bank-accounts');
      setAccounts(response.data.bankAccounts);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/finance/bank-accounts', formData);
      setShowAddForm(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error adding bank account:', error);
    }
  };

  const handleEdit = async (accountId) => {
    try {
      const response = await axiosInstance.get(`/api/finance/bank-accounts/${accountId}`);
      setFormData(response.data);
      setShowAddForm(true);
    } catch (error) {
      console.error('Error fetching bank account:', error);
    }
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await axiosInstance.delete(`/api/finance/bank-accounts/${accountId}`);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting bank account:', error);
      }
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Bank Accounts"
        subtitle="Manage your company's bank accounts"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Bank Accounts" }
        ]}
      />

      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddForm(true)}
          leftIcon={<FiPlus />}
        >
          Add New Account
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Bank Name</h3>
                  <Input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Account Type</h3>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select type' },
                      { value: 'CURRENT', label: 'Current' },
                      { value: 'SAVINGS', label: 'Savings' },
                      { value: 'FIXED', label: 'Fixed Deposit' }
                    ]}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Account Holder</h3>
                  <Input
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Account Number</h3>
                  <Input
                    name="bankAccountNo"
                    value={formData.bankAccountNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">IFSC Code</h3>
                  <Input
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Branch Name</h3>
                  <Input
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Current Balance</h3>
                  <Input
                    name="currentBalance"
                    value={formData.currentBalance}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Status</h3>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                    ]}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
              >
                {formData._id ? 'Update Account' : 'Add Account'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {accounts.map(account => (
            <Card key={account._id}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{account.bankName}</h3>
                  <p className="text-sm text-gray-600">{account.accountHolder}</p>
                  <p className="text-sm text-gray-600">{account.bankAccountNo}</p>
                  <p className="text-sm text-gray-600">Balance: ₹{account.currentBalance}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    leftIcon={<FiEdit2 />}
                    onClick={() => handleEdit(account._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    leftIcon={<FiTrash2 />}
                    onClick={() => handleDelete(account._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
