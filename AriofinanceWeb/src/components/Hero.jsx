import React from 'react';
import dashboardHero from '../dashboard-hero.png';

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16 fade-in-up">
      <div className="flex-1">
        <h1 className="text-6xl md:text-7xl font-extrabold text-primary mb-8 leading-tight drop-shadow-lg tracking-tight">
          Effortless Business Finance Management
        </h1>
        <p className="text-2xl text-gray-800 mb-10 max-w-lg leading-relaxed">
          Modern SaaS platform to manage your business finances, automate workflows, and grow with confidence. Try any plan free for 1 year!
        </p>
        <a href="#pricing" className="inline-block px-12 py-5 rounded-3xl bg-primary text-white font-extrabold text-2xl shadow-xl hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 button-hover">
          Get Started Free
        </a>
      </div>
      <div className="flex-1 flex items-center justify-center fade-in-up">
        <img src={dashboardHero} alt="Finance dashboard screenshot" className="w-full max-w-3xl rounded-3xl shadow-3xl border border-gray-200 hover:scale-105 transition-transform duration-500" />
      </div>
    </section>
  );
}
