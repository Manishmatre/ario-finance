import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

// Mock plans data (same as in Pricing.jsx)
const mockPlans = [
  {
    slug: 'free',
    name: 'Free',
    description: 'Perfect for individuals and small businesses getting started',
    price: { monthly: 0, yearly: 0 },
    features: { users: 1, bankAccounts: 1, vendors: 5, clients: 5, projects: 2, transactionsPerMonth: 50, storageGB: 0.5, advancedReporting: false, apiAccess: false, prioritySupport: false, customBranding: false, multiCurrency: false, auditTrail: false, dataExport: false, whiteLabel: false, dedicatedSupport: false },
    isPopular: false,
    isActive: true,
    sortOrder: 1,
    trialDays: 0,
    billingCycle: 'both',
    color: '#6B7280',
    badge: null
  },
  {
    slug: 'starter',
    name: 'Starter',
    description: 'Ideal for growing small businesses',
    price: { monthly: 999, yearly: 9999 },
    features: { users: 3, bankAccounts: 3, vendors: 25, clients: 25, projects: 10, transactionsPerMonth: 500, storageGB: 5, advancedReporting: true, apiAccess: false, prioritySupport: false, customBranding: false, multiCurrency: false, auditTrail: false, dataExport: true, whiteLabel: false, dedicatedSupport: false },
    isPopular: true,
    isActive: true,
    sortOrder: 2,
    trialDays: 14,
    billingCycle: 'both',
    color: '#3B82F6',
    badge: 'Most Popular'
  },
  {
    slug: 'professional',
    name: 'Professional',
    description: 'For established businesses with advanced needs',
    price: { monthly: 2499, yearly: 24999 },
    features: { users: 10, bankAccounts: 10, vendors: 100, clients: 100, projects: 50, transactionsPerMonth: 2000, storageGB: 20, advancedReporting: true, apiAccess: true, prioritySupport: true, customBranding: false, multiCurrency: true, auditTrail: true, dataExport: true, whiteLabel: false, dedicatedSupport: false },
    isPopular: false,
    isActive: true,
    sortOrder: 3,
    trialDays: 14,
    billingCycle: 'both',
    color: '#8B5CF6',
    badge: null
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with unlimited needs',
    price: { monthly: 4999, yearly: 49999 },
    features: { users: -1, bankAccounts: -1, vendors: -1, clients: -1, projects: -1, transactionsPerMonth: -1, storageGB: 100, advancedReporting: true, apiAccess: true, prioritySupport: true, customBranding: true, multiCurrency: true, auditTrail: true, dataExport: true, whiteLabel: true, dedicatedSupport: true },
    isPopular: false,
    isActive: true,
    sortOrder: 4,
    trialDays: 30,
    billingCycle: 'both',
    color: '#F59E42',
    badge: 'Best Value'
  }
];

const defaultPlan = mockPlans[0];

export default function PlanCreator() {
  const [selectedSlug, setSelectedSlug] = useState(defaultPlan.slug);
  const [plan, setPlan] = useState({ ...defaultPlan });
  const [submittedPlan, setSubmittedPlan] = useState(null);

  // When dropdown changes, update form fields
  const handleSelectChange = (e) => {
    const slug = e.target.value;
    setSelectedSlug(slug);
    const template = mockPlans.find(p => p.slug === slug);
    setPlan({ ...template });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('features.')) {
      const featureKey = name.split('.')[1];
      setPlan(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('price.')) {
      const priceKey = name.split('.')[1];
      setPlan(prev => ({
        ...prev,
        price: {
          ...prev.price,
          [priceKey]: Number(value)
        }
      }));
    } else {
      setPlan(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  // On submit, show the plan data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/plans', plan);
      toast.success('Plan saved to database!');
      setSubmittedPlan(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save plan');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create a Plan</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Select Plan Template</label>
            <select
              value={selectedSlug}
              onChange={handleSelectChange}
              className="w-full border rounded px-3 py-2"
            >
              {mockPlans.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Name</label>
              <input name="name" value={plan.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Slug</label>
              <input name="slug" value={plan.slug} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <input name="description" value={plan.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block mb-1 font-medium">Monthly Price</label>
                <input name="price.monthly" type="number" value={plan.price.monthly} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Yearly Price</label>
                <input name="price.yearly" type="number" value={plan.price.yearly} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium">Trial Days</label>
              <input name="trialDays" type="number" value={plan.trialDays} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Sort Order</label>
              <input name="sortOrder" type="number" value={plan.sortOrder} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <input name="color" value={plan.color} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Badge</label>
              <input name="badge" value={plan.badge || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-2">
              <input name="isPopular" type="checkbox" checked={plan.isPopular} onChange={handleChange} />
              <label className="font-medium">Is Popular</label>
            </div>
            <div className="flex items-center gap-2">
              <input name="isActive" type="checkbox" checked={plan.isActive} onChange={handleChange} />
              <label className="font-medium">Is Active</label>
            </div>
            <div>
              <label className="block mb-1 font-medium">Billing Cycle</label>
              <select name="billingCycle" value={plan.billingCycle} onChange={handleChange} className="w-full border rounded px-3 py-2">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block mb-1 font-medium">Features</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(plan.features).map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      name={`features.${key}`}
                      type={typeof plan.features[key] === 'boolean' ? 'checkbox' : 'number'}
                      checked={typeof plan.features[key] === 'boolean' ? plan.features[key] : undefined}
                      value={typeof plan.features[key] === 'boolean' ? undefined : plan.features[key]}
                      onChange={handleChange}
                      className="border rounded px-2 py-1"
                    />
                    <label>{key}</label>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full mt-4">Create Plan</Button>
          </form>
        </div>
      </Card>
      {submittedPlan && (
        <Card className="mt-6">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-2">Created Plan Data</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">{JSON.stringify(submittedPlan, null, 2)}</pre>
          </div>
        </Card>
      )}
    </div>
  );
} 