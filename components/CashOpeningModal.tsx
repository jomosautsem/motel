
import React, { useState } from 'react';
import { X, DollarSign, Lock } from 'lucide-react';

interface CashOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (initialAmount: number) => void;
  shiftName: string;
}

export const CashOpeningModal: React.FC<CashOpeningModalProps> = ({ isOpen, onClose, onConfirm, shiftName }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val)) {
      onConfirm(val);
      setAmount('');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        <div className="px-6 py-4 border-b border-green-100 flex justify-between items-center bg-green-50">
          <div className="flex items-center gap-2 text-green-800">
            <Lock className="w-5 h-5" />
            <h2 className="text-xl font-bold">Apertura de Caja</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-green-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <p className="text-slate-500 font-medium">Iniciando Turno</p>
            <h3 className="text-2xl font-bold text-slate-800">{shiftName}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Fondo Inicial de Caja (MXN)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ej. 1000.00"
                  min="0"
                  step="0.50"
                  autoFocus
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none bg-slate-50 focus:bg-white text-xl font-bold text-slate-800 transition"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 text-center">Ingrese la cantidad de dinero en efectivo con la que inicia.</p>
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-700 hover:scale-[1.02] transition"
            >
              Confirmar Apertura
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
