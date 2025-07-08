import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import TextArea from '../../components/ui/TextArea';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';

// Mock data for categories
const mockCategories = [
  { _id: '1', name: 'Supplies' },
  { _id: '2', name: 'Travel' },
  { _id: '3', name: 'Entertainment' },
  { _id: '4', name: 'Meals' },
  { _id: '5', name: 'Office Rent' },
  { _id: '6', name: 'Utilities' },
  { _id: '7', name: 'Internet' },
  { _id: '8', name: 'Telephone' },
  { _id: '9', name: 'Stationery' },
  { _id: '10', name: 'Marketing' },
  { _id: '11', name: 'Training' },
  { _id: '12', name: 'Insurance' },
  { _id: '13', name: 'Repairs & Maintenance' },
  { _id: '14', name: 'Subscriptions' },
  { _id: '15', name: 'Bank Charges' },
  { _id: '16', name: 'Legal Fees' },
  { _id: '17', name: 'Consulting' },
  { _id: '18', name: 'Salaries' },
  { _id: '19', name: 'Bonuses' },
  { _id: '20', name: 'Taxes' },
  { _id: '21', name: 'Fuel' },
  { _id: '22', name: 'Courier' },
  { _id: '23', name: 'Gifts' },
  { _id: '24', name: 'Medical' },
  { _id: '25', name: 'Other' },
];

export default function ExpenseForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(mockCategories);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      category: '',
      description: '',
      paymentMethod: 'cash',
      referenceNo: '',
      notes: '',
      status: 'pending'
    }
  });

  // Fetch expense data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchExpense = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(`/api/finance/expenses/${id}`);
          const expense = response.data;
          
          // Set form values
          Object.keys(expense).forEach(key => {
            if (expense[key] !== null && expense[key] !== undefined) {
              setValue(key, expense[key]);
            }
          });

          // Set receipt preview if exists
          if (expense.receipt) {
            setReceiptPreview(expense.receipt);
          }
        } catch (err) {
          console.error('Error fetching expense:', err);
          toast.error('Failed to load expense details');
          navigate('/finance/expenses');
        } finally {
          setLoading(false);
        }
      };
      fetchExpense();
    }
  }, [id, isEditMode, navigate, setValue]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type (allow images and PDFs)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload an image (JPEG, PNG, GIF) or PDF file');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setReceiptPreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setReceiptPreview(null);
    // Clear the file input
    document.getElementById('receipt').value = '';
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      // List of standard fields expected by backend
      const standardFields = [
        'date', 'amount', 'category', 'description', 'paymentMethod', 'referenceNo', 'receipt', 'status', 'approvedBy', 'approvedAt', 'notes'
      ];
      const details = {};
      Object.keys(data).forEach(key => {
        if (standardFields.includes(key)) {
          formData.append(key, data[key]);
        } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          details[key] = data[key];
        }
      });
      // Add details as JSON string if not empty
      if (Object.keys(details).length > 0) {
        formData.append('details', JSON.stringify(details));
      }
      // Append file if selected
      if (file) {
        formData.append('receipt', file);
      }
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/api/finance/expenses/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Expense updated successfully');
      } else {
        response = await axiosInstance.post('/api/finance/expenses', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Expense created successfully');
      }
      navigate('/finance/expenses');
    } catch (err) {
      console.error('Error saving expense:', err);
      toast.error(err.response?.data?.error || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEditMode ? 'Edit Expense' : 'Add New Expense'}
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Expenses', to: '/finance/expenses' },
          { label: isEditMode ? 'Edit Expense' : 'Add New Expense' },
        ]}
        actions={[
          <Button
            key="back"
            variant="outline"
            as={Link}
            to="/finance/expenses"
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to Expenses
          </Button>
        ]}
      />
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Expense Details</h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Expense Information */}
            <div>
              <h4 className="text-base font-semibold text-blue-900 mb-3">Expense Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <Input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    error={errors.date?.message}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' }
                    })}
                    error={errors.amount?.message}
                    disabled={loading}
                    leftAddon="₹"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select
                    options={categories.map(cat => ({
                      value: cat._id,
                      label: cat.name
                    }))}
                    {...register('category', { required: 'Category is required' })}
                    error={errors.category?.message}
                    disabled={loading || categories.length === 0}
                    placeholder={categories.length === 0 ? 'No categories available' : 'Select a category'}
                    onChange={e => {
                      setSelectedCategory(categories.find(cat => cat._id === e.target.value)?.name || '');
                      // Call react-hook-form's onChange if present
                      if (typeof register('category').onChange === 'function') {
                        register('category').onChange(e);
                      }
                    }}
                  />
                </div>
                {/* Conditional fields based on selected category */}
                {selectedCategory === 'Supplies' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                      <Input {...register('vendor', { required: 'Vendor is required' })} error={errors.vendor?.message} disabled={loading} placeholder="Enter vendor name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <Input {...register('itemName', { required: 'Item Name is required' })} error={errors.itemName?.message} disabled={loading} placeholder="Enter item name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <Input type="number" {...register('quantity', { required: 'Quantity is required' })} error={errors.quantity?.message} disabled={loading} placeholder="Enter quantity" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Travel' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Travel Mode</label>
                      <Input {...register('travelMode', { required: 'Travel Mode is required' })} error={errors.travelMode?.message} disabled={loading} placeholder="e.g. Flight, Train, Taxi" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                      <Input {...register('destination', { required: 'Destination is required' })} error={errors.destination?.message} disabled={loading} placeholder="Enter destination" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <Input {...register('purpose', { required: 'Purpose is required' })} error={errors.purpose?.message} disabled={loading} placeholder="Enter purpose" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <Input type="date" {...register('startDate', { required: 'Start Date is required' })} error={errors.startDate?.message} disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <Input type="date" {...register('endDate', { required: 'End Date is required' })} error={errors.endDate?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Entertainment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                      <Input {...register('eventName', { required: 'Event Name is required' })} error={errors.eventName?.message} disabled={loading} placeholder="Enter event name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <Input {...register('location', { required: 'Location is required' })} error={errors.location?.message} disabled={loading} placeholder="Enter location" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
                      <Input type="number" {...register('numberOfAttendees', { required: 'Number of Attendees is required' })} error={errors.numberOfAttendees?.message} disabled={loading} placeholder="Enter number of attendees" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Meals' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of People</label>
                      <Input type="number" {...register('numberOfPeople', { required: 'Number of People is required' })} error={errors.numberOfPeople?.message} disabled={loading} placeholder="Enter number of people" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                      <Input {...register('restaurantName', { required: 'Restaurant Name is required' })} error={errors.restaurantName?.message} disabled={loading} placeholder="Enter restaurant name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                      <select className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white" {...register('mealType', { required: 'Meal Type is required' })} disabled={loading}>
                        <option value="">Select meal type</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                      </select>
                      {errors.mealType && <div className="text-red-500 text-xs mt-1">{errors.mealType.message}</div>}
                    </div>
                  </>
                )}
                {selectedCategory === 'Office Rent' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                      <Input type="month" {...register('rentMonth', { required: 'Month is required' })} error={errors.rentMonth?.message} disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name</label>
                      <Input {...register('landlordName', { required: 'Landlord Name is required' })} error={errors.landlordName?.message} disabled={loading} placeholder="Enter landlord name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lease Number</label>
                      <Input {...register('leaseNumber', { required: 'Lease Number is required' })} error={errors.leaseNumber?.message} disabled={loading} placeholder="Enter lease number" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Utilities' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Utility Type</label>
                      <Input {...register('utilityType', { required: 'Utility Type is required' })} error={errors.utilityType?.message} disabled={loading} placeholder="e.g. Electricity, Water, Gas" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <Input {...register('utilityAccountNumber', { required: 'Account Number is required' })} error={errors.utilityAccountNumber?.message} disabled={loading} placeholder="Enter account number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                      <Input type="month" {...register('utilityBillingPeriod', { required: 'Billing Period is required' })} error={errors.utilityBillingPeriod?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Internet' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                      <Input {...register('internetProvider', { required: 'Provider is required' })} error={errors.internetProvider?.message} disabled={loading} placeholder="Enter provider name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <Input {...register('internetAccountNumber', { required: 'Account Number is required' })} error={errors.internetAccountNumber?.message} disabled={loading} placeholder="Enter account number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                      <Input type="month" {...register('internetBillingPeriod', { required: 'Billing Period is required' })} error={errors.internetBillingPeriod?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Telephone' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                      <Input {...register('telephoneProvider', { required: 'Provider is required' })} error={errors.telephoneProvider?.message} disabled={loading} placeholder="Enter provider name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <Input {...register('telephoneAccountNumber', { required: 'Account Number is required' })} error={errors.telephoneAccountNumber?.message} disabled={loading} placeholder="Enter account number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                      <Input type="month" {...register('telephoneBillingPeriod', { required: 'Billing Period is required' })} error={errors.telephoneBillingPeriod?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Stationery' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                      <Input {...register('stationeryVendor', { required: 'Vendor is required' })} error={errors.stationeryVendor?.message} disabled={loading} placeholder="Enter vendor name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                      <Input {...register('stationeryItemName', { required: 'Item Name is required' })} error={errors.stationeryItemName?.message} disabled={loading} placeholder="Enter item name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <Input type="number" {...register('stationeryQuantity', { required: 'Quantity is required' })} error={errors.stationeryQuantity?.message} disabled={loading} placeholder="Enter quantity" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Marketing' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                      <Input {...register('campaignName', { required: 'Campaign Name is required' })} error={errors.campaignName?.message} disabled={loading} placeholder="Enter campaign name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                      <Input {...register('platform', { required: 'Platform is required' })} error={errors.platform?.message} disabled={loading} placeholder="Enter platform" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                      <Input type="number" {...register('budget', { required: 'Budget is required' })} error={errors.budget?.message} disabled={loading} placeholder="Enter budget" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Training' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Training Provider</label>
                      <Input {...register('trainingProvider', { required: 'Training Provider is required' })} error={errors.trainingProvider?.message} disabled={loading} placeholder="Enter training provider" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                      <Input {...register('courseName', { required: 'Course Name is required' })} error={errors.courseName?.message} disabled={loading} placeholder="Enter course name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees</label>
                      <Input type="number" {...register('trainingAttendees', { required: 'Number of Attendees is required' })} error={errors.trainingAttendees?.message} disabled={loading} placeholder="Enter number of attendees" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Insurance' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                      <Input {...register('policyNumber', { required: 'Policy Number is required' })} error={errors.policyNumber?.message} disabled={loading} placeholder="Enter policy number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                      <Input {...register('insuranceProvider', { required: 'Provider is required' })} error={errors.insuranceProvider?.message} disabled={loading} placeholder="Enter provider name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Period</label>
                      <Input type="month" {...register('coveragePeriod', { required: 'Coverage Period is required' })} error={errors.coveragePeriod?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Repairs & Maintenance' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
                      <Input {...register('asset', { required: 'Asset is required' })} error={errors.asset?.message} disabled={loading} placeholder="Enter asset name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
                      <Input {...register('serviceProvider', { required: 'Service Provider is required' })} error={errors.serviceProvider?.message} disabled={loading} placeholder="Enter service provider" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Service</label>
                      <Input type="date" {...register('serviceDate', { required: 'Date of Service is required' })} error={errors.serviceDate?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Subscriptions' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Name</label>
                      <Input {...register('subscriptionName', { required: 'Subscription Name is required' })} error={errors.subscriptionName?.message} disabled={loading} placeholder="Enter subscription name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                      <Input {...register('subscriptionProvider', { required: 'Provider is required' })} error={errors.subscriptionProvider?.message} disabled={loading} placeholder="Enter provider name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Date</label>
                      <Input type="date" {...register('renewalDate', { required: 'Renewal Date is required' })} error={errors.renewalDate?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Bank Charges' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <Input {...register('bankName', { required: 'Bank Name is required' })} error={errors.bankName?.message} disabled={loading} placeholder="Enter bank name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Charge Type</label>
                      <Input {...register('chargeType', { required: 'Charge Type is required' })} error={errors.chargeType?.message} disabled={loading} placeholder="Enter charge type" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date</label>
                      <Input type="date" {...register('transactionDate', { required: 'Transaction Date is required' })} error={errors.transactionDate?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Legal Fees' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Case Reference</label>
                      <Input {...register('caseReference', { required: 'Case Reference is required' })} error={errors.caseReference?.message} disabled={loading} placeholder="Enter case reference" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lawyer Name</label>
                      <Input {...register('lawyerName', { required: 'Lawyer Name is required' })} error={errors.lawyerName?.message} disabled={loading} placeholder="Enter lawyer name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
                      <Input {...register('courtName', { required: 'Court Name is required' })} error={errors.courtName?.message} disabled={loading} placeholder="Enter court name" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Consulting' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultant Name</label>
                      <Input {...register('consultantName', { required: 'Consultant Name is required' })} error={errors.consultantName?.message} disabled={loading} placeholder="Enter consultant name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Provided</label>
                      <Input {...register('serviceProvided', { required: 'Service Provided is required' })} error={errors.serviceProvided?.message} disabled={loading} placeholder="Enter service provided" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <Input {...register('duration', { required: 'Duration is required' })} error={errors.duration?.message} disabled={loading} placeholder="Enter duration" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Salaries' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                      <Input {...register('employeeName', { required: 'Employee Name is required' })} error={errors.employeeName?.message} disabled={loading} placeholder="Enter employee name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                      <Input {...register('employeeId', { required: 'Employee ID is required' })} error={errors.employeeId?.message} disabled={loading} placeholder="Enter employee ID" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
                      <Input type="month" {...register('payPeriod', { required: 'Pay Period is required' })} error={errors.payPeriod?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Bonuses' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                      <Input {...register('bonusEmployeeName', { required: 'Employee Name is required' })} error={errors.bonusEmployeeName?.message} disabled={loading} placeholder="Enter employee name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                      <Input {...register('bonusEmployeeId', { required: 'Employee ID is required' })} error={errors.bonusEmployeeId?.message} disabled={loading} placeholder="Enter employee ID" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Reason</label>
                      <Input {...register('bonusReason', { required: 'Bonus Reason is required' })} error={errors.bonusReason?.message} disabled={loading} placeholder="Enter bonus reason" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Taxes' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                      <Input {...register('taxType', { required: 'Tax Type is required' })} error={errors.taxType?.message} disabled={loading} placeholder="e.g. GST, VAT, Income Tax" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                      <Input type="month" {...register('taxPeriod', { required: 'Period is required' })} error={errors.taxPeriod?.message} disabled={loading} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                      <Input {...register('taxReferenceNumber', { required: 'Reference Number is required' })} error={errors.taxReferenceNumber?.message} disabled={loading} placeholder="Enter reference number" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Fuel' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                      <Input {...register('vehicle', { required: 'Vehicle is required' })} error={errors.vehicle?.message} disabled={loading} placeholder="Enter vehicle name/number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <Input {...register('fuelType', { required: 'Fuel Type is required' })} error={errors.fuelType?.message} disabled={loading} placeholder="Enter fuel type" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading</label>
                      <Input type="number" {...register('odometerReading', { required: 'Odometer Reading is required' })} error={errors.odometerReading?.message} disabled={loading} placeholder="Enter odometer reading" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Courier' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Courier Company</label>
                      <Input {...register('courierCompany', { required: 'Courier Company is required' })} error={errors.courierCompany?.message} disabled={loading} placeholder="Enter courier company" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                      <Input {...register('trackingNumber', { required: 'Tracking Number is required' })} error={errors.trackingNumber?.message} disabled={loading} placeholder="Enter tracking number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                      <Input type="date" {...register('deliveryDate', { required: 'Delivery Date is required' })} error={errors.deliveryDate?.message} disabled={loading} />
                    </div>
                  </>
                )}
                {selectedCategory === 'Gifts' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                      <Input {...register('recipient', { required: 'Recipient is required' })} error={errors.recipient?.message} disabled={loading} placeholder="Enter recipient name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                      <Input {...register('occasion', { required: 'Occasion is required' })} error={errors.occasion?.message} disabled={loading} placeholder="Enter occasion" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gift Description</label>
                      <Input {...register('giftDescription', { required: 'Gift Description is required' })} error={errors.giftDescription?.message} disabled={loading} placeholder="Enter gift description" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Medical' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                      <Input {...register('patientName', { required: 'Patient Name is required' })} error={errors.patientName?.message} disabled={loading} placeholder="Enter patient name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                      <Input {...register('doctorName', { required: 'Doctor Name is required' })} error={errors.doctorName?.message} disabled={loading} placeholder="Enter doctor name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                      <Input {...register('hospital', { required: 'Hospital is required' })} error={errors.hospital?.message} disabled={loading} placeholder="Enter hospital name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <Input {...register('medicalReason', { required: 'Reason is required' })} error={errors.medicalReason?.message} disabled={loading} placeholder="Enter reason" />
                    </div>
                  </>
                )}
                {selectedCategory === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                    <Input {...register('otherDetails', { required: 'Details are required' })} error={errors.otherDetails?.message} disabled={loading} placeholder="Enter details" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <TextArea
                    {...register('description', { required: 'Description is required' })}
                    error={errors.description?.message}
                    disabled={loading}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h4 className="text-base font-semibold text-blue-900 mb-3">Payment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <Select
                    options={paymentMethods}
                    {...register('paymentMethod', { required: 'Payment method is required' })}
                    error={errors.paymentMethod?.message}
                    disabled={loading}
                    onChange={e => {
                      setSelectedPaymentMethod(e.target.value);
                      if (typeof register('paymentMethod').onChange === 'function') {
                        register('paymentMethod').onChange(e);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                  <Input
                    {...register('referenceNo')}
                    error={errors.referenceNo?.message}
                    disabled={loading}
                    placeholder="e.g. Check #, Transaction ID"
                  />
                </div>
                {/* Conditional Payment Method fields */}
                {selectedPaymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                    <Input
                      {...register('paidBy', { required: 'Paid By is required' })}
                      error={errors.paidBy?.message}
                      disabled={loading}
                      placeholder="Enter person who paid"
                    />
                  </div>
                )}
                {selectedPaymentMethod === 'bank_transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                    <select
                      className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                      {...register('bank', { required: 'Bank is required' })}
                      disabled={loading}
                    >
                      <option value="">Select bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.bank && <div className="text-red-500 text-xs mt-1">{errors.bank.message}</div>}
                  </div>
                )}
                {selectedPaymentMethod === 'credit_card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <Input
                      {...register('cardNumber', { required: 'Card Number is required' })}
                      error={errors.cardNumber?.message}
                      disabled={loading}
                      placeholder="Enter card number"
                    />
                  </div>
                )}
                {selectedPaymentMethod === 'upi' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPI App/Platform</label>
                      <select
                        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                        {...register('upiApp', { required: 'UPI App/Platform is required' })}
                        disabled={loading}
                      >
                        <option value="">Select UPI App/Platform</option>
                        <option value="Google Pay">Google Pay</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Paytm">Paytm</option>
                        <option value="BHIM">BHIM</option>
                        <option value="Amazon Pay">Amazon Pay</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.upiApp && <div className="text-red-500 text-xs mt-1">{errors.upiApp.message}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                      <Input
                        {...register('paymentUpiId', { required: 'UPI ID is required' })}
                        error={errors.paymentUpiId?.message}
                        disabled={loading}
                        placeholder="Enter UPI ID"
                      />
                    </div>
                  </>
                )}
                {selectedPaymentMethod === 'debit_card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Debit Card Number</label>
                    <Input
                      {...register('debitCardNumber', { required: 'Debit Card Number is required' })}
                      error={errors.debitCardNumber?.message}
                      disabled={loading}
                      placeholder="Enter debit card number"
                    />
                  </div>
                )}
                {selectedPaymentMethod === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                    <Input {...register('otherPaymentDetails', { required: 'Payment Details are required' })} error={errors.otherPaymentDetails?.message} disabled={loading} placeholder="Enter payment details" />
                  </div>
                )}
                {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select
                      options={statusOptions}
                      {...register('status')}
                      error={errors.status?.message}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <h4 className="text-base font-semibold text-blue-900 mb-3">Receipt Upload</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt {!isEditMode && '(Optional)'}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {receiptPreview ? (
                      <div className="relative">
                        {receiptPreview.startsWith('data:image') ? (
                          <img
                            src={receiptPreview}
                            alt="Receipt preview"
                            className="max-h-48 mx-auto mb-2 rounded"
                          />
                        ) : (
                          <div className="p-4 bg-gray-100 rounded">
                            <p className="text-sm text-gray-500">PDF file attached</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="receipt"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="receipt"
                              name="receipt"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                              accept="image/*,.pdf"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, PDF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {errors.receipt?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.receipt.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-base font-semibold text-blue-900 mb-3">Notes</h4>
              <TextArea
                label="Notes (Optional)"
                {...register('notes')}
                error={errors.notes?.message}
                disabled={loading}
                rows={2}
                placeholder="Any additional notes about this expense..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Expense' : 'Add Expense'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => navigate('/finance/expenses')}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
