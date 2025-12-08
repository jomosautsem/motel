
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
  initialData?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Alimentos'); // 'Alimentos' | 'Bebidas' | 'Otros'
  const [category, setCategory] = useState<Product['category']>('Cocina');

  // Reset or Fill form when opening
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Editing Mode
        setName(initialData.name);
        setPrice(initialData.price.toString());
        
        // Determine Type based on Category
        if (initialData.category === 'Bebida') {
            setType('Bebidas');
        } else if (initialData.category === 'Otro') {
            setType('Otros');
        } else {
            setType('Alimentos');
        }
        setCategory(initialData.category);
      } else {
        // Create Mode
        setName('');
        setPrice('');
        setType('Alimentos');
        setCategory('Cocina');
      }
    }
  }, [isOpen, initialData]);

  // Update available categories when Type changes (only if user interacts)
  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === 'Alimentos') setCategory('Cocina');
    else if (newType === 'Bebidas') setCategory('Bebida');
    else if (newType === 'Otros') setCategory('Otro');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    onSave({
      name,
      price: parseFloat(price),
      category,
      stock: initialData ? initialData.stock : 50 // Preserve stock if editing
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nombre del Producto</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Hamburguesa Doble, Whisky..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-slate-50 focus:bg-white transition"
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Precio</label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.50"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-slate-50 focus:bg-white transition"
                required
              />
            </div>

            {/* Type Selector (UI Logic) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tipo de Producto</label>
              <select 
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white cursor-pointer"
              >
                <option value="Alimentos">Alimentos (Comidas/Snacks)</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Otros">Otros (Farmacia/Kits)</option>
              </select>
            </div>

            {/* Category Selector (Data Logic) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Categoría</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none bg-white cursor-pointer"
              >
                {type === 'Alimentos' && (
                  <>
                    <option value="Cocina">Cocina (Platillos preparados)</option>
                    <option value="Snack">Snack (Papas, dulces)</option>
                  </>
                )}
                {type === 'Bebidas' && (
                  <option value="Bebida">Bebida</option>
                )}
                {type === 'Otros' && (
                  <option value="Otro">Otro</option>
                )}
              </select>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-white transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="productForm"
            className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Guardar
          </button>
        </div>

      </div>
    </div>
  );
};
