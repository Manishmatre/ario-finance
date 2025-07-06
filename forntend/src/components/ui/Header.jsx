import React from "react";


export default function Header({ user = { name: "Demo Admin" }, tenant = { name: "Ario Finance" }, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b shadow-sm flex items-center h-16 px-4 md:px-8">
      <img src="/assets/arionextech-logo.png" alt="ArionexTech Logo" className="h-8 w-auto mr-3 hidden md:block" onError={e => { e.target.style.display='none'; e.target.parentNode.querySelector('.logo-text').style.display='block'; }} />
      <span className="logo-text hidden md:block font-bold text-xl text-blue-700 mr-3" style={{display:'none'}}>Arionex<span className="text-gray-900">Tech</span></span>
      <button
        className="md:hidden mr-4"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Sidebar"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {/* Brand Title for mobile */}
      <span className="font-bold text-xl text-blue-700 flex items-center gap-2 md:hidden">
        <span className="bg-blue-600 text-white rounded px-2 py-1">Arionex</span><span className="text-gray-900">Tech</span>
      </span>
      <span className="ml-auto flex items-center gap-4">
        <span className="hidden md:inline text-gray-600">Tenant: <b>{tenant.name}</b></span>
        <span className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold">{user.name}</span>
          <button className="ml-2 text-gray-400 hover:text-blue-600" title="Logout">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
            </svg>
          </button>
        </span>
      </span>
    </header>
  );
}
