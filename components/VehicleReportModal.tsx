
import React, { useState } from 'react';
import { X, AlertTriangle, Save } from 'lucide-react';
import { VehicleReport } from '../types';

interface VehicleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Omit<VehicleReport, 'id' | 'date'>) => void;
}

export const VehicleReportModal: React.FC<VehicleReportModalProps> = ({ isOpen, onClose, onSave }) => {
  const [plate, setPlate] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<VehicleReport['severity']>('Baja');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ plate, description, severity });
    setPlate('');
    setDescription('');
    setSeverity('Baja');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-xl font-bold">Crear Reporte de Vehículo</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <form id="reportForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Placas del Vehículo</label>
              <input 
                type="text" 
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none uppercase font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nivel de Alerta</label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
              >
                <option value="Baja">Baja (Observación)</option>
                <option value="Media">Media (Incidente menor)</option>
                <option value="Alta">Alta (Prohibir acceso/Policía)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Descripción del Incidente</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describa el motivo del reporte..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                required
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-white transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="reportForm"
            className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar Reporte
          </button>
        </div>

      </div>
    </div>
  );
};
