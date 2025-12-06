
import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign } from 'lucide-react';
import { Room } from '../types';

interface ReduceTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirm: (hours: number, cost: number) => void;
}

export const ReduceTimeModal: React.FC<ReduceTimeModalProps> = ({ isOpen, onClose, room, onConfirm }) => {
  const [hours, setHours] = useState<string>('1');
  const [cost, setCost] = useState<string>('0');

  useEffect(() => {
    if (isOpen) {
      setHours('1');
      setCost('0');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hours);
    const c = parseFloat(cost);
    if (!isNaN(h) && !isNaN(c)) {
      onConfirm(h, c);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="text-center w-full">
            <h2 className="text-xl font-bold text-slate-800">Reducir Tiempo</h2>
            <p className="text-sm text-slate-500">Habitación {room.id}</p>
          </div>
          <button onClick={onClose} className="absolute right-4 text-slate-400 hover:text-rose-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <form id="reduceTimeForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-orange-50 p-4 rounded-xl text-xs text-orange-800 border border-orange-100 mb-4">
               <strong>Nota:</strong> Esta acción restará tiempo a la hora de salida y descontará el monto del total a pagar.
            </div>

            {/* Hours Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Horas a Reducir</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="number" 
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="0.5"
                  step="0.5"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition"
                  required
                />
              </div>
            </div>

            {/* Cost Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Monto a Descontar</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="number" 
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  min="0"
                  step="0.50"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50 focus:bg-white transition"
                  required
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="submit"
            form="reduceTimeForm"
            className="w-full md:w-auto px-8 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            Confirmar Reducción
          </button>
        </div>

      </div>
    </div>
  );
};
