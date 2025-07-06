import React, { forwardRef, useState } from "react";

const Input = forwardRef(function Input({
  label,
  error,
  type = "text",
  className = "",
  icon: Icon,
  showPasswordToggle = false,
  ...props
}, ref) {
  const [show, setShow] = useState(false);
  const inputType = showPasswordToggle ? (show ? "text" : "password") : type;
  return (
    <div className={"w-full " + className}>
      {label && <label className="block mb-1 font-medium">{label}</label>}
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
          {...props}
        />
        {Icon && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon />
          </span>
        )}
        {showPasswordToggle && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShow((v) => !v)}
          >
            {show ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592M6.7 6.7A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.112M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M3 3l18 18"/></svg>
            )}
          </button>
        )}
      </div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
});

export default Input; 