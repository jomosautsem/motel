
import React, { useState } from 'react';
import { Room, RoomStatus, VehicleReport } from '../types';
import { Car, Bike, Footprints, AlertTriangle, PlusCircle, Search, User, MapPin, Clock } from 'lucide-react';
import { VehicleReportModal } from './VehicleReportModal';

interface VehiclesManagerProps {
  rooms: Room[];
  reports: VehicleReport[];
  onAddReport: (report: Omit<VehicleReport, 'id' | 'date'>) => void;
}

export const VehiclesManager: React.FC<VehiclesManagerProps> = ({ rooms, reports, onAddReport }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // Stats
  const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED);
  const autoCount = occupiedRooms.filter(r => r.entryType === 'Auto').length;
  const motoCount = occupiedRooms.filter(r => r.entryType === 'Moto').length;
  const footCount = occupiedRooms.filter(r => r.entryType === 'Pie').length;

  return (
    <div className="animate-fade-in space-y-8 min-h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-rose-500 tracking-tight">Gestión de Vehículos y Reportes</h2>
          <p className="text-slate-400">Monitoreo de entradas y seguridad vehicular</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-rose-900/20 transition flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          Crear Reporte de Vehículo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Autos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-medium text-sm">Automóviles</p>
             <p className="text-3xl font-bold text-slate-800 mt-1">{autoCount}</p>
             <p className="text-xs text-green-600 font-semibold mt-1">Activos en propiedad</p>
           </div>
           <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
             <Car className="w-8 h-8" />
           </div>
        </div>

        {/* Motos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-medium text-sm">Motocicletas</p>
             <p className="text-3xl font-bold text-slate-800 mt-1">{motoCount}</p>
             <p className="text-xs text-green-600 font-semibold mt-1">Activos en propiedad</p>
           </div>
           <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
             <Bike className="w-8 h-8" />
           </div>
        </div>

        {/* Pie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-medium text-sm">Entradas a Pie</p>
             <p className="text-3xl font-bold text-slate-800 mt-1">{footCount}</p>
             <p className="text-xs text-green-600 font-semibold mt-1">Huéspedes activos</p>
           </div>
           <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
             <User className="w-8 h-8" />
           </div>
        </div>

        {/* Reportados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-slate-500 font-medium text-sm">Vehículos Reportados</p>
             <p className={`text-3xl font-bold mt-1 ${reports.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{reports.length}</p>
             <p className="text-xs text-slate-400 font-semibold mt-1">Incidencias registradas</p>
           </div>
           <div className={`p-4 rounded-xl ${reports.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
             <AlertTriangle className="w-8 h-8" />
           </div>
        </div>
      </div>

      {/* Reports List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-slate-800">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold">Reportes Recientes</h3>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
             <div className="bg-white p-4 rounded-full shadow-sm mb-3">
               <Car className="w-8 h-8 text-slate-300" />
             </div>
             <p className="font-medium">No hay reportes de vehículos registrados.</p>
             <p className="text-sm opacity-70">El sistema está limpio de incidentes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map(report => (
              <div key={report.id} className="border border-l-4 border-l-rose-500 rounded-xl p-4 bg-rose-50/50 hover:bg-rose-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono font-bold text-slate-800 text-lg bg-white px-2 py-0.5 rounded border border-rose-100">{report.plate}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    report.severity === 'Alta' ? 'bg-rose-600 text-white' : 
                    report.severity === 'Media' ? 'bg-orange-500 text-white' : 
                    'bg-yellow-400 text-slate-900'
                  }`}>
                    {report.severity}
                  </span>
                </div>
                <p className="text-slate-700 text-sm mb-3">{report.description}</p>
                <p className="text-xs text-slate-400 text-right">{report.date.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Vehicles List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2 text-slate-800">
            <Car className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold">Vehículos en Propiedad</h3>
          </div>
          <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">
            {occupiedRooms.length} Activos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {occupiedRooms.map(room => (
            <div key={room.id} className="p-5 rounded-2xl border border-slate-100 hover:shadow-md transition bg-white group">
              
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition">
                      {room.entryType === 'Moto' ? <Bike className="w-5 h-5" /> : room.entryType === 'Pie' ? <User className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                   </div>
                   <div>
                     <p className="text-xs text-slate-400 font-bold uppercase">Cliente</p>
                     <p className="font-bold text-slate-800">Habitación {room.id}</p>
                   </div>
                 </div>
                 <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md">
                   Activo
                 </span>
              </div>

              {room.entryType !== 'Pie' ? (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Placa:</span>
                    <span className="text-xs font-mono font-bold text-slate-800">{room.vehiclePlate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Vehículo:</span>
                    <span className="text-xs font-medium text-slate-800 text-right truncate max-w-[120px]">
                      {room.vehicleBrand} {room.vehicleModel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">Color:</span>
                    <span className="text-xs font-medium text-slate-800">{room.vehicleColor || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 text-sm gap-2 h-[86px]">
                  <Footprints className="w-4 h-4" /> Entrada a Pie
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                <span>Habitación {room.id}</span>
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3" />
                <span>{room.checkInTime ? room.checkInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</span>
              </div>

            </div>
          ))}
          {occupiedRooms.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 italic">
              No hay habitaciones ocupadas actualmente.
            </div>
          )}
        </div>
      </div>

      <VehicleReportModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onAddReport}
      />
    </div>
  );
};
