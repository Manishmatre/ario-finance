import React from 'react';
const Select = ({ options, value, onChange, error, className = '', ...props }) => {
  return (
    <select
      className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'} font-medium bg-white ${className}`}
      value={value}
      onChange={onChange}
      {...props}
    >
      {options.map((opt, index) =>
        <option key={opt.key || `option-${index}`} value={opt.value}>{opt.label}</option>
      )}
    </select>
  );
};
export default Select;
