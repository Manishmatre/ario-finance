import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/useAuth';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [subscribing, setSubscribing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    method: 'card', // 'card', 'upi', 'netbanking', 'wallet'
    upiId: '',
    bankName: '',
    accountNumber: '',
    walletNumber: '',
    savePaymentInfo: false
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const availableCoupons = [
    { code: '1YEARFREE', description: 'Get 1 year free on all plans', effect: { type: 'free', duration: 12 } }
    // Add more coupons here if needed
  ];
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [plansRes, subRes] = await Promise.all([
          axiosInstance.get('/api/plans'),
          axiosInstance.get('/api/subscription/current')
        ]);
        console.log('Plans loaded:', plansRes.data);
        console.log('Subscription loaded:', subRes.data);
        setPlans(plansRes.data);
        setSubscription(subRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load pricing or subscription info');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get plan price for a billing cycle
  function getPlanPrice(plan, cycle = 'monthly') {
    if (!plan || !plan.price) return 0;
    if (plan.price && plan.price[cycle] !== undefined) {
      return plan.price[cycle];
    }
    return plan.price?.monthly || 0;
  }

  // Helper to get yearly discount percentage
  function getYearlyDiscount(plan) {
    if (!plan || !plan.price || plan.price.monthly === 0) return 0;
    const monthly = plan.price.monthly * 12;
    const yearly = plan.price.yearly;
    return Math.round(((monthly - yearly) / monthly) * 100);
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Handle plan selection for subscription
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Handle payment form changes
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    }

    // Format CVV (only numbers, max 4 digits)
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPaymentData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: formattedValue
        }
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
  };

  // Validate payment data
  const validatePayment = () => {
    const errors = [];

    // Validate card number (basic Luhn algorithm check)
    const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
    if (paymentData.method === 'card' && (cardNumber.length < 13 || cardNumber.length > 19)) {
      errors.push('Invalid card number');
    }

    // Validate expiry date
    const expiry = paymentData.expiryDate.split('/');
    if (paymentData.method === 'card' && expiry.length !== 2 || expiry[0].length !== 2 || expiry[1].length !== 2) {
      errors.push('Invalid expiry date format (MM/YY)');
    } else {
      const month = parseInt(expiry[0]);
      const year = parseInt('20' + expiry[1]);
      const now = new Date();
      const expiryDate = new Date(year, month - 1);
      
      if (paymentData.method === 'card' && (month < 1 || month > 12)) {
        errors.push('Invalid month');
      }
      if (paymentData.method === 'card' && expiryDate < now) {
        errors.push('Card has expired');
      }
    }

    // Validate CVV
    if (paymentData.method === 'card' && paymentData.cvv.length < 3) {
      errors.push('Invalid CVV');
    }

    // Validate cardholder name
    if (paymentData.method === 'card' && paymentData.cardholderName.trim().length < 2) {
      errors.push('Please enter cardholder name');
    }

    // Validate billing address
    if (!paymentData.billingAddress.line1.trim()) {
      errors.push('Please enter billing address');
    }
    if (!paymentData.billingAddress.city.trim()) {
      errors.push('Please enter city');
    }
    if (!paymentData.billingAddress.state.trim()) {
      errors.push('Please enter state');
    }
    if (!paymentData.billingAddress.pincode.trim()) {
      errors.push('Please enter pincode');
    }

    return errors;
  };

  // Process payment and create subscription
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment data
    const errors = validatePayment();
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    
    setSubscribing(true);
    
    try {
      // First, process payment
      const paymentResponse = await axiosInstance.post('/api/subscription/process-payment', {
        planSlug: selectedPlan.slug,
        billingCycle,
        amount: getPlanPrice(selectedPlan, billingCycle),
        paymentData: {
          ...paymentData,
          cardNumber: paymentData.method === 'card' ? paymentData.cardNumber : undefined,
          expiryDate: paymentData.method === 'card' ? paymentData.expiryDate : undefined,
          cvv: paymentData.method === 'card' ? paymentData.cvv : undefined,
          cardholderName: paymentData.method === 'card' ? paymentData.cardholderName : undefined,
          upiId: paymentData.method === 'upi' ? paymentData.upiId : undefined,
          bankName: paymentData.method === 'netbanking' ? paymentData.bankName : undefined,
          accountNumber: paymentData.method === 'netbanking' ? paymentData.accountNumber : undefined,
          walletNumber: paymentData.method === 'wallet' ? paymentData.walletNumber : undefined,
          savePaymentInfo: paymentData.savePaymentInfo,
          couponCode: appliedCoupon?.code // Include applied coupon code
        }
      });

      if (paymentResponse.data.success) {
        // Then create subscription
        await axiosInstance.post('/api/subscription/create', {
          planSlug: selectedPlan.slug,
          billingCycle,
          paymentMethod: paymentData.method,
          paymentId: paymentResponse.data.paymentId
        });

        toast.success(subscription ? 'Plan changed successfully!' : 'Subscription activated successfully!');
        setShowPaymentModal(false);
        
        // Redirect to confirmation page
        navigate('/finance/subscription-confirmation');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleApplyCoupon = () => {
    const found = availableCoupons.find(c => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (found) {
      setAppliedCoupon(found);
      toast.success(`Coupon '${found.code}' applied!`);
    } else {
      toast.error('Invalid coupon code');
    }
  };
  const handleClaimCoupon = (coupon) => {
    setCouponCode(coupon.code);
    setAppliedCoupon(coupon);
    toast.success(`Coupon '${coupon.code}' claimed!`);
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
      {/* 1 Year Free Offer Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg px-4 py-2 flex flex-col md:flex-row items-center justify-between mb-4 min-h-[56px]">
        <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
          <span className="text-lg font-bold flex items-center gap-2 whitespace-nowrap">🎉 1 Year Free!</span>
          <span className="text-base truncate">Use coupon <span className="inline-block bg-white/90 text-blue-700 font-semibold px-2 py-0.5 rounded ml-1 mr-1">1YEARFREE</span> at checkout for your first year free.</span>
        </div>
        <Button
          variant="primary"
          className="ml-0 md:ml-6 mt-2 md:mt-0 px-5 py-1.5 text-base font-semibold bg-white/900 text-blue-700 hover:bg-blue-100 border-2 border-white shadow min-w-[150px]"
          onClick={() => {
            navigator.clipboard.writeText('1YEARFREE');
            toast.success('Coupon code copied! Please select a plan to continue.');
          }}
        >
          Claim 1 Year Free
        </Button>
      </div>
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = subscription && subscription.plan === plan.slug;
          const price = getPlanPrice(plan, billingCycle);
          const yearlyDiscount = getYearlyDiscount(plan);
          const isPopular = plan.isPopular;
          const badge = plan.badge;
          const trial = plan.trialDays;
          // Group features
          const coreLimits = [
            { key: 'users', label: 'Users', icon: '👤' },
            { key: 'bankAccounts', label: 'Bank Accounts', icon: '🏦' },
            { key: 'vendors', label: 'Vendors', icon: '🧾' },
            { key: 'clients', label: 'Clients', icon: '👥' },
            { key: 'projects', label: 'Projects', icon: '📁' },
            { key: 'transactionsPerMonth', label: 'Transactions/Month', icon: '🔄' },
            { key: 'storageGB', label: 'Storage (GB)', icon: '💾' },
          ];
          const premiumFeatures = [
            { key: 'advancedReporting', label: 'Advanced Reporting', icon: '📊' },
            { key: 'apiAccess', label: 'API Access', icon: '🔗' },
            { key: 'prioritySupport', label: 'Priority Support', icon: '⚡' },
            { key: 'customBranding', label: 'Custom Branding', icon: '🎨' },
            { key: 'multiCurrency', label: 'Multi-Currency', icon: '💱' },
            { key: 'auditTrail', label: 'Audit Trail', icon: '📝' },
            { key: 'dataExport', label: 'Data Export', icon: '⬇️' },
            { key: 'whiteLabel', label: 'White Label', icon: '🏷️' },
            { key: 'dedicatedSupport', label: 'Dedicated Support', icon: '🤝' },
          ];
          return (
            <Card
              key={plan.slug}
              className={`relative shadow-md hover:shadow-xl transition-shadow duration-200 ${isPopular ? 'ring-2 ring-blue-500' : ''} ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
            >
              <div className="p-6 flex flex-col h-full">
                {/* Badge and Popular */}
                {(badge || isPopular) && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${isPopular ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{badge || 'Most Popular'}</div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                <div className="mb-2 flex items-end space-x-2">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(price)}</span>
                  <span className="text-gray-600 text-base">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                {billingCycle === 'yearly' && yearlyDiscount > 0 && (
                  <p className="text-green-600 text-xs font-medium mb-1">
                    Save {yearlyDiscount}% with yearly billing
                  </p>
                )}
                {trial > 0 && (
                  <p className="text-blue-600 text-xs font-medium mb-1">{trial} days free trial</p>
                )}
                {/* Core Limits */}
                <div className="mt-2 mb-2">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Core Limits</h4>
                  <ul className="space-y-1">
                    {coreLimits.map(f => (
                      <li key={f.key} className="flex items-center text-sm">
                        <span className="mr-2">{f.icon}</span>
                        <span className="font-medium">{f.label}:</span>
                        <span className="ml-1">{plan.features && plan.features[f.key] !== undefined ? (plan.features[f.key] === -1 ? <span title="Unlimited">∞</span> : plan.features[f.key]) : '-'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Premium Features */}
                <div className="mb-2">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Premium Features</h4>
                  <ul className="space-y-1">
                    {premiumFeatures.map(f => (
                      <li key={f.key} className="flex items-center text-sm">
                        <span className="mr-2">{f.icon}</span>
                        <span className="font-medium">{f.label}:</span>
                        <span className="ml-1">
                          {plan.features && typeof plan.features[f.key] === 'boolean' ? (
                            plan.features[f.key] ? (
                              <span title="Included" className="text-green-600">✔️</span>
                            ) : (
                              <span title="Not included" className="text-gray-400">❌</span>
                            )
                          ) : '-'}
                        </span>
                        {/* Tooltip if featureList has description for this feature */}
                        {plan.featureList && plan.featureList.length > 0 && (
                          plan.featureList.find(fl => fl.name && fl.name.toLowerCase() === f.label.toLowerCase())?.description && (
                            <span className="ml-2 text-xs text-gray-400" title={plan.featureList.find(fl => fl.name && fl.name.toLowerCase() === f.label.toLowerCase())?.description}>ⓘ</span>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1"></div>
                <Button
                  onClick={() => handlePlanSelect(plan)}
                  variant={isCurrent ? 'primary' : 'outline'}
                  className="w-full mt-4"
                  disabled={isCurrent || subscribing}
                >
                  {isCurrent ? 'Current Plan' : subscription ? 'Change Plan' : 'Subscribe'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Payment Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={subscription ? `Change to ${selectedPlan?.name || 'Plan'}` : `Subscribe to ${selectedPlan?.name || 'Plan'}`}
      >
        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-8">
          {/* Plan Summary */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span role="img" aria-label="summary">📝</span> Plan Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1"><span role="img" aria-label="plan">📦</span> Plan:</span>
                <span className="font-medium">{selectedPlan?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1"><span role="img" aria-label="cycle">📅</span> Billing Cycle:</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1"><span role="img" aria-label="amount">💰</span> Amount:</span>
                <span className="font-medium">
                  {appliedCoupon && appliedCoupon.code === '1YEARFREE' ? '₹0' : formatPrice(getPlanPrice(selectedPlan, billingCycle))}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1"><span role="img" aria-label="discount">🎁</span> Coupon:</span>
                  <span className="font-medium text-green-600">{appliedCoupon.code} - {appliedCoupon.description}</span>
                </div>
              )}
              {subscription && subscription.plan !== selectedPlan?.slug && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1"><span role="img" aria-label="change">🔄</span> Change:</span>
                  <span className={`font-medium flex items-center gap-1 ${getPlanPrice(selectedPlan, billingCycle) > subscription.amount ? 'text-green-600' : 'text-orange-600'}`}> 
                    {getPlanPrice(selectedPlan, billingCycle) > subscription.amount ? <span role="img" aria-label="upgrade">⬆️</span> : <span role="img" aria-label="downgrade">⬇️</span>}
                    {getPlanPrice(selectedPlan, billingCycle) > subscription.amount ? 'Upgrade' : 'Downgrade'}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Coupon Code Section */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="coupon">🏷️</span> Coupon Code</h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!appliedCoupon}
              />
              <Button
                type="button"
                variant="primary"
                className="px-4"
                onClick={handleApplyCoupon}
                disabled={!!appliedCoupon}
              >
                Apply
              </Button>
              {appliedCoupon && (
                <Button
                  type="button"
                  variant="outline"
                  className="px-4"
                  onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                >
                  Remove
                </Button>
              )}
            </div>
            {appliedCoupon && (
              <div className="text-green-700 text-sm mb-2">Coupon <b>{appliedCoupon.code}</b> applied: {appliedCoupon.description}</div>
            )}
            <div className="text-xs text-gray-500 mb-1">Available Coupons:</div>
            <div className="flex gap-2 flex-wrap">
              {availableCoupons.map(coupon => (
                <div key={coupon.code} className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                  <span className="font-semibold text-blue-700">{coupon.code}</span>
                  <span className="text-gray-700">{coupon.description}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-2 px-2 py-1"
                    onClick={() => handleClaimCoupon(coupon)}
                    disabled={appliedCoupon?.code === coupon.code}
                  >
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="payment">💸</span> Payment Method</h4>
            <div className="flex gap-3 flex-wrap">
              {['card', 'upi', 'netbanking', 'wallet'].map(method => (
                <button
                  type="button"
                  key={method}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${paymentData.method === method ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'}`}
                  onClick={() => setPaymentData(prev => ({ ...prev, method }))}
                >
                  {method === 'card' && 'Credit/Debit Card'}
                  {method === 'upi' && 'UPI'}
                  {method === 'netbanking' && 'Net Banking'}
                  {method === 'wallet' && 'Wallet'}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          {(!paymentData.method || paymentData.method === 'card') && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="card">💳</span> Card Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handlePaymentChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={paymentData.method === 'card'}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="card">💳</span></span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handlePaymentChange}
                    placeholder="MM/YY"
                    className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={paymentData.method === 'card'}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="calendar">📅</span></span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    placeholder="123"
                    className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={paymentData.method === 'card'}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="lock">🔒</span></span>
                </div>
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  name="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={handlePaymentChange}
                  placeholder="John Doe"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={paymentData.method === 'card'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="user">👤</span></span>
              </div>
            </div>
          )}
          {paymentData.method === 'upi' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="upi">🏦</span> UPI Information</h4>
              <div className="relative mb-4">
                <input
                  type="text"
                  name="upiId"
                  value={paymentData.upiId || ''}
                  onChange={handlePaymentChange}
                  placeholder="yourname@bank"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={paymentData.method === 'upi'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="upi">🏦</span></span>
              </div>
            </div>
          )}
          {paymentData.method === 'netbanking' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="netbanking">💻</span> Net Banking</h4>
              <div className="relative mb-4">
                <input
                  type="text"
                  name="bankName"
                  value={paymentData.bankName || ''}
                  onChange={handlePaymentChange}
                  placeholder="Bank Name"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={paymentData.method === 'netbanking'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="bank">🏦</span></span>
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  name="accountNumber"
                  value={paymentData.accountNumber || ''}
                  onChange={handlePaymentChange}
                  placeholder="Account Number"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={paymentData.method === 'netbanking'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="account">🔢</span></span>
              </div>
            </div>
          )}
          {paymentData.method === 'wallet' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="wallet">👛</span> Wallet</h4>
              <div className="relative mb-4">
                <input
                  type="text"
                  name="walletNumber"
                  value={paymentData.walletNumber || ''}
                  onChange={handlePaymentChange}
                  placeholder="Wallet Number / ID"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={paymentData.method === 'wallet'}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="wallet">👛</span></span>
              </div>
            </div>
          )}

          {/* Billing Address */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><span role="img" aria-label="address">📍</span> Billing Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <input
                  type="text"
                  name="billingAddress.line1"
                  value={paymentData.billingAddress.line1}
                  onChange={handlePaymentChange}
                  placeholder="Street address"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="map">🗺️</span></span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="billingAddress.line2"
                  value={paymentData.billingAddress.line2}
                  onChange={handlePaymentChange}
                  placeholder="Apartment, suite, etc."
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="building">🏢</span></span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="billingAddress.city"
                  value={paymentData.billingAddress.city}
                  onChange={handlePaymentChange}
                  placeholder="City"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="city">🏙️</span></span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="billingAddress.state"
                  value={paymentData.billingAddress.state}
                  onChange={handlePaymentChange}
                  placeholder="State"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="state">🌐</span></span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="billingAddress.pincode"
                  value={paymentData.billingAddress.pincode}
                  onChange={handlePaymentChange}
                  placeholder="123456"
                  className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><span role="img" aria-label="pin">📮</span></span>
              </div>
            </div>
          </div>

          {/* Save Payment Method */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="savePaymentInfo"
              checked={!!paymentData.savePaymentInfo}
              onChange={e => setPaymentData(prev => ({ ...prev, savePaymentInfo: e.target.checked }))}
              className="accent-blue-600 h-4 w-4 rounded border-gray-300 focus:ring-blue-600"
            />
            <label htmlFor="savePaymentInfo" className="text-sm text-gray-700">Save this payment method for future use</label>
          </div>

          {/* Inline Validation Error (if any) */}
          {Array.isArray(validatePayment()) && validatePayment().length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-2 text-sm">
              {validatePayment()[0]}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              disabled={subscribing}
            >
              {subscribing && <span className="animate-spin h-5 w-5 mr-2">🔄</span>}
              {subscription ? `Change to ${selectedPlan?.name}` : `Subscribe to ${selectedPlan?.name}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 