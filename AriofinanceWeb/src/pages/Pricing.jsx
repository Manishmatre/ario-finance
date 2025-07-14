import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const plans = [
  {
    name: 'Starter',
    price: '₹999/mo',
    description: 'For growing businesses',
    features: ['Unlimited invoices', 'Basic analytics', 'Email support'],
    popular: false
  },
  {
    name: 'Professional',
    price: '₹2,499/mo',
    description: 'For established teams',
    features: ['Everything in Starter', 'Advanced analytics', 'Priority support', 'Multi-user access'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '₹4,999/mo',
    description: 'For large organizations',
    features: ['Everything in Professional', 'Custom integrations', 'Dedicated manager'],
    popular: false
  }
];

const faqs = [
  {
    q: 'Is there really a 1 year free offer?',
    a: 'Yes! Use code 1YEARFREE at checkout to get your first year free on any plan.'
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel or change your plan at any time, no questions asked.'
  },
  {
    q: 'Is my data secure?',
    a: 'We use bank-grade encryption and best practices to keep your data safe and private.'
  }
];

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing - Ario Finance Management</title>
        <meta name="description" content="Simple, transparent pricing for Ario Finance Management. Choose the plan that fits your business." />
      </Helmet>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Pricing</h1>
        <div className="grid md:grid-cols-3 gap-8 mb-10 fade-in-up">
          {plans.map((plan, i) => (
            <div key={i} className={`bg-white rounded-2xl shadow-lg p-8 text-center border-2 ${plan.popular ? 'border-primary scale-105 z-10' : 'border-transparent'} relative transition-transform card-hover`}>
              {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold shadow">Most Popular</span>}
              <h2 className="font-bold text-2xl mb-2">{plan.name}</h2>
              <div className="text-3xl font-bold text-primary mb-2">{plan.price}</div>
              <div className="text-gray-600 mb-4">{plan.description}</div>
              <ul className="text-gray-700 mb-6 space-y-2 text-left max-w-xs mx-auto">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2"><span className="text-green-500">✔</span> {f}</li>
                ))}
              </ul>
              <a href="/app/register" className="inline-block px-6 py-2 rounded bg-primary text-white font-semibold hover:bg-primary-dark transition shadow button-hover">Start Free</a>
            </div>
          ))}
        </div>
        <div className="text-center mt-6 mb-16 fade-in-up">
          <span className="inline-block bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full">🎉 1 Year Free on All Plans! Use code <b>1YEARFREE</b></span>
        </div>
        <div className="max-w-3xl mx-auto mb-16 fade-in-up">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h4 className="font-semibold text-lg mb-1">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center fade-in-up">
          <a href="/app/register" className="inline-block px-10 py-4 rounded-xl bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary-dark transition-all duration-200 button-hover">Start Your Free Year</a>
        </div>
      </div>
      <Footer />
    </>
  );
} 