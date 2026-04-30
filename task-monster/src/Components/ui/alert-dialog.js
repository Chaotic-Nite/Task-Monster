import React from 'react';

export const AlertDialog = ({ children }) => {
  return <>{children}</>;
};

export const AlertDialogTrigger = ({ children, asChild, ...props }) => {
  return React.cloneElement(children, props);
};

export const AlertDialogContent = ({ children, className = '' }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 app-overlay-bg ${className}`}>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  );
};

export const AlertDialogHeader = ({ children }) => {
  return <div className="p-6 pb-0">{children}</div>;
};

export const AlertDialogTitle = ({ children, className = '' }) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

export const AlertDialogDescription = ({ children, className = '' }) => {
  return <p className={`text-sm text-gray-600 mt-2 ${className}`}>{children}</p>;
};

export const AlertDialogFooter = ({ children }) => {
  return <div className="flex justify-end space-x-2 p-6 pt-0">{children}</div>;
};

export const AlertDialogAction = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const AlertDialogCancel = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};