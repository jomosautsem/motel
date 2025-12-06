import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-[60] animate-fade-in-down">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
        type === 'success' 
          ? 'bg-slate-900 border-green-500/50 text-white' 
          : type === 'error'
            ? 'bg-white border-rose-200 text-slate-800'
            : 'bg-white border-amber-200 text-slate-800'
      }`}>
        <div className={`p-1 rounded-full ${
          type === 'success' ? 'bg-green-500/20 text-green-400' : 
          type === 'error' ? 'bg-rose-100 text-rose-500' :
          'bg-amber-100 text-amber-500'
        }`}>
          {type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
           type === 'error' ? <XCircle className="w-5 h-5" /> :
           <AlertTriangle className="w-5 h-5" />}
        </div>
        <p className="font-medium text-sm">{message}</p>
        <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};