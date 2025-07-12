import React from 'react';

const partners = [
  { name: 'HDFC Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/HDFC_Bank_Logo.svg' },
  { name: 'SBI', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/State_Bank_of_India_logo.svg' },
  { name: 'ICICI Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/ICICI_Bank_Logo.svg' },
  { name: 'Razorpay', logo: 'https://razorpay.com/favicon.svg' },
  { name: 'AWS', logo: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png' }
];

export default function Partners() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-bold text-center mb-8">Trusted by Leading Banks & Partners</h2>
      <div className="flex flex-wrap justify-center items-center gap-10">
        {partners.map((p, i) => (
          <img key={i} src={p.logo} alt={p.name} title={p.name} className="h-12 object-contain grayscale hover:grayscale-0 transition-all" />
        ))}
      </div>
    </section>
  );
} 