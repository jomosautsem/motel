import React, { useState, useEffect } from 'react';
import { X, Tv, Thermometer, CheckSquare, Minus, Plus } from 'lucide-react';
import { Room } from '../types';

interface ControlsModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomId: string, tvCount: number, acCount: number) => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ room, isOpen, onClose, onSave }) => {
  const [tvCount, setTvCount] = useState(0);
  const [acCount, setAcCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTvCount(room.tvControlCount || 0);
      setAcCount(room.acControlCount || 0);
    }
  }, [isOpen, room]);

  const handleReset = () => {
    setTvCount(0);
    setAcCount(0);
  };

  const handleSave = () => {
    onSave(room.id, tvCount, acCount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestionar Controles</h2>
            <p className="text-sm text-slate-500 font-medium">Hab. Habitación {room.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Quick Action: Mark Returned */}
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100 transition font-medium text-sm"
          >
            <CheckSquare className="w-4 h-4" />
            Marcar Todo como Devuelto (Poner a 0)
          </button>

          {/* Counters */}
          <div className="space-y-4">
            
            {/* TV Control */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition bg-white shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Tv className="w-6 h-6 text-blue-500" />
                <span className="font-semibold">Controles de TV</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTvCount(Math.max(0, tvCount - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-500 active:scale-95 transition"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold text-xl text-slate-800">{tvCount}</span>
                <button 
                  onClick={() => setTvCount(tvCount + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-green-500 active:scale-95 transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AC Control */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-orange-200 transition bg-white shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <Thermometer className="w-6 h-6 text-orange-500" />
                <span className="font-semibold">Controles de Aire</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setAcCount(Math.max(0, acCount - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-rose-500 active:scale-95 transition"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-bold text-xl text-slate-800">{acCount}</span>
                <button 
                  onClick={() => setAcCount(acCount + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-green-500 active:scale-95 transition"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition active:scale-[0.98]"
          >
            Guardar Controles
          </button>
        </div>

      </div>
    </div>
  );
};