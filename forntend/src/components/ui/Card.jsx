import React from 'react';
export function Card({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
