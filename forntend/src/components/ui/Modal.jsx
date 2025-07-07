import React from 'react';
export function Modal({ open, onClose, children, fullscreen = false, backgroundContent = null }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-30 z-50 backdrop-blur-xl flex items-center justify-center">
      {backgroundContent && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
          {backgroundContent}
        </div>
      )}
      <div className={
        fullscreen
          ? "bg-white/80 w-full h-full shadow-2xl relative overflow-y-auto flex flex-col z-10"
          : "bg-white/80 rounded p-6 max-w-md w-full shadow-2xl relative mx-2 overflow-y-auto max-h-[90vh] z-10"
      }>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl z-20" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}
