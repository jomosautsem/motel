
import React, { useState, useMemo } from 'react';
import { RoomHistoryEntry, Consumption, Expense, VehicleLog } from '../types';
import { Calendar, FileText, Download, Filter, Search, AlertCircle } from 'lucide-react';

interface ShiftHistoryManagerProps {
  roomHistory: RoomHistoryEntry[];
  consumptions: Consumption[];
  expenses: Expense[];
  vehicleHistory: VehicleLog[];
}

export const ShiftHistoryManager: React.FC<ShiftHistoryManagerProps> = ({
  roomHistory,
  consumptions,
  expenses,
  vehicleHistory
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'Matutino' | 'Vespertino' | 'Nocturno'>('Matutino');

  // Helper to define shift times
  const getShiftRange = (dateStr: string, shift: string) => {
    const start = new Date(dateStr);
    const end = new Date(dateStr);

    if (shift === 'Matutino') {
      start.setHours(7, 0, 0, 0);
      end.setHours(13, 59, 59, 999);
    } else if (shift === 'Vespertino') {
      start.setHours(14, 0, 0, 0);
      end.setHours(20, 59, 59, 999);
    } else {
      // Nocturno starts at 21:00 on Day X and ends at 07:00 on Day X+1
      start.setHours(21, 0, 0, 0);
      end.setDate(end.getDate() + 1);
      end.setHours(6, 59, 59, 999);
    }
    return { start, end };
  };

  // Helper to calculate duration string
  const getDurationString = (start: Date, end: Date) => {
    if (!start || !end) return '-';
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Logic to infer Paid Hours from Price
  const getPaidHours = (price: number) => {
    // 2hr $220, 4hr $280, 5hr $300, 8hr $330, 12hr $480
    // We assume standard rates. Extra people or penalties might skew this slightly, 
    // but it serves as a good baseline for auditing.
    if (price <= 240) return 2;
    if (price <= 290) return 4;
    if (price <= 315) return 5;
    if (price <= 350) return 8;
    return 12; // Assuming 12h for anything higher unless it's huge
  };

  // Filter Data
  const { filteredRooms, filteredConsumptions, filteredExpenses, filteredVehicles, totals } = useMemo(() => {
    const { start, end } = getShiftRange(selectedDate, selectedShift);

    // 1. Room History (Completed Rents)
    // FIX: Filter by checkInTime (when the sale was made) not createdAt (release time)
    const fRooms = roomHistory.filter(h => h.checkInTime >= start && h.checkInTime <= end);

    // 2. Consumptions (Sales)
    const fCons = consumptions.filter(c => c.timestamp >= start && c.timestamp <= end);

    // 3. Expenses
    const fExp = expenses.filter(e => e.date >= start && e.date <= end);

    // 4. Vehicles
    const fVeh = vehicleHistory.filter(v => v.entryTime >= start && v.entryTime <= end);

    // Totals
    const totalRoomRevenue = fRooms.reduce((acc, r) => acc + r.totalPrice, 0);
    const totalConsRevenue = fCons.reduce((acc, c) => acc + c.totalAmount, 0);
    const totalExpensesAmt = fExp.reduce((acc, e) => acc + e.amount, 0);
    const netIncome = (totalRoomRevenue + totalConsRevenue) - totalExpensesAmt;

    return {
      filteredRooms: fRooms,
      filteredConsumptions: fCons,
      filteredExpenses: fExp,
      filteredVehicles: fVeh,
      totals: { totalRoomRevenue, totalConsRevenue, totalExpensesAmt, netIncome }
    };
  }, [selectedDate, selectedShift, roomHistory, consumptions, expenses, vehicleHistory]);


  const generatePDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const dateStr = new Date(selectedDate).toLocaleDateString();

    // -- Header --
    doc.setFillColor(225, 29, 72); // Rose 600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Motel las Bolas", 105, 15, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Reporte de Turno: ${selectedShift}`, 105, 25, { align: "center" });
    doc.text(`Fecha: ${dateStr}`, 105, 33, { align: "center" });

    let yPos = 50;

    // -- Financial Summary --
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Financiero", 14, yPos);
    yPos += 8;

    const summaryData = [
      ['Concepto', 'Monto'],
      ['Renta de Habitaciones', `$${totals.totalRoomRevenue.toFixed(2)}`],
      ['Venta de Productos/Consumos', `$${totals.totalConsRevenue.toFixed(2)}`],
      ['Gastos Operativos', `-$${totals.totalExpensesAmt.toFixed(2)}`],
      ['UTILIDAD NETA DEL TURNO', `$${totals.netIncome.toFixed(2)}`]
    ];

    (doc as any).autoTable({
      startY: yPos,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }, // Slate 800
      footStyles: { fillColor: [30, 41, 59] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // -- Room History Table --
    doc.text("Detalle de Habitaciones (Auditoría de Tiempo)", 14, yPos);
    yPos += 5;

    const roomRows = filteredRooms.map(r => {
        const paidHours = getPaidHours(r.totalPrice);
        const actualMs = r.checkOutTime.getTime() - r.checkInTime.getTime();
        const actualHours = actualMs / (1000 * 60 * 60);
        
        const excessMinutes = Math.floor((actualHours - paidHours) * 60);
        const excessStr = excessMinutes > 15 ? `+${Math.floor(excessMinutes/60)}h ${excessMinutes%60}m` : '-';

        return [
          `Hab ${r.roomId}`,
          r.checkInTime ? r.checkInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
          r.checkOutTime ? r.checkOutTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
          getDurationString(r.checkInTime, r.checkOutTime),
          `$${r.totalPrice.toFixed(2)}`,
          excessStr // New Column
        ];
    });

    (doc as any).autoTable({
      startY: yPos,
      head: [['Habitación', 'Entrada', 'Salida', 'Tiempo Real', 'Pagado', 'Exceso']],
      body: roomRows.length > 0 ? roomRows : [['-', '-', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] }, // Slate 600
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // -- Expenses Table --
    doc.text("Detalle de Gastos", 14, yPos);
    yPos += 5;

    const expenseRows = filteredExpenses.map(e => [
      e.description,
      e.date.toLocaleTimeString(),
      `$${e.amount.toFixed(2)}`
    ]);

    (doc as any).autoTable({
      startY: yPos,
      head: [['Descripción', 'Hora', 'Monto']],
      body: expenseRows.length > 0 ? expenseRows : [['Sin gastos', '-', '$0.00']],
      theme: 'striped',
      headStyles: { fillColor: [225, 29, 72] }, // Rose 600
    });
    
    // Add page if needed
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    } else {
        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // -- Vehicles Table --
    doc.text("Registro de Vehículos", 14, yPos);
    yPos += 5;

    const vehicleRows = filteredVehicles.map(v => [
        `Hab ${v.roomId}`,
        v.entryType,
        v.plate || 'S/P',
        v.brand || '-',
        v.entryTime.toLocaleTimeString()
    ]);

    (doc as any).autoTable({
        startY: yPos,
        head: [['Hab', 'Tipo', 'Placa', 'Marca', 'Entrada']],
        body: vehicleRows.length > 0 ? vehicleRows : [['-', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Blue 600
    });

    // Save
    doc.save(`Reporte_${selectedShift}_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="animate-fade-in space-y-8 min-h-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="w-8 h-8 text-rose-500" />
            Historial de Turnos
          </h2>
          <p className="text-slate-400">Consulte movimientos y descargue reportes detallados (Últimos 15 días).</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-end">
        
        <div className="w-full md:w-auto">
           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
             <Calendar className="w-4 h-4" /> Seleccionar Fecha
           </label>
           <input 
             type="date" 
             value={selectedDate}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="w-full md:w-64 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 font-medium"
           />
        </div>

        <div className="w-full md:w-auto">
           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
             <Filter className="w-4 h-4" /> Seleccionar Turno
           </label>
           <select 
             value={selectedShift}
             onChange={(e) => setSelectedShift(e.target.value as any)}
             className="w-full md:w-64 px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 outline-none bg-slate-50 font-medium cursor-pointer"
           >
             <option value="Matutino">Matutino (07:00 - 14:00)</option>
             <option value="Vespertino">Vespertino (14:00 - 21:00)</option>
             <option value="Nocturno">Nocturno (21:00 - 07:00)</option>
           </select>
        </div>

        <div className="w-full md:w-auto md:ml-auto">
           <button 
             onClick={generatePDF}
             className="w-full md:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-900/20 transition flex items-center justify-center gap-2"
           >
             <Download className="w-5 h-5" />
             Descargar Reporte PDF
           </button>
        </div>

      </div>

      {/* Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Financial Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
             <FileText className="w-5 h-5 text-blue-500" /> Vista Previa: Finanzas
           </h3>
           <div className="space-y-3">
             <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Habitaciones Liberadas</span>
                <span className="font-bold text-slate-800">{filteredRooms.length}</span>
             </div>
             <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">Ingresos Rentas</span>
                <span className="font-bold text-green-700">${totals.totalRoomRevenue.toFixed(2)}</span>
             </div>
             <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-700 font-medium">Ventas / Consumos</span>
                <span className="font-bold text-purple-700">${totals.totalConsRevenue.toFixed(2)}</span>
             </div>
             <div className="flex justify-between p-3 bg-rose-50 rounded-lg border border-rose-100">
                <span className="text-rose-700 font-medium">Gastos Operativos</span>
                <span className="font-bold text-rose-700">-${totals.totalExpensesAmt.toFixed(2)}</span>
             </div>
             <div className="border-t border-slate-200 pt-3 mt-2 flex justify-between items-center">
                <span className="font-bold text-slate-800 uppercase text-sm">Utilidad Neta</span>
                <span className="font-mono text-2xl font-bold text-slate-900">${totals.netIncome.toFixed(2)}</span>
             </div>
           </div>
        </div>

        {/* Activity Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
             <Search className="w-5 h-5 text-orange-500" /> Actividad Registrada
           </h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              {filteredRooms.length === 0 && filteredExpenses.length === 0 && filteredConsumptions.length === 0 ? (
                 <p className="text-center text-slate-400 py-10 italic">No hay movimientos registrados para este turno.</p>
              ) : (
                <>
                  {filteredRooms.map(r => {
                     const paidHours = getPaidHours(r.totalPrice);
                     const actualMs = r.checkOutTime.getTime() - r.checkInTime.getTime();
                     const actualHours = actualMs / (1000 * 60 * 60);
                     const excessMinutes = Math.floor((actualHours - paidHours) * 60);
                     const hasExcess = excessMinutes > 15;

                     return (
                        <div key={r.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                            <div>
                              <span className="text-slate-600 block">Habitación {r.roomId} (Salida)</span>
                              <div className="flex gap-2 text-xs">
                                <span className="text-slate-400">{getDurationString(r.checkInTime, r.checkOutTime)}</span>
                                {hasExcess && (
                                    <span className="text-rose-500 font-bold flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Exceso +{Math.floor(excessMinutes)}m
                                    </span>
                                )}
                              </div>
                            </div>
                            <span className="font-bold text-slate-800">+ ${r.totalPrice}</span>
                        </div>
                     );
                  })}
                  {filteredExpenses.map(e => (
                     <div key={e.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-rose-600">{e.description}</span>
                        <span className="font-bold text-rose-600">- ${e.amount}</span>
                     </div>
                  ))}
                </>
              )}
           </div>
        </div>

      </div>

    </div>
  );
};
