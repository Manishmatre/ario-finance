import React, { useState } from 'react';

const CreatableSelect = ({ options, value, onChange, placeholder = '', className = '' }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showOptions, setShowOptions] = useState(false);
  const lowerOptions = options.map(opt => opt.value.toLowerCase());

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowOptions(true);
    if (!options.find(opt => opt.value === e.target.value)) {
      onChange({ target: { value: e.target.value } });
    }
  };

  const handleOptionClick = (val) => {
    setInputValue(val);
    setShowOptions(false);
    onChange({ target: { value: val } });
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} tabIndex={0} onBlur={() => setTimeout(() => setShowOptions(false), 100)}>
      <input
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowOptions(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showOptions && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <div
                key={opt.value + idx}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${opt.value === value ? 'bg-blue-100' : ''}`}
                onMouseDown={() => handleOptionClick(opt.value)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-400">No options</div>
          )}
          {inputValue && !lowerOptions.includes(inputValue.toLowerCase()) && (
            <div
              className="px-4 py-2 cursor-pointer text-blue-600 hover:bg-blue-50 border-t border-gray-100"
              onMouseDown={() => handleOptionClick(inputValue)}
            >
              Add "{inputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatableSelect; 