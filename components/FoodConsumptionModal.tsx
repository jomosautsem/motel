import React, { useState, useMemo } from 'react';
import { X, Search, ShoppingCart, Plus, Minus, Trash2, Coffee, Utensils, Box, Check } from 'lucide-react';
import { Room, Product, ConsumptionItem } from '../types';

interface FoodConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  occupiedRooms: Room[];
  products: Product[];
  onConfirm: (roomId: string, items: ConsumptionItem[]) => void;
}

type CategoryTab = 'Bebidas' | 'Comidas' | 'Otros';

export const FoodConsumptionModal: React.FC<FoodConsumptionModalProps> = ({ 
  isOpen, 
  onClose, 
  occupiedRooms, 
  products, 
  onConfirm 
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<ConsumptionItem[]>([]);
  const [activeTab, setActiveTab] = useState<CategoryTab>('Bebidas');
  
  // Local state for quantity inputs on product list rows (productId -> quantity)
  const [rowQuantities, setRowQuantities] = useState<Record<string, number>>({});
  
  // State for immediate feedback on specific product rows (productId set)
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Reset state when opening
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRoomId('');
      setSearchTerm('');
      setCart([]);
      setActiveTab('Bebidas');
      setRowQuantities({});
      setJustAddedId(null);
    }
  }, [isOpen]);

  const getRowQuantity = (productId: string) => rowQuantities[productId] || 1;
  
  const setRowQuantity = (productId: string, val: number) => {
    setRowQuantities(prev => ({ ...prev, [productId]: Math.max(1, val) }));
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by Tab
    if (activeTab === 'Bebidas') {
      filtered = products.filter(p => p.category === 'Bebida');
    } else if (activeTab === 'Comidas') {
      filtered = products.filter(p => p.category === 'Cocina' || p.category === 'Snack');
    } else if (activeTab === 'Otros') {
      filtered = products.filter(p => p.category === 'Otro');
    }

    // Filter by Search
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  }, [products, activeTab, searchTerm]);

  const addToCart = (product: Product) => {
    const qtyToAdd = getRowQuantity(product.id);
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + qtyToAdd, total: (item.quantity + qtyToAdd) * item.unitPrice }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: qtyToAdd,
        unitPrice: product.price,
        total: product.price * qtyToAdd
      }];
    });

    // Reset row quantity after adding and show feedback
    setRowQuantity(product.id, 1);
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1000);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty, total: newQty * item.unitPrice };
        }
        return item;
      }));
  }

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = () => {
    if (!selectedRoomId) {
        alert("Por favor selecciona una habitación primero.");
        return;
    }
    if (cart.length === 0) return;
    onConfirm(selectedRoomId, cart);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-white font-sans">
      <div className="bg-[#0f172a] rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col border border-slate-700/50">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-start bg-[#0f172a] shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Registrar Consumo</h2>
            <p className="text-sm text-slate-400 mt-1">Selecciona habitación y productos</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          
          {/* LEFT: Product Selection (Main Area) */}
          <div className="flex-1 flex flex-col border-r border-slate-800 bg-[#0f172a] relative">
            
            <div className="p-6 space-y-6">
                {/* Room Selector */}
                <div className="space-y-2">
                    <select 
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className={`w-full p-4 rounded-xl border bg-slate-800/50 text-white font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none appearance-none cursor-pointer hover:bg-slate-800 transition ${!selectedRoomId && cart.length > 0 ? 'border-rose-500 animate-pulse' : 'border-slate-700'}`}
                    >
                        <option value="" className="text-slate-400">-- Elige una habitación --</option>
                        {occupiedRooms.map(room => (
                        <option key={room.id} value={room.id}>
                            Habitación {room.id} - {room.clientName || 'Ocupada'}
                        </option>
                        ))}
                    </select>
                </div>

                {/* Step Indicator & Tabs */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold text-white">2</div>
                        <span className="text-white font-medium">Seleccionar Productos</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setActiveTab('Bebidas')}
                            className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                                activeTab === 'Bebidas' 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Coffee className="w-4 h-4" /> Bebidas
                        </button>
                        <button 
                            onClick={() => setActiveTab('Comidas')}
                            className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                                activeTab === 'Comidas' 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Utensils className="w-4 h-4" /> Comidas
                        </button>
                        <button 
                            onClick={() => setActiveTab('Otros')}
                            className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
                                activeTab === 'Otros' 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <Box className="w-4 h-4" /> Otros
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder={`Buscar en ${activeTab.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-slate-900 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none text-slate-200 placeholder-slate-600 transition"
                    />
                </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                <div className="mb-2 flex items-center gap-2 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                     <span className="capitalize">{activeTab}</span>
                     <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md text-xs">{filteredProducts.length}</span>
                </div>
                
                <div className="space-y-3">
                    {filteredProducts.map(product => {
                        const qty = getRowQuantity(product.id);
                        const rowTotal = qty * product.price;
                        const isAdded = justAddedId === product.id;

                        return (
                            <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition group">
                                <div className="mb-3 sm:mb-0">
                                    <h4 className="font-bold text-slate-200 text-lg">{product.name}</h4>
                                    <p className="text-green-400 font-bold font-mono text-sm">${product.price}</p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Subtotal Display (Dynamic) */}
                                    {qty > 1 && (
                                        <div className="hidden sm:block mr-2 animate-fade-in text-right">
                                            <p className="text-[10px] text-slate-400 uppercase">Total</p>
                                            <p className="text-green-400 font-bold font-mono">${rowTotal}</p>
                                        </div>
                                    )}

                                    {/* Quantity Control */}
                                    <div className="flex items-center bg-[#0f172a] rounded-lg border border-slate-700 p-1">
                                        <button 
                                            onClick={() => setRowQuantity(product.id, qty - 1)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-10 text-center font-bold text-white">{qty}</span>
                                        <button 
                                            onClick={() => setRowQuantity(product.id, qty + 1)}
                                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Add Button */}
                                    <button 
                                        onClick={() => addToCart(product)}
                                        className={`px-4 py-2 font-semibold rounded-lg shadow-lg transition active:scale-95 flex items-center gap-2 min-w-[100px] justify-center ${
                                            isAdded 
                                            ? 'bg-white text-green-600 shadow-white/10' 
                                            : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
                                        }`}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check className="w-4 h-4" /> Agregado
                                            </>
                                        ) : 'Agregar'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-10 text-slate-600 italic">
                            No se encontraron productos en esta categoría.
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* RIGHT: Cart Summary (Sidebar Style) */}
          <div className="w-full lg:w-[380px] flex flex-col bg-slate-800 border-l border-slate-700 z-20 shadow-2xl">
            
            <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-rose-500" />
                    Resumen del Pedido
                </h3>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800">
               {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
                   <div className="bg-slate-700/50 p-4 rounded-full mb-3">
                     <ShoppingCart className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-medium">Carrito vacío</p>
                 </div>
               ) : (
                 cart.map(item => (
                   <div key={item.productId} className="flex justify-between items-center p-3 bg-[#0f172a] border border-slate-700 rounded-xl group hover:border-slate-500 transition">
                     <div className="flex-1">
                       <p className="font-bold text-slate-200 text-sm">{item.productName}</p>
                       <p className="text-xs text-slate-500 font-mono">${item.unitPrice} c/u</p>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg">
                            <button onClick={() => updateCartQuantity(item.productId, -1)} className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded">
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.productId, 1)} className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                       <div className="text-right min-w-[60px]">
                           <p className="font-bold text-green-400 text-sm">${item.total}</p>
                           <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-rose-500 hover:underline mt-0.5">Eliminar</button>
                       </div>
                     </div>
                   </div>
                 ))
               )}
            </div>

            {/* Totals & Actions */}
            <div className="p-6 border-t border-slate-700 bg-slate-900">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-slate-400 font-medium">Total a Pagar</span>
                 <span className="text-4xl font-bold text-white font-mono">${cartTotal.toFixed(2)}</span>
               </div>
               
               <div className="flex flex-col gap-3">
                 <button 
                   onClick={handleSubmit}
                   disabled={cart.length === 0}
                   className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 hover:scale-[1.02] hover:shadow-rose-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-lg"
                 >
                   Confirmar Pedido
                 </button>
                 <button onClick={onClose} className="w-full py-3 text-slate-500 font-medium hover:text-white transition">
                   Cancelar
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}