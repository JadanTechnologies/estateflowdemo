
import React from 'react';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <h1 className="text-4xl font-bold text-text-primary mb-2">Access Denied</h1>
      <p className="text-text-secondary text-lg">You do not have permission to view this page.</p>
      <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'dashboard'; }} className="mt-6 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded">
        Return to Dashboard
      </a>
    </div>
  );
};

export default AccessDenied;
