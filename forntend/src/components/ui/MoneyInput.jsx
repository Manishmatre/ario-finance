import React from 'react';
export function MoneyInput({ value, onChange, ...props }) {
  return (
    <input
      type="number"
      step="0.01"
      min="0"
      className="border rounded px-2 py-1"
      value={value}
      onChange={e => onChange && onChange(e.target.value)}
      {...props}
    />
  );
}
