
import React, { useState } from 'react';
import { X, AlertTriangle, Save, Car } from 'lucide-react';
import { VehicleReport } from '../types';

interface VehicleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Omit<VehicleReport, 'id' | 'date'>) => void;
  knownVehicles?: { plate: string, brand: string, model: string, room: string }[];
}

export const VehicleReportModal: React.FC<VehicleReportModalProps> = ({ isOpen, onClose, onSave, knownVehicles = [] }) => {
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<VehicleReport['severity']>('Baja');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ plate, brand, model, description, severity });
    // Reset
    setPlate('');
    setBrand('');
    setModel('');
    setDescription('');
    setSeverity('Baja');
    onClose();
  };

  const handleSelectVehicle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPlate = e.target.value;
    if (!selectedPlate) return;

    const vehicle = knownVehicles.find(v => v.plate === selectedPlate);
    if (vehicle) {
      setPlate(vehicle.plate);
      setBrand(vehicle.brand);
      setModel(vehicle.model);
    }
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
        <div className="p-6 md:p-8 bg-white">
          
          {/* Quick Select from Active Vehicles */}
          {knownVehicles.length > 0 && (
            <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                <Car className="w-3 h-3" /> Seleccionar de Activos
              </label>
              <select 
                onChange={handleSelectVehicle}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Lista de vehículos en propiedad --</option>
                {knownVehicles.map((v, idx) => (
                  <option key={`${v.plate}-${idx}`} value={v.plate}>
                    Hab {v.room}: {v.plate} ({v.brand})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form id="reportForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Placas del Vehículo</label>
              <input 
                type="text" 
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none uppercase font-mono font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Marca</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej. Nissan"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Modelo</label>
                <input 
                  type="text" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ej. Versa"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nivel de Alerta</label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
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
