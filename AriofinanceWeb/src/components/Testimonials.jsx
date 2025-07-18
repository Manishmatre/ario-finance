import React from 'react';

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Startup Founder',
    quote: 'SSK Finance made our accounting effortless. The dashboard is beautiful and easy to use!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5
  },
  {
    name: 'Rahul M.',
    role: 'CFO',
    quote: 'The 1 year free offer let us try everything risk-free. Highly recommend!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5
  },
  {
    name: 'Anjali T.',
    role: 'Business Owner',
    quote: 'Support is fast and helpful. We switched from spreadsheets and never looked back.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16 fade-in-up">
      <h2 className="text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-xl transition-shadow card-hover">
            <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full mb-4 border-2 border-primary object-cover" />
            <span className="text-yellow-400 text-xl mb-2">{'★'.repeat(t.rating)}</span>
            <p className="text-gray-700 mb-3 italic">“{t.quote}”</p>
            <span className="font-semibold text-primary">— {t.name}, {t.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 