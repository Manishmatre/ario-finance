import React from 'react';

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
  }
];

export default function Features() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-10">
      {features.map((f, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow">
          <span className="text-5xl mb-4">{f.icon}</span>
          <h3 className="font-bold text-2xl mb-2">{f.title}</h3>
          <p className="text-gray-600 text-lg">{f.desc}</p>
        </div>
      ))}
    </section>
  );
} 