import React from 'react';
import { useParams } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiFileText, FiCheck, FiX } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import PageHeading from '../../components/ui/PageHeading';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../../utils/axiosInstance';

const LoanAnalysis = () => {
  const { id } = useParams();
  const [loan, setLoan] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchLoanAnalysis();
  }, [id]);

  const fetchLoanAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/finance/loans/${id}/analysis`);
      setLoan(response.data);
    } catch (error) {
      setError('Failed to fetch loan analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Loan not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Loan Analysis"
        subtitle="Detailed analysis of loan performance and risk"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Loans", to: "/finance/loans" },
          { label: "Analysis" }
        ]}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Risk Assessment */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <div className="flex items-center">
              <span className={`px-4 py-2 rounded-full text-xl ${
                loan.riskRating === 'LOW' ? 'bg-green-100 text-green-800' :
                loan.riskRating === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {loan.riskRating}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{loan.riskDescription}</p>
            </div>
          </div>
        </Card>

        {/* Payment Performance */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Payment Performance</h3>
            <div className="flex items-center">
              <FiTrendingUp className="text-3xl text-green-500 mr-2" />
              <span className="text-2xl font-semibold">{loan.paymentScore}%</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{loan.paymentHistory.length} payments made</p>
              <p className="text-sm text-gray-600">{loan.latePayments} late payments</p>
            </div>
          </div>
        </Card>

        {/* Document Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Document Status</h3>
            <div className="space-y-2">
              {Object.entries(loan.documents).map(([category, status]) => (
                <div key={category} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    status === 'APPROVED' ? 'bg-green-500' :
                    status === 'PENDING' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm">{category.replace('_', ' ')}: {status}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Collateral Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Collateral Status</h3>
            <div className="flex items-center">
              <FiAlertTriangle className="text-3xl text-yellow-500 mr-2" />
              <span className="text-2xl font-semibold">{loan.collateralValue ? 'Secure' : 'Not Secure'}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{loan.collateralValue ? `Value: ₹${loan.collateralValue.toLocaleString()}` : 'No collateral provided'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History Chart */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loan.paymentHistory}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Financial Metrics */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Financial Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-600">Loan Amount</h4>
              <p className="text-xl font-semibold">₹{loan.amount.toLocaleString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Interest Rate</h4>
              <p className="text-xl font-semibold">{loan.interestRate}%</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Tenure</h4>
              <p className="text-xl font-semibold">{loan.tenure} months</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-600">Monthly Installment</h4>
              <p className="text-xl font-semibold">₹{loan.monthlyInstallment.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="text-blue-600 hover:text-blue-800"
        >
          <FiFileText className="mr-2" /> Print Report
        </Button>
        {loan.status === 'REPAYING' && (
          <Button
            variant="outline"
            onClick={() => {
              // Implement early repayment logic
            }}
            className="text-green-600 hover:text-green-800"
          >
            <FiCheck className="mr-2" /> Early Repayment
          </Button>
        )}
        {loan.status === 'DEFAULTED' && (
          <Button
            variant="outline"
            onClick={() => {
              // Implement recovery action
            }}
            className="text-red-600 hover:text-red-800"
          >
            <FiX className="mr-2" /> Recovery Action
          </Button>
        )}
      </div>
    </div>
  );
};

export default LoanAnalysis;
