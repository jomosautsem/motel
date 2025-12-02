export enum RoomStatus {
  AVAILABLE = 'Disponible',
  OCCUPIED = 'Ocupada',
  CLEANING = 'Limpieza',
  MAINTENANCE = 'Mantenimiento'
}

export interface Room {
  id: string;
  status: RoomStatus;
  type: 'Suite' | 'Jacuzzi' | 'Sencilla';
  
  // Occupancy Details
  checkInTime?: Date;
  checkOutTime?: Date;
  clientName?: string;
  peopleCount?: number;
  entryType?: 'Auto' | 'Moto' | 'Pie';
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  totalPrice?: number;

  // Inventory/Controls Details
  tvControlCount?: number;
  acControlCount?: number;
}

export enum AppView {
  DASHBOARD = 'Dashboard',
  ROOMS = 'Habitaciones',
  VEHICLES = 'Vehiculos',
  FOOD = 'Alimentos',
  REPORTS = 'Reportes',
  EMPLOYEES = 'Empleados',
  EXPENSES = 'Gastos',
  TRANSFERS = 'Transferencias'
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'Activo' | 'Descanso';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Bebida' | 'Snack' | 'Cocina' | 'Otro';
  stock: number;
}

export interface ConsumptionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Consumption {
  id: string;
  roomId: string; // "General" if not attached to a room (e.g. employee or walk-in)
  items: ConsumptionItem[];
  totalAmount: number;
  timestamp: Date;
  status: 'Pagado' | 'Pendiente en Habitación';
}