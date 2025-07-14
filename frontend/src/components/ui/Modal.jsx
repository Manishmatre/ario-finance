import React from 'react';

export function Modal({ open, onClose, children, fullscreen = false, backgroundContent = null, title, className = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center">
      {/* Solid, semi-transparent background */}
      <div className="absolute inset-0 bg-black/50 transition-opacity duration-300" onClick={onClose} />
      {backgroundContent && (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden">
          {backgroundContent}
        </div>
      )}
      <div
        className={
          fullscreen
            ? "relative w-full h-full flex flex-col z-10"
            : "relative w-[90vw] md:w-[60vw] lg:w-[50vw] max-h-[90vh] mx-4 z-10 flex flex-col animate-fade-in animate-scale-in"
        }
      >
        <div
          className={
        fullscreen
              ? `bg-white shadow-2xl border border-gray-100 rounded-none h-full flex flex-col ${className}`
              : `bg-white shadow-2xl border border-gray-100 rounded-3xl flex flex-col ${className}`
          }
        >
          <div className="flex items-center justify-between px-8 py-6 bg-gray-50 rounded-t-3xl shadow-sm relative">
            {title && <span className="text-2xl font-bold text-gray-900">{title}</span>}
          <button
              className="absolute -top-4 -right-4 bg-white shadow-lg text-gray-500 hover:text-blue-600 text-2xl z-20 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-full p-2 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
            tabIndex={0}
              style={{ boxShadow: '0 4px 24px 0 rgba(37, 99, 235, 0.10)' }}
            >
              {/* Modern close icon (SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            className="p-8 sm:p-4 overflow-y-auto"
            style={{
              maxHeight: 'calc(90vh - 88px)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <style>{`div[role='dialog']::-webkit-scrollbar { display: none !important; }`}</style>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
