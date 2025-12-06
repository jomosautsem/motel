
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

export interface RoomHistoryEntry {
  id: string;
  roomId: string;
  totalPrice: number;
  checkInTime: Date;
  checkOutTime: Date;
  createdAt: Date;
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
  date: Date;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  status: 'Activo' | 'Descanso' | 'Baja';
  joinedDate: Date;
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
  roomId?: string; // Optional now, as it could be an employee consumption
  employeeId?: string; // New field for employee tracking
  items: ConsumptionItem[];
  totalAmount: number;
  timestamp: Date;
  status: 'Pagado' | 'Pendiente en Habitación' | 'Descuento Nómina';
}

export interface VehicleReport {
  id: string;
  plate: string;
  description: string;
  date: Date;
  severity: 'Baja' | 'Media' | 'Alta';
}

export interface VehicleLog {
  id: string;
  roomId: string;
  plate: string;
  brand: string;
  model: string;
  color: string;
  entryType: 'Auto' | 'Moto';
  entryTime: Date;
  exitTime?: Date;
}
