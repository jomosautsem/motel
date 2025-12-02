
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
import { EmployeesManager } from './components/EmployeesManager';
import { ExpensesManager } from './components/ExpensesManager';
import { Toast } from './components/Toast';
import { Room, RoomStatus, AppView, Product, Consumption, ConsumptionItem, VehicleReport, Employee, Expense } from './types';
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

  // Expenses State
  const [expensesList, setExpensesList] = useState<Expense[]>([]);

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

  // --- EXPENSE HANDLERS ---
  const handleAddExpense = (description: string, amount: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount,
      date: new Date()
    };
    setExpensesList(prev => [newExpense, ...prev]);
    setToast({ message: 'Gasto registrado correctamente.', type: 'success' });
  };

  const handleDeleteExpense = (id: string) => {
    setExpensesList(prev => prev.filter(ex => ex.id !== id));
    setToast({ message: 'Gasto eliminado.', type: 'success' });
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
  
  // 4. Expenses
  const totalExpenses = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalShiftRevenue = roomRevenue + productRevenue;
  const totalGeneral = totalShiftRevenue - totalExpenses; // Revenue - Expenses

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
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-white' : 'text-slate-400'}`} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 shadow-sm z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Motel las Bolas</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Manager V2.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem view={AppView.ROOMS} icon={BedDouble} label="Habitaciones" />
          <SidebarItem view={AppView.FOOD} icon={Utensils} label="Alimentos y Bebidas" />
          <SidebarItem view={AppView.VEHICLES} icon={Car} label="Vehículos" />
          <SidebarItem view={AppView.EMPLOYEES} icon={Users} label="Empleados" />
          <SidebarItem view={AppView.EXPENSES} icon={TrendingDown} label="Gastos" />
          <SidebarItem view={AppView.REPORTS} icon={FileBarChart} label="Reportes IA" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 mb-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <Users className="w-5 h-5 text-slate-500" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-700">Admin</p>
               <p className="text-xs text-slate-400">Gerente General</p>
             </div>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-4 py-3 rounded-xl transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">{currentView}</h2>
            
            {/* Shift Badge */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${currentShift.bg} ${currentShift.color} border-current/20`}>
              <currentShift.icon className="w-3.5 h-3.5" />
              <span>Turno {currentShift.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold text-slate-800 font-mono tracking-tight">
                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {currentTime.toLocaleDateString([], {weekday: 'long', day:'numeric', month:'long'})}
              </p>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition">
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          
          {/* Dashboard View */}
          {currentView === AppView.DASHBOARD && (
            <div className="space-y-8 animate-fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Occupancy */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <BedDouble className="w-6 h-6 text-white" />
                      </div>
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-lg border border-green-500/30">
                        {Math.round((activeRoomCount / rooms.length) * 100)}% Ocupación
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Habitaciones Ocupadas</p>
                    <p className="text-4xl font-bold mt-1 tracking-tight">{activeRoomCount} <span className="text-xl text-slate-500 font-normal">/ {rooms.length}</span></p>
                  </div>
                </div>

                {/* Current Shift Revenue */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:border-blue-200 transition">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Clock className="w-6 h-6" />
                      </div>
                   </div>
                   <p className="text-slate-500 text-sm font-medium">Ingresos Turno {currentShift.name}</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{formatCurrency(totalShiftRevenue)}</p>
                   <p className="text-xs text-blue-500 font-medium mt-1">Turno en curso</p>
                </div>

                {/* Active People */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 group hover:border-purple-200 transition">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                        <Users className="w-6 h-6" />
                      </div>
                   </div>
                   <p className="text-slate-500 text-sm font-medium">Personas Activas</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{activePeopleCount}</p>
                   <p className="text-xs text-purple-500 font-medium mt-1">Huéspedes actuales</p>
                </div>

                {/* Previous Shift (Mock) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 opacity-60 hover:opacity-100 transition">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-500">
                        <DollarSign className="w-6 h-6" />
                      </div>
                   </div>
                   <p className="text-slate-500 text-sm font-medium">Ingresos Turno Anterior</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">$0.00</p>
                   <p className="text-xs text-slate-400 font-medium mt-1">Turno finalizado</p>
                </div>
              </div>

              {/* Financial Breakdown Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col justify-between h-24">
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                       <BedDouble className="w-4 h-4" /> Ingresos por Habitaciones
                    </div>
                    <p className="text-2xl font-bold text-green-800 text-right">{formatCurrency(roomRevenue)}</p>
                 </div>
                 
                 <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex flex-col justify-between h-24">
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                       <ShoppingCart className="w-4 h-4" /> Ingresos por Consumos
                    </div>
                    <p className="text-2xl font-bold text-purple-800 text-right">{formatCurrency(productRevenue)}</p>
                 </div>

                 <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col justify-between h-24">
                    <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                       <Users className="w-4 h-4" /> Consumos de Empleados
                    </div>
                    <p className="text-2xl font-bold text-orange-800 text-right">{formatCurrency(employeeConsumption)}</p>
                 </div>

                 <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col justify-between h-24">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                       <TrendingDown className="w-4 h-4" /> Gastos
                    </div>
                    <p className="text-2xl font-bold text-rose-800 text-right">{formatCurrency(totalExpenses)}</p>
                 </div>
              </div>

              {/* Total Banner */}
              <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/30 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                     <DollarSign className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold">Total General del Turno</h3>
                 </div>
                 <p className="text-4xl font-bold font-mono tracking-tight">{formatCurrency(totalGeneral)}</p>
              </div>

              {/* Compact Room Grid */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-rose-500" />
                  Estado Rápido de Habitaciones
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {rooms.map(room => (
                    <RoomCard 
                      key={room.id} 
                      room={room} 
                      onStatusChange={handleStatusChange} 
                      variant="compact"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rooms View */}
          {currentView === AppView.ROOMS && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {rooms.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  onStatusChange={handleStatusChange}
                  onOpenControls={handleOpenControls}
                />
              ))}
            </div>
          )}

          {/* Vehicles View */}
          {currentView === AppView.VEHICLES && (
            <VehiclesManager 
              rooms={rooms}
              reports={vehicleReports}
              onAddReport={handleAddVehicleReport}
            />
          )}

          {/* Employees View */}
          {currentView === AppView.EMPLOYEES && (
            <EmployeesManager 
              employees={employees}
              consumptions={consumptions}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddConsumption={handleAddEmployeeConsumption}
              products={products}
            />
          )}

          {/* Expenses View */}
          {currentView === AppView.EXPENSES && (
            <ExpensesManager 
              expenses={expensesList}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* Food View */}
          {currentView === AppView.FOOD && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0f172a] p-6 rounded-2xl shadow-lg border border-slate-700">
                <div>
                   <h2 className="text-2xl font-bold text-rose-500">Gestión de Alimentos y Bebidas</h2>
                   <p className="text-slate-400 text-sm">Control de inventario y ventas</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setProductModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-white transition flex items-center gap-2 text-sm font-medium"
                  >
                    <Package className="w-4 h-4" /> Añadir/Editar Menú
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-white transition flex items-center gap-2 text-sm font-medium">
                    <BoxIcon className="w-4 h-4" /> Gestionar Tipos
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:text-white transition flex items-center gap-2 text-sm font-medium">
                     <Users className="w-4 h-4" /> Gestionar Categorías
                  </button>
                  <button 
                    onClick={() => setFoodModalOpen(true)}
                    className="px-6 py-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-900/30 transition flex items-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Registrar Consumo
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                   <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                     <Package className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-slate-500 text-xs uppercase font-bold">Productos en Menú</p>
                     <p className="text-2xl font-bold text-slate-800">{products.length}</p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                   <div className="bg-green-100 p-3 rounded-xl text-green-600">
                     <ShoppingCart className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-slate-500 text-xs uppercase font-bold">Consumos Registrados</p>
                     <p className="text-2xl font-bold text-slate-800">{foodTotalOrders}</p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                   <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                     <Coffee className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-slate-500 text-xs uppercase font-bold">Ingresos Totales</p>
                     <p className="text-2xl font-bold text-slate-800">{formatCurrency(foodTotalRevenue)}</p>
                   </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                   <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                     <Utensils className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-slate-500 text-xs uppercase font-bold">Promedio / Consumo</p>
                     <p className="text-2xl font-bold text-slate-800">{formatCurrency(foodAvgTicket)}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Menu List */}
                 <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                       <h3 className="font-bold text-slate-800">Menú Actual</h3>
                       <div className="text-xs text-slate-500">
                         {products.filter(p => p.category === 'Bebida').length} Bebidas • {products.filter(p => p.category !== 'Bebida').length} Alimentos/Otros
                       </div>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                      {products.map(product => (
                        <div key={product.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                                product.category === 'Bebida' ? 'bg-blue-400' : 
                                product.category === 'Snack' ? 'bg-orange-400' : 
                                product.category === 'Cocina' ? 'bg-rose-400' : 'bg-slate-400'
                              }`}>
                                {product.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{product.name}</p>
                                <p className="text-xs text-slate-400 uppercase font-semibold">{product.category}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-bold text-green-600">${product.price}</p>
                              <p className="text-xs text-slate-400">Stock: {product.stock}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Recent Activity */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Últimos Consumos</h3>
                    <div className="space-y-4">
                       {foodConsumptions.length === 0 ? (
                         <div className="text-center text-slate-400 text-sm py-10">
                           No hay actividad reciente.
                         </div>
                       ) : (
                         foodConsumptions.slice(0, 6).map(consumption => (
                           <div key={consumption.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                              <div className="bg-green-100 p-2 rounded-full text-green-600 mt-1">
                                <Receipt className="w-3 h-3" />
                              </div>
                              <div className="flex-1">
                                 <div className="flex justify-between">
                                    <p className="font-bold text-slate-800 text-sm">Habitación {consumption.roomId}</p>
                                    <p className="font-bold text-green-600 text-sm">${consumption.totalAmount}</p>
                                 </div>
                                 <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                   {consumption.items.map(i => `${i.quantity} ${i.productName}`).join(', ')}
                                 </p>
                                 <p className="text-[10px] text-slate-400 mt-1">
                                   {consumption.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                 </p>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
              </div>

            </div>
          )}

          {/* Report View */}
          {currentView === AppView.REPORTS && (
             <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full border border-slate-100">
                  <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-6">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">Análisis Inteligente</h2>
                  <p className="text-slate-500 mb-8">
                    Obtenga insights poderosos sobre el rendimiento de su negocio impulsados por IA.
                  </p>
                  
                  {aiAnalysis ? (
                    <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-200 mb-6">
                      <div className="prose prose-slate max-w-none text-sm">
                        <p className="whitespace-pre-line text-slate-700 leading-relaxed">{aiAnalysis}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-4 bg-slate-100 rounded-full w-3/4 mx-auto mb-6 opacity-0"></div>
                  )}

                  <button 
                    onClick={handleGenerateReport}
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-5 h-5 animate-spin" /> Analizando datos...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" /> Generar Reporte con IA
                      </>
                    )}
                  </button>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      {selectedRoomForOccupancy && (
        <OccupancyModal 
          room={selectedRoomForOccupancy}
          isOpen={occupancyModalOpen}
          onClose={() => setOccupancyModalOpen(false)}
          onConfirm={handleConfirmOccupancy}
        />
      )}

      {selectedRoomForControls && (
        <ControlsModal
          room={selectedRoomForControls}
          isOpen={controlsModalOpen}
          onClose={() => setControlsModalOpen(false)}
          onSave={handleSaveControls}
        />
      )}

      <FoodConsumptionModal
        isOpen={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        occupiedRooms={rooms.filter(r => r.status === RoomStatus.OCCUPIED)}
        products={products}
        onConfirm={handleAddConsumption}
      />

      <ProductModal 
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleAddProduct}
      />
      
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

    </div>
  );
}

// Helper Icon for Box
const BoxIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
);
