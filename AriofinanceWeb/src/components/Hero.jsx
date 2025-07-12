import React from 'react';
import dashboardHero from '../dashboard-hero.png';

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6 leading-tight drop-shadow-sm">
          Effortless Business Finance Management
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-lg">
          Modern SaaS platform to manage your business finances, automate workflows, and grow with confidence. Try any plan free for 1 year!
        </p>
        <a href="#pricing" className="inline-block px-10 py-4 rounded-xl bg-primary text-white font-bold text-xl shadow-lg hover:bg-primary-dark transition-all duration-200">
          Get Started Free
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <img src={dashboardHero} alt="Finance dashboard screenshot" className="w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100" />
      </div>
    </section>
  );
} 