import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100';
          let borderClass = 'border-slate-200 dark:border-slate-800';
          let icon = <Info className="h-5 w-5 text-blue-500" />;

          if (toast.type === 'success') {
            borderClass = 'border-green-200 dark:border-green-950';
            icon = <CheckCircle className="h-5 w-5 text-green-500" />;
          } else if (toast.type === 'error') {
            borderClass = 'border-red-200 dark:border-red-950';
            icon = <AlertCircle className="h-5 w-5 text-red-500" />;
          } else if (toast.type === 'warning') {
            borderClass = 'border-orange-200 dark:border-orange-950';
            icon = <AlertTriangle className="h-5 w-5 text-orange-500" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl border glass-panel shadow-lg transition-all duration-300 animate-fade-in ${borderClass} ${bgClass}`}
            >
              <div className="flex-shrink-0">{icon}</div>
              <div className="flex-grow text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
