
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  Car, 
  Utensils, 
  FileBarChart, 
  Users, 
  LogOut, 
  Heart,
  Bot,
  Sparkles,
  Sun,
  Moon,
  Sunset,
  ShoppingCart,
  TrendingDown,
  Clock,
  DollarSign,
  Package,
  Receipt,
  Coffee,
  CalendarClock
} from 'lucide-react';
import { RoomCard } from './components/RoomCard';
import { OccupancyModal } from './components/OccupancyModal';
import { ControlsModal } from './components/ControlsModal';
import { FoodConsumptionModal } from './components/FoodConsumptionModal';
import { ProductModal } from './components/ProductModal';
import { VehiclesManager } from './components/VehiclesManager';
import { EmployeesManager } from './components/EmployeesManager';
import { ExpensesManager } from './components/ExpensesManager';
import { ShiftHistoryManager } from './components/ShiftHistoryManager';
import { Toast } from './components/Toast';
import { ChangeRoomModal } from './components/ChangeRoomModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Room, RoomStatus, AppView, Product, Consumption, ConsumptionItem, VehicleReport, Employee, Expense, RoomHistoryEntry, VehicleLog } from './types';
import { analyzeBusinessData } from './services/geminiService';
import { supabase } from './supabaseClient';

const createTime = (hoursFromNow: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursFromNow);
  return d;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [vehicleReports, setVehicleReports] = useState<VehicleReport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [roomHistory, setRoomHistory] = useState<RoomHistoryEntry[]>([]);
  const [vehicleHistory, setVehicleHistory] = useState<VehicleLog[]>([]);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [occupancyModalOpen, setOccupancyModalOpen] = useState(false);
  const [selectedRoomForOccupancy, setSelectedRoomForOccupancy] = useState<Room | null>(null);
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const [selectedRoomForControls, setSelectedRoomForControls] = useState<Room | null>(null);
  const [changeRoomModalOpen, setChangeRoomModalOpen] = useState(false);
  const [selectedRoomForChange, setSelectedRoomForChange] = useState<Room | null>(null);
  
  // Add Person Modal State
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [selectedRoomForAddPerson, setSelectedRoomForAddPerson] = useState<Room | null>(null);

  // Release Confirmation State
  const [releaseConfirmationOpen, setReleaseConfirmationOpen] = useState(false);
  const [selectedRoomForRelease, setSelectedRoomForRelease] = useState<Room | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
      else setLoading(false);
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => {
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('id', { ascending: true });
      
      if (roomsData) {
        const sortedRooms = roomsData.sort((a: any, b: any) => {
           const numA = parseInt(a.id.replace(/\D/g, ''));
           const numB = parseInt(b.id.replace(/\D/g, ''));
           if (numA !== numB) return numA - numB;
           return a.id.localeCompare(b.id);
        }).map((r: any) => ({
          ...r,
          type: 'Sencilla', // Override type to 'Sencilla' for all rooms
          checkInTime: r.check_in_time ? new Date(r.check_in_time) : undefined,
          checkOutTime: r.check_out_time ? new Date(r.check_out_time) : undefined,
          peopleCount: r.people_count,
          clientName: r.client_name,
          entryType: r.entry_type,
          vehiclePlate: r.vehicle_plate,
          vehicleBrand: r.vehicle_brand,
          vehicleModel: r.vehicle_model,
          vehicleColor: r.vehicle_color,
          totalPrice: r.total_price,
          tvControlCount: r.tv_control_count,
          acControlCount: r.ac_control_count
        }));
        setRooms(sortedRooms);
      }

      const { data: prodData } = await supabase.from('products').select('*');
      if (prodData) setProducts(prodData);

      const { data: empData } = await supabase.from('employees').select('*');
      if (empData) {
        setEmployees(empData.map((e: any) => ({
          ...e,
          joinedDate: new Date(e.joined_date)
        })));
      }

      const { data: expData } = await supabase.from('expenses').select('*').order('date', { ascending: false });
      if (expData) {
        setExpensesList(expData.map((e: any) => ({ ...e, date: new Date(e.date) })));
      }
      
      const { data: histData } = await supabase.from('room_history').select('*').order('created_at', { ascending: false });
      if (histData) {
        setRoomHistory(histData.map((h: any) => ({
          id: h.id,
          roomId: h.room_id,
          totalPrice: h.total_price,
          checkInTime: h.check_in_time ? new Date(h.check_in_time) : undefined,
          checkOutTime: h.check_out_time ? new Date(h.check_out_time) : undefined,
          createdAt: h.created_at ? new Date(h.created_at) : new Date()
        })));
      }

      const { data: repData } = await supabase.from('vehicle_reports').select('*').order('date', { ascending: false });
      if (repData) {
        setVehicleReports(repData.map((r: any) => ({ ...r, date: new Date(r.date) })));
      }
      
      // Fetch Vehicle History
      const { data: vHistData } = await supabase.from('vehicle_history').select('*').order('entry_time', { ascending: false });
      if (vHistData) {
        setVehicleHistory(vHistData.map((v: any) => ({
          id: v.id,
          roomId: v.room_id,
          plate: v.plate,
          brand: v.brand,
          model: v.model,
          color: v.color,
          entryType: v.entry_type,
          entryTime: new Date(v.entry_time),
          exitTime: v.exit_time ? new Date(v.exit_time) : undefined
        })));
      }

      const { data: consData } = await supabase
        .from('consumptions')
        .select(`
          *,
          consumption_items (*)
        `)
        .order('timestamp', { ascending: false });

      if (consData) {
        const mappedConsumptions: Consumption[] = consData.map((c: any) => ({
          id: c.id,
          roomId: c.room_id,
          employeeId: c.employee_id,
          totalAmount: c.total_amount,
          timestamp: new Date(c.timestamp),
          status: c.status,
          items: c.consumption_items.map((i: any) => ({
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            unitPrice: i.unit_price,
            total: i.total
          }))
        }));
        setConsumptions(mappedConsumptions);
      }

    } catch (e) {
      console.error("Error fetching data:", e);
      setToast({ message: "Error cargando datos del servidor", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getShiftInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 14) return { name: 'Matutino', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-100' };
    if (hour >= 14 && hour < 21) return { name: 'Vespertino', icon: Sunset, color: 'text-rose-500', bg: 'bg-rose-100' };
    return { name: 'Nocturno', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-100' };
  };

  const getShiftStartTime = () => {
    const now = new Date(currentTime);
    const hour = now.getHours();
    if (hour >= 7 && hour < 14) {
      now.setHours(7, 0, 0, 0);
    } 
    else if (hour >= 14 && hour < 21) {
      now.setHours(14, 0, 0, 0);
    } 
    else {
      if (hour < 7) {
        now.setDate(now.getDate() - 1);
      }
      now.setHours(21, 0, 0, 0);
    }
    return now;
  };

  const currentShift = getShiftInfo();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Credenciales incorrectas o error de conexión.');
      setLoading(false);
    } else {
      setError('');
    }
  };

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    if (newStatus === RoomStatus.OCCUPIED) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoomForOccupancy(room);
        setOccupancyModalOpen(true);
      }
      return;
    }

    if (newStatus === RoomStatus.CLEANING) {
      const room = rooms.find(r => r.id === roomId);
      if (room && ((room.tvControlCount || 0) > 0 || (room.acControlCount || 0) > 0)) {
         setToast({ 
           message: "⚠️ No se puede liberar: Controles pendientes de devolución.", 
           type: 'error' 
         });
         setSelectedRoomForControls(room);
         setControlsModalOpen(true);
         return;
      }

      if (room && room.status === RoomStatus.OCCUPIED) {
         // --- HISTORIAL DE RENTAS ---
         const roomConsumptions = consumptions
           .filter(c => c.roomId === roomId && c.status === 'Pendiente en Habitación')
           .reduce((acc, c) => acc + c.totalAmount, 0);
         
         const netRent = (room.totalPrice || 0) - roomConsumptions;

         await supabase.from('room_history').insert({
           room_id: roomId,
           total_price: netRent,
           check_in_time: room.checkInTime,
           check_out_time: new Date()
         });
         
         // Fetch history again to update dashboard
         const { data: histData } = await supabase.from('room_history').select('*').order('created_at', { ascending: false });
         if (histData) {
            setRoomHistory(histData.map((h: any) => ({
              id: h.id,
              roomId: h.room_id,
              totalPrice: h.total_price,
              checkInTime: h.check_in_time ? new Date(h.check_in_time) : undefined,
              checkOutTime: h.check_out_time ? new Date(h.check_out_time) : undefined,
              createdAt: h.created_at ? new Date(h.created_at) : new Date()
            })));
         }

         await supabase.from('consumptions')
           .update({ status: 'Pagado' })
           .eq('room_id', roomId)
           .eq('status', 'Pendiente en Habitación');

         // --- HISTORIAL DE VEHÍCULOS (Cierre) ---
         if (room.entryType === 'Auto' || room.entryType === 'Moto') {
           await supabase.from('vehicle_history')
             .update({ exit_time: new Date() })
             .eq('room_id', roomId)
             .is('exit_time', null); // Close only active session
         }
      }
    }

    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));

    const isReset = newStatus === RoomStatus.AVAILABLE || newStatus === RoomStatus.CLEANING;
    const updateData = isReset ? {
      status: newStatus,
      client_name: null,
      vehicle_plate: null,
      vehicle_brand: null,
      vehicle_model: null,
      vehicle_color: null,
      entry_type: null,
      check_in_time: null,
      check_out_time: null,
      people_count: 2,
      total_price: null,
      tv_control_count: 0,
      ac_control_count: 0
    } : { status: newStatus };

    const { error } = await supabase.from('rooms').update(updateData).eq('id', roomId);

    if (error) {
      setToast({ message: "Error actualizando habitación", type: "error" });
      fetchData();
    } else {
      if (newStatus === RoomStatus.CLEANING) {
        fetchData(); 
      }
    }
  };

  const handleRequestRelease = (room: Room) => {
    // Check controls first
    if ((room.tvControlCount || 0) > 0 || (room.acControlCount || 0) > 0) {
      setToast({ 
        message: "⚠️ No se puede liberar: Controles pendientes de devolución.", 
        type: 'error' 
      });
      setSelectedRoomForControls(room);
      setControlsModalOpen(true);
      return;
    }
    
    // Open Confirmation Modal
    setSelectedRoomForRelease(room);
    setReleaseConfirmationOpen(true);
  };

  const confirmRelease = () => {
    if (selectedRoomForRelease) {
      handleStatusChange(selectedRoomForRelease.id, RoomStatus.CLEANING);
      setReleaseConfirmationOpen(false);
      setSelectedRoomForRelease(null);
    }
  };

  const handleConfirmOccupancy = async (data: Partial<Room>) => {
    if (selectedRoomForOccupancy) {
      const updatePayload = {
        status: RoomStatus.OCCUPIED,
        client_name: data.clientName,
        people_count: data.peopleCount,
        entry_type: data.entryType,
        vehicle_plate: data.vehiclePlate,
        vehicle_brand: data.vehicleBrand,
        vehicle_model: data.vehicleModel,
        vehicle_color: data.vehicleColor,
        check_in_time: data.checkInTime,
        check_out_time: data.checkOutTime,
        total_price: data.totalPrice
      };

      setRooms(prev => prev.map(r => 
        r.id === selectedRoomForOccupancy.id 
          ? { ...r, ...data, status: RoomStatus.OCCUPIED } 
          : r
      ));
      
      setOccupancyModalOpen(false);

      const { error } = await supabase
        .from('rooms')
        .update(updatePayload)
        .eq('id', selectedRoomForOccupancy.id);

      if (error) {
        console.error(error);
        setToast({ message: "Error al guardar ocupación", type: 'error' });
        fetchData();
      } else {
        // --- GUARDAR EN HISTORIAL DE VEHÍCULOS ---
        if (data.entryType !== 'Pie') {
           await supabase.from('vehicle_history').insert({
             room_id: selectedRoomForOccupancy.id,
             plate: data.vehiclePlate,
             brand: data.vehicleBrand,
             model: data.vehicleModel,
             color: data.vehicleColor,
             entry_type: data.entryType,
             entry_time: data.checkInTime
           });
           fetchData(); // Refresh to get the new vehicle history
        }
        setSelectedRoomForOccupancy(null);
      }
    }
  };

  const handleOpenControls = (room: Room) => {
    setSelectedRoomForControls(room);
    setControlsModalOpen(true);
  };

  const handleSaveControls = async (roomId: string, tvCount: number, acCount: number) => {
    setRooms(prev => prev.map(r => 
      r.id === roomId 
        ? { ...r, tvControlCount: tvCount, acControlCount: acCount }
        : r
    ));
    setControlsModalOpen(false);
    setSelectedRoomForControls(null);

    await supabase.from('rooms').update({
      tv_control_count: tvCount,
      ac_control_count: acCount
    }).eq('id', roomId);
  };

  const handleChangeRoom = (room: Room) => {
    setSelectedRoomForChange(room);
    setChangeRoomModalOpen(true);
  };

  const handleConfirmChangeRoom = async (targetRoomId: string) => {
    if (!selectedRoomForChange) return;
    
    setLoading(true);
    const sourceId = selectedRoomForChange.id;
    const targetId = targetRoomId;

    try {
      const { error: targetError } = await supabase.from('rooms').update({
        status: RoomStatus.OCCUPIED,
        client_name: selectedRoomForChange.clientName,
        people_count: selectedRoomForChange.peopleCount,
        entry_type: selectedRoomForChange.entryType,
        vehicle_plate: selectedRoomForChange.vehiclePlate,
        vehicle_brand: selectedRoomForChange.vehicleBrand,
        vehicle_model: selectedRoomForChange.vehicleModel,
        vehicle_color: selectedRoomForChange.vehicleColor,
        check_in_time: selectedRoomForChange.checkInTime,
        check_out_time: selectedRoomForChange.checkOutTime,
        total_price: selectedRoomForChange.totalPrice,
        tv_control_count: 0, 
        ac_control_count: 0
      }).eq('id', targetId);

      if (targetError) throw targetError;

      const { error: consError } = await supabase.from('consumptions')
        .update({ room_id: targetId })
        .eq('room_id', sourceId)
        .eq('status', 'Pendiente en Habitación');
      
      if (consError) throw consError;

      const { error: sourceError } = await supabase.from('rooms').update({
        status: RoomStatus.CLEANING,
        client_name: null,
        vehicle_plate: null,
        vehicle_brand: null,
        vehicle_model: null,
        vehicle_color: null,
        entry_type: null,
        check_in_time: null,
        check_out_time: null,
        people_count: 2,
        total_price: null,
        tv_control_count: 0,
        ac_control_count: 0
      }).eq('id', sourceId);

      if (sourceError) throw sourceError;
      
      // Update vehicle history with new room ID
      await supabase.from('vehicle_history')
        .update({ room_id: targetId })
        .eq('room_id', sourceId)
        .is('exit_time', null);

      setToast({ message: `Cambio de Habitación ${sourceId} a ${targetId} exitoso.`, type: 'success' });
      setChangeRoomModalOpen(false);
      setSelectedRoomForChange(null);
      fetchData();

    } catch (e) {
      console.error("Change Room Error:", e);
      setToast({ message: "Error al cambiar de habitación", type: 'error' });
      setLoading(false);
    }
  };

  // --- ADD EXTRA PERSON LOGIC ---
  const handleAddPersonClick = (room: Room) => {
    const currentPeople = room.peopleCount || 2;
    if (currentPeople >= 3) {
      setToast({ message: "Límite alcanzado: Solo se permite 1 persona extra.", type: 'error' });
      return;
    }
    setSelectedRoomForAddPerson(room);
    setConfirmationModalOpen(true);
  };

  const confirmAddPerson = async () => {
    if (!selectedRoomForAddPerson) return;
    
    const room = selectedRoomForAddPerson;
    const currentPeople = room.peopleCount || 2;
    const newCount = currentPeople + 1;
    const extraCharge = 150;
    const newTotal = (room.totalPrice || 0) + extraCharge;

    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, peopleCount: newCount, totalPrice: newTotal } : r));
    setConfirmationModalOpen(false);
    setSelectedRoomForAddPerson(null);

    const { error } = await supabase.from('rooms').update({
      people_count: newCount,
      total_price: newTotal
    }).eq('id', room.id);

    if (error) {
      setToast({ message: "Error al agregar persona", type: 'error' });
      fetchData();
    } else {
      setToast({ message: `Persona extra agregada (+$${extraCharge}).`, type: 'success' });
    }
  };

  const handleAddConsumption = async (roomId: string, items: ConsumptionItem[]) => {
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);
    
    try {
      const { data: cons, error: consError } = await supabase
        .from('consumptions')
        .insert({
          room_id: roomId,
          total_amount: totalAmount,
          status: 'Pendiente en Habitación'
        })
        .select()
        .single();
      
      if (consError) throw consError;

      const itemsPayload = items.map(item => ({
        consumption_id: cons.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total
      }));

      const { error: itemsError } = await supabase.from('consumption_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      const room = rooms.find(r => r.id === roomId);
      const newTotal = (room?.totalPrice || 0) + totalAmount;
      
      await supabase.from('rooms').update({ total_price: newTotal }).eq('id', roomId);

      fetchData();
      setFoodModalOpen(false);
      setToast({
        message: `Se agregaron ${items.length} productos a la Habitación ${roomId}.`,
        type: 'success'
      });

    } catch (e) {
      console.error(e);
      setToast({ message: "Error al registrar consumo", type: "error" });
    }
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert(newProduct);
    if (error) {
      setToast({ message: "Error creando producto", type: "error" });
    } else {
      fetchData();
      setToast({ message: 'Producto añadido correctamente.', type: 'success' });
    }
  };

  const handleAddVehicleReport = async (report: Omit<VehicleReport, 'id' | 'date'>) => {
    const { error } = await supabase.from('vehicle_reports').insert(report);
    if (error) {
      setToast({ message: "Error al guardar reporte", type: "error" });
    } else {
      fetchData();
      setToast({ message: 'Reporte registrado exitosamente.', type: 'success' });
    }
  };

  const handleAddEmployee = async (data: Omit<Employee, 'id' | 'joinedDate'>) => {
    const { error } = await supabase.from('employees').insert(data);
    if (!error) {
      fetchData();
      setToast({ message: 'Empleado registrado.', type: 'success' });
    }
  };

  const handleEditEmployee = async (id: string, data: Partial<Employee>) => {
    const { error } = await supabase.from('employees').update(data).eq('id', id);
    if (!error) {
      fetchData();
      setToast({ message: 'Empleado actualizado.', type: 'success' });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      
      if (error) {
        if (error.code === '23503') {
           setToast({ message: "No se puede eliminar: El empleado tiene historial de ventas.", type: 'error' });
        } else {
           setToast({ message: "Error al eliminar empleado.", type: 'error' });
        }
      } else {
        fetchData();
        setToast({ message: 'Empleado eliminado.', type: 'success' });
      }
    }
  };

  const handleAddEmployeeConsumption = async (employeeId: string, items: ConsumptionItem[]) => {
    const totalAmount = items.reduce((acc, item) => acc + item.total, 0);
    
    try {
      const { data: cons, error: consError } = await supabase
        .from('consumptions')
        .insert({
          employee_id: employeeId,
          total_amount: totalAmount,
          status: 'Descuento Nómina'
        })
        .select()
        .single();
        
      if (consError) throw consError;

      const itemsPayload = items.map(item => ({
        consumption_id: cons.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total
      }));

      await supabase.from('consumption_items').insert(itemsPayload);
      
      fetchData();
      setToast({ message: 'Consumo de empleado registrado.', type: 'success' });

    } catch (e) {
      setToast({ message: "Error registrando consumo", type: "error" });
    }
  };

  const handleAddExpense = async (description: string, amount: number) => {
    const { error } = await supabase.from('expenses').insert({ description, amount });
    if (!error) {
      fetchData();
      setToast({ message: 'Gasto registrado.', type: 'success' });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      fetchData();
      setToast({ message: 'Gasto eliminado.', type: 'success' });
    }
  };

  const handleGenerateReport = async () => {
    setIsAnalyzing(true);
    const context = `
      Estado Actual Habitaciones: ${rooms.filter(r => r.status === RoomStatus.OCCUPIED).length} ocupadas de ${rooms.length}.
      Ingresos Turno Actual: $${(consumptions.reduce((acc, c) => acc + c.totalAmount, 0)).toFixed(2)}
    `;
    const result = await analyzeBusinessData(context);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const shiftStartTime = getShiftStartTime();

  const shiftConsumptions = consumptions.filter(c => c.timestamp >= shiftStartTime);
  const shiftExpenses = expensesList.filter(e => e.date >= shiftStartTime);
  
  // Filter active rooms by checkInTime (entry time)
  const shiftOccupiedRooms = rooms.filter(r => 
    r.status === RoomStatus.OCCUPIED && 
    r.checkInTime && r.checkInTime >= shiftStartTime
  );
  
  // FIX: Filter history by checkInTime (entry time) to ensure revenue attribution is consistent
  // If a room entered at 22:00 (Night) and is released at 08:00 (Morning), it should NOT be in the Morning dashboard.
  const shiftHistory = roomHistory.filter(h => h.checkInTime && h.checkInTime >= shiftStartTime);
  
  const historyRevenue = shiftHistory.reduce((acc, h) => acc + h.totalPrice, 0);

  const activeRoomCount = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length; 
  // Fix active people count to only include occupied rooms
  const activePeopleCount = rooms.reduce((acc, r) => {
    return r.status === RoomStatus.OCCUPIED ? acc + (r.peopleCount || 0) : acc;
  }, 0);
  
  const grossRoomTotal = shiftOccupiedRooms.reduce((acc, r) => acc + (r.totalPrice || 0), 0);
  const activeConsumptionsTotal = shiftConsumptions
    .filter(c => c.status === 'Pendiente en Habitación' && c.roomId)
    .reduce((acc, c) => acc + c.totalAmount, 0);

  const activeRoomRentRevenue = Math.max(0, grossRoomTotal - activeConsumptionsTotal);
  
  const roomRevenue = activeRoomRentRevenue + historyRevenue;
  
  const productRevenue = shiftConsumptions
    .filter(c => !c.employeeId)
    .reduce((acc, c) => acc + c.totalAmount, 0);
  
  const employeeConsumption = shiftConsumptions
    .filter(c => c.employeeId)
    .reduce((acc, c) => acc + c.totalAmount, 0);
  
  const totalExpenses = shiftExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const totalShiftRevenue = roomRevenue + productRevenue + employeeConsumption;
  const totalGeneral = totalShiftRevenue - totalExpenses;

  const foodConsumptions = shiftConsumptions.filter(c => !c.employeeId);
  const foodTotalRevenue = foodConsumptions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const foodTotalOrders = foodConsumptions.length;
  const foodAvgTicket = foodTotalOrders > 0 ? foodTotalRevenue / foodTotalOrders : 0;

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <Sparkles className="w-10 h-10 animate-spin text-rose-500" />
       </div>
     )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50 p-4 relative overflow-hidden">
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition bg-white/50"
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition bg-white/50"
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-rose-500/30 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Conectando...' : 'Ingresar al Sistema'}
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            &copy; 2024 Motel las Bolas. Pasión y Excelencia.
          </div>
        </div>
      </div>
    );
  }

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
          <SidebarItem view={AppView.HISTORY} icon={CalendarClock} label="Historial Turnos" />
          <SidebarItem view={AppView.REPORTS} icon={FileBarChart} label="Reportes IA" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 mb-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <Users className="w-5 h-5 text-slate-500" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-700">Admin</p>
               <p className="text-xs text-slate-400">{session.user.email}</p>
             </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-4 py-3 rounded-xl transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">{currentView}</h2>
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
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          
          {currentView === AppView.DASHBOARD && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/10 transition"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <BedDouble className="w-6 h-6 text-white" />
                      </div>
                      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-lg border border-green-500/30">
                        {rooms.length > 0 ? Math.round((activeRoomCount / rooms.length) * 100) : 0}% Ocupación
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Habitaciones Ocupadas</p>
                    <p className="text-4xl font-bold mt-1 tracking-tight">{activeRoomCount} <span className="text-xl text-slate-500 font-normal">/ {rooms.length}</span></p>
                  </div>
                </div>

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

              <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/30 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                     <DollarSign className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-bold">Total General del Turno</h3>
                 </div>
                 <p className="text-4xl font-bold font-mono tracking-tight">{formatCurrency(totalGeneral)}</p>
              </div>

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
                      currentTime={currentTime}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === AppView.ROOMS && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {rooms.map(room => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  activeConsumptions={consumptions.filter(c => c.roomId === room.id && c.status === 'Pendiente en Habitación')}
                  onStatusChange={handleStatusChange}
                  onOpenControls={handleOpenControls}
                  onChangeRoom={handleChangeRoom}
                  onAddPerson={() => handleAddPersonClick(room)}
                  onRequestRelease={handleRequestRelease}
                  currentTime={currentTime}
                />
              ))}
            </div>
          )}

          {currentView === AppView.VEHICLES && (
            <VehiclesManager 
              rooms={rooms}
              reports={vehicleReports}
              onAddReport={handleAddVehicleReport}
              vehicleHistory={vehicleHistory}
            />
          )}

          {currentView === AppView.EMPLOYEES && (
            <EmployeesManager 
              employees={employees}
              consumptions={shiftConsumptions}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onAddConsumption={handleAddEmployeeConsumption}
              products={products}
            />
          )}

          {currentView === AppView.EXPENSES && (
            <ExpensesManager 
              expenses={shiftExpenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {currentView === AppView.HISTORY && (
            <ShiftHistoryManager 
              roomHistory={roomHistory}
              consumptions={consumptions}
              expenses={expensesList}
              vehicleHistory={vehicleHistory}
            />
          )}

          {currentView === AppView.FOOD && (
            <div className="space-y-8 animate-fade-in">
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
                  <button 
                    onClick={() => setFoodModalOpen(true)}
                    className="px-6 py-2.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-900/30 transition flex items-center gap-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" /> Registrar Consumo
                  </button>
                </div>
              </div>

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
      
      <ChangeRoomModal
        isOpen={changeRoomModalOpen}
        onClose={() => setChangeRoomModalOpen(false)}
        sourceRoom={selectedRoomForChange}
        availableRooms={rooms.filter(r => r.status === RoomStatus.AVAILABLE)}
        onConfirm={handleConfirmChangeRoom}
      />
      
      {/* ADD PERSON CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        onConfirm={confirmAddPerson}
        title="Confirmar Persona Extra"
        message={`¿Está seguro de agregar una persona extra a la Habitación ${selectedRoomForAddPerson?.id}? Se cargará un costo adicional de $150.00.`}
        confirmText="Sí, Agregar (+ $150)"
        type="warning"
      />

      {/* RELEASE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={releaseConfirmationOpen}
        onClose={() => setReleaseConfirmationOpen(false)}
        onConfirm={confirmRelease}
        title="Confirmar Salida"
        message={`¿Está seguro que desea liberar la Habitación ${selectedRoomForRelease?.id}? Esto finalizará la estancia y cerrará la cuenta.`}
        confirmText="Sí, Liberar Habitación"
        type="danger"
      />

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
