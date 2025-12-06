
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="p-6 text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            type === 'danger' ? 'bg-rose-100 text-rose-500' : 
            type === 'warning' ? 'bg-amber-100 text-amber-500' : 'bg-blue-100 text-blue-500'
          }`}>
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition ${
                type === 'danger' 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' 
                  : type === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
