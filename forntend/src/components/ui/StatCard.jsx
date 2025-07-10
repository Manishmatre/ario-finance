import React from 'react';
import Card from './Card';

export default function StatCard({ title, value, icon, className = '' }) {
  return (
    <Card className={`flex items-center gap-4 p-4 ${className}`}>
      <div>{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </Card>
  );
}
