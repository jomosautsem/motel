
import React, { useState } from 'react';
import { X, Wrench, AlertTriangle } from 'lucide-react';
import { Room } from '../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onConfirm: (reason: string) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose, room, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold">Poner en Mantenimiento</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="font-bold text-yellow-800 text-sm">Atención</p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              La Habitación {room.id} quedará inhabilitada hasta que se marque como "Disponible" nuevamente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Motivo / Problema</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Fuga de agua en baño, TV no enciende, Pintura..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-none bg-white text-slate-800"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition active:scale-[0.98]"
            >
              Confirmar Mantenimiento
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
