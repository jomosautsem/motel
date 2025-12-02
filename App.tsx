import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  Car, 
  Utensils, 
  FileBarChart, 
  Users, 
  Wallet, 
  ArrowRightLeft, 
  LogOut, 
  Heart,
  Search,
  Bot,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { RoomCard } from './components/RoomCard';
import { OccupancyModal } from './components/OccupancyModal';
import { ControlsModal } from './components/ControlsModal';
import { Room, RoomStatus, AppView } from './types';
import { analyzeBusinessData } from './services/geminiService';

// --- DATA INITIALIZATION ---
const ROOM_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9A", "9B", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

const INITIAL_ROOMS: Room[] = ROOM_IDS.map(id => ({
  id,
  status: Math.random() > 0.7 ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE,
  type: ['9A', '9B'].includes(id) ? 'Jacuzzi' : (parseInt(id) > 15 ? 'Suite' : 'Sencilla'),
  vehiclePlate: Math.random() > 0.7 ? `ABC-${Math.floor(100 + Math.random() * 900)}` : undefined,
  clientName: Math.random() > 0.7 ? 'Cliente Anónimo' : undefined,
  tvControlCount: 0,
  acControlCount: 0
}));

const CHART_DATA = [
  { name: 'Lun', ingresos: 4000, ocupacion: 45 },
  { name: 'Mar', ingresos: 3000, ocupacion: 35 },
  { name: 'Mie', ingresos: 5000, ocupacion: 55 },
  { name: 'Jue', ingresos: 7500, ocupacion: 65 },
  { name: 'Vie', ingresos: 12000, ocupacion: 90 },
  { name: 'Sab', ingresos: 15000, ocupacion: 98 },
  { name: 'Dom', ingresos: 11000, ocupacion: 85 },
];

export default function App() {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  
  // Occupancy Modal State
  const [occupancyModalOpen, setOccupancyModalOpen] = useState(false);
  const [selectedRoomForOccupancy, setSelectedRoomForOccupancy] = useState<Room | null>(null);

  // Controls Modal State
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const [selectedRoomForControls, setSelectedRoomForControls] = useState<Room | null>(null);

  // AI Report State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'motellasbolas@gmail.com' && password === 'j5s82QSM') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
    // Intercept OCCUPIED status to show modal
    if (newStatus === RoomStatus.OCCUPIED) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoomForOccupancy(room);
        setOccupancyModalOpen(true);
      }
      return;
    }

    // Default behavior for other statuses
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        // Reset extra data when freeing the room
        if (newStatus === RoomStatus.AVAILABLE || newStatus === RoomStatus.CLEANING) {
          return { 
            ...r, 
            status: newStatus,
            clientName: undefined,
            vehiclePlate: undefined,
            checkInTime: undefined,
            peopleCount: undefined,
            totalPrice: undefined,
            tvControlCount: 0,
            acControlCount: 0
          };
        }
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  const handleConfirmOccupancy = (data: Partial<Room>) => {
    if (selectedRoomForOccupancy) {
      setRooms(prev => prev.map(r => 
        r.id === selectedRoomForOccupancy.id 
          ? { ...r, status: RoomStatus.OCCUPIED, ...data } 
          : r
      ));
      setOccupancyModalOpen(false);
      setSelectedRoomForOccupancy(null);
    }
  };

  const handleOpenControls = (room: Room) => {
    setSelectedRoomForControls(room);
    setControlsModalOpen(true);
  };

  const handleSaveControls = (roomId: string, tvCount: number, acCount: number) => {
    setRooms(prev => prev.map(r => 
      r.id === roomId 
        ? { ...r, tvControlCount: tvCount, acControlCount: acCount }
        : r
    ));
    setControlsModalOpen(false);
    setSelectedRoomForControls(null);
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    const context = `
      Ingresos Semanales: ${JSON.stringify(CHART_DATA)}
      Estado Actual Habitaciones: ${rooms.filter(r => r.status === RoomStatus.OCCUPIED).length} ocupadas de 21.
      Habitaciones en Limpieza: ${rooms.filter(r => r.status === RoomStatus.CLEANING).length}.
    `;
    const result = await analyzeBusinessData(context);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 p-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10">
          <div className="text-center mb-8">
            <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Heart className="w-10 h-10 text-rose-600 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Motel las Bolas</h1>
            <p className="text-slate-500 mt-2">Sistema de Gestión Privado</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition bg-white/50"
                placeholder="admin@motel.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition bg-white/50"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-lg border border-rose-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-rose-500/30 hover:scale-[1.02] transition-all duration-200"
            >
              Ingresar al Sistema
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; 2024 Motel las Bolas. Pasión y Excelencia.
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD LAYOUT ---
  const SidebarItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30' 
          : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#FDF2F4]"> {/* Very light rose background */}
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-rose-100 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <Heart className="w-8 h-8 fill-rose-600" />
            <span className="text-2xl font-bold text-slate-900 tracking-tight">MLB</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Panel de Control</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <SidebarItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem view={AppView.ROOMS} icon={BedDouble} label="Habitaciones" />
          <SidebarItem view={AppView.VEHICLES} icon={Car} label="Vehículos" />
          <SidebarItem view={AppView.FOOD} icon={Utensils} label="Alimentos" />
          <SidebarItem view={AppView.REPORTS} icon={FileBarChart} label="Reportes" />
          <SidebarItem view={AppView.EMPLOYEES} icon={Users} label="Empleados" />
          <SidebarItem view={AppView.EXPENSES} icon={Wallet} label="Gastos" />
          <SidebarItem view={AppView.TRANSFERS} icon={ArrowRightLeft} label="Transferencias" />
        </nav>

        <div className="p-4 border-t border-rose-100">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-600 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b p-4 flex justify-between items-center shadow-sm">
        <span className="font-bold text-lg text-rose-600">Motel las Bolas</span>
        <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="text-slate-600">
          <LayoutDashboard />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        
        {/* VIEW: DASHBOARD */}
        {currentView === AppView.DASHBOARD && (
          <div className="space-y-8 animate-fade-in">
            <header className="mb-6">
              <h2 className="text-3xl font-bold text-slate-800">Bienvenido de nuevo</h2>
              <p className="text-slate-500">Resumen operativo del día</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Ocupación Actual</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-2">68%</h3>
                  </div>
                  <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                    <BedDouble className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-green-500 text-sm font-medium flex items-center">+12%</span>
                  <span className="text-slate-400 text-xs">vs. ayer</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Ingresos Hoy</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-2">$2,450</h3>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <Wallet className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-green-500 text-sm font-medium flex items-center">Bueno</span>
                  <span className="text-slate-400 text-xs">Objetivo: $2,000</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Hab. Limpieza</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-2">
                      {rooms.filter(r => r.status === RoomStatus.CLEANING).length}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">Prioridad Alta</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Vehículos</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-2">
                       {rooms.filter(r => r.status === RoomStatus.OCCUPIED).length}
                    </h3>
                  </div>
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <Car className="w-6 h-6" />
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">En premisas</p>
              </div>
            </div>

            {/* Quick Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Actividad Reciente</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#fff1f2', radius: 4}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="ingresos" fill="#e11d48" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: ROOMS */}
        {currentView === AppView.ROOMS && (
          <div className="animate-fade-in">
             <header className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Habitaciones</h2>
                <p className="text-slate-500">Gestión de estado en tiempo real</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Disponible
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Ocupada
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Limpieza
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rooms.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onStatusChange={handleStatusChange} 
                  onOpenControls={handleOpenControls}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW: REPORTS (WITH GEMINI) */}
        {currentView === AppView.REPORTS && (
          <div className="animate-fade-in space-y-8">
            <header className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Reportes Financieros</h2>
                <p className="text-slate-500">Análisis detallado de rendimiento</p>
              </div>
            </header>

            {/* AI Insight Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <Bot className="w-32 h-32" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                     <Sparkles className="w-6 h-6 text-yellow-300" />
                   </div>
                   <h3 className="text-xl font-bold">Asistente Inteligente MLB</h3>
                 </div>
                 
                 {!aiAnalysis ? (
                   <div className="max-w-xl">
                     <p className="text-indigo-100 mb-6">
                       Utiliza nuestra IA integrada para analizar patrones de ocupación, sugerir ajustes de precios y detectar anomalías en los gastos de esta semana.
                     </p>
                     <button 
                       onClick={handleGenerateReport}
                       disabled={isAnalyzing}
                       className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg disabled:opacity-70 flex items-center gap-2"
                     >
                       {isAnalyzing ? (
                         <>
                           <span className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                           Analizando datos...
                         </>
                       ) : (
                         <>
                           <Bot className="w-5 h-5" />
                           Generar Análisis Ahora
                         </>
                       )}
                     </button>
                   </div>
                 ) : (
                   <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-fade-in">
                     <h4 className="font-bold text-lg mb-2 text-yellow-300">Resumen Ejecutivo</h4>
                     <p className="text-white/90 whitespace-pre-line leading-relaxed text-sm">
                       {aiAnalysis}
                     </p>
                     <button 
                       onClick={() => setAiAnalysis('')}
                       className="mt-4 text-xs text-white/60 hover:text-white underline"
                     >
                       Generar nuevo reporte
                     </button>
                   </div>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Tendencia de Ingresos</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip contentStyle={{borderRadius: '8px'}} />
                      <Line type="monotone" dataKey="ingresos" stroke="#e11d48" strokeWidth={3} dot={{r: 4, fill: '#e11d48'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <h3 className="font-bold text-slate-800 mb-4">Porcentaje de Ocupación</h3>
                 <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px'}} />
                      <Bar dataKey="ocupacion" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder Views for other sections */}
        {![AppView.DASHBOARD, AppView.ROOMS, AppView.REPORTS].includes(currentView) && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
             <div className="bg-slate-100 p-6 rounded-full mb-4">
               {currentView === AppView.VEHICLES && <Car className="w-12 h-12" />}
               {currentView === AppView.FOOD && <Utensils className="w-12 h-12" />}
               {currentView === AppView.EMPLOYEES && <Users className="w-12 h-12" />}
               {currentView === AppView.EXPENSES && <Wallet className="w-12 h-12" />}
               {currentView === AppView.TRANSFERS && <ArrowRightLeft className="w-12 h-12" />}
             </div>
             <h2 className="text-2xl font-bold text-slate-700 mb-2">{currentView}</h2>
             <p>Módulo en construcción para la versión 1.1</p>
          </div>
        )}

      </main>

      {/* MODAL OCCUPANCY */}
      {selectedRoomForOccupancy && (
        <OccupancyModal 
          isOpen={occupancyModalOpen} 
          room={selectedRoomForOccupancy} 
          onClose={() => setOccupancyModalOpen(false)}
          onConfirm={handleConfirmOccupancy}
        />
      )}

      {/* MODAL CONTROLS */}
      {selectedRoomForControls && (
        <ControlsModal
          isOpen={controlsModalOpen}
          room={selectedRoomForControls}
          onClose={() => setControlsModalOpen(false)}
          onSave={handleSaveControls}
        />
      )}
    </div>
  );
}