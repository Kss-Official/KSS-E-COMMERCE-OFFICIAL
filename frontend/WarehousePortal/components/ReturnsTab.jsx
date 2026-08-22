import React, { useState } from 'react';
import { Search, RotateCcw, CheckCircle2 } from 'lucide-react';

const initialReturns = [
  { id: 'RTN-250522-004', item: 'Earphones (EP-4001)', qty: 15, reason: 'Defective Packaging', status: 'Inspected & Restocked', date: '22 May, 01:20 PM' },
  { id: 'RTN-250522-005', item: 'Phone Case (PC-3001)', qty: 5, reason: 'Wrong Size Delivered', status: 'Pending Inspection', date: '22 May, 03:40 PM' },
];

export default function ReturnsTab() {
  const [returnsList, setReturnsList] = useState(initialReturns);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = returnsList.filter(r => 
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Returns & Restocking</h2>
        <p className="text-sm text-gray-500 font-medium">Inspect returned products, record reason for return, and restock clean inventory.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search return ID, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Return ID</th>
              <th className="py-3.5 px-6">Item / SKU</th>
              <th className="py-3.5 px-6">Quantity</th>
              <th className="py-3.5 px-6">Return Reason</th>
              <th className="py-3.5 px-6">Restock Status</th>
              <th className="py-3.5 px-6">Received Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.id}</td>
                <td className="py-4 px-6 font-bold text-gray-900 text-xs">{item.item}</td>
                <td className="py-4 px-6 font-extrabold text-gray-900">{item.qty}</td>
                <td className="py-4 px-6 text-gray-600 font-semibold text-xs">{item.reason}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    item.status.includes('Restocked') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-xs text-gray-500 font-medium">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
