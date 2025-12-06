
import React, { useState } from 'react';
import { X, ArrowRightLeft, BedDouble } from 'lucide-react';
import { Room } from '../types';

interface ChangeRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceRoom: Room | null;
  availableRooms: Room[];
  onConfirm: (targetRoomId: string) => void;
}

export const ChangeRoomModal: React.FC<ChangeRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  sourceRoom, 
  availableRooms, 
  onConfirm 
}) => {
  const [targetRoomId, setTargetRoomId] = useState('');

  if (!isOpen || !sourceRoom) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRoomId) {
      onConfirm(targetRoomId);
      setTargetRoomId('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2 text-indigo-700">
            <ArrowRightLeft className="w-5 h-5" />
            <h2 className="text-xl font-bold">Cambiar Habitación</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-indigo-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Source Info */}
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
               <div>
                 <p className="text-xs font-bold text-rose-400 uppercase">Origen</p>
                 <p className="text-lg font-bold text-slate-800">Habitación {sourceRoom.id}</p>
                 <p className="text-xs text-slate-500">{sourceRoom.type}</p>
               </div>
               <BedDouble className="w-8 h-8 text-rose-300" />
            </div>

            <div className="flex justify-center">
               <div className="bg-slate-100 p-2 rounded-full">
                 <ArrowRightLeft className="w-5 h-5 text-slate-400" />
               </div>
            </div>

            {/* Target Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Seleccionar Destino</label>
              <select 
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                required
              >
                <option value="">-- Habitaciones Disponibles --</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    Habitación {room.id} - {room.type}
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && (
                <p className="text-xs text-rose-500 mt-1">No hay habitaciones disponibles para realizar el cambio.</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
              <p>Nota: Se transferirán todos los datos del cliente, tiempos y consumos pendientes automáticamente.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 border border-slate-300 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={!targetRoomId}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Confirmar Cambio
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
