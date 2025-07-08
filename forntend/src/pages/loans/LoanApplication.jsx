import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFileText, FiUpload, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeading from '../../components/ui/PageHeading';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import { MoneyInput } from '../../components/ui/MoneyInput';
import Loader from '../../components/ui/Loader';
import axiosInstance from '../../utils/axiosInstance';

const LoanApplication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loanNumber: '',
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    loanType: '',
    amount: '',
    interestRate: '',
    tenure: '',
    disbursementDate: '',
    nextPaymentDue: '',
    status: '',
    bank: '',
    lender: '',
    loanPurpose: '',
    collateralType: '',
    collateralValue: '',
    monthlyInstallment: '',
    documents: []
  });
  const [banks, setBanks] = useState([]);
  const [lenders, setLenders] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingLenders, setLoadingLenders] = useState(true);

  React.useEffect(() => {
    fetchBanks();
    fetchLenders();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await axiosInstance.get('/api/finance/bank-accounts');
      // Get bank accounts from the response
      const bankAccounts = response.data.bankAccounts || [];
      setBanks(bankAccounts.map((bank, index) => ({
        key: bank._id || `bank-${index}`,
        value: bank._id,
        // Create a more descriptive label using bank name and account number
        label: `${bank.bankName} (${bank.bankAccountNo}) - ${bank.accountHolder}`
      })));
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks([]);
    } finally {
      setLoadingBanks(false);
    }
  };

  const fetchLenders = async () => {
    try {
      const response = await axiosInstance.get('/api/finance/lenders');
      // Access lenders array from response.data.lenders
      setLenders(response.data.lenders.map(lender => ({
        key: lender._id,
        value: lender._id,
        label: `${lender.name} - ${lender.type}`
      })));
    } catch (error) {
      console.error('Error fetching lenders:', error);
      setLenders([]);
    } finally {
      setLoadingLenders(false);
    }
  };
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, {
            name: file.name,
            url: reader.result
          }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/api/finance/loans', formData);
      navigate('/finance/loans');
    } catch (error) {
      setError('Failed to submit loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add New Loan"
        subtitle="Enter loan details to track and manage company loans"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Loans", to: "/finance/loans" },
          { label: "Add Loan" }
        ]}
      />

      <Card>
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-md">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Loan Number</h3>
                  <Input
                    name="loanNumber"
                    value={formData.loanNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Applicant Name</h3>
                  <Input
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Applicant Email</h3>
                  <Input
                    type="email"
                    name="applicantEmail"
                    value={formData.applicantEmail}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Applicant Phone</h3>
                  <Input
                    type="tel"
                    name="applicantPhone"
                    value={formData.applicantPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Bank</h3>
                  <Select
                    key="bank-select"
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    options={banks}
                    placeholder="Select bank"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Loan Type</h3>
                  <Select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select loan type' },
                      { value: 'PERSONAL', label: 'Personal Loan' },
                      { value: 'BUSINESS', label: 'Business Loan' },
                      { value: 'MORTGAGE', label: 'Mortgage Loan' },
                      { value: 'EDUCATION', label: 'Education Loan' },
                      { value: 'VEHICLE', label: 'Vehicle Loan' }
                    ]}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Lender</h3>
                  <Select
                    name="lender"
                    value={formData.lender}
                    onChange={handleInputChange}
                    options={lenders}
                    placeholder="Select lender"
                    required
                  />
                </div>
              </div>

              {formData.lender && (
                <div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Lender Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name</span>
                        <span className="text-sm font-medium">{lenders.find(l => l.value === formData.lender)?.label.split(' - ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type</span>
                        <span className="text-sm font-medium">{lenders.find(l => l.value === formData.lender)?.label.split(' - ')[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Loan Amount</h3>
                  <MoneyInput
                    value={formData.amount}
                    onChange={handleInputChange}
                    prefix="₹"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Interest Rate</h3>
                  <Input
                    type="number"
                    step="0.1"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Loan Tenure</h3>
                  <Select
                    name="tenure"
                    value={formData.tenure}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select tenure' },
                      { value: '3', label: '3 months' },
                      { value: '6', label: '6 months' },
                      { value: '9', label: '9 months' },
                      { value: '12', label: '12 months (1 year)' },
                      { value: '18', label: '18 months (1.5 years)' },
                      { value: '24', label: '24 months (2 years)' },
                      { value: '36', label: '36 months (3 years)' },
                      { value: '48', label: '48 months (4 years)' },
                      { value: '60', label: '60 months (5 years)' },
                      { value: '72', label: '72 months (6 years)' },
                      { value: '84', label: '84 months (7 years)' },
                      { value: '96', label: '96 months (8 years)' },
                      { value: '120', label: '120 months (10 years)' }
                    ]}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Monthly Installment</h3>
                  <MoneyInput
                    value={formData.monthlyInstallment}
                    onChange={handleInputChange}
                    prefix="₹"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Disbursement Date</h3>
                  <Input
                    type="date"
                    name="disbursementDate"
                    value={formData.disbursementDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Next Payment Due</h3>
                  <Input
                    type="date"
                    name="nextPaymentDue"
                    value={formData.nextPaymentDue}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Loan Status</h3>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select status' },
                      { value: 'APPROVED', label: 'Approved' },
                      { value: 'DISBURSED', label: 'Disbursed' },
                      { value: 'REPAYING', label: 'Repaying' },
                      { value: 'DEFAULTED', label: 'Defaulted' },
                      { value: 'CLOSED', label: 'Closed' }
                    ]}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>

              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                </div>
              )}

              {formData.documents.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <FiFileText className="text-gray-400" />
                        <span className="text-sm text-gray-600">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
              >
                Add Loan
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default LoanApplication;
