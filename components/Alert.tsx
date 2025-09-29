
import React from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseClasses = "fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg max-w-md";
  const typeClasses = {
    error: "bg-red-900/70 backdrop-blur-sm text-red-300 border border-red-700",
    success: "bg-green-900/70 backdrop-blur-sm text-green-300 border border-green-700",
  };

  const Icon = () => (
    <svg className="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
    </svg>
  );

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
      <Icon />
      <span className="sr-only">{type}</span>
      <div>
        <span className="font-medium">{type === 'error' ? 'Error!' : 'Success!'}</span> {message}
      </div>
      <button type="button" onClick={onClose} className="ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 text-current hover:bg-white/10" aria-label="Close">
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  );
};
