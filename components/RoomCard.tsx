
import React, { useState } from 'react';
import { Room, RoomStatus, Consumption } from '../types';
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
  Receipt,
  BedDouble,
  ShoppingCart,
  Tv,
  Thermometer,
  Hourglass
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  activeConsumptions?: Consumption[];
  onStatusChange: (id: string, status: RoomStatus) => void;
  onOpenControls?: (room: Room) => void;
  onChangeRoom?: (room: Room) => void;
  onAddPerson?: (room: Room) => void;
  onRemovePerson?: (room: Room) => void;
  onAddTime?: (room: Room) => void;
  onReduceTime?: (room: Room) => void;
  onRequestRelease?: (room: Room) => void;
  variant?: 'standard' | 'compact';
  currentTime?: Date; // Added for real-time overdue calculation
}

export const RoomCard: React.FC<RoomCardProps> = ({ 
  room, 
  activeConsumptions = [], 
  onStatusChange, 
  onOpenControls, 
  onChangeRoom,
  onAddPerson,
  onRemovePerson,
  onAddTime,
  onReduceTime,
  onRequestRelease,
  variant = 'standard',
  currentTime = new Date()
}) => {
  const [showActions, setShowActions] = useState(false);

  // Calculate duration in hours to determine color
  const getDurationHours = () => {
    if (!room.checkInTime || !room.checkOutTime) return 0;
    const start = new Date(room.checkInTime).getTime();
    const end = new Date(room.checkOutTime).getTime();
    return (end - start) / (1000 * 60 * 60);
  };

  // Overdue Logic
  const isOccupied = room.status === RoomStatus.OCCUPIED;
  const checkOutTime = room.checkOutTime ? new Date(room.checkOutTime) : null;
  const isOverdue = isOccupied && checkOutTime && currentTime > checkOutTime;
  
  const getOverdueTime = () => {
    if (!isOverdue || !checkOutTime) return 0;
    const diffMs = currentTime.getTime() - checkOutTime.getTime();
    return Math.floor(diffMs / 60000); // Minutes
  };

  const overdueMinutes = getOverdueTime();

  const getOccupancyColorClass = () => {
    // If overdue, force Red/Danger styling? Or keep urgency on badge?
    // Let's keep the paid duration color but add visual alarm.
    const hours = getDurationHours();
    if (hours <= 2.1) return 'bg-green-500 text-white border-green-600';
    if (hours <= 4.1) return 'bg-orange-500 text-white border-orange-600';
    if (hours <= 5.1) return 'bg-yellow-400 text-slate-900 border-yellow-500';
    if (hours <= 8.1) return 'bg-red-600 text-white border-red-700';
    return 'bg-blue-600 text-white border-blue-700';
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-white border-green-200 text-green-700 hover:border-green-400';
      case RoomStatus.OCCUPIED: return getOccupancyColorClass();
      case RoomStatus.CLEANING: return 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400';
      case RoomStatus.MAINTENANCE: return 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:border-yellow-400';
    }
  };

  const getStatusBadge = (status: RoomStatus) => {
    if (status === RoomStatus.OCCUPIED) return 'bg-black/20 text-current backdrop-blur-sm';
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-green-100 text-green-800';
      case RoomStatus.CLEANING: return 'bg-blue-100 text-blue-800';
      case RoomStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
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

  // --- Breakdown Calculations ---
  const totalConsumptionAmount = activeConsumptions.reduce((acc, c) => acc + c.totalAmount, 0);
  const totalRoomPrice = room.totalPrice || 0;
  
  const peopleCount = room.peopleCount || 2;
  const extraPeople = Math.max(0, peopleCount - 2);
  const extraPersonCost = extraPeople * 150;
  
  const roomRentPrice = totalRoomPrice - totalConsumptionAmount - extraPersonCost;
  const allItems = activeConsumptions.flatMap(c => c.items);

  // --- COMPACT VIEW (DASHBOARD) ---
  if (variant === 'compact') {
    const hasTvControls = (room.tvControlCount || 0) > 0;
    const hasAcControls = (room.acControlCount || 0) > 0;

    return (
      <div 
        onClick={() => {
           if (room.status === RoomStatus.AVAILABLE) onStatusChange(room.id, RoomStatus.OCCUPIED);
           else if (isOccupied) setShowActions(!showActions);
        }}
        className={`relative p-2 rounded-lg border-2 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between h-[120px] cursor-pointer ${getStatusColor(room.status)}`}
      >
        {/* Overdue Alarm Compact */}
        {isOverdue && (
           <div className="absolute -top-2 -right-2 z-20 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse border border-white shadow-sm flex items-center gap-0.5">
             <Hourglass className="w-2.5 h-2.5" />
             +{overdueMinutes}m
           </div>
        )}

        <div className="flex justify-between items-start">
          <span className="text-base font-bold leading-none">Hab {room.id}</span>
          {isOccupied && (
             <div className="flex items-center gap-0.5 text-[9px] bg-black/10 px-1 py-0.5 rounded backdrop-blur-md">
               <Clock className="w-2.5 h-2.5" />
               <span>{Math.round(getDurationHours())}h</span>
             </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center text-center relative">
          {isOccupied ? (
            <>
              <p className={`text-xl font-bold ${isOverdue ? 'animate-pulse' : ''}`}>{formatTime(room.checkOutTime)}</p>
              <p className="text-[9px] opacity-90 uppercase tracking-wide mt-0.5">Salida</p>
            </>
          ) : (
            <p className="text-xs font-medium opacity-70">{room.status}</p>
          )}

          {/* Controls Indicator (Icons) */}
          {(hasTvControls || hasAcControls) && (
             <div className="absolute right-0 bottom-0 flex gap-0.5">
                {hasTvControls && (
                  <div className={`p-0.5 rounded ${isOccupied ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`} title="Control TV">
                    <Tv className="w-2.5 h-2.5" />
                  </div>
                )}
                {hasAcControls && (
                  <div className={`p-0.5 rounded ${isOccupied ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`} title="Control Aire">
                    <Thermometer className="w-2.5 h-2.5" />
                  </div>
                )}
             </div>
          )}
        </div>

        <div className="flex justify-between items-end text-[9px] font-medium opacity-80">
          <span>{room.type}</span>
          {isOccupied && <span>{room.peopleCount} Pers.</span>}
        </div>
      </div>
    );
  }

  // --- STANDARD VIEW (ROOMS SCREEN) - COMPACTED ---
  const ActionBtn = ({ icon: Icon, label, colorClass, onClick }: { icon: any, label: string, colorClass: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-1 rounded-lg border bg-white shadow-sm hover:shadow-md transition active:scale-95 ${colorClass}`}
    >
      <Icon className="w-3.5 h-3.5 mb-0.5" />
      <span className="text-[8px] font-bold text-center leading-tight">{label}</span>
    </button>
  );

  return (
    <div className={`relative p-2.5 rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[260px] ${getStatusColor(room.status)}`}>
      
      {/* Overdue Alarm Standard */}
      {isOverdue && (
         <div className="absolute -top-2 -right-2 z-20 bg-red-600 text-white px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse border-2 border-white flex items-center gap-1">
           <AlertTriangle className="w-3 h-3" />
           <span className="text-[9px]">+{overdueMinutes}m</span>
         </div>
      )}

      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <div>
            <h3 className="text-base font-bold">Habitación {room.id}</h3>
            <p className="text-[9px] opacity-75 font-medium tracking-wide">{room.type.toUpperCase()}</p>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadge(room.status)}`}>
            {room.status}
          </span>
        </div>

        {/* Content Area */}
        <div className="space-y-1.5">
          
          {room.status === RoomStatus.OCCUPIED && (
            <>
              {showActions ? (
                // EXPANDED MENU VIEW
                <div className="animate-fade-in space-y-1.5 text-slate-800">
                  {/* Detailed History Log Box (Financial Breakdown) */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-inner overflow-hidden">
                    <div className="px-2 py-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                       <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                         <Receipt className="w-3 h-3" /> Cuenta
                       </span>
                       <span className="text-[8px] text-slate-400 font-mono">{formatDate(room.checkInTime)}</span>
                    </div>
                    
                    <div className="p-1.5 max-h-[80px] overflow-y-auto custom-scrollbar space-y-0.5">
                      {/* Room Rent Line */}
                      <div className="flex justify-between items-center text-[9px] text-slate-700">
                         <div className="flex items-center gap-1">
                           <BedDouble className="w-2.5 h-2.5 text-blue-500" />
                           <span className="font-medium">Hospedaje ({Math.round(getDurationHours())}h)</span>
                         </div>
                         <span className="font-mono font-bold">${roomRentPrice.toFixed(2)}</span>
                      </div>

                      {/* Extra Person Line */}
                      {extraPeople > 0 && (
                        <div className="flex justify-between items-center text-[9px] text-slate-700">
                           <div className="flex items-center gap-1">
                             <UserPlus className="w-2.5 h-2.5 text-purple-500" />
                             <span className="font-medium">Extra ({extraPeople})</span>
                           </div>
                           <span className="font-mono font-bold">${extraPersonCost.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Items List */}
                      {allItems.length > 0 && (
                        <div className="pt-0.5 mt-0.5 border-t border-slate-100 space-y-0.5">
                          {allItems.map((item, idx) => (
                            <div key={`${item.productId}-${idx}`} className="flex justify-between items-center text-[9px] text-slate-600">
                              <div className="flex items-center gap-1">
                                <ShoppingCart className="w-2.5 h-2.5 text-rose-500" />
                                <span>{item.quantity}x {item.productName}</span>
                              </div>
                              <span className="font-mono">${item.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Total Footer */}
                    <div className="px-2 py-0.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-[9px] font-bold text-slate-600 uppercase">Total</span>
                       <div className="flex items-center gap-1 bg-green-100 px-1.5 py-0.5 rounded text-green-700">
                          <DollarSign className="w-2.5 h-2.5" />
                          <span className="font-bold font-mono text-[10px]">{totalRoomPrice.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-1">
                    <ActionBtn 
                      icon={LogOut} 
                      label="Liberar" 
                      colorClass="text-rose-600 border-rose-100 hover:bg-rose-50" 
                      onClick={() => onRequestRelease && onRequestRelease(room)}
                    />
                    <ActionBtn 
                      icon={Sliders} 
                      label="Controles" 
                      colorClass="text-blue-600 border-blue-100 hover:bg-blue-50" 
                      onClick={() => onOpenControls && onOpenControls(room)}
                    />
                    
                    <ActionBtn 
                      icon={PlusCircle} 
                      label="Aumentar" 
                      colorClass="text-green-600 border-green-100 hover:bg-green-50" 
                      onClick={() => onAddTime && onAddTime(room)}
                    />
                    
                    <ActionBtn 
                      icon={MinusCircle} 
                      label="Reducir" 
                      colorClass="text-orange-600 border-orange-100 hover:bg-orange-50" 
                      onClick={() => onReduceTime && onReduceTime(room)}
                    />
                    
                    <ActionBtn 
                      icon={UserPlus} 
                      label="+/- Persona" 
                      colorClass="text-purple-600 border-purple-100 hover:bg-purple-50" 
                      onClick={() => onAddPerson && onAddPerson(room)}
                    />
                    
                    <ActionBtn 
                      icon={UserMinus} 
                      label="Salida Pers." 
                      colorClass="text-pink-600 border-pink-100 hover:bg-pink-50" 
                      onClick={() => onRemovePerson && onRemovePerson(room)}
                    />
                    
                    <ActionBtn icon={Edit} label="Editar E/S" colorClass="text-amber-600 border-amber-100 hover:bg-amber-50" />
                    <ActionBtn 
                      icon={ArrowRightLeft} 
                      label="Cambiar Hab." 
                      colorClass="text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                      onClick={() => onChangeRoom && onChangeRoom(room)}
                    />
                  </div>
                </div>
              ) : (
                // STANDARD INFO VIEW
                <div className="space-y-1.5 bg-white/20 p-2 rounded-lg border border-white/30 backdrop-blur-sm text-current">
                  
                  {/* Client & People */}
                  <div className="flex justify-between items-start border-b border-white/20 pb-1">
                     <div className="flex items-center gap-1 font-semibold">
                        <User className="w-3 h-3 opacity-80" />
                        <span className="truncate max-w-[80px] text-[10px]" title={room.clientName}>{room.clientName || 'Anónimo'}</span>
                     </div>
                     <div className="flex items-center gap-0.5 text-[9px] bg-black/10 px-1 py-0.5 rounded-md border border-white/10 shadow-sm">
                        <Users className="w-2.5 h-2.5" />
                        <span>{room.peopleCount || 2}</span>
                     </div>
                  </div>

                  {/* Time Range */}
                  <div className={`flex items-center gap-1.5 text-[9px] bg-black/10 p-1 rounded-lg ${isOverdue ? 'ring-2 ring-red-500 animate-pulse' : ''}`}>
                    <Clock className="w-2.5 h-2.5 opacity-70" />
                    <div className="flex gap-1.5 font-mono font-medium">
                      <span>{formatTime(room.checkInTime)}</span>
                      <span className="opacity-50">➜</span>
                      <span>{formatTime(room.checkOutTime)}</span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  {room.entryType !== 'Pie' && (
                    <div className="text-[9px] space-y-0.5 pl-1.5 border-l-2 border-white/30">
                       <div className="flex items-center gap-1 font-medium opacity-90">
                         {getEntryIcon(room.entryType)}
                         <span>{room.entryType}</span>
                       </div>
                       {(room.vehicleBrand || room.vehiclePlate) ? (
                          <div className="space-y-0.5 opacity-80">
                            <p className="truncate max-w-[100px]">{room.vehicleBrand} {room.vehicleModel}</p>
                            <p className="font-mono font-bold inline-block px-1 rounded text-[8px] bg-black/10">{room.vehiclePlate}</p>
                          </div>
                       ) : (
                         <p className="opacity-60 italic text-[8px]">Sin datos</p>
                       )}
                    </div>
                  )}

                  {/* Controls Indicators */}
                  {((room.tvControlCount || 0) > 0 || (room.acControlCount || 0) > 0) && (
                    <div className="flex gap-1 pt-0.5">
                      {(room.tvControlCount || 0) > 0 && (
                        <div className="flex items-center gap-0.5 text-[8px] bg-blue-500/20 px-1 py-0.5 rounded border border-blue-400/30" title="TV Control">
                          <Tv className="w-2.5 h-2.5" /> <span className="font-mono">{room.tvControlCount}</span>
                        </div>
                      )}
                      {(room.acControlCount || 0) > 0 && (
                        <div className="flex items-center gap-0.5 text-[8px] bg-orange-500/20 px-1 py-0.5 rounded border border-orange-400/30" title="AC Control">
                          <Thermometer className="w-2.5 h-2.5" /> <span className="font-mono">{room.acControlCount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-0.5 flex justify-between items-center">
                    <span className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Total</span>
                    <div className="flex items-center font-bold bg-black/10 px-1.5 py-0.5 rounded-md border border-white/10">
                      <DollarSign className="w-3 h-3" />
                      <span className="text-xs">{room.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {room.status === RoomStatus.AVAILABLE && (
            <div className="flex items-center text-xs gap-2 opacity-60 py-4 justify-center">
              <Sparkles className="w-4 h-4" />
              <span>Lista</span>
            </div>
          )}

          {room.status === RoomStatus.MAINTENANCE && (
            <div className="flex items-center text-xs gap-2 opacity-60 py-4 justify-center">
              <AlertTriangle className="w-4 h-4" />
              <span>Mantenimiento</span>
            </div>
          )}
          
           {room.status === RoomStatus.CLEANING && (
            <div className="flex items-center text-xs gap-2 opacity-60 py-4 justify-center">
              <Sparkles className="w-4 h-4" />
              <span>Limpieza</span>
            </div>
          )}
        </div>
      </div>

      <div className={`mt-1.5 pt-1.5 border-t ${room.status === RoomStatus.OCCUPIED ? 'border-white/20' : 'border-black/5'}`}>
        {room.status === RoomStatus.OCCUPIED ? (
          <button 
            onClick={() => setShowActions(!showActions)}
            className={`w-full py-1.5 rounded-lg text-xs font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-1 ${
              showActions 
                ? 'bg-white text-slate-700 hover:bg-slate-50' 
                : 'bg-black/20 text-white hover:bg-black/30'
            }`}
          >
            {showActions ? (
              <>
                <X className="w-3 h-3" /> Cerrar
              </>
            ) : (
              <>
                <Menu className="w-3 h-3" /> Gestionar
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-1.5">
            {room.status === RoomStatus.AVAILABLE && (
              <button 
                onClick={() => onStatusChange(room.id, RoomStatus.OCCUPIED)}
                className="w-full py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition shadow-sm hover:shadow-md"
              >
                Ocupar
              </button>
            )}
            {room.status === RoomStatus.CLEANING && (
              <button 
                onClick={() => onStatusChange(room.id, RoomStatus.AVAILABLE)}
                className="w-full py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition shadow-sm hover:shadow-md"
              >
                Lista
              </button>
            )}
            {(room.status === RoomStatus.MAINTENANCE) && (
              <button 
                onClick={() => onStatusChange(room.id, RoomStatus.AVAILABLE)}
                className="w-full py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-medium hover:bg-yellow-700 transition shadow-sm hover:shadow-md"
              >
                Listo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
