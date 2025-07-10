import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiArrowLeft, FiEdit, FiTrash2, FiDownload, FiDollarSign, FiCalendar, FiCheckCircle, FiFileText } from 'react-icons/fi';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [bankAccountDetails, setBankAccountDetails] = useState(null);
  const [transaction, setTransaction] = useState(null);

  // Fetch categories for ID->name mapping
  useEffect(() => {
    axiosInstance.get('/api/finance/expenses/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/finance/expenses/${id}`);
        setExpense(res.data);
        // Determine the bank account ID (top-level or in details)
        let bankAccountId = res.data.bankAccount;
        if (!bankAccountId && res.data.details && res.data.details.bankAccount) {
          bankAccountId = res.data.details.bankAccount;
        }
        // If bankAccount is just an ID, fetch its details
        if (
          res.data.paymentMethod === 'bank_transfer' &&
          bankAccountId &&
          typeof bankAccountId === 'string'
        ) {
          const bankRes = await axiosInstance.get(`/api/finance/bank-accounts/${bankAccountId}`);
          setBankAccountDetails(bankRes.data);
        } else if (
          res.data.paymentMethod === 'bank_transfer' &&
          bankAccountId &&
          typeof bankAccountId === 'object'
        ) {
          setBankAccountDetails(bankAccountId);
        } else {
          setBankAccountDetails(null);
        }
        // Fetch related transaction
        if (res.data.paymentMethod === 'bank_transfer' && bankAccountId) {
          const txnRes = await axiosInstance.get(`/api/finance/bank-accounts/${bankAccountId}/ledger`);
          // Find the transaction for this expense by amount and date
          const txn = (txnRes.data || []).find(t => t.amount === res.data.amount && new Date(t.date).toISOString().slice(0,10) === new Date(res.data.date).toISOString().slice(0,10));
          setTransaction(txn || null);
        } else {
          setTransaction(null);
        }
      } catch (err) {
        toast.error('Failed to fetch expense details');
        navigate('/finance/expenses');
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/finance/expenses/${id}`);
      toast.success('Expense deleted successfully');
      navigate('/finance/expenses');
    } catch (err) {
      toast.error('Failed to delete expense');
    } finally {
      setDeleteModalOpen(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  if (!expense) return <div className="flex justify-center items-center h-64">Expense not found</div>;

  // Helper to get category name
  const getCategoryName = (cat) => {
    if (!cat) return 'Uncategorized';
    if (typeof cat === 'object' && cat.name) return cat.name;
    // If cat is an ID, look up in categories
    const found = categories.find(c => c._id === cat);
    return found ? found.name : (typeof cat === 'string' ? cat : 'Uncategorized');
  };

  // Summary cards
  const summaryCards = [
    { title: 'Amount', value: `₹${expense.amount?.toLocaleString('en-IN')}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Status', value: expense.status?.charAt(0).toUpperCase() + expense.status?.slice(1), icon: <FiCheckCircle className={`h-6 w-6 ${expense.status === 'approved' ? 'text-green-500' : expense.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`} /> },
    { title: 'Date', value: expense.date ? format(new Date(expense.date), 'dd MMM yyyy') : '-', icon: <FiCalendar className="h-6 w-6 text-blue-500" /> },
    { title: 'Category', value: getCategoryName(expense.category), icon: <FiFileText className="h-6 w-6 text-purple-500" /> },
  ];

  return (
    <div className="space-y-6 px-2 sm:px-4">
      <PageHeading
        title={expense?.description || 'Expense Details'}
        subtitle="View and manage expense details"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Expenses", to: "/finance/expenses" },
          { label: expense?.description || "Expense Details" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </div>
      {/* Actions Bar */}
      <div className="flex gap-2 justify-end mb-4">
          <Button
            key="edit"
            variant="outline"
            onClick={() => navigate(`/finance/expenses/${id}/edit`)}
          >
            <FiEdit className="mr-2" /> Edit
        </Button>
          <Button
            key="delete"
            variant="outline"
            color="red"
            onClick={() => setDeleteModalOpen(true)}
          >
            <FiTrash2 className="mr-2" /> Delete
        </Button>
          <Button
            key="export"
            variant="outline"
            onClick={() => toast.info('Export feature coming soon!')}
          >
            <FiDownload className="mr-2" /> Export
          </Button>
      </div>
      {/* Main Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Expense Details</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="text-lg">{format(new Date(expense.date), 'dd MMM yyyy')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="text-lg">{getCategoryName(expense.category)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-2xl font-bold text-red-600">₹{expense.amount.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <div className={`px-3 py-1 rounded-full text-sm ${
                expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-lg">{expense.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
              <p className="text-lg">{expense.paymentMethod || 'N/A'}</p>
            </div>
            {expense.referenceNo && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Reference No</h3>
                <p className="text-lg">{expense.referenceNo}</p>
              </div>
            )}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="text-lg">{expense.notes || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Bank Account Details */}
      {expense.paymentMethod === 'bank_transfer' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Bank Account Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bank Name</h3>
              <p className="text-lg">{bankAccountDetails?.bankName || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Number</h3>
              <p className="text-lg">{bankAccountDetails?.bankAccountNo || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Holder</h3>
              <p className="text-lg">{bankAccountDetails?.accountHolder || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Branch</h3>
              <p className="text-lg">{bankAccountDetails?.branchName || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">IFSC</h3>
              <p className="text-lg">{bankAccountDetails?.ifsc || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
              <p className="text-lg">₹{bankAccountDetails?.currentBalance?.toLocaleString('en-IN') || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="text-lg">{bankAccountDetails?.status || '-'}</p>
            </div>
            {(!bankAccountDetails && (typeof expense.bankAccount === 'string' || (expense.details && typeof expense.details.bankAccount === 'string'))) && (
              <div className="md:col-span-2 text-red-500">
                Bank details not found for ID: {expense.bankAccount || (expense.details && expense.details.bankAccount)}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Bank Transaction Details */}
      {transaction && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mt-4">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Bank Transaction</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Transaction Date</h3>
              <p className="text-lg">{transaction.date ? new Date(transaction.date).toLocaleDateString('en-IN') : '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-lg">₹{transaction.amount?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Narration</h3>
              <p className="text-lg">{transaction.narration || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Balance After</h3>
              <p className="text-lg">₹{transaction.balance?.toLocaleString('en-IN') || '-'}</p>
            </div>
          </div>
        </div>
      )}
      {/* Receipt/Document Section */}
      {expense.receipt && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-800">Receipt</h3>
          </div>
          <div className="p-6">
            {expense.receipt.endsWith('.pdf') ? (
              <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View PDF Receipt</a>
            ) : (
              <img src={expense.receipt} alt="Receipt" className="max-h-64 rounded border" />
            )}
          </div>
        </div>
      )}
      {/* Delete Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Delete Expense</h3>
          <p>Are you sure you want to delete this expense?</p>
          <div className="flex gap-2 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
