import React from 'react';
export default function Card({ children, title, value, icon, className = '' }) {
  return (
    <div className={`bg-white/70 backdrop-blur-md border border-white/40 rounded-xl shadow-xl p-6 w-full ${className}`} style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)' }}>
      {icon && <div className="mb-2">{icon}</div>}
      {title && <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>}
      {value && <div className="text-xl font-bold mb-2">{value}</div>}
      {children}
    </div>
  );
}
