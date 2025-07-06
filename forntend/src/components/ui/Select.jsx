import React from 'react';
const Select = ({ options, value, onChange, ...props }) => {
  return (
    <select className="border rounded px-2 py-1 w-full" value={value} onChange={onChange} {...props}>
      {options.map(opt =>
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  );
};
export default Select;
