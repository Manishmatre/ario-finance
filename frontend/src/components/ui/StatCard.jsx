import React from 'react';
import Card from './Card';

export default function StatCard({ title, value, icon, className = '', valueColor = '' }) {
  return (
    <Card className={`flex items-center gap-4 p-4 ${className}`}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-2xl">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500 font-medium mb-1">{title}</div>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      </div>
    </Card>
  );
}
