import React from 'react';
import PropTypes from 'prop-types';

const TextArea = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  rows = 3,
  ...props 
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="mt-1 relative rounded-md shadow-sm">
        <textarea
          ref={ref}
          rows={rows}
          className={`block w-full px-3 py-2 border ${
            error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
          } rounded-md shadow-sm sm:text-sm`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

TextArea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
  required: PropTypes.bool,
};

export default TextArea;
