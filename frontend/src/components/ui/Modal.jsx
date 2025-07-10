import React from 'react';

export function Modal({ open, onClose, children, fullscreen = false, backgroundContent = null, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center">
      {/* Blurry, semi-transparent background */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[8px] transition-all duration-300" onClick={onClose} />
      {backgroundContent && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
          {backgroundContent}
        </div>
      )}
      <div
        className={
          fullscreen
            ? "relative w-full h-full flex flex-col z-10"
            : "relative max-w-lg w-full mx-2 z-10"
        }
      >
        <div
          className={
        fullscreen
              ? "bg-white/60 backdrop-blur-[16px] shadow-2xl border border-white/30 rounded-none h-full flex flex-col"
              : "bg-white/60 backdrop-blur-[16px] shadow-2xl border border-white/30 rounded-2xl p-8 flex flex-col"
          }
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-20 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-full bg-white/40 backdrop-blur px-2 py-1"
            onClick={onClose}
            aria-label="Close modal"
            tabIndex={0}
          >
            &times;
          </button>
          {title && <div className="mb-4 text-xl font-semibold text-gray-800 text-center drop-shadow">{title}</div>}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
