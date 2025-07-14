import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Contact - Ario Finance Management</title>
        <meta name="description" content="Contact Ario Finance Management for support, sales, or partnership inquiries." />
      </Helmet>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 fade-in-up">
        <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
        <form className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4">
          <input type="text" placeholder="Your Name" className="px-4 py-3 border border-gray-300 rounded-lg" required />
          <input type="email" placeholder="Your Email" className="px-4 py-3 border border-gray-300 rounded-lg" required />
          <textarea placeholder="How can we help you?" className="px-4 py-3 border border-gray-300 rounded-lg min-h-[100px]" required />
          <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition shadow button-hover">Send Message</button>
        </form>
        <div className="mt-8 text-center text-gray-500 text-sm">
          Or email us at <a href="mailto:support@ariofinance.com" className="text-primary underline">support@ariofinance.com</a>
        </div>
      </div>
      <Footer />
    </>
  );
} 