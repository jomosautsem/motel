import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, ShoppingCart, Plus, Minus, Check, User, Edit2 } from 'lucide-react';
import { Employee, Product, ConsumptionItem } from '../types';

interface EmployeeConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  products: Product[];
  onConfirm: (employeeId: string, items: ConsumptionItem[]) => void;
  preSelectedEmployeeId?: string;
}

export const EmployeeConsumptionModal: React.FC<EmployeeConsumptionModalProps> = ({ 
  isOpen, 
  onClose, 
  employees, 
  products, 
  onConfirm,
  preSelectedEmployeeId
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<ConsumptionItem[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeId(preSelectedEmployeeId || '');
      setSearchTerm('');
      setCart([]);
    }
  }, [isOpen, preSelectedEmployeeId]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, total: newQty * item.unitPrice };
      }
      return item;
    }));
  };

  const updatePrice = (productId: string, newPrice: string) => {
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue < 0) return;

    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, unitPrice: priceValue, total: item.quantity * priceValue };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = () => {
    if (selectedEmployeeId && cart.length > 0) {
      onConfirm(selectedEmployeeId, cart);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registrar Consumo de Empleado</h2>
            <p className="text-sm text-slate-500">Se descontará vía nómina o registro interno.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Left: Product Selection */}
          <div className="flex-1 flex flex-col border-r border-slate-100 bg-slate-50">
            <div className="p-4 space-y-4">
               {/* Employee Selector */}
               <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Empleado</label>
                 <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                   <select 
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      // Remove disabled prop to allow changing employee
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-white"
                   >
                     <option value="">-- Seleccionar --</option>
                     {employees.map(emp => (
                       <option key={emp.id} value={emp.id}>{emp.name}</option>
                     ))}
                   </select>
                 </div>
               </div>

               {/* Search */}
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                 <input 
                   type="text"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Buscar producto..."
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-white shadow-sm"
                 />
               </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2 custom-scrollbar">
              {filteredProducts.map(product => {
                const inCart = cart.find(c => c.productId === product.id);
                return (
                  <div key={product.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center hover:shadow-md transition">
                    <div>
                      <p className="font-semibold text-slate-800">{product.name}</p>
                      <p className="text-xs font-bold text-green-600">${product.price}</p>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-white rounded"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-white rounded"><Plus className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Cart Summary */}
          <div className="w-[340px] bg-white flex flex-col z-10 shadow-xl">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <ShoppingCart className="w-4 h-4" /> Resumen y Precios
               </h3>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {cart.length === 0 ? (
                 <div className="text-center text-slate-400 text-sm py-10">
                   Carrito vacío
                 </div>
               ) : (
                 cart.map(item => (
                   <div key={item.productId} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                     <div className="flex justify-between items-start text-sm">
                       <div className="flex-1">
                         <p className="text-slate-800 font-medium">{item.productName}</p>
                         <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                           <span>Cant: {item.quantity}</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-slate-800">${item.total.toFixed(2)}</p>
                         <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-rose-500 hover:underline">Eliminar</button>
                       </div>
                     </div>
                     
                     {/* Custom Price Input */}
                     <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Precio Unitario:</label>
                        <div className="flex-1 relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.50"
                            value={item.unitPrice}
                            onChange={(e) => updatePrice(item.productId, e.target.value)}
                            className="w-full pl-5 pr-2 py-1 text-xs border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-700"
                          />
                        </div>
                     </div>
                   </div>
                 ))
               )}
             </div>

             <div className="p-4 border-t border-slate-100 bg-slate-50">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-slate-500 font-medium">Total a Cargo</span>
                 <span className="text-2xl font-bold text-slate-800">${totalAmount.toFixed(2)}</span>
               </div>
               <button 
                 onClick={handleSubmit}
                 disabled={!selectedEmployeeId || cart.length === 0}
                 className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
               >
                 Confirmar Cargo
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};