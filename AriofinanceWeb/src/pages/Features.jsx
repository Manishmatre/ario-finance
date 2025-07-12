import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

const features = [
  {
    icon: '📊',
    title: 'Real-Time Dashboards',
    desc: 'See all your business finances in one place, updated in real time.'
  },
  {
    icon: '🔒',
    title: 'Bank-Grade Security',
    desc: 'Your data is encrypted and protected with industry-leading security.'
  },
  {
    icon: '⚡',
    title: 'Automated Workflows',
    desc: 'Save time with smart automations for billing, payments, and more.'
  },
  {
    icon: '👥',
    title: 'Multi-User Access',
    desc: 'Invite your team and collaborate securely with role-based permissions.'
  },
  {
    icon: '📈',
    title: 'Advanced Analytics',
    desc: 'Get actionable insights and reports to grow your business.'
  },
  {
    icon: '💬',
    title: 'Priority Support',
    desc: 'Get fast, helpful support from our expert team.'
  }
];

export default function Features() {
  return (
    <>
      <Helmet>
        <title>Features - Ario Finance Management</title>
        <meta name="description" content="Explore all the features of Ario Finance Management. Real-time dashboards, automation, security, and more." />
      </Helmet>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Features</h1>
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
              <span className="text-5xl mb-4">{f.icon}</span>
              <h3 className="font-bold text-2xl mb-2">{f.title}</h3>
              <p className="text-gray-600 text-lg">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
} 