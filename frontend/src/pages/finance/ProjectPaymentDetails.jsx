import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import axios from '../../utils/axios';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';

export default function ProjectPaymentDetails() {
  const { id } = useParams(); // paymentId
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/finance/projects/payments/${id}`)
      .then(res => setPayment(res.data))
      .catch(() => setError('Failed to load payment details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!payment) return <div className="text-gray-500 p-4">No payment found.</div>;

  // Summary cards
  const summaryCards = [
    { title: 'Amount', value: `₹${payment.amount?.toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Payment Date', value: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : '-', icon: <FiCalendar className="h-6 w-6 text-yellow-500" /> },
    { title: 'Status', value: 'Received', icon: <FiCheckCircle className="h-6 w-6 text-blue-500" /> },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={`Project Payment Details`}
        subtitle={`Payment for Project: ${payment.project?.name || ''}`}
        breadcrumbs={[
          { label: 'Projects', to: '/finance/projects' },
          { label: 'Project Details', to: `/finance/projects/${payment.project?._id}` },
          { label: 'Payment Details' }
        ]}
        actions={<Button icon={<FiArrowLeft />} variant="outline" onClick={() => navigate(-1)}>Back</Button>}
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard title="Amount" value={`₹${payment.amount?.toLocaleString()}`} icon={<FiDollarSign className="h-6 w-6 text-green-500" />} valueColor="text-green-600" />
        <StatCard title="Payment Date" value={payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : '-'} icon={<FiCalendar className="h-6 w-6 text-yellow-500" />} />
        <StatCard title="Status" value="Received" icon={<FiCheckCircle className="h-6 w-6 text-blue-500" />} valueColor="text-blue-600" />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><strong>Project:</strong> <Link to={`/finance/projects/${payment.project?._id}`} className="text-blue-600 underline">{payment.project?.name}</Link></div>
          <div><strong>Client:</strong> {payment.project?.client?.name || '-'}</div>
          <div><strong>Payment Method:</strong> {payment.paymentMethod}</div>
          <div><strong>Reference Number:</strong> {payment.referenceNumber || '-'}</div>
          <div><strong>Bank Account:</strong> {payment.bankAccountId?.bankName ? `${payment.bankAccountId.bankName} (${payment.bankAccountId.accountNumber})` : '-'}</div>
          <div><strong>Notes:</strong> {payment.notes || '-'}</div>
          <div><strong>Created At:</strong> {new Date(payment.createdAt).toLocaleString()}</div>
          <div><strong>Updated At:</strong> {new Date(payment.updatedAt).toLocaleString()}</div>
        </div>
      </div>
      {payment.transaction && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Transaction Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><strong>Transaction ID:</strong> {payment.transaction._id}</div>
            <div><strong>Amount:</strong> ₹{payment.transaction.amount?.toLocaleString()}</div>
            <div><strong>Date:</strong> {payment.transaction.date ? new Date(payment.transaction.date).toLocaleDateString('en-IN') : '-'}</div>
            <div><strong>Narration:</strong> {payment.transaction.narration || '-'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 