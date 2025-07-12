import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Security from '../components/Security';
import Partners from '../components/Partners';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Ario Finance Management - Effortless Business Finance</title>
        <meta name="description" content="The modern SaaS platform for effortless business finance management. Try free for 1 year!" />
      </Helmet>
      <Navbar />
      <Hero />
      <Features />
      <Security />
      <Partners />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
} 