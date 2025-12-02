
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
  Sparkles,
  Sun,
  Moon,
  Sunset,
  History,
  ShoppingCart,
  TrendingDown,
  Clock,
  DollarSign,
  Package,
  Receipt,
  Coffee,
  Plus
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
import { FoodConsumptionModal } from './components/FoodConsumptionModal';
import { ProductModal } from './components/ProductModal';
import { VehiclesManager } from './components/VehiclesManager';
import { EmployeesManager } from './components/EmployeesManager'; // Import EmployeesManager
import { Toast } from './components/Toast';
import { Room, RoomStatus, AppView, Product, Consumption, ConsumptionItem, VehicleReport, Employee } from './types';
import { analyzeBusinessData } from './services/geminiService';

// --- DATA INITIALIZATION ---
const ROOM_IDS = ["1", "2", "3", "4", "5", "6", "7", "8", "9A", "9B", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];

// Helper to create date from now + hours
const createTime = (hoursFromNow: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d;
}

const INITIAL_ROOMS: Room[] = ROOM_IDS.map(id => {
  const isOccupied = Math.random() > 0.5;
  
  // Assign random durations to show off the colors
  let checkIn, checkOut, duration;
  if (isOccupied) {
    const rand = Math.random();
    if (rand < 0.2) duration = 2; // Green
    else if (rand < 0.4) duration = 4; // Orange
    else if (rand < 0.6) duration = 5; // Yellow
    else if (rand < 0.8) duration = 8; // Red
    else duration = 12; // Blue

    checkIn = createTime(-1); // Started 1 hour ago
    checkOut = createTime(duration - 1);
  }

  return {
    id,
    status: isOccupied ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE,
    type: ['9A', '9B'].includes(id) ? 'Jacuzzi' : (parseInt(id) > 15 ? 'Suite' : 'Sencilla'),
    vehiclePlate: isOccupied ? `ABC-${Math.floor(100 + Math.random() * 900)}` : undefined,
    vehicleBrand: isOccupied ? (Math.random() > 0.5 ? 'Nissan' : 'Chevrolet') : undefined,
    vehicleModel: isOccupied ? (Math.random() > 0.5 ? 'Versa' : 'Aveo') : undefined,
    vehicleColor: isOccupied ? (Math.random() > 0.5 ? 'Rojo' : 'Blanco') : undefined,
    entryType: isOccupied ? (Math.random() > 0.8 ? 'Pie' : Math.random() > 0.8 ? 'Moto' : 'Auto') : undefined,
    clientName: isOccupied ? `Habitación ${id}` : undefined,
    checkInTime: checkIn,
    checkOutTime: checkOut,
    tvControlCount: 0,
    acControlCount: 0,
    peopleCount: 2,
    totalPrice: isOccupied ? (duration === 2 ? 220 : duration === 4 ? 280 : 500) : undefined
  };
});

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Cerveza Corona', price: 45, category: 'Bebida', stock: 50 },
  { id: '2', name: 'Refresco Cola', price: 30, category: 'Bebida', stock: 40 },
  { id: '3', name: 'Agua Mineral', price: 25, category: 'Bebida', stock: 30 },
  { id: '4', name: 'Papas Fritas', price: 35, category: 'Snack', stock: 20 },
  { id: '5', name: 'Cacahuates', price: 20, category: 'Snack', stock: 25 },
  { id: '6', name: 'Sandwich Jamón', price: 60, category: 'Cocina', stock: 10 },
  { id: '7', name: 'Kit Pasión', price: 150, category: 'Otro', stock: 15 },
  { id: '8', name: 'Preservativos', price: 50, category: 'Otro', stock: 100 },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Abigail', role: 'Recamarera', status: 'Activo', joinedDate: new Date('2024-01-15') },
  { id: '2', name: 'Anahi', role: 'Recamarera', status: 'Activo', joinedDate: new Date('2024-03-20') },
  { id: '3', name: 'Carlos', role: 'Mantenimiento', status: 'Descanso', joinedDate: new Date('2023-11-05') },
  { id: '4', name: 'Sofia', role: 'Recepcionista', status: 'Activo', joinedDate: new Date('2024-05-01') },
];

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
  
  // Food & Beverage State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);

  // Vehicle State
  const [vehicleReports, setVehicleReports] = useState<VehicleReport[]>([]);
  
  // Employees State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // Shift Management State
  const [currentTime, setCurrentTime] = useState(new Date());

  // Occupancy Modal State
  const [occupancyModalOpen, setOccupancyModalOpen] = useState(false);
  const [selectedRoomForOccupancy, setSelectedRoomForOccupancy] = useState<Room | null>(null);

  // Controls Modal State
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const [selectedRoomForControls, setSelectedRoomForControls] = useState<Room | null>(null);

  // AI Report State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // --- HANDLERS & EFFECTS ---
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getShiftInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 14) return { name: 'Matutino', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-100' };
    if (hour >= 14 && hour < 21) return { name: 'Vespertino', icon: Sunset, color: 'text-rose-500', bg: 'bg-rose-100' };
    return { name: 'Nocturno', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-100' };
  };

  const currentShift = getShiftInfo();

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
    if (newStatus === RoomStatus.OCCUPIED) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoomForOccupancy(room);
        setOccupancyModalOpen(true);
      }
      return;
    }

    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        if (newStatus === RoomStatus.AVAILABLE || newStatus === RoomStatus.CLEANING) {
          return { 
            ...r, 
            status: newStatus,
            clientName: undefined,
            vehiclePlate: undefined,
            vehicleBrand: undefined,
            vehicleModel: undefined,
            vehicleColor: undefined,
            entryType: undefined,
            checkInTime: undefined,
            checkOutTime: undefined,
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

  const handleAddConsumption = (roomId: string, items: ConsumptionItem[]) => {
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);
    
    // 1. Create Consumption Record
    const newConsumption: Consumption = {
      id: Date.now().toString(),
      roomId,
      items,
      totalAmount,
      timestamp: new Date(),
      status: 'Pendiente en Habitación'
    };
    setConsumptions(prev => [newConsumption, ...prev]);

    // 2. Update Room Total Price
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          totalPrice: (r.totalPrice || 0) + totalAmount
        };
      }
      return r;
    }));

    setFoodModalOpen(false);
    setToast({
      message: `Se agregaron ${items.length} productos a la Habitación ${roomId}.`,
      type: 'success'
    });
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString()
    };
    setProducts(prev => [...prev, product]);
    setToast({
      message: 'Producto añadido al menú correctamente.',
      type: 'success'
    });
  };

  const handleAddVehicleReport = (report: Omit<VehicleReport, 'id' | 'date'>) => {
    const newReport: VehicleReport = {
      ...report,
      id: Date.now().toString(),
      date: new Date()
    };
    setVehicleReports(prev => [newReport, ...prev]);
    setToast({
      message: 'Reporte de vehículo registrado exitosamente.',
      type: 'success'
    });
  };

  // --- EMPLOYEE HANDLERS ---
  const handleAddEmployee = (data: Omit<Employee, 'id' | 'joinedDate'>) => {
    const newEmployee: Employee = {
      ...data,
      id: Date.now().toString(),
      joinedDate: new Date()
    };
    setEmployees(prev => [...prev, newEmployee]);
    setToast({ message: 'Empleado registrado exitosamente.', type: 'success' });
  };

  const handleEditEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...data } : emp));
    setToast({ message: 'Información de empleado actualizada.', type: 'success' });
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setToast({ message: 'Empleado eliminado.', type: 'success' });
    }
  };

  const handleAddEmployeeConsumption = (employeeId: string, items: ConsumptionItem[]) => {
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);
    const newConsumption: Consumption = {
      id: Date.now().toString(),
      employeeId, // Track it via employee ID
      items,
      totalAmount,
      timestamp: new Date(),
      status: 'Descuento Nómina'
    };
    setConsumptions(prev => [newConsumption, ...prev]);
    setToast({ message: 'Consumo de empleado registrado.', type: 'success' });
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    const context = `
      Ingresos Semanales: ${JSON.stringify(CHART_DATA)}
      Estado Actual Habitaciones: ${rooms.filter(r => r.status === RoomStatus.OCCUPIED).length} ocupadas de 21.
    `;
    const result = await analyzeBusinessData(context);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // --- DASHBOARD CALCULATIONS ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const activeRoomCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
  const activePeopleCount = rooms.reduce((acc, r) => acc + (r.peopleCount || 0), 0);
  
  // Financials
  // 1. Room Revenue (Hardcoded/Mock for now)
  const roomRevenue = 3250.00;
  
  // 2. Product Revenue (Consumptions attached to rooms)
  const productRevenue = consumptions
    .filter(c => !c.employeeId) // Only room consumptions
    .reduce((acc, c) => acc + c.totalAmount, 0);
  
  // 3. Employee Consumption (Consumptions attached to employees)
  const employeeConsumption = consumptions
    .filter(c => c.employeeId)
    .reduce((acc, c) => acc + c.totalAmount, 0);
  
  const expenses = 450.00;
  const totalShiftRevenue = roomRevenue + productRevenue;
  const totalGeneral = totalShiftRevenue - expenses;

  // --- FOOD STATS ---
  const foodConsumptions = consumptions.filter(c => !c.employeeId); // Only client food
  const foodTotalRevenue = foodConsumptions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const foodTotalOrders = foodConsumptions.length;
  const foodAvgTicket = foodTotalOrders > 0 ? foodTotalRevenue / foodTotalOrders : 0;

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
      
      {/* GLOBAL TOAST */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen bg-slate-900 text-white">
        
        {/* VIEW: DASHBOARD */}
        {currentView === AppView.DASHBOARD && (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-500 tracking-tight">Dashboard - Motel Las Bolas</h1>
                <p className="text-slate-400 text-sm mt-1">Bienvenido al panel de control principal.</p>
              </div>
              <div className="flex flex-col items-end">
                <div className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${currentShift.bg} ${currentShift.color} shadow-lg`}>
                   <currentShift.icon className="w-5 h-5" />
                   <span>Turno {currentShift.name}</span>
                </div>
                <div className="text-right mt-1">
                  <p className="text-xs text-slate-400 font-mono">{currentShift.name === 'Matutino' ? '07:00 - 14:00' : currentShift.name === 'Vespertino' ? '14:00 - 21:00' : '21:00 - 07:00'}</p>
                  <p className="text-xs text-slate-500 mt-0.5 capitalize">
                    {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub Nav (Visual Only) */}
            <div className="flex gap-2 mb-6">
              <button className="px-6 py-2 bg-white text-slate-800 rounded-lg font-semibold shadow-sm text-sm flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Vista General
              </button>
              <button className="px-6 py-2 bg-slate-800 text-slate-400 rounded-lg font-medium hover:text-white transition text-sm flex items-center gap-2">
                <History className="w-4 h-4" /> Historial del Turno
              </button>
            </div>

            {/* Row 1: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Occupancy */}
              <div className="bg-white rounded-xl p-5 text-slate-800 shadow-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Habitaciones Ocupadas</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">{activeRoomCount}</span>
                    <span className="text-slate-400 font-medium">/ {rooms.length}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{Math.round((activeRoomCount / rooms.length) * 100)}% Ocupación</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <BedDouble className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Current Shift Income */}
              <div className="bg-white rounded-xl p-5 text-slate-800 shadow-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Ingresos Turno {currentShift.name}</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{formatCurrency(totalShiftRevenue)}</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Turno en curso
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Active People */}
              <div className="bg-white rounded-xl p-5 text-slate-800 shadow-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Personas Activas</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{activePeopleCount}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Huéspedes actuales</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>

               {/* Card 4: Previous Shift Income (Placeholder logic) */}
               <div className="bg-white rounded-xl p-5 text-slate-800 shadow-lg flex justify-between items-center">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase">Ingresos T. Anterior</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{formatCurrency(0)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Turno finalizado</p>
                </div>
                <div className="bg-cyan-100 p-3 rounded-full text-cyan-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* DASHBOARD ROOM GRID (New Section) */}
            <div className="mt-4 p-4 bg-white rounded-2xl shadow-lg border border-slate-200">
              <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-rose-500" />
                Estado de Habitaciones
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-slate-800">
                {rooms.map(room => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onStatusChange={handleStatusChange} 
                    variant="compact" // Use new compact variant
                  />
                ))}
              </div>

               {/* Color Legend */}
               <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div> 2 Horas</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div> 4 Horas</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> 5 Horas</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-600"></div> 8 Horas</div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600"></div> 12 Horas</div>
               </div>
            </div>

            {/* Row 2: Colored Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              
              {/* Green: Room Revenue */}
              <div className="bg-emerald-100 rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 bg-emerald-200/50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform"></div>
                 <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm z-10">
                    <BedDouble className="w-4 h-4" />
                    Ingresos por Habitaciones
                 </div>
                 <div className="text-right z-10">
                    <span className="text-2xl font-bold text-emerald-900">{formatCurrency(roomRevenue)}</span>
                 </div>
              </div>

              {/* Purple: Consumables Revenue */}
              <div className="bg-purple-100 rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 bg-purple-200/50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform"></div>
                 <div className="flex items-center gap-2 text-purple-800 font-semibold text-sm z-10">
                    <ShoppingCart className="w-4 h-4" />
                    Ingresos por Consumos
                 </div>
                 <div className="text-right z-10">
                    <span className="text-2xl font-bold text-purple-900">{formatCurrency(productRevenue)}</span>
                 </div>
              </div>

              {/* Orange: Employee Consumables */}
              <div className="bg-orange-100 rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 bg-orange-200/50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform"></div>
                 <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm z-10">
                    <Users className="w-4 h-4" />
                    Consumos de Empleados
                 </div>
                 <div className="text-right z-10">
                    <span className="text-2xl font-bold text-orange-900">{formatCurrency(employeeConsumption)}</span>
                 </div>
              </div>

               {/* Red: Expenses */}
               <div className="bg-rose-100 rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 bg-rose-200/50 w-24 h-24 rounded-full group-hover:scale-110 transition-transform"></div>
                 <div className="flex items-center gap-2 text-rose-800 font-semibold text-sm z-10">
                    <TrendingDown className="w-4 h-4" />
                    Gastos
                 </div>
                 <div className="text-right z-10">
                    <span className="text-2xl font-bold text-rose-900">{formatCurrency(expenses)}</span>
                 </div>
              </div>
            </div>

            {/* Row 3: Total Bar */}
            <div className="bg-blue-600 rounded-xl p-4 flex justify-between items-center text-white shadow-lg">
               <div className="flex items-center gap-3">
                 <DollarSign className="w-6 h-6 opacity-80" />
                 <span className="font-bold text-lg">Total General del Turno</span>
               </div>
               <span className="text-3xl font-bold tracking-tight">{formatCurrency(totalGeneral)}</span>
            </div>

          </div>
        )}

        {/* VIEW: FOOD & BEVERAGES */}
        {currentView === AppView.FOOD && (
          <div className="animate-fade-in space-y-8 bg-slate-900 min-h-full">
            
            {/* Header with Title and Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-4xl font-extrabold text-orange-500 tracking-tight">Gestión de Alimentos y Bebidas</h2>
                <p className="text-slate-400 mt-2">Control de inventario, menú y registro de consumos a habitaciones.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setProductModalOpen(true)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <Package className="w-4 h-4" /> Añadir/Editar Menú
                </button>
                <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Gestionar Tipos
                </button>
                <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition flex items-center gap-2">
                  <Search className="w-4 h-4" /> Gestionar Categorías
                </button>
                <button 
                  onClick={() => setFoodModalOpen(true)}
                  className="px-6 py-2 bg-orange-600 rounded-lg text-white font-bold hover:bg-orange-700 shadow-lg shadow-orange-900/20 transition flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Registrar Consumo
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card: Products in Menu */}
              <div className="bg-white rounded-2xl p-6 text-slate-800 flex items-center gap-4 shadow-lg">
                <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-slate-500 font-medium">Productos en Menú</p>
                   <p className="text-3xl font-bold">{products.length}</p>
                </div>
              </div>

              {/* Card: Registered Consumptions */}
              <div className="bg-white rounded-2xl p-6 text-slate-800 flex items-center gap-4 shadow-lg">
                <div className="bg-green-100 p-4 rounded-xl text-green-600">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-slate-500 font-medium">Consumos Registrados</p>
                   <p className="text-3xl font-bold">{foodTotalOrders}</p>
                </div>
              </div>

              {/* Card: Total Revenue */}
              <div className="bg-white rounded-2xl p-6 text-slate-800 flex items-center gap-4 shadow-lg">
                <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
                  <Coffee className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-slate-500 font-medium">Ingresos Totales</p>
                   <p className="text-3xl font-bold">{formatCurrency(foodTotalRevenue)}</p>
                </div>
              </div>

              {/* Card: Avg Ticket */}
              <div className="bg-white rounded-2xl p-6 text-slate-800 flex items-center gap-4 shadow-lg">
                <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-slate-500 font-medium">Promedio / Consumo</p>
                   <p className="text-3xl font-bold">{formatCurrency(foodAvgTicket)}</p>
                </div>
              </div>
            </div>

            {/* Recent Consumptions & Menu View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
                 <h3 className="text-xl font-bold text-white mb-4">Últimos Consumos Registrados</h3>
                 <div className="space-y-3">
                   {foodConsumptions.length === 0 ? (
                     <div className="text-center py-12 text-slate-500 italic border-2 border-dashed border-slate-700 rounded-xl">
                       No se han registrado consumos en este turno aún.
                     </div>
                   ) : (
                     foodConsumptions.map(consumption => (
                       <div key={consumption.id} className="bg-slate-700/50 p-4 rounded-xl flex justify-between items-center border border-white/5">
                         <div className="flex items-center gap-4">
                           <div className="bg-slate-600 p-2 rounded-lg">
                             <Utensils className="w-5 h-5 text-orange-400" />
                           </div>
                           <div>
                             <p className="font-bold text-white">Habitación {consumption.roomId}</p>
                             <p className="text-sm text-slate-400">
                               {consumption.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-bold text-green-400">+{formatCurrency(consumption.totalAmount)}</p>
                            <p className="text-xs text-slate-500">{consumption.timestamp.toLocaleTimeString()}</p>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
              </div>

              {/* Quick Menu View */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col">
                 <h3 className="text-xl font-bold text-white mb-4">Menú Rápido</h3>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px]">
                   {products.map(product => (
                     <div key={product.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700 transition">
                       <div>
                         <p className="font-medium text-slate-200">{product.name}</p>
                         <span className="text-xs bg-slate-600 px-2 py-0.5 rounded-full text-slate-300">{product.category}</span>
                       </div>
                       <span className="font-bold text-orange-400">${product.price}</span>
                     </div>
                   ))}
                 </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW: ROOMS */}
        {currentView === AppView.ROOMS && (
          <div className="animate-fade-in bg-slate-50 p-6 rounded-3xl min-h-full">
             <header className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Habitaciones</h2>
                <p className="text-slate-500">Gestión de estado en tiempo real</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> 2h
                </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> 4h
                </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 5h
                </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> 8h
                </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 text-xs text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> 12h
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

        {/* VIEW: VEHICLES */}
        {currentView === AppView.VEHICLES && (
          <div className="animate-fade-in bg-slate-50 p-6 rounded-3xl min-h-full">
            <VehiclesManager 
              rooms={rooms} 
              reports={vehicleReports}
              onAddReport={handleAddVehicleReport}
            />
          </div>
        )}

        {/* VIEW: EMPLOYEES (New Integration) */}
        {currentView === AppView.EMPLOYEES && (
          <div className="animate-fade-in bg-slate-50 p-6 rounded-3xl min-h-full">
             <EmployeesManager 
               employees={employees}
               consumptions={consumptions}
               onAddEmployee={handleAddEmployee}
               onEditEmployee={handleEditEmployee}
               onDeleteEmployee={handleDeleteEmployee}
               onAddConsumption={handleAddEmployeeConsumption}
               products={products}
             />
          </div>
        )}

        {/* VIEW: REPORTS */}
        {currentView === AppView.REPORTS && (
          <div className="animate-fade-in space-y-8 bg-slate-50 p-6 rounded-3xl min-h-full">
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
        {![AppView.DASHBOARD, AppView.ROOMS, AppView.REPORTS, AppView.FOOD, AppView.VEHICLES, AppView.EMPLOYEES].includes(currentView) && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 bg-slate-50 rounded-3xl min-h-full">
             <div className="bg-slate-100 p-6 rounded-full mb-4">
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

      {/* MODAL FOOD CONSUMPTION */}
      <FoodConsumptionModal 
        isOpen={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        occupiedRooms={rooms.filter(r => r.status === RoomStatus.OCCUPIED)}
        products={products}
        onConfirm={handleAddConsumption}
      />

      {/* MODAL NEW PRODUCT */}
      <ProductModal 
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleAddProduct}
      />
    </div>
  );
}
