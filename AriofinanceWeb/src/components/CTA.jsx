import React from 'react';

export default function CTA() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h2 className="text-4xl font-bold mb-4">Ready to take control of your business finances?</h2>
      <p className="text-lg text-gray-700 mb-8">Start your free year today. No credit card required. Cancel anytime.</p>
      <a href="/pricing" className="inline-block px-10 py-4 rounded-xl bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary-dark transition-all duration-200">Start Your Free Year</a>
    </section>
  );
} 