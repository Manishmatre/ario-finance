import React from 'react';

export function MoneyInput({ value, onChange, prefix = '', ...props }) {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    
    // Allow empty string for clearing
    if (inputValue === '') {
      onChange({ target: { name: props.name, value: '' } });
      return;
    }

    // Remove prefix if it exists
    const valueWithoutPrefix = inputValue.startsWith(prefix) 
      ? inputValue.substring(prefix.length) 
      : inputValue;

    // Remove any non-numeric characters except decimal point
    const cleanedValue = valueWithoutPrefix.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    if (cleanedValue.split('.').length > 2) {
      return;
    }

    // Format the value to 2 decimal places
    const formattedValue = parseFloat(cleanedValue).toFixed(2);
    
    // Update the value
    onChange({ target: { name: props.name, value: formattedValue } });
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <span className="text-gray-500">{prefix}</span>
        </span>
      )}
      <input
        type="text"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${prefix ? 'pl-10' : ''}`}
        value={value || ''}
        onChange={handleInputChange}
        {...props}
      />
    </div>
  );
}
