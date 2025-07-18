import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white/90 border-t border-gray-100 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-lg font-bold text-primary">SSK Finance</span>
        <span className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} SSKnexTech. All rights reserved.</span>
        <div className="flex gap-4 text-gray-400">
          <a href="#" aria-label="Twitter" className="hover:text-primary"><svg width="20" height="20" fill="currentColor"><path d="M20 3.924c-.735.326-1.523.547-2.35.646a4.11 4.11 0 0 0 1.804-2.27 8.19 8.19 0 0 1-2.605.996A4.104 4.104 0 0 0 9.85 7.03a11.65 11.65 0 0 1-8.457-4.287 4.104 4.104 0 0 0 1.27 5.477A4.073 4.073 0 0 1 .8 7.15v.052a4.104 4.104 0 0 0 3.292 4.022 4.09 4.09 0 0 1-1.852.07 4.108 4.108 0 0 0 3.834 2.85A8.233 8.233 0 0 1 0 17.542a11.616 11.616 0 0 0 6.29 1.844c7.547 0 11.675-6.155 11.675-11.49 0-.175-.004-.349-.012-.522A8.18 8.18 0 0 0 20 3.924z"/></svg></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-primary"><svg width="20" height="20" fill="currentColor"><path d="M16 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0zm-6 8a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-11h2v2h-2V5zm0 3h2v6h-2V8z"/></svg></a>
        </div>
      </div>
    </footer>
  );
} 