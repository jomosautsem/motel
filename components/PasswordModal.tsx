
import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldAlert } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requiredPassword: string;
  title?: string;
  message?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  requiredPassword,
  title = "Acción Protegida",
  message = "Ingrese la contraseña de administrador para continuar."
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === requiredPassword) {
      onConfirm();
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <Lock className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">{message}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Contraseña..."
                className={`w-full px-4 py-3 rounded-xl border outline-none transition text-center font-bold tracking-widest ${
                  error 
                    ? 'border-rose-300 bg-rose-50 text-rose-600 focus:ring-2 focus:ring-rose-500' 
                    : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                }`}
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold animate-pulse mt-1 justify-center">
                  <ShieldAlert className="w-3 h-3" /> Contraseña incorrecta
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 transition active:scale-[0.98]"
            >
              Confirmar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
