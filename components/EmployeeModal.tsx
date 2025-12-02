
import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Save } from 'lucide-react';
import { Employee } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'joinedDate'>) => void;
  initialData?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<Employee['status']>('Activo');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setRole(initialData.role);
        setStatus(initialData.status);
      } else {
        setName('');
        setRole('Recamarera');
        setStatus('Activo');
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, role, status });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 md:p-8">
          <form id="employeeForm" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. María Pérez"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Puesto / Rol</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
                >
                  <option value="Recamarera">Recamarera</option>
                  <option value="Recepcionista">Recepcionista</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Estado</label>
              <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={() => setStatus('Activo')}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium border ${status === 'Activo' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-slate-200 text-slate-500'}`}
                 >
                   Activo
                 </button>
                 <button
                   type="button"
                   onClick={() => setStatus('Descanso')}
                   className={`flex-1 py-2 rounded-lg text-sm font-medium border ${status === 'Descanso' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-white border-slate-200 text-slate-500'}`}
                 >
                   Descanso
                 </button>
              </div>
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
            form="employeeForm"
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>

      </div>
    </div>
  );
};
