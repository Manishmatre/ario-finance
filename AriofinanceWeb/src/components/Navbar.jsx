import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-white/90 shadow-sm sticky top-0 z-30 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>SSK Finance</span>
        </Link>
        <div className="flex gap-6 items-center text-base font-medium">
          <Link to="/features" className="hover:text-primary">Features</Link>
          <Link to="/pricing" className="hover:text-primary">Pricing</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
          <Link to="/contact" className="hover:text-primary">Contact</Link>
          <a href="/app/login" className="ml-4 px-4 py-1.5 rounded bg-primary text-white hover:bg-primary-dark transition font-semibold shadow">Sign In</a>
        </div>
      </div>
    </nav>
  );
} 