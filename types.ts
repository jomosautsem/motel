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