import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useData();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border backdrop-blur-md animate-in slide-in-from-right-full duration-300
            ${toast.type === 'success' ? 'bg-zinc/95 dark:bg-carbon/95 border-persian/50 text-persian' : ''}
            ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/90 border-red-500/50 text-red-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/90 border-blue-500/50 text-blue-400' : ''}
            ${toast.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/90 border-orange-500/50 text-orange-400' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          {toast.type === 'warning' && <AlertCircle size={18} />}
          
          <span className="text-sm font-medium text-carbon dark:text-zinc">{toast.message}</span>
          
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-50 hover:opacity-100 p-1 hover:bg-white/10 rounded">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}