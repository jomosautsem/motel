
import React, { useState } from 'react';
import { Users, ShoppingCart, DollarSign, Plus, Edit, Trash2, Search, TrendingUp, UserPlus, FileText } from 'lucide-react';
import { Employee, Consumption } from '../types';
import { EmployeeModal } from './EmployeeModal';
import { EmployeeConsumptionModal } from './EmployeeConsumptionModal';

interface EmployeesManagerProps {
  employees: Employee[];
  consumptions: Consumption[];
  onAddEmployee: (data: any) => void;
  onEditEmployee: (id: string, data: any) => void;
  onDeleteEmployee: (id: string) => void;
  onAddConsumption: (employeeId: string, items: any[]) => void;
  products: any[];
}

export const EmployeesManager: React.FC<EmployeesManagerProps> = ({ 
  employees, 
  consumptions, 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee,
  onAddConsumption,
  products
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Consumption Modal State
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [selectedEmployeeForConsumption, setSelectedEmployeeForConsumption] = useState<string | undefined>(undefined);

  // Filter employees
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats Logic
  const totalEmployees = employees.length;
  // Filter consumptions that have an employeeId (are not room consumptions)
  const employeeConsumptions = consumptions.filter(c => c.employeeId);
  const totalRecords = employeeConsumptions.length;
  const currentTurnConsumption = employeeConsumptions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const generalTotal = currentTurnConsumption; // In a real app, this might span more time

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleOpenConsumption = (employeeId?: string) => {
    setSelectedEmployeeForConsumption(employeeId);
    setIsConsumptionModalOpen(true);
  };

  const handleSaveEmployee = (data: any) => {
    if (editingEmployee) {
      onEditEmployee(editingEmployee.id, data);
    } else {
      onAddEmployee(data);
    }
  };

  const getEmployeeConsumptionTotal = (id: string) => {
    return employeeConsumptions
      .filter(c => c.employeeId === id)
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
  };

  return (
    <div className="animate-fade-in space-y-6 min-h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold text-blue-500 tracking-tight">Gestión de Empleados</h2>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Empleado
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-medium text-xs uppercase">Total Empleados</p>
               <p className="text-3xl font-bold text-blue-600 mt-1">{totalEmployees}</p>
             </div>
             <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
               <Users className="w-6 h-6" />
             </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-medium text-xs uppercase">Consumos Registrados</p>
               <p className="text-3xl font-bold text-purple-600 mt-1">{totalRecords}</p>
             </div>
             <div className="bg-purple-50 p-3 rounded-xl text-purple-500">
               <ShoppingCart className="w-6 h-6" />
             </div>
           </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-slate-500 font-medium text-xs uppercase">Total Consumos Turno</p>
               <p className="text-3xl font-bold text-green-600 mt-1">${currentTurnConsumption}</p>
             </div>
             <div className="bg-green-50 p-3 rounded-xl text-green-500">
               <DollarSign className="w-6 h-6" />
             </div>
           </div>
        </div>

        <div className="bg-orange-50 rounded-2xl p-6 shadow-sm border border-orange-100">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-orange-600 font-medium text-xs uppercase">Total General Consumos</p>
               <p className="text-3xl font-bold text-orange-700 mt-1">${generalTotal}</p>
               <p className="text-[10px] text-orange-500 font-semibold mt-1">Todos los empleados</p>
             </div>
             <div className="bg-white p-3 rounded-xl text-orange-500 shadow-sm">
               <TrendingUp className="w-6 h-6" />
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Employee List */}
        <div className="lg:col-span-2 space-y-4">
           
           {/* Search Bar */}
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Buscar empleado por nombre..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
             />
           </div>

           {/* List */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
             {filteredEmployees.length === 0 ? (
               <div className="p-8 text-center text-slate-400">
                 No se encontraron empleados.
               </div>
             ) : (
               <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                 {filteredEmployees.map(emp => {
                   const totalConsumed = getEmployeeConsumptionTotal(emp.id);
                   const recordCount = employeeConsumptions.filter(c => c.employeeId === emp.id).length;
                   
                   return (
                     <div key={emp.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            emp.role === 'Recamarera' ? 'bg-pink-500' : 
                            emp.role === 'Recepcionista' ? 'bg-indigo-500' : 'bg-slate-500'
                          }`}>
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{emp.name}</h4>
                            <p className="text-xs text-slate-500">{emp.role}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                emp.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {emp.status}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Ingreso: {new Date(emp.joinedDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between sm:justify-end gap-6">
                          <div className="text-right">
                             <p className="font-bold text-green-600">${totalConsumed}</p>
                             <p className="text-xs text-slate-400">{recordCount} registros</p>
                          </div>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => handleOpenConsumption(emp.id)}
                               className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:scale-105 transition shadow-sm"
                               title="Agregar Consumo"
                             >
                               <Plus className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleOpenEdit(emp)}
                               className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-white hover:border-slate-300 border border-transparent transition"
                               title="Editar"
                             >
                               <Edit className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => onDeleteEmployee(emp.id)}
                               className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                               title="Eliminar"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             )}
           </div>
        </div>

        {/* Right Column: Consumption Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
           <div className="flex items-center gap-2 mb-4 text-slate-800">
             <BoxIcon />
             <h3 className="font-bold">Consumos del Turno Actual</h3>
           </div>
           <p className="text-xs text-slate-400 mb-4">Turno: Turno Vespertino ({new Date().toLocaleDateString()})</p>
           
           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
             {employeeConsumptions.length === 0 ? (
               <div className="text-center py-8 text-slate-400 text-sm">
                 No hay consumos registrados en este turno.
               </div>
             ) : (
               employeeConsumptions.map(consumption => {
                 const employee = employees.find(e => e.id === consumption.employeeId);
                 return (
                   <div key={consumption.id} className="relative pl-4 pb-4 border-l border-slate-200 last:pb-0">
                     <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white ring-1 ring-slate-100"></div>
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                       <div className="flex justify-between items-start mb-1">
                         <span className="font-bold text-slate-700 text-sm">{employee?.name || 'Desconocido'}</span>
                         <span className="text-xs font-mono text-slate-400">{consumption.timestamp.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       </div>
                       <p className="text-xs text-slate-500 mb-2">
                         {consumption.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                       </p>
                       <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                         <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Nómina</span>
                         <span className="font-bold text-green-600 text-sm">${consumption.totalAmount}</span>
                       </div>
                     </div>
                   </div>
                 );
               })
             )}
           </div>
        </div>

      </div>

      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEmployee}
        initialData={editingEmployee}
      />

      <EmployeeConsumptionModal 
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        employees={employees}
        products={products}
        onConfirm={onAddConsumption}
        preSelectedEmployeeId={selectedEmployeeForConsumption}
      />
    </div>
  );
};

// Helper Icon
const BoxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);
