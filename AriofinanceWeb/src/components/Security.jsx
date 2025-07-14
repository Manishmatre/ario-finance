import React from 'react';

export default function Security() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-12 fade-in-up">
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-4">Bank-Grade Security & Compliance</h2>
        <p className="text-lg text-gray-700 mb-6">Your data is protected with industry-leading encryption, secure cloud infrastructure, and strict privacy controls. We are committed to keeping your business safe and compliant at all times.</p>
        <ul className="flex gap-6 flex-wrap">
          <li className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full text-green-700 font-semibold text-sm shadow"><span>🔒</span> 256-bit SSL Encryption</li>
          <li className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-blue-700 font-semibold text-sm shadow"><span>✅</span> GDPR Compliant</li>
          <li className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full text-yellow-700 font-semibold text-sm shadow"><span>☁️</span> Secure Cloud Hosting</li>
        </ul>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Security badge" className="w-40 h-40 object-contain" />
      </div>
    </section>
  );
} 