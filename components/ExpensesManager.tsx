
import React, { useState } from 'react';
import { Expense } from '../types';
import { PlusCircle, TrendingDown, Trash2, DollarSign, Wallet, Calendar } from 'lucide-react';
import { PasswordModal } from './PasswordModal';

interface ExpensesManagerProps {
  expenses: Expense[];
  onAddExpense: (description: string, amount: number) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Password Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(null);

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    onAddExpense(description, parseFloat(amount));
    setDescription('');
    setAmount('');
  };

  const handleDeleteClick = (id: string) => {
    setExpenseIdToDelete(id);
    setIsAuthModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseIdToDelete) {
      onDeleteExpense(expenseIdToDelete);
      setExpenseIdToDelete(null);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold text-rose-500 tracking-tight flex items-center gap-2">
             <TrendingDown className="w-8 h-8" />
             Gestión de Gastos
          </h2>
          <p className="text-slate-400">Registro de salidas de efectivo y compras del turno.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Registrar Nuevo Gasto
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Descripción del Gasto</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Compra de insumos, Taxi, Reparación..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400">Monto (MXN)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ej: 50.00"
                    min="0"
                    step="0.50"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 hover:bg-rose-700 hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Agregar Gasto
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: List & Summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Card */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="bg-rose-500/20 p-4 rounded-full text-rose-500">
                 <Wallet className="w-8 h-8" />
               </div>
               <div>
                 <p className="text-slate-400 font-medium">Total Gastos Turno Actual</p>
                 <p className="text-3xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
               </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg overflow-hidden min-h-[400px]">
            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
               <h3 className="font-bold text-white text-lg">Historial de Gastos</h3>
            </div>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                 <Wallet className="w-12 h-12 mb-3 opacity-20" />
                 <p>No se han registrado gastos en este turno.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {expenses.map(expense => (
                  <div key={expense.id} className="p-5 hover:bg-slate-700/50 transition flex items-center justify-between group">
                    <div className="flex items-start gap-4">
                       <div className="mt-1 bg-slate-700 p-2 rounded-lg text-slate-300">
                         <TrendingDown className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-white text-lg">{expense.description}</p>
                         <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{expense.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span>•</span>
                            <span>{expense.date.toLocaleDateString()}</span>
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-xl font-bold text-rose-400">
                        -${expense.amount.toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleDeleteClick(expense.id)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Eliminar Gasto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <PasswordModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirm={handleConfirmDelete}
        requiredPassword="gastosj5s82QSM"
        title="Eliminar Gasto"
        message="Esta acción es irreversible. Ingrese contraseña para confirmar."
      />
    </div>
  );
};
