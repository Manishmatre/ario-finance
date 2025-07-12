import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { FiCreditCard, FiCalendar, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiXCircle, FiDownload, FiSettings } from 'react-icons/fi';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import { Modal } from '../../components/ui/Modal';

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscriptionRes, usageRes, billingRes] = await Promise.all([
        axiosInstance.get('/api/subscription/current'),
        axiosInstance.get('/api/subscription/usage'),
        axiosInstance.get('/api/subscription/billing-history')
      ]);

      setSubscription(subscriptionRes.data);
      setUsage(usageRes.data);
      setBillingHistory(billingRes.data);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
      // Set default values if API calls fail
      setSubscription({
        plan: 'free',
        status: 'active',
        billingCycle: 'monthly',
        amount: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        getRemainingDays: function() {
          const now = new Date();
          const end = new Date(this.currentPeriodEnd);
          const diffTime = end - now;
          return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      });
      setUsage({
        subscription: { plan: 'free', status: 'active' },
        usage: {},
        usagePercentages: {},
        limits: {}
      });
      setBillingHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await axiosInstance.post('/api/subscription/cancel');
      toast.success('Subscription will be cancelled at the end of the current period');
      setShowCancelModal(false);
      fetchSubscriptionData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await axiosInstance.post('/api/subscription/reactivate');
      toast.success('Subscription reactivated successfully');
      setShowReactivateModal(false);
      fetchSubscriptionData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reactivate subscription');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'trialing':
        return <FiCalendar className="w-4 h-4" />;
      case 'cancelled':
        return <FiAlertCircle className="w-4 h-4" />;
      case 'expired':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiAlertCircle className="w-4 h-4" />;
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <PageHeading
        title="Subscription Management"
        subtitle="Manage your subscription, view usage, and billing history"
        breadcrumbs={[
          { label: 'Finance', to: '/finance' },
          { label: 'Subscription' }
        ]}
      />

      {/* Current Subscription */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {subscription?.planName || subscription?.plan}
                {subscription?.badge && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{subscription.badge}</span>
                )}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(subscription?.status)}`}>
                {getStatusIcon(subscription?.status)}
                <span className="ml-1 capitalize">{subscription?.status}</span>
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                onClick={() => window.location.href = '/finance/pricing'}
                variant="primary"
                size="sm"
                className="w-full md:w-auto"
              >
                Change Plan
              </Button>
              {subscription?.cancelAtPeriodEnd ? (
                <Button
                  onClick={() => setShowReactivateModal(true)}
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
                  Reactivate
                </Button>
              ) : (
                <Button
                  onClick={() => setShowCancelModal(true)}
                  variant="outline"
                  size="sm"
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Plan Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium">{subscription?.planName || subscription?.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Billing Cycle:</span>
                  <span className="font-medium capitalize">{subscription?.billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(subscription?.amount)}</span>
                </div>
                {subscription?.trialDays > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trial:</span>
                    <span className="font-medium text-blue-600">{subscription.trialDays} days</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Billing Period</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">{formatDate(subscription?.currentPeriodStart)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ends:</span>
                  <span className="font-medium">{formatDate(subscription?.currentPeriodEnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className="font-medium">
                    {subscription?.getRemainingDays ? subscription.getRemainingDays() : 
                      subscription?.currentPeriodEnd ? 
                      Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24)) : 
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Plan Features - Only show if user has a paid subscription */}
      {subscription && subscription.plan !== 'free' && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan Features</h3>
            {/* Group features as in Pricing page */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Core Limits */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Core Limits</h4>
                <ul className="space-y-1">
                  {['users','bankAccounts','vendors','clients','projects','transactionsPerMonth','storageGB'].map(key => (
                    <li key={key} className="flex items-center text-sm">
                      <span className="mr-2">{key === 'users' ? '👤' : key === 'bankAccounts' ? '🏦' : key === 'vendors' ? '🧾' : key === 'clients' ? '👥' : key === 'projects' ? '📁' : key === 'transactionsPerMonth' ? '🔄' : key === 'storageGB' ? '💾' : ''}</span>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>:
                      <span className="ml-1">{subscription.features && subscription.features[key] !== undefined ? subscription.features[key] : '-'}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Premium Features */}
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Premium Features</h4>
                <ul className="space-y-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {['advancedReporting','apiAccess','prioritySupport','customBranding','multiCurrency','auditTrail','dataExport','whiteLabel','dedicatedSupport'].map(key => (
                    <li key={key} className="flex items-center text-sm">
                      <span className="mr-2">{key === 'advancedReporting' ? '📊' : key === 'apiAccess' ? '🔗' : key === 'prioritySupport' ? '⚡' : key === 'customBranding' ? '🎨' : key === 'multiCurrency' ? '💱' : key === 'auditTrail' ? '📝' : key === 'dataExport' ? '⬇️' : key === 'whiteLabel' ? '🏷️' : key === 'dedicatedSupport' ? '🤝' : ''}</span>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>:
                      <span className="ml-1">
                        {subscription.features && typeof subscription.features[key] === 'boolean' ? (
                          subscription.features[key] ? (
                            <span title="Included" className="text-green-600">✔️</span>
                          ) : (
                            <span title="Not included" className="text-gray-400">❌</span>
                          )
                        ) : '-'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Usage Statistics */}
      {usage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Users"
            value={
              <>
                {usage.usage.users}/
                {usage.limits.users === -1 ? <span title="Unlimited">∞</span> : usage.limits.users}
              </>
            }
            percentage={usage.usagePercentages.users}
            icon={<FiTrendingUp className="h-6 w-6 text-blue-500" />}
          />
          <StatCard
            title="Bank Accounts"
            value={
              <>
                {usage.usage.bankAccounts}/
                {usage.limits.bankAccounts === -1 ? <span title="Unlimited">∞</span> : usage.limits.bankAccounts}
              </>
            }
            percentage={usage.usagePercentages.bankAccounts}
            icon={<FiCreditCard className="h-6 w-6 text-green-500" />}
          />
          <StatCard
            title="Vendors"
            value={
              <>
                {usage.usage.vendors}/
                {usage.limits.vendors === -1 ? <span title="Unlimited">∞</span> : usage.limits.vendors}
              </>
            }
            percentage={usage.usagePercentages.vendors}
            icon={<FiTrendingUp className="h-6 w-6 text-purple-500" />}
          />
          <StatCard
            title="Transactions (This Month)"
            value={
              <>
                {usage.usage.transactionsThisMonth}/
                {usage.limits.transactionsPerMonth === -1 ? <span title="Unlimited">∞</span> : usage.limits.transactionsPerMonth}
              </>
            }
            percentage={usage.usagePercentages.transactionsThisMonth}
            icon={<FiTrendingUp className="h-6 w-6 text-orange-500" />}
          />
        </div>
      )}

      {/* Usage Progress Bars */}
      {usage && (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Details</h3>
            <div className="space-y-4">
              {Object.entries(usage.usagePercentages).map(([key, percentage]) => {
                const isOverLimit = percentage > 100;
                const isNearLimit = percentage > 80;
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`font-medium ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {usage.usage[key]}/{usage.limits[key] === -1 ? <span title="Unlimited">∞</span> : usage.limits[key]}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Billing History */}
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
            <Button variant="outline" size="sm" icon={<FiDownload className="w-4 h-4" />}>
              Export
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {invoice.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Cancel Subscription Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={handleCancelSubscription}
              variant="danger"
            >
              Cancel Subscription
            </Button>
            <Button
              onClick={() => setShowCancelModal(false)}
              variant="outline"
            >
              Keep Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reactivate Subscription Modal */}
      <Modal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        title="Reactivate Subscription"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Reactivate your subscription to continue with automatic billing at the end of your current period.
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={handleReactivateSubscription}
              variant="primary"
            >
              Reactivate
            </Button>
            <Button
              onClick={() => setShowReactivateModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 