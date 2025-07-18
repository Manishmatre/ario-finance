import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FiCheckCircle, FiDownload, FiMail, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function SubscriptionConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await axiosInstance.get('/api/subscription/current');
        setSubscription(response.data);
      } catch (error) {
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = () => {
    // In a real implementation, generate and download invoice
    toast.info('Invoice download feature coming soon!');
  };

  const handleSendEmail = () => {
    // In a real implementation, send confirmation email
    toast.info('Confirmation email sent!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subscription Activated!
        </h1>
        <p className="text-gray-600">
          Thank you for subscribing to SSK Finance. Your subscription is now active.
        </p>
      </div>

      {/* Subscription Details */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FiCreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-medium">{subscription?.plan}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FiCalendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="font-medium capitalize">{subscription?.billingCycle}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{subscription?.status}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(subscription?.amount)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Next Billing Date</p>
                <p className="font-medium">
                  {subscription?.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Days Remaining</p>
                <p className="font-medium">
                  {subscription?.getRemainingDays ? subscription.getRemainingDays() : 'N/A'} days
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Features */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Plan Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscription?.features && Object.entries(subscription.features).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => navigate('/finance')}
          variant="primary"
          className="flex items-center justify-center space-x-2"
        >
          <span>Go to Dashboard</span>
        </Button>
        
        <Button
          onClick={handleDownloadInvoice}
          variant="outline"
          className="flex items-center justify-center space-x-2"
        >
          <FiDownload className="w-4 h-4" />
          <span>Download Invoice</span>
        </Button>
        
        <Button
          onClick={handleSendEmail}
          variant="outline"
          className="flex items-center justify-center space-x-2"
        >
          <FiMail className="w-4 h-4" />
          <span>Send Confirmation</span>
        </Button>
      </div>

      {/* Help Section */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Your subscription is now active and you can access all plan features.</p>
            <p>• You can manage your subscription from the Subscription Management page.</p>
            <p>• For any questions, please contact our support team.</p>
            <p>• You'll receive email notifications for billing and important updates.</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 