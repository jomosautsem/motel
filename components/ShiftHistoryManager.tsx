
import React, { useState, useMemo } from 'react';
import { RoomHistoryEntry, Consumption, Expense, VehicleLog, Room, RoomStatus, Employee } from '../types';
import { Calendar, FileText, Download, Filter, Search, AlertCircle, History, PlayCircle, ShoppingBag } from 'lucide-react';

interface ShiftHistoryManagerProps {
  roomHistory: RoomHistoryEntry[];
  consumptions: Consumption[];
  expenses: Expense[];
  vehicleHistory: VehicleLog[];
  rooms: Room[];
  employees: Employee[]; // Added to resolve employee names in logs
}

export const ShiftHistoryManager: React.FC<ShiftHistoryManagerProps> = ({
  roomHistory,
  consumptions,
  expenses,
  vehicleHistory,
  rooms,
  employees
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
  const getDurationString = (start?: Date, end?: Date) => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '-'; // Invalid range
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Logic to infer Paid Hours from Price
  const getPaidHours = (price: number) => {
    if (price <= 240) return 2;
    if (price <= 290) return 4;
    if (price <= 315) return 5;
    if (price <= 350) return 8;
    return 12;
  };

  // Filter Data
  const { filteredRooms, filteredConsumptions, filteredExpenses, filteredVehicles, activeRoomsInShift, totals, soldItems } = useMemo(() => {
    const { start, end } = getShiftRange(selectedDate, selectedShift);

    // 1. Room History
    const fRooms = roomHistory.filter(h => {
        if (!h.checkInTime) return false;
        return h.checkInTime >= start && h.checkInTime <= end;
    });

    // 2. Active Rooms
    const activeRooms = rooms.filter(r => {
        if (r.status !== RoomStatus.OCCUPIED || !r.checkInTime) return false;
        if (isNaN(new Date(r.checkInTime).getTime())) return false;
        return r.checkInTime >= start && r.checkInTime <= end;
    });

    // 3. Consumptions
    const fCons = consumptions.filter(c => c.timestamp >= start && c.timestamp <= end);

    // 4. Expenses
    const fExp = expenses.filter(e => e.date >= start && e.date <= end);

    // 5. Vehicles
    const fVeh = vehicleHistory.filter(v => v.entryTime >= start && v.entryTime <= end);

    // 6. Flattened Sold Items (New Feature)
    const items = fCons.flatMap(c => {
        let target = '-';
        if (c.roomId) target = `Hab ${c.roomId}`;
        else if (c.employeeId) {
            const emp = employees.find(e => e.id === c.employeeId);
            target = emp ? `${emp.name} (Emp)` : 'Empleado';
        }

        return c.items.map(i => ({
            time: c.timestamp,
            target,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total
        }));
    });

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
      activeRoomsInShift: activeRooms,
      soldItems: items,
      totals: { totalRoomRevenue, totalConsRevenue, totalExpensesAmt, netIncome }
    };
  }, [selectedDate, selectedShift, roomHistory, consumptions, expenses, vehicleHistory, rooms, employees]);


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
      ['Renta de Habitaciones (Cobradas)', `$${totals.totalRoomRevenue.toFixed(2)}`],
      ['Venta de Productos/Consumos', `$${totals.totalConsRevenue.toFixed(2)}`],
      ['Gastos Operativos', `-$${totals.totalExpensesAmt.toFixed(2)}`],
      ['UTILIDAD NETA (Caja)', `$${totals.netIncome.toFixed(2)}`]
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

    // -- Detailed Products Sold Table (NEW) --
    doc.text("Detalle de Ventas (Productos)", 14, yPos);
    yPos += 5;

    const productRows = soldItems.map(item => [
       item.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
       item.target,
       item.productName,
       item.quantity.toString(),
       `$${item.unitPrice.toFixed(2)}`,
       `$${item.total.toFixed(2)}`
    ]);

    (doc as any).autoTable({
        startY: yPos,
        head: [['Hora', 'Destino', 'Producto', 'Cant', 'P.Unit', 'Total']],
        body: productRows.length > 0 ? productRows : [['-', '-', '-', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [147, 51, 234] }, // Purple 600
        styles: { fontSize: 9 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;

    // -- Active Rooms Table --
    if (activeRoomsInShift.length > 0) {
        // Check page break
        if (yPos > 240) { doc.addPage(); yPos = 20; }
        
        doc.text("Habitaciones Activas (Pendientes de Cobro)", 14, yPos);
        yPos += 5;

        const activeRows = activeRoomsInShift.map(r => [
            `Hab ${r.id}`,
            r.checkInTime ? r.checkInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
            "En curso",
            `$${(r.totalPrice || 0).toFixed(2)}`
        ]);

        (doc as any).autoTable({
            startY: yPos,
            head: [['Habitación', 'Entrada', 'Estado', 'Acumulado']],
            body: activeRows,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] }, // Green 600
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // -- Room History Table --
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.text("Habitaciones Cobradas (Historial)", 14, yPos);
    yPos += 5;

    const roomRows = filteredRooms.map(r => {
        const paidHours = getPaidHours(r.totalPrice);
        let excessStr = '-';
        let actualStr = '-';

        if (r.checkInTime && r.checkOutTime) {
            const actualMs = r.checkOutTime.getTime() - r.checkInTime.getTime();
            const actualHours = actualMs / (1000 * 60 * 60);
            
            const excessMinutes = Math.floor((actualHours - paidHours) * 60);
            if (excessMinutes > 15) {
                excessStr = `+${Math.floor(excessMinutes/60)}h ${excessMinutes%60}m`;
            }
            actualStr = getDurationString(r.checkInTime, r.checkOutTime);
        }

        return [
          `Hab ${r.roomId}`,
          r.checkInTime ? r.checkInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
          r.checkOutTime ? r.checkOutTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
          actualStr,
          `$${r.totalPrice.toFixed(2)}`,
          excessStr 
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
    if (yPos > 240) { doc.addPage(); yPos = 20; }
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
    
    // -- Vehicles Table --
    if (yPos > 230) { doc.addPage(); yPos = 20; }
    else { yPos = (doc as any).lastAutoTable.finalY + 15; }
    
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
        <div className="space-y-6">
            
            {/* Active Rooms */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-green-500" /> Habitaciones Activas (Sin Salida)
                </h3>
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {activeRoomsInShift.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm italic py-4">No hay habitaciones activas iniciadas en este turno.</p>
                    ) : (
                        activeRoomsInShift.map(r => (
                            <div key={r.id} className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Habitación {r.id}</p>
                                        <p className="text-xs text-slate-500">Entrada: {r.checkInTime ? r.checkInTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-700 text-sm">${r.totalPrice?.toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Sold Products Details (NEW) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-purple-500" /> Detalle de Ventas / Consumos
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {soldItems.length === 0 ? (
                         <p className="text-center text-slate-400 py-6 italic text-sm">No hay productos vendidos en este turno.</p>
                    ) : (
                        <table className="w-full text-xs text-left">
                            <thead className="text-slate-400 font-bold uppercase border-b border-slate-100">
                                <tr>
                                    <th className="pb-2">Prod</th>
                                    <th className="pb-2">Dest</th>
                                    <th className="pb-2 text-right">Cant</th>
                                    <th className="pb-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {soldItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-2 pr-2 font-medium text-slate-700 truncate max-w-[120px]" title={item.productName}>
                                            {item.productName}
                                        </td>
                                        <td className="py-2 text-slate-500">{item.target}</td>
                                        <td className="py-2 text-right text-slate-600">{item.quantity}</td>
                                        <td className="py-2 text-right font-bold text-green-600">${item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Historical Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-orange-500" /> Habitaciones Cobradas (Historial)
                </h3>
                <div className="space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {filteredRooms.length === 0 ? (
                        <p className="text-center text-slate-400 py-6 italic text-sm">No hay rentas cobradas en este turno.</p>
                    ) : (
                        filteredRooms.map(r => (
                            <div key={r.id} className="text-sm flex justify-between border-b border-slate-50 pb-2">
                                <div>
                                <span className="text-slate-600 block">Habitación {r.roomId} (Salida)</span>
                                <div className="flex gap-2 text-xs">
                                    <span className="text-slate-400">{getDurationString(r.checkInTime, r.checkOutTime)}</span>
                                </div>
                                </div>
                                <span className="font-bold text-slate-800">+ ${r.totalPrice}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
