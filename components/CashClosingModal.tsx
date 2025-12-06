
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Lock, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';

interface CashClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (declaredAmount: number, notes: string) => void;
  systemExpected: number;
  initialAmount: number;
  shiftName: string;
}

export const CashClosingModal: React.FC<CashClosingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  systemExpected, 
  initialAmount,
  shiftName
}) => {
  const [declaredAmount, setDeclaredAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [difference, setDifference] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeclaredAmount('');
      setNotes('');
      setDifference(null);
    }
  }, [isOpen]);

  // Calculate difference in real-time
  useEffect(() => {
    const val = parseFloat(declaredAmount);
    if (!isNaN(val)) {
      setDifference(val - (systemExpected + initialAmount));
    } else {
      setDifference(null);
    }
  }, [declaredAmount, systemExpected, initialAmount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(declaredAmount);
    if (!isNaN(val)) {
      onConfirm(val, notes);
    }
  };

  const totalExpected = systemExpected + initialAmount;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col md:flex-row">
        
        {/* Left Panel: System Info */}
        <div className="w-full md:w-1/2 bg-slate-50 border-r border-slate-100 p-8 flex flex-col justify-center space-y-6">
           <div className="flex items-center gap-2 text-slate-500 mb-2">
             <Lock className="w-5 h-5" />
             <span className="font-bold text-sm uppercase tracking-wider">Cierre de Caja</span>
           </div>
           
           <h2 className="text-3xl font-bold text-slate-800 mb-6">{shiftName}</h2>
           
           <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500">Fondo Inicial</span>
               <span className="font-mono font-bold text-slate-700">${initialAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500">Ventas/Ingresos (Neto)</span>
               <span className="font-mono font-bold text-green-600">+${systemExpected.toFixed(2)}</span>
             </div>
             <div className="h-px bg-slate-200 my-2"></div>
             <div className="flex justify-between items-center text-lg">
               <span className="font-bold text-slate-700">Total Esperado</span>
               <span className="font-mono font-bold text-blue-600">${totalExpected.toFixed(2)}</span>
             </div>
           </div>

           <div className="mt-8 bg-blue-50 p-4 rounded-xl text-xs text-blue-700 leading-relaxed border border-blue-100">
             <p className="font-bold mb-1">Nota Importante:</p>
             El "Total Esperado" es la suma del fondo inicial más todas las ventas registradas en el sistema, menos los gastos registrados.
           </div>
        </div>

        {/* Right Panel: User Input */}
        <div className="w-full md:w-1/2 p-8">
           <div className="flex justify-end mb-4">
             <button onClick={onClose} className="text-slate-400 hover:text-rose-500">
               <X className="w-6 h-6" />
             </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                   <Calculator className="w-4 h-4" /> Efectivo Contado (Real)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input 
                    type="number" 
                    value={declaredAmount}
                    onChange={(e) => setDeclaredAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.50"
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold text-slate-800 transition"
                    required
                  />
                </div>
              </div>

              {/* Difference Indicator */}
              {difference !== null && (
                <div className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                  Math.abs(difference) < 1 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : difference > 0
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                   {Math.abs(difference) < 1 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                   <div>
                     <p className="font-bold text-sm uppercase">
                       {Math.abs(difference) < 1 ? 'Caja Cuadrada' : difference > 0 ? 'Sobrante' : 'Faltante'}
                     </p>
                     <p className="text-lg font-mono font-bold">
                       {difference > 0 ? '+' : ''}{difference.toFixed(2)}
                     </p>
                   </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500">Notas / Observaciones</label>
                <textarea 
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Justifique cualquier diferencia..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:scale-[1.02] transition"
              >
                Cerrar Turno
              </button>
           </form>
        </div>

      </div>
    </div>
  );
};
