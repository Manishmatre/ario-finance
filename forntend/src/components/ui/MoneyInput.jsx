import React from 'react';

export function MoneyInput({ value, onChange, ...props }) {
  return (
    <input
      type="number"
      step="0.01"
      min="0"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={e => {
        if (onChange) {
          // Handle both direct value and react-hook-form onChange
          if (typeof onChange === 'function') {
            onChange(e);
          }
        }
      }}
      {...props}
    />
  );
}
