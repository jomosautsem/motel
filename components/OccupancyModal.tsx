import React, { useState, useEffect } from 'react';
import { X, Car, Bike, Footprints, Calendar, Clock, DollarSign, User, Users } from 'lucide-react';
import { Room } from '../types';

interface OccupancyModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export const OccupancyModal: React.FC<OccupancyModalProps> = ({ room, isOpen, onClose, onConfirm }) => {
  const [clientName, setClientName] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [entryType, setEntryType] = useState<'Auto' | 'Moto' | 'Pie'>('Auto');
  
  // Vehicle Data
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');

  // Time Data
  const [manualTime, setManualTime] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Price
  const [price, setPrice] = useState(280);

  // Initialize form on open
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const formatTime = (date: Date) => {
        // Returns HH:MM in 24h format
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
      };
      setStartTime(formatTime(now));
      
      // Default 4 hours
      const end = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      setEndTime(formatTime(end));
      
      // Default name is the Room ID as requested
      setClientName(`Habitación ${room.id}`);
      
      setPeopleCount(2);
      setEntryType('Auto');
      setBrand('');
      setModel('');
      setColor('');
      setPlate('');
    }
  }, [isOpen, room.id]);

  // Pricing Logic Helper
  const calculatePrice = (hours: number) => {
    // Tarifas Actualizadas:
    // 2hr $220
    // 4hr $280
    // 5hr $300
    // 8hr $330
    // 12hr $480
    
    // Usamos un pequeño margen (0.1) para errores de redondeo en cálculos de tiempo
    if (hours <= 2.1) return 220;
    if (hours <= 4.1) return 280;
    if (hours <= 5.1) return 300;
    if (hours <= 8.1) return 330;
    if (hours <= 12.1) return 480;
    
    // Si es más de 12 horas, cobramos $50 extra por hora adicional (lógica existente mantenida como fallback)
    return 480 + (Math.ceil(hours - 12) * 50);
  };

  // Effect to automatically calculate price when times change
  useEffect(() => {
    if (!startTime || !endTime) return;

    const now = new Date();
    // Create date objects using a dummy date to compare time difference
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    if (isNaN(startH) || isNaN(endH)) return;

    const startDate = new Date(now);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(endH, endM, 0, 0);

    // Handle overnight (if end time is earlier than start time, assume it's next day)
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 0) {
      setPrice(calculatePrice(diffHours));
    }
  }, [startTime, endTime]);

  const handleQuickTime = (hours: number) => {
    const start = new Date();
    // Parse current start time input if valid, else use now
    const [sh, sm] = startTime.split(':').map(Number);
    if (!isNaN(sh)) {
        start.setHours(sh);
        start.setMinutes(sm);
        start.setSeconds(0);
    }

    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    
    // Format to HH:MM 24h
    const formatTime = (date: Date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setEndTime(formatTime(end));
    // Price will update via useEffect
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    
    // Parse Start Time
    const [startH, startM] = startTime.split(':').map(Number);
    const checkInDate = new Date(now);
    checkInDate.setHours(startH, startM, 0, 0);

    // Parse End Time
    const [endH, endM] = endTime.split(':').map(Number);
    const checkOutDate = new Date(now);
    checkOutDate.setHours(endH, endM, 0, 0);

    // Handle overnight stays
    if (checkOutDate <= checkInDate) {
        checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    onConfirm({
      clientName: clientName || `Habitación ${room.id}`,
      peopleCount,
      entryType,
      vehicleBrand: brand,
      vehicleModel: model,
      vehicleColor: color,
      vehiclePlate: plate,
      checkInTime: checkInDate,
      checkOutTime: checkOutDate,
      totalPrice: price
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
             </button>
             <h2 className="text-xl font-bold text-slate-800">Ocupar Habitación: <span className="text-rose-600">Habitación {room.id}</span></h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50">
          <form id="occupancyForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Client & Vehicle */}
            <div className="space-y-6">
              
              {/* Client Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nombre del Cliente</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white transition"
                  />
                </div>
              </div>

              {/* People Count */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Personas</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white transition"
                  />
                </div>
              </div>

              {/* Entry Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Tipo de Entrada</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEntryType('Auto')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${
                      entryType === 'Auto' 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Car className="w-5 h-5" /> Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('Moto')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${
                      entryType === 'Moto' 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bike className="w-5 h-5" /> Moto
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('Pie')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium transition-all ${
                      entryType === 'Pie' 
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Footprints className="w-5 h-5" /> Pie
                  </button>
                </div>
              </div>

              {/* Vehicle Info - Conditional */}
              {entryType !== 'Pie' && (
                <div className="space-y-4 animate-fade-in">
                  <input 
                    type="text" 
                    placeholder="Marca"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Modelo"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Placas (ABC1234)"
                      value={plate}
                      onChange={(e) => setPlate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Time & Price */}
            <div className="space-y-8">
              
              {/* Time Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <h3>Tiempo de Estancia</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                  <span className="text-sm font-medium text-slate-600">Activar Tiempo Manual</span>
                  <div 
                    onClick={() => setManualTime(!manualTime)}
                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ${manualTime ? 'bg-rose-500' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${manualTime ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hora de Inicio</label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      readOnly={!manualTime}
                      className={`w-full px-4 py-3 rounded-xl border outline-none font-mono text-center text-lg ${manualTime ? 'bg-white border-slate-300 focus:border-rose-500' : 'bg-slate-50 border-transparent text-slate-500'}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Hora de Fin</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      readOnly={!manualTime}
                      className={`w-full px-4 py-3 rounded-xl border outline-none font-mono text-center text-lg ${manualTime ? 'bg-white border-slate-300 focus:border-rose-500' : 'bg-slate-50 border-transparent text-slate-500'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">O Selección Rápida:</p>
                  <div className="flex flex-wrap gap-2">
                    {[2, 4, 5, 8, 12].map((hr) => (
                      <button
                        key={hr}
                        type="button"
                        onClick={() => handleQuickTime(hr)}
                        className="flex-1 min-w-[60px] py-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-600 rounded-lg text-sm font-medium transition"
                      >
                        {hr} Hr
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <label className="text-lg font-bold text-slate-800 block">Precio Total</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-6 h-6" />
                  <input 
                    type="text"
                    value={price}
                    readOnly
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-blue-500 bg-slate-800 text-white text-3xl font-bold outline-none cursor-not-allowed"
                  />
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex gap-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-3.5 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="occupancyForm"
            className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.01] transition transform flex items-center justify-center gap-2"
          >
            <span>Ocupar Habitación</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};