import React from 'react';
export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 min-w-[300px]">
        <button className="float-right" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}
