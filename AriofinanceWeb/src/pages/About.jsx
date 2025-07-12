import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function About() {
  return (
    <>
      <Helmet>
        <title>About - Ario Finance Management</title>
        <meta name="description" content="Learn more about Ario Finance Management, our mission, and our team." />
      </Helmet>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">Ario Finance Management is built by a passionate team at ArionexTech to help businesses manage their finances with ease, security, and confidence. Our mission is to empower every business to grow with modern, accessible financial tools.</p>
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Our Mission</h3>
            <p className="text-gray-600">To make business finance simple, secure, and scalable for everyone.</p>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Our Team</h3>
            <p className="text-gray-600">We are a diverse group of engineers, designers, and business experts dedicated to your success.</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 