import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';

const LoanDetails = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLoanDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/finance/loans/${id}`);
      setLoan(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!loan) {
    return <div>Loan not found</div>;
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={loan.loanNumber}
        subtitle={`Loan Details - ${loan.applicantName}`}
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Loans", to: "/finance/loans" },
          { label: "Details" }
        ]}
      />

      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          leftIcon={<FiArrowLeft />}
          onClick={() => window.history.back()}
        >
          Back to Loans
        </Button>
        <Button
          variant="outline"
          leftIcon={<FiEdit2 />}
          onClick={() => window.location.href = `/finance/loans/${id}/edit`}
        >
          Edit Loan
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Loan Information</h3>
            <div className="space-y-2">
              <p><strong>Loan Number:</strong> {loan.loanNumber}</p>
              <p><strong>Loan Type:</strong> {loan.loanType}</p>
              <p><strong>Loan Purpose:</strong> {loan.loanPurpose}</p>
              <p><strong>Loan Status:</strong> {loan.status}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Financial Details</h3>
            <div className="space-y-2">
              <p><strong>Amount:</strong> ₹{loan.amount}</p>
              <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
              <p><strong>Tenure:</strong> {loan.tenure}</p>
              <p><strong>Monthly Installment:</strong> ₹{loan.monthlyInstallment}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Applicant Information</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {loan.applicantName}</p>
            <p><strong>Email:</strong> {loan.applicantEmail}</p>
            <p><strong>Phone:</strong> {loan.applicantPhone}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Lender Information</h3>
          <div className="space-y-2">
            <p><strong>Lender:</strong> {loan.lender?.name}</p>
            <p><strong>Type:</strong> {loan.lender?.type}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Collateral Information</h3>
          <div className="space-y-2">
            <p><strong>Type:</strong> {loan.collateralType}</p>
            <p><strong>Value:</strong> ₹{loan.collateralValue}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h3>
          <div className="space-y-2">
            <p><strong>Disbursement Date:</strong> {loan.disbursementDate}</p>
            <p><strong>Next Payment Due:</strong> {loan.nextPaymentDue}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Documents</h3>
          <div className="space-y-2">
            {loan.documents?.map((doc, index) => (
              <div key={index} className="flex items-center space-x-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {doc.name}
                </a>
                <span className="text-gray-500">({doc.type})</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoanDetails;
