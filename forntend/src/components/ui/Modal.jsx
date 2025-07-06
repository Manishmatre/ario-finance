import React from 'react';
export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-30 z-50 backdrop-blur-xl flex items-center justify-center">
      <div className="bg-white/80 rounded p-6 max-w-md w-full shadow-2xl relative mx-2 overflow-y-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}
