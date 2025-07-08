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

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/finance/expenses/${id}`);
        setExpense(res.data);
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
      await axios.delete(`/api/finance/expenses/${id}`);
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

  // Summary cards
  const summaryCards = [
    { title: 'Amount', value: `₹${expense.amount?.toLocaleString('en-IN')}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Status', value: expense.status?.charAt(0).toUpperCase() + expense.status?.slice(1), icon: <FiCheckCircle className={`h-6 w-6 ${expense.status === 'approved' ? 'text-green-500' : expense.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`} /> },
    { title: 'Date', value: expense.date ? format(new Date(expense.date), 'dd MMM yyyy') : '-', icon: <FiCalendar className="h-6 w-6 text-blue-500" /> },
    { title: 'Category', value: expense.category?.name || 'Uncategorized', icon: <FiFileText className="h-6 w-6 text-purple-500" /> },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{expense.description}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="text-lg">{format(new Date(expense.date), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-lg">{expense.category?.name || 'Uncategorized'}</p>
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
            </div>
          </div>
          {/* Vendor Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Vendor Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vendor Name</h3>
                <p className="text-lg">{expense.vendor?.name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">GST Number</h3>
                <p className="text-lg">{expense.vendor?.gstNo || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="text-lg">{expense.vendor?.phone || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-lg">{expense.vendor?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                <p className="text-lg">{expense.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Reference</h3>
                <p className="text-lg">{expense.paymentRef || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bill Number</h3>
                <p className="text-lg">{expense.billNumber || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bill Date</h3>
                <p className="text-lg">{expense.billDate ? format(new Date(expense.billDate), 'dd MMM yyyy') : 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Remarks</h3>
                <p className="text-lg">{expense.remarks || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      {/* Documents Section */}
      <Card>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Documents</h3>
          {expense.documents?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expense.documents.map((doc, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-600">{doc.type}</p>
                  <Button variant="outline" onClick={() => window.open(doc.url, '_blank')}>
                    View Document
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No documents attached</p>
          )}
        </div>
      </Card>
      {/* Audit Trail */}
      <Card>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-4">Audit Trail</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Created By</h4>
              <p className="text-sm">{expense.createdBy?.name || 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium">Created At</h4>
              <p className="text-sm">{expense.createdAt ? format(new Date(expense.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}</p>
            </div>
            <div>
              <h4 className="font-medium">Last Updated</h4>
              <p className="text-sm">{expense.updatedAt ? format(new Date(expense.updatedAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}</p>
            </div>
          </div>
        </div>
      </Card>
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
