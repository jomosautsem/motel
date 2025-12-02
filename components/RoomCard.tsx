import React, { useState } from 'react';
import { Room, RoomStatus } from '../types';
import { 
  Car, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  User, 
  Users, 
  DollarSign, 
  Bike, 
  Footprints,
  Menu,
  X,
  LogOut,
  Sliders,
  PlusCircle,
  MinusCircle,
  UserPlus,
  UserMinus,
  Edit,
  ArrowRightLeft,
  ArrowRight
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onStatusChange: (id: string, status: RoomStatus) => void;
  onOpenControls?: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onStatusChange, onOpenControls }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-white border-green-200 text-green-700 hover:border-green-400';
      case RoomStatus.OCCUPIED: return 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-400';
      case RoomStatus.CLEANING: return 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400';
      case RoomStatus.MAINTENANCE: return 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:border-yellow-400';
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-green-100 text-green-800';
      case RoomStatus.OCCUPIED: return 'bg-rose-100 text-rose-800';
      case RoomStatus.CLEANING: return 'bg-blue-100 text-blue-800';
      case RoomStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTime = (date?: Date | string) => {
    if (!date) return '--:--';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getEntryIcon = (type?: string) => {
    switch(type) {
      case 'Moto': return <Bike className="w-3.5 h-3.5" />;
      case 'Pie': return <Footprints className="w-3.5 h-3.5" />;
      default: return <Car className="w-3.5 h-3.5" />;
    }
  };

  // Occupied Menu Action Button Component
  const ActionBtn = ({ icon: Icon, label, colorClass, onClick }: { icon: any, label: string, colorClass: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg border bg-white shadow-sm hover:shadow-md transition active:scale-95 ${colorClass}`}
    >
      <Icon className="w-5 h-5 mb-1" />
      <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
    </button>
  );

  return (
    <div className={`relative p-5 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[380px] ${getStatusColor(room.status)}`}>
      
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">Habitación {room.id}</h3>
            <p className="text-xs opacity-75 mt-1 font-medium tracking-wide">{room.type.toUpperCase()}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(room.status)}`}>
            {room.status}
          </span>
        </div>

        {/* Content Area */}
        <div className="space-y-3">
          
          {/* --- OCCUPIED VIEW --- */}
          {room.status === RoomStatus.OCCUPIED && (
            <>
              {showActions ? (
                // EXPANDED MENU VIEW
                <div className="animate-fade-in space-y-3">
                  {/* History Log Box */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-inner">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Historial de la Estancia</div>
                    <div className="flex items-start gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="mt-1 text-blue-500">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-700 font-medium">
                          Entrada inicial con <span className="font-bold">{room.peopleCount || 2} persona(s)</span>.
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {formatDate(room.checkInTime)}, {formatTime(room.checkInTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <ActionBtn 
                      icon={LogOut} 
                      label="Liberar" 
                      colorClass="text-rose-600 border-rose-100 hover:bg-rose-50" 
                      onClick={() => onStatusChange(room.id, RoomStatus.CLEANING)}
                    />
                    <ActionBtn 
                      icon={Sliders} 
                      label="Controles" 
                      colorClass="text-blue-600 border-blue-100 hover:bg-blue-50" 
                      onClick={() => onOpenControls && onOpenControls(room)}
                    />
                    
                    <ActionBtn icon={PlusCircle} label="Aumentar" colorClass="text-green-600 border-green-100 hover:bg-green-50" />
                    <ActionBtn icon={MinusCircle} label="Reducir" colorClass="text-orange-600 border-orange-100 hover:bg-orange-50" />
                    
                    <ActionBtn icon={UserPlus} label="+/- Persona" colorClass="text-purple-600 border-purple-100 hover:bg-purple-50" />
                    <ActionBtn icon={UserMinus} label="Salida Persona" colorClass="text-pink-600 border-pink-100 hover:bg-pink-50" />
                    
                    <ActionBtn icon={Edit} label="Editar E/S" colorClass="text-amber-600 border-amber-100 hover:bg-amber-50" />
                    <ActionBtn icon={ArrowRightLeft} label="Cambiar Hab." colorClass="text-indigo-600 border-indigo-100 hover:bg-indigo-50" />
                  </div>
                </div>
              ) : (
                // STANDARD INFO VIEW
                <div className="space-y-3 bg-white/60 p-3 rounded-xl border border-rose-100/50 backdrop-blur-sm">
                  
                  {/* Client & People */}
                  <div className="flex justify-between items-start border-b border-rose-100 pb-2">
                     <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <User className="w-4 h-4 text-rose-500" />
                        <span className="truncate max-w-[110px] text-sm" title={room.clientName}>{room.clientName || 'Anónimo'}</span>
                     </div>
                     <div className="flex items-center gap-1 text-slate-500 text-xs bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                        <Users className="w-3 h-3" />
                        <span>{room.peopleCount || 2}</span>
                     </div>
                  </div>

                  {/* Time Range */}
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <div className="flex gap-2 font-mono">
                      <span>{formatTime(room.checkInTime)}</span>
                      <span className="text-slate-300">➜</span>
                      <span>{formatTime(room.checkOutTime)}</span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  {room.entryType !== 'Pie' && (
                    <div className="text-xs text-slate-600 space-y-1 pl-2 border-l-2 border-rose-200">
                       <div className="flex items-center gap-1.5 font-medium text-rose-700">
                         {getEntryIcon(room.entryType)}
                         <span>{room.entryType}</span>
                       </div>
                       {(room.vehicleBrand || room.vehiclePlate) ? (
                          <div className="space-y-0.5">
                            <p className="opacity-80 truncate">{room.vehicleBrand} {room.vehicleModel} {room.vehicleColor}</p>
                            <p className="font-mono font-bold text-slate-700 bg-slate-100 inline-block px-1 rounded text-[10px]">{room.vehiclePlate}</p>
                          </div>
                       ) : (
                         <p className="text-slate-400 italic">Sin datos de vehículo</p>
                       )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{room.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* --- OTHER STATUS VIEWS --- */}
          {room.status === RoomStatus.AVAILABLE && (
            <div className="flex items-center text-sm gap-2 opacity-60 py-4">
              <Sparkles className="w-4 h-4" />
              <span>Lista para recibir huéspedes</span>
            </div>
          )}

          {room.status === RoomStatus.MAINTENANCE && (
            <div className="flex items-center text-sm gap-2 opacity-60 py-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Revisión técnica requerida</span>
            </div>
          )}
          
           {room.status === RoomStatus.CLEANING && (
            <div className="flex items-center text-sm gap-2 opacity-60 py-4">
              <Sparkles className="w-4 h-4" />
              <span>Limpieza en progreso</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Main Buttons */}
      <div className="mt-4 pt-4 border-t border-black/5">
        {room.status === RoomStatus.OCCUPIED ? (
          <button 
            onClick={() => setShowActions(!showActions)}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
              showActions 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-rose-600 text-white hover:bg-rose-700'
            }`}
          >
            {showActions ? (
              <>
                <X className="w-4 h-4" /> Cerrar Menú
              </>
            ) : (
              <>
                <Menu className="w-4 h-4" /> Gestionar
              </>
            )}
          </button>
        ) : (
          /* Standard Buttons for other statuses */
          <div className="flex gap-2">
            {room.status === RoomStatus.AVAILABLE && (
              <button 
                onClick={() => onStatusChange(room.id, RoomStatus.OCCUPIED)}
                className="w-full py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition shadow-sm hover:shadow-md"
              >
                Ocupar
              </button>
            )}
            {room.status === RoomStatus.CLEANING && (
              <button 
                onClick={() => onStatusChange(room.id, RoomStatus.AVAILABLE)}
                className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-sm hover:shadow-md"
              >
                Marcar Lista
              </button>
            )}
            {(room.status === RoomStatus.MAINTENANCE) && (
              <button 
                onClick={() => onStatusChange(room.id, RoomStatus.AVAILABLE)}
                className="w-full py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition shadow-sm hover:shadow-md"
              >
                Finalizar Mant.
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};