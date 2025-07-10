import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import { FiEdit2, FiArrowLeft, FiMail, FiPhone, FiMapPin, FiDatabase, FiDollarSign } from 'react-icons/fi';
import Loader from '../../components/ui/Loader';

const LenderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lender, setLender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    fetchLenderDetails();
    fetchLenderLoans();
    // eslint-disable-next-line
  }, [id]);

  const fetchLenderDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/finance/lenders/${id}`);
      setLender(response.data);
    } catch (err) {
      setError('Failed to fetch lender details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLenderLoans = async () => {
    try {
      const response = await axiosInstance.get(`/api/finance/loans`, { params: { lender: id } });
      setLoans(response.data);
    } catch (err) {
      setLoans([]);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader /></div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!lender) return <div>Lender not found</div>;

  // Summary cards
  const summaryCards = [
    { title: 'Total Loans', value: loans.length, icon: <FiDatabase className="h-6 w-6 text-blue-500" /> },
    { title: 'Total Amount', value: `₹${loans.reduce((sum, l) => sum + (l.amount || 0), 0).toLocaleString()}`, icon: <FiDollarSign className="h-6 w-6 text-green-500" /> },
    { title: 'Status', value: lender.status, icon: <FiDatabase className="h-6 w-6 text-purple-500" /> },
    { title: 'Type', value: lender.type, icon: <FiDatabase className="h-6 w-6 text-gray-500" /> },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={lender.name}
        subtitle={`Lender Details`}
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Lenders", to: "/finance/lenders" },
          { label: "Details" }
        ]}
      />
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          leftIcon={<FiArrowLeft />}
          onClick={() => navigate(-1)}
        >
          Back to Lenders
        </Button>
        <Button
          variant="outline"
          leftIcon={<FiEdit2 />}
          onClick={() => navigate(`/finance/lenders/add/${id}`)}
        >
          Edit Lender
        </Button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {summaryCards.map((card, idx) => (
          <Card key={idx} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </div>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Lender Information</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {lender.name}</p>
              <p><strong>Type:</strong> {lender.type}</p>
              <p><strong>Status:</strong> {lender.status}</p>
              <p><strong>Created At:</strong> {lender.createdAt ? new Date(lender.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
            <div className="space-y-2">
              <p><FiMail className="inline mr-1" /><strong>Email:</strong> {lender.email || '-'}</p>
              <p><FiPhone className="inline mr-1" /><strong>Phone:</strong> {lender.phone || '-'}</p>
              <p><FiMapPin className="inline mr-1" /><strong>Address:</strong> {lender.address || '-'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Related Loans</h3>
          {loans.length === 0 ? (
            <div className="text-gray-500">No loans found for this lender.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Loan Number</th>
                    <th className="px-4 py-2 text-left">Applicant</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan._id} className="border-b hover:bg-blue-50">
                      <td className="px-4 py-2">{loan.loanNumber}</td>
                      <td className="px-4 py-2">{loan.applicant?.name || '-'}</td>
                      <td className="px-4 py-2 text-right">₹{loan.amount?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          loan.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
                          loan.status === 'REPAYING' ? 'bg-purple-100 text-purple-800' :
                          loan.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/finance/loans/${loan._id}`)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default LenderDetails; 