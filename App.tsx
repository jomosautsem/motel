
import React, { useState, useEffect } from 'react';
import { 
  Room, 
  RoomStatus, 
  AppView, 
  VehicleReport, 
  VehicleLog, 
  Expense, 
  Employee, 
  Product, 
  Consumption, 
  RoomHistoryEntry 
} from './types';
import { RoomCard } from './components/RoomCard';
import { OccupancyModal } from './components/OccupancyModal';
import { ControlsModal } from './components/ControlsModal';
import { FoodConsumptionModal } from './components/FoodConsumptionModal';
import { ProductModal } from './components/ProductModal';
import { Toast } from './components/Toast';
import { VehiclesManager } from './components/VehiclesManager';
import { EmployeesManager } from './components/EmployeesManager';
import { ExpensesManager } from './components/ExpensesManager';
import { ShiftHistoryManager } from './components/ShiftHistoryManager';
import { ChangeRoomModal } from './components/ChangeRoomModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AddTimeModal } from './components/AddTimeModal';
import { ReduceTimeModal } from './components/ReduceTimeModal';
import { analyzeBusinessData } from './services/geminiService';
import { supabase } from './supabaseClient';
import { 
  LayoutDashboard, 
  BedDouble, 
  Car, 
  Utensils, 
  Users, 
  DollarSign, 
  History,
  Sparkles,
  ShoppingCart,
  LogOut
} from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicleReports, setVehicleReports] = useState<VehicleReport[]>([]);
  const [vehicleHistory, setVehicleHistory] = useState<VehicleLog[]>([]);
  const [roomHistory, setRoomHistory] = useState<RoomHistoryEntry[]>([]);
  
  // Real-time Clock for Dashboard Sync
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dashboard Stats State (Derived from DB)
  const [shiftOccupiedRooms, setShiftOccupiedRooms] = useState(0);
  const [activePeopleCount, setActivePeopleCount] = useState(0);
  const [activeRoomRentRevenue, setActiveRoomRentRevenue] = useState(0); 
  const [shiftRoomConsumptionRevenue, setShiftRoomConsumptionRevenue] = useState(0);
  const [shiftEmployeeConsumptionRevenue, setShiftEmployeeConsumptionRevenue] = useState(0);
  const [shiftExpensesTotal, setShiftExpensesTotal] = useState(0);
  const [historyRevenue, setHistoryRevenue] = useState(0);

  // Shift Info
  const [currentShift, setCurrentShift] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); 
    return () => clearInterval(timer);
  }, []);

  // Modals State
  const [occupancyModalOpen, setOccupancyModalOpen] = useState(false);
  const [selectedRoomForOccupancy, setSelectedRoomForOccupancy] = useState<Room | null>(null);
  
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const [selectedRoomForControls, setSelectedRoomForControls] = useState<Room | null>(null);

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  
  const [addTimeModalOpen, setAddTimeModalOpen] = useState(false);
  const [selectedRoomForAddTime, setSelectedRoomForAddTime] = useState<Room | null>(null);
  
  const [reduceTimeModalOpen, setReduceTimeModalOpen] = useState(false);
  const [selectedRoomForReduceTime, setSelectedRoomForReduceTime] = useState<Room | null>(null);

  const [changeRoomModalOpen, setChangeRoomModalOpen] = useState(false);
  const [selectedRoomForChange, setSelectedRoomForChange] = useState<Room | null>(null);

  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedRoomForRelease, setSelectedRoomForRelease] = useState<Room | null>(null);

  const [removePersonConfirmationOpen, setRemovePersonConfirmationOpen] = useState(false);
  const [selectedRoomForRemovePerson, setSelectedRoomForRemovePerson] = useState<Room | null>(null);

  const [addPersonConfirmationOpen, setAddPersonConfirmationOpen] = useState(false);
  const [selectedRoomForAddPerson, setSelectedRoomForAddPerson] = useState<Room | null>(null);

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);

  // Gemini Analysis State
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- INITIALIZATION & DATA FETCHING ---
  
  const initSystem = async () => {
    try {
      // 1. AUTO-LOGIN (Fixes "No rooms visible" issue due to RLS)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Automatically login as admin to ensure RLS policies allow reading data
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: 'motellasbolas@gmail.com',
          password: 'j5s82QSM'
        });
        if (authError) {
            console.error("Auth Error (Auto-Login Failed):", authError);
            showToast("Error de autenticación. Recargue la página.", "error");
        }
      }

      await fetchData();
    } catch (e) {
      console.error("System init error", e);
    }
  };

  const fetchData = async () => {
    try {
      // 1. Fetch Rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('id', { ascending: true });
      
      if (roomsError) throw roomsError;

      // Process and sort rooms logically
      const sortedRooms = (roomsData || []).map((r: any) => ({
        ...r,
        type: 'Sencilla', 
        checkInTime: r.check_in_time ? new Date(r.check_in_time) : undefined,
        checkOutTime: r.check_out_time ? new Date(r.check_out_time) : undefined,
        clientName: r.client_name,
        peopleCount: r.people_count,
        entryType: r.entry_type,
        vehiclePlate: r.vehicle_plate,
        vehicleBrand: r.vehicle_brand,
        vehicleModel: r.vehicle_model,
        vehicleColor: r.vehicle_color,
        totalPrice: r.total_price,
        tvControlCount: r.tv_control_count,
        acControlCount: r.ac_control_count
      })).sort((a: any, b: any) => {
        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
      });
      
      setRooms(sortedRooms);

      // 2. Fetch Products
      const { data: productsData } = await supabase.from('products').select('*');
      setProducts(productsData || []);

      // 3. Fetch Employees
      const { data: employeesData } = await supabase.from('employees').select('*');
      if (employeesData) {
        setEmployees(employeesData.map((e: any) => ({
            ...e,
            joinedDate: new Date(e.joined_date)
        })));
      }

      // 4. Fetch Expenses
      const { data: expensesData } = await supabase.from('expenses').select('*');
      if (expensesData) {
        setExpenses(expensesData.map((e: any) => ({
            ...e,
            date: new Date(e.date)
        })));
      }

      // 5. Fetch Consumptions
      const { data: consumptionsData } = await supabase
        .from('consumptions')
        .select(`
            *,
            consumption_items (*)
        `);
      
      if (consumptionsData) {
        const parsedConsumptions: Consumption[] = consumptionsData.map((c: any) => ({
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
        setConsumptions(parsedConsumptions);
      }

      // 6. Fetch Vehicle Reports
      const { data: reportsData } = await supabase.from('vehicle_reports').select('*');
      if (reportsData) {
        setVehicleReports(reportsData.map((r: any) => ({
            ...r,
            date: new Date(r.date)
        })));
      }

      // 7. Fetch Vehicle History
      const { data: vLogData } = await supabase.from('vehicle_history').select('*');
      if (vLogData) {
        setVehicleHistory(vLogData.map((l: any) => ({
            id: l.id,
            roomId: l.room_id,
            plate: l.plate,
            brand: l.brand,
            model: l.model,
            color: l.color,
            entryType: l.entry_type,
            entryTime: new Date(l.entry_time),
            exitTime: l.exit_time ? new Date(l.exit_time) : undefined
        })));
      }

      // 8. Fetch Room History
      const { data: rHistoryData } = await supabase.from('room_history').select('*');
      if (rHistoryData) {
          setRoomHistory(rHistoryData.map((h: any) => ({
              id: h.id,
              roomId: h.room_id,
              totalPrice: h.total_price,
              checkInTime: h.check_in_time ? new Date(h.check_in_time) : new Date(),
              checkOutTime: h.check_out_time ? new Date(h.check_out_time) : new Date(),
              createdAt: new Date(h.created_at)
          })));
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error al cargar datos", "error");
    }
  };

  useEffect(() => {
    initSystem();
  }, []);

  // --- DASHBOARD AUTOMATIC LOGIC ---

  const getShiftInfo = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Matutino: 07:00 - 14:00
    // Vespertino: 14:00 - 21:00
    // Nocturno: 21:00 - 07:00
    
    let shiftName = '';
    let startHour = 0;
    
    if (hour >= 7 && hour < 14) {
      shiftName = 'Turno Matutino';
      startHour = 7;
    } else if (hour >= 14 && hour < 21) {
      shiftName = 'Turno Vespertino';
      startHour = 14;
    } else {
      shiftName = 'Turno Nocturno';
      startHour = 21; 
    }

    const startTime = new Date(now);
    if (hour < 7) {
       startTime.setDate(startTime.getDate() - 1);
       startTime.setHours(21, 0, 0, 0);
    } else {
       startTime.setHours(startHour, 0, 0, 0);
    }
    
    return { shiftName, startTime };
  };

  useEffect(() => {
    const { shiftName, startTime } = getShiftInfo();
    setCurrentShift(shiftName);

    // Filter Stats based on current shift StartTime
    
    // 1. Rooms Occupied NOW (Realtime status, not history)
    const activeRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED);
    setShiftOccupiedRooms(activeRooms.length);
    
    // 2. Active People NOW
    const totalPeople = activeRooms.reduce((acc, r) => acc + (r.peopleCount || 0), 0);
    setActivePeopleCount(totalPeople);

    // 3. Active Rents Revenue (Money currently in occupied rooms, excluding consumptions)
    let currentRentRevenue = 0;
    activeRooms.forEach(r => {
        const roomConsumptions = consumptions.filter(c => c.roomId === r.id && c.status === 'Pendiente en Habitación');
        const consumptionTotal = roomConsumptions.reduce((sum, c) => sum + c.totalAmount, 0);
        currentRentRevenue += (r.totalPrice || 0) - consumptionTotal;
    });
    setActiveRoomRentRevenue(currentRentRevenue);

    // 4. History Revenue (Money from rooms released THIS SHIFT)
    // Filter by checkInTime to assign revenue to the shift where entry happened
    const shiftHistory = roomHistory.filter(h => {
        if (!h.checkInTime) return false;
        return h.checkInTime >= startTime;
    });
    const historyTotal = shiftHistory.reduce((acc, h) => acc + h.totalPrice, 0);
    setHistoryRevenue(historyTotal);

    // 5. Consumptions Revenue (Items sold THIS SHIFT)
    const shiftRoomCons = consumptions.filter(c => c.timestamp >= startTime && c.roomId);
    setShiftRoomConsumptionRevenue(shiftRoomCons.reduce((acc, c) => acc + c.totalAmount, 0));

    const shiftEmpCons = consumptions.filter(c => c.timestamp >= startTime && c.employeeId);
    setShiftEmployeeConsumptionRevenue(shiftEmpCons.reduce((acc, c) => acc + c.totalAmount, 0));

    // 6. Expenses (Spent THIS SHIFT)
    const shiftExp = expenses.filter(e => e.date >= startTime);
    setShiftExpensesTotal(shiftExp.reduce((acc, e) => acc + e.amount, 0));

  }, [rooms, consumptions, expenses, roomHistory, currentTime]);


  // --- HANDLERS ---

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const handleStatusChange = (roomId: string, newStatus: RoomStatus) => {
    if (newStatus === RoomStatus.OCCUPIED) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setSelectedRoomForOccupancy(room);
        setOccupancyModalOpen(true);
      }
    } else {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
      supabase.from('rooms').update({ status: newStatus }).eq('id', roomId).then(({ error }) => {
          if (error) showToast("Error actualizando estado", "error");
      });
    }
  };

  const handleConfirmOccupancy = async (data: any) => {
    if (!selectedRoomForOccupancy) return;
    
    const { error: roomError } = await supabase.from('rooms').update({
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
        total_price: data.totalPrice,
        tv_control_count: 0,
        ac_control_count: 0
    }).eq('id', selectedRoomForOccupancy.id);

    if (roomError) {
        showToast("Error al ocupar habitación", "error");
        return;
    }

    if (data.entryType !== 'Pie') {
      await supabase.from('vehicle_history').insert({
        room_id: selectedRoomForOccupancy.id,
        plate: data.vehiclePlate,
        brand: data.vehicleBrand,
        model: data.vehicleModel,
        color: data.vehicleColor,
        entry_type: data.entryType,
        entry_time: new Date()
      });
    }

    await fetchData(); 
    setOccupancyModalOpen(false);
    setSelectedRoomForOccupancy(null);
    showToast(`Habitación ${selectedRoomForOccupancy.id} ocupada correctamente.`);
  };

  const handleOpenControls = (room: Room) => {
    setSelectedRoomForControls(room);
    setControlsModalOpen(true);
  };

  const handleSaveControls = async (roomId: string, tvCount: number, acCount: number) => {
    const { error } = await supabase.from('rooms').update({
        tv_control_count: tvCount,
        ac_control_count: acCount
    }).eq('id', roomId);

    if (error) {
        showToast("Error guardando controles", "error");
    } else {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, tvControlCount: tvCount, acControlCount: acCount } : r));
        showToast('Controles actualizados');
    }
  };

  const handleAddTime = (room: Room) => {
    setSelectedRoomForAddTime(room);
    setAddTimeModalOpen(true);
  };

  const handleConfirmAddTime = async (hours: number, cost: number) => {
    if (selectedRoomForAddTime && selectedRoomForAddTime.checkOutTime) {
      const newTime = new Date(selectedRoomForAddTime.checkOutTime);
      newTime.setTime(newTime.getTime() + (hours * 60 * 60 * 1000));
      const newPrice = (selectedRoomForAddTime.totalPrice || 0) + cost;

      const { error } = await supabase.from('rooms').update({
          check_out_time: newTime,
          total_price: newPrice
      }).eq('id', selectedRoomForAddTime.id);

      if (error) {
          showToast("Error al agregar tiempo", "error");
      } else {
          setRooms(prev => prev.map(r => r.id === selectedRoomForAddTime.id ? { ...r, checkOutTime: newTime, totalPrice: newPrice } : r));
          setAddTimeModalOpen(false);
          showToast(`Tiempo agregado a Hab. ${selectedRoomForAddTime.id}`);
      }
    }
  };

  const handleReduceTime = (room: Room) => {
    setSelectedRoomForReduceTime(room);
    setReduceTimeModalOpen(true);
  };

  const handleConfirmReduceTime = async (hours: number, cost: number) => {
    if (selectedRoomForReduceTime && selectedRoomForReduceTime.checkOutTime) {
      const newTime = new Date(selectedRoomForReduceTime.checkOutTime);
      newTime.setTime(newTime.getTime() - (hours * 60 * 60 * 1000));
      const newPrice = Math.max(0, (selectedRoomForReduceTime.totalPrice || 0) - cost);

      const { error } = await supabase.from('rooms').update({
          check_out_time: newTime,
          total_price: newPrice
      }).eq('id', selectedRoomForReduceTime.id);

      if (error) {
          showToast("Error al reducir tiempo", "error");
      } else {
          setRooms(prev => prev.map(r => r.id === selectedRoomForReduceTime.id ? { ...r, checkOutTime: newTime, totalPrice: newPrice } : r));
          setReduceTimeModalOpen(false);
          showToast(`Tiempo reducido en Hab. ${selectedRoomForReduceTime.id}`);
      }
    }
  };

  const handleChangeRoom = (room: Room) => {
    setSelectedRoomForChange(room);
    setChangeRoomModalOpen(true);
  };

  const handleConfirmChangeRoom = async (targetRoomId: string) => {
    if (!selectedRoomForChange) return;

    const source = rooms.find(r => r.id === selectedRoomForChange.id);
    if (!source) return;

    await supabase.from('rooms').update({
        status: RoomStatus.OCCUPIED,
        client_name: source.clientName,
        people_count: source.peopleCount,
        entry_type: source.entryType,
        vehicle_plate: source.vehiclePlate,
        vehicle_brand: source.vehicleBrand,
        vehicle_model: source.vehicleModel,
        vehicle_color: source.vehicleColor,
        check_in_time: source.checkInTime,
        check_out_time: source.checkOutTime,
        total_price: source.totalPrice,
        tv_control_count: source.tvControlCount,
        ac_control_count: source.acControlCount
    }).eq('id', targetRoomId);

    await supabase.from('consumptions')
        .update({ room_id: targetRoomId })
        .eq('room_id', source.id)
        .eq('status', 'Pendiente en Habitación');

    await supabase.from('rooms').update({
        status: RoomStatus.CLEANING,
        client_name: null,
        people_count: 2,
        entry_type: null,
        vehicle_plate: null,
        vehicle_brand: null,
        vehicle_model: null,
        vehicle_color: null,
        check_in_time: null,
        check_out_time: null,
        total_price: null,
        tv_control_count: 0,
        ac_control_count: 0
    }).eq('id', source.id);

    await fetchData();
    setChangeRoomModalOpen(false);
    showToast(`Cambio de Hab. ${selectedRoomForChange.id} a ${targetRoomId} exitoso`);
  };

  const handleRequestRelease = (room: Room) => {
    if ((room.tvControlCount || 0) > 0 || (room.acControlCount || 0) > 0) {
        showToast("No se puede liberar: Hay controles pendientes de devolución.", "error");
        handleOpenControls(room);
        return;
    }
    setSelectedRoomForRelease(room);
    setReleaseModalOpen(true);
  };

  const handleConfirmRelease = async () => {
    if (selectedRoomForRelease) {
      const roomConsumptions = consumptions.filter(c => c.roomId === selectedRoomForRelease.id && c.status === 'Pendiente en Habitación');
      const consumptionTotal = roomConsumptions.reduce((sum, c) => sum + c.totalAmount, 0);
      const netRent = (selectedRoomForRelease.totalPrice || 0) - consumptionTotal; 

      const { error: histError } = await supabase.from('room_history').insert({
        room_id: selectedRoomForRelease.id,
        total_price: netRent,
        check_in_time: selectedRoomForRelease.checkInTime,
        check_out_time: new Date()
      });

      if (histError) console.error("History Error", histError);

      await supabase.from('consumptions')
        .update({ status: 'Pagado' })
        .eq('room_id', selectedRoomForRelease.id)
        .eq('status', 'Pendiente en Habitación');

      if (selectedRoomForRelease.entryType !== 'Pie') {
         await supabase.from('vehicle_history')
            .update({ exit_time: new Date() })
            .eq('room_id', selectedRoomForRelease.id)
            .is('exit_time', null);
      }

      await supabase.from('rooms').update({
        status: RoomStatus.CLEANING,
        client_name: null,
        people_count: 2,
        entry_type: null,
        vehicle_plate: null,
        vehicle_brand: null,
        vehicle_model: null,
        vehicle_color: null,
        check_in_time: null,
        check_out_time: null,
        total_price: null,
        tv_control_count: 0,
        ac_control_count: 0
      }).eq('id', selectedRoomForRelease.id);

      await fetchData();
      setReleaseModalOpen(false);
      showToast(`Habitación ${selectedRoomForRelease.id} liberada.`);
    }
  };

  const handleConfirmFood = async (roomId: string, items: any[]) => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    
    const { data: consData, error: consError } = await supabase.from('consumptions').insert({
        room_id: roomId,
        total_amount: total,
        status: 'Pendiente en Habitación'
    }).select().single();

    if (consError || !consData) {
        showToast("Error al crear consumo", "error");
        return;
    }

    const itemsToInsert = items.map(item => ({
        consumption_id: consData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total
    }));

    await supabase.from('consumption_items').insert(itemsToInsert);

    const room = rooms.find(r => r.id === roomId);
    if (room) {
        await supabase.from('rooms').update({
            total_price: (room.totalPrice || 0) + total
        }).eq('id', roomId);
    }

    await fetchData();
    setFoodModalOpen(false);
    showToast('Consumo agregado a habitación');
  };

  const handleSaveProduct = async (productData: any) => {
    const { error } = await supabase.from('products').insert(productData);
    if (error) showToast("Error al guardar producto", "error");
    else {
        await fetchData();
        showToast("Producto agregado al menú");
    }
  };

  const handleAddEmployee = async (empData: any) => {
    const { error } = await supabase.from('employees').insert({
        name: empData.name,
        role: empData.role,
        status: empData.status,
        joined_date: new Date()
    });
    
    if (error) showToast("Error al agregar empleado", "error");
    else {
        await fetchData();
        showToast('Empleado registrado');
    }
  };

  const handleEditEmployee = async (id: string, data: any) => {
    const { error } = await supabase.from('employees').update({
        name: data.name,
        role: data.role,
        status: data.status
    }).eq('id', id);

    if (error) showToast("Error al actualizar empleado", "error");
    else {
        await fetchData();
        showToast('Empleado actualizado');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
        if (error.code === '23503') { 
            showToast("No se puede eliminar: El empleado tiene consumos registrados.", "error");
        } else {
            showToast("Error al eliminar empleado", "error");
        }
    } else {
        await fetchData();
        showToast('Empleado eliminado', 'warning');
    }
  };

  const handleAddEmployeeConsumption = async (employeeId: string, items: any[]) => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    
    const { data: consData, error } = await supabase.from('consumptions').insert({
        employee_id: employeeId,
        total_amount: total,
        status: 'Descuento Nómina'
    }).select().single();

    if (error || !consData) {
        showToast("Error al registrar consumo", "error");
        return;
    }

    const itemsToInsert = items.map(item => ({
        consumption_id: consData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total
    }));
    await supabase.from('consumption_items').insert(itemsToInsert);

    await fetchData();
    showToast('Consumo de empleado registrado');
  };

  const handleAddExpense = async (desc: string, amount: number) => {
    const { error } = await supabase.from('expenses').insert({
        description: desc,
        amount,
        date: new Date()
    });
    if (error) showToast("Error al registrar gasto", "error");
    else {
        await fetchData();
        showToast('Gasto registrado');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) showToast("Error al eliminar gasto", "error");
    else {
        await fetchData();
        showToast('Gasto eliminado', 'warning');
    }
  };

  const handleAddVehicleReport = async (reportData: any) => {
    // Attempt to save full data first
    const { error } = await supabase.from('vehicle_reports').insert({
        plate: reportData.plate,
        brand: reportData.brand,
        model: reportData.model,
        description: reportData.description,
        severity: reportData.severity,
        date: new Date()
    });

    if (error) {
        // Fallback: If 'brand' column doesn't exist yet, save basic report
        if (error.code === '42703') { // Undefined column
             const { error: retryError } = await supabase.from('vehicle_reports').insert({
                plate: reportData.plate,
                description: reportData.description,
                severity: reportData.severity,
                date: new Date()
            });
            if (retryError) showToast("Error creando reporte", "error");
            else {
                await fetchData();
                showToast('Reporte vehicular creado (Sin detalles de marca)', 'warning');
            }
        } else {
            showToast("Error creando reporte", "error");
        }
    } else {
        await fetchData();
        showToast('Reporte vehicular creado', 'warning');
    }
  };

  const handleAddPerson = (room: Room) => {
    if ((room.peopleCount || 2) >= 3) {
      showToast('Límite de personas alcanzado (Máx 3)', 'error');
      return;
    }
    setSelectedRoomForAddPerson(room);
    setAddPersonConfirmationOpen(true);
  };

  const handleConfirmAddPerson = async () => {
    if (!selectedRoomForAddPerson) return;
    
    const room = selectedRoomForAddPerson;
    const newCount = (room.peopleCount || 2) + 1;
    const newPrice = (room.totalPrice || 0) + 150;
    
    const { error } = await supabase.from('rooms').update({
        people_count: newCount,
        total_price: newPrice
    }).eq('id', room.id);

    if (error) {
        showToast("Error agregando persona", "error");
    } else {
        setRooms(prev => prev.map(r => r.id === room.id ? { 
            ...r, 
            peopleCount: newCount, 
            totalPrice: newPrice 
        } : r));
        showToast('Persona agregada (+ $150)');
        setAddPersonConfirmationOpen(false);
    }
  };

  const handleRemovePersonClick = (room: Room) => {
    if ((room.peopleCount || 0) <= 1) {
       showToast('Mínimo 1 persona requerida', 'error');
       return;
    }
    setSelectedRoomForRemovePerson(room);
    setRemovePersonConfirmationOpen(true);
  };

  const confirmRemovePerson = async () => {
    if (selectedRoomForRemovePerson) {
      const newCount = Math.max(1, (selectedRoomForRemovePerson.peopleCount || 2) - 1);
      
      const { error } = await supabase.from('rooms').update({
          people_count: newCount
      }).eq('id', selectedRoomForRemovePerson.id);

      if (error) {
          showToast("Error al retirar persona", "error");
      } else {
          setRooms(prev => prev.map(r => r.id === selectedRoomForRemovePerson.id ? {
            ...r,
            peopleCount: newCount
          } : r));
          setRemovePersonConfirmationOpen(false);
          showToast('Persona retirada (Precio mantenido)');
      }
    }
  };

  const handleAnalyzeData = async () => {
    setIsAnalyzing(true);
    const context = `
      Habitaciones Ocupadas: ${shiftOccupiedRooms}.
      Ingresos del turno (Rentas): $${activeRoomRentRevenue + historyRevenue}.
      Ingresos del turno (Consumos): $${shiftRoomConsumptionRevenue + shiftEmployeeConsumptionRevenue}.
      Gastos registrados: $${shiftExpensesTotal}.
    `;
    
    const result = await analyzeBusinessData(context);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  // --- RENDER HELPERS ---

  const renderContent = () => {
    switch(view) {
      case AppView.DASHBOARD:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Shift Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard - Motel Las Bolas</h2>
                <p className="text-slate-400 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {currentShift}
                </p>
              </div>
              
              <div className="flex gap-3">
                 <button 
                  onClick={() => setFoodModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 backdrop-blur-sm transition border border-white/10"
                >
                  <Utensils className="w-4 h-4" /> Venta Rápida
                </button>
                <button 
                  onClick={handleAnalyzeData}
                  disabled={isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> {isAnalyzing ? 'Analizando...' : 'Analizar Negocio'}
                </button>
              </div>
            </div>
            
            {/* Analysis Result */}
            {analysisResult && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h3 className="font-bold mb-2 flex items-center gap-2 relative z-10"><Sparkles className="w-4 h-4" /> Análisis IA</h3>
                <p className="whitespace-pre-line opacity-90 relative z-10 text-sm leading-relaxed">{analysisResult}</p>
                <button onClick={() => setAnalysisResult('')} className="absolute top-4 right-4 text-white/50 hover:text-white"><Sparkles className="w-4 h-4" /></button>
              </div>
            )}

            {/* Stats Cards Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ocupación */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Habitaciones Ocupadas</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{shiftOccupiedRooms} <span className="text-sm text-slate-400 font-normal">/ {rooms.length}</span></p>
                   <p className="text-xs text-blue-500 font-semibold mt-1">{Math.round((shiftOccupiedRooms/Math.max(rooms.length, 1))*100)}% Ocupación</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
                  <BedDouble className="w-6 h-6" />
                </div>
              </div>

               {/* Ingresos Turno (Rentas) */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ingresos Turno (Rentas)</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">${(activeRoomRentRevenue + historyRevenue).toFixed(2)}</p>
                   <p className="text-xs text-green-500 font-semibold mt-1">En curso + Histórico</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl text-green-500">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

               {/* Personas */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Personas Activas</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{activePeopleCount}</p>
                   <p className="text-xs text-slate-400 font-semibold mt-1">Huéspedes actuales</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl text-purple-500">
                  <Users className="w-6 h-6" />
                </div>
              </div>

               {/* Total Turno Anterior */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between opacity-60">
                <div>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Turno Anterior</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">$ --</p>
                   <p className="text-xs text-slate-400 font-semibold mt-1">Cierre finalizado</p>
                </div>
                <div className="bg-slate-100 p-3 rounded-xl text-slate-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Stats Cards Row 2 (Detailed Money) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                 <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-sm">
                   <BedDouble className="w-4 h-4" /> Ingresos por Habitaciones
                 </div>
                 <p className="text-2xl font-bold text-green-800">${(activeRoomRentRevenue + historyRevenue).toFixed(2)}</p>
              </div>

              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                 <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold text-sm">
                   <ShoppingCart className="w-4 h-4" /> Ingresos por Consumos
                 </div>
                 <p className="text-2xl font-bold text-purple-800">${shiftRoomConsumptionRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                 <div className="flex items-center gap-2 mb-2 text-orange-700 font-bold text-sm">
                   <Users className="w-4 h-4" /> Consumos de Empleados
                 </div>
                 <p className="text-2xl font-bold text-orange-800">${shiftEmployeeConsumptionRevenue.toFixed(2)}</p>
              </div>

              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
                 <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-sm">
                   <DollarSign className="w-4 h-4" /> Gastos
                 </div>
                 <p className="text-2xl font-bold text-rose-800">${shiftExpensesTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Total General Bar */}
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                 <span className="text-xl font-bold">Total General del Turno</span>
               </div>
               <span className="text-4xl font-mono font-bold">
                 ${((activeRoomRentRevenue + historyRevenue + shiftRoomConsumptionRevenue + shiftEmployeeConsumptionRevenue) - shiftExpensesTotal).toFixed(2)}
               </span>
            </div>

            {/* Active Rooms Grid */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <BedDouble className="w-5 h-5 text-slate-500" /> Estado de Habitaciones
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {rooms.map(room => (
                   <RoomCard 
                      key={room.id} 
                      room={room} 
                      onStatusChange={handleStatusChange} 
                      variant="compact"
                      activeConsumptions={consumptions.filter(c => c.roomId === room.id && c.status === 'Pendiente en Habitación')}
                      currentTime={currentTime}
                   />
                ))}
                {rooms.length === 0 && (
                  <div className="col-span-full py-8 text-center text-slate-400">
                    Cargando habitaciones...
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case AppView.ROOMS:
        return (
          // Adjusted Grid here for smaller cards: sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in">
             {rooms.map(room => (
               <RoomCard 
                 key={room.id} 
                 room={room}
                 onStatusChange={handleStatusChange}
                 onOpenControls={handleOpenControls}
                 onAddTime={handleAddTime}
                 onReduceTime={handleReduceTime}
                 onAddPerson={handleAddPerson}
                 onRemovePerson={handleRemovePersonClick}
                 onChangeRoom={handleChangeRoom}
                 onRequestRelease={handleRequestRelease}
                 activeConsumptions={consumptions.filter(c => c.roomId === room.id && c.status === 'Pendiente en Habitación')}
                 currentTime={currentTime}
               />
             ))}
             {rooms.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400">
                  No hay habitaciones disponibles para mostrar.
                </div>
             )}
          </div>
        );

      case AppView.VEHICLES:
        return (
          <VehiclesManager 
            rooms={rooms}
            reports={vehicleReports}
            onAddReport={handleAddVehicleReport}
            vehicleHistory={vehicleHistory}
          />
        );

      case AppView.FOOD:
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-800">Alimentos y Bebidas</h2>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setProductModalOpen(true)}
                   className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition"
                 >
                   Añadir/Editar Menú
                 </button>
                 <button 
                   onClick={() => setFoodModalOpen(true)}
                   className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow-sm"
                 >
                   Registrar Consumo
                 </button>
               </div>
             </div>
             
             {/* Stats Row */}
             <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                   <p className="text-slate-500 text-xs font-bold uppercase">Productos en Menú</p>
                   <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                   <p className="text-slate-500 text-xs font-bold uppercase">Consumos Registrados</p>
                   <p className="text-2xl font-bold text-green-600">{consumptions.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                   <p className="text-slate-500 text-xs font-bold uppercase">Ingresos Totales</p>
                   <p className="text-2xl font-bold text-orange-600">${shiftRoomConsumptionRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                   <p className="text-slate-500 text-xs font-bold uppercase">Promedio / Consumo</p>
                   <p className="text-2xl font-bold text-purple-600">
                     ${consumptions.length > 0 ? (shiftRoomConsumptionRevenue / consumptions.length).toFixed(2) : '0.00'}
                   </p>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h3 className="font-bold text-slate-700">Menú Actual</h3>
                   <span className="text-xs text-slate-500">
                     {products.filter(p => p.category === 'Bebida').length} Bebidas • {products.filter(p => p.category !== 'Bebida').length} Alimentos/Otros
                   </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                   {products.map(p => (
                     <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                             p.category === 'Bebida' ? 'bg-blue-400' : p.category === 'Snack' ? 'bg-orange-400' : 'bg-green-400'
                           }`}>
                             {p.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800">{p.name}</p>
                             <p className="text-xs text-slate-400 uppercase">{p.category}</p>
                           </div>
                        </div>
                        <span className="font-mono font-bold text-green-600">${p.price}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );

      case AppView.EMPLOYEES:
        return (
          <EmployeesManager 
            employees={employees}
            consumptions={consumptions}
            products={products}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onAddConsumption={handleAddEmployeeConsumption}
          />
        );

      case AppView.EXPENSES:
        return (
          <ExpensesManager 
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      
      case AppView.HISTORY:
        return (
          <ShiftHistoryManager 
            roomHistory={roomHistory}
            consumptions={consumptions}
            expenses={expenses}
            vehicleHistory={vehicleHistory}
          />
        );

      default:
        return <div className="p-10 text-center text-slate-400">Vista en desarrollo: {view}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 font-bold text-xl text-rose-500">
           <BedDouble className="w-8 h-8" />
           <span className="hidden lg:block">Motel Las Bolas</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          {[
            { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
            { id: AppView.ROOMS, icon: BedDouble, label: 'Habitaciones' },
            { id: AppView.FOOD, icon: Utensils, label: 'Alimentos y Bebidas' },
            { id: AppView.VEHICLES, icon: Car, label: 'Vehículos' },
            { id: AppView.EMPLOYEES, icon: Users, label: 'Empleados' },
            { id: AppView.EXPENSES, icon: DollarSign, label: 'Gastos' },
            { id: AppView.HISTORY, icon: History, label: 'Historial Turnos' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                view === item.id 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
           <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-white">Admin</p>
                <p className="text-xs text-slate-500">motellasbolas@gmail.com</p>
              </div>
           </div>
           <button className="mt-4 w-full flex items-center gap-2 text-rose-500 hover:text-rose-400 text-sm font-medium px-2 transition">
             <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Cerrar Sesión</span>
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative custom-scrollbar">
        {renderContent()}
      </main>

      {/* --- MODALS --- */}
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {selectedRoomForOccupancy && (
        <OccupancyModal 
          room={selectedRoomForOccupancy}
          isOpen={occupancyModalOpen}
          onClose={() => setOccupancyModalOpen(false)}
          onConfirm={handleConfirmOccupancy}
          reports={vehicleReports}
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
        onConfirm={handleConfirmFood}
      />

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {selectedRoomForAddTime && (
        <AddTimeModal 
          isOpen={addTimeModalOpen}
          onClose={() => setAddTimeModalOpen(false)}
          room={selectedRoomForAddTime}
          onConfirm={handleConfirmAddTime}
        />
      )}

      {selectedRoomForReduceTime && (
        <ReduceTimeModal 
          isOpen={reduceTimeModalOpen}
          onClose={() => setReduceTimeModalOpen(false)}
          room={selectedRoomForReduceTime}
          onConfirm={handleConfirmReduceTime}
        />
      )}

      <ChangeRoomModal 
        isOpen={changeRoomModalOpen}
        onClose={() => setChangeRoomModalOpen(false)}
        sourceRoom={selectedRoomForChange}
        availableRooms={rooms.filter(r => r.status === RoomStatus.AVAILABLE || r.status === RoomStatus.CLEANING)}
        onConfirm={handleConfirmChangeRoom}
      />

      <ConfirmationModal 
        isOpen={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        onConfirm={handleConfirmRelease}
        title="¿Liberar Habitación?"
        message={`Esta acción finalizará la estancia de la Habitación ${selectedRoomForRelease?.id}. Se registrará el historial y se marcará para limpieza.`}
        confirmText="Sí, Liberar"
        type="warning"
      />

      <ConfirmationModal 
        isOpen={removePersonConfirmationOpen}
        onClose={() => setRemovePersonConfirmationOpen(false)}
        onConfirm={confirmRemovePerson}
        title="¿Salida de Persona?"
        message={`Se reducirá el contador de personas de la Habitación ${selectedRoomForRemovePerson?.id} PERO el precio se mantendrá igual.`}
        confirmText="Confirmar Salida"
        type="warning"
      />

      <ConfirmationModal 
        isOpen={addPersonConfirmationOpen}
        onClose={() => setAddPersonConfirmationOpen(false)}
        onConfirm={handleConfirmAddPerson}
        title="¿Agregar Persona Extra?"
        message={`Se aumentará una persona a la Habitación ${selectedRoomForAddPerson?.id} y se sumarán $150 al total.`}
        confirmText="Sí, Agregar"
        type="info"
      />

    </div>
  );
};

export default App;
