import React from 'react';
export default function Card({ children, title, value, icon }) {
  return (
    <div className="bg-white rounded shadow p-4">
      {icon && <div className="mb-2">{icon}</div>}
      {title && <div className="text-gray-500 text-sm">{title}</div>}
      {value && <div className="text-xl font-bold">{value}</div>}
      {children}
    </div>
  );
}
