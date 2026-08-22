import React, { useState } from 'react';
import { Search, Calendar, CheckCircle2, Clock } from 'lucide-react';

const historyData = [
  { id: '#ORD-10240', customer: 'Deepak Patel', address: 'Plot 4, Connaught Place, New Delhi', amount: '₹1,599', type: 'Prepaid', completedAt: '21 May 2025, 04:30 PM', rating: '5.0 ★' },
  { id: '#ORD-10238', customer: 'Meera Kapur', address: '18, Hauz Khas, New Delhi', amount: '₹899', type: 'COD', completedAt: '21 May 2025, 02:15 PM', rating: '4.9 ★' },
  { id: '#ORD-10235', customer: 'Suresh Kumar', address: '55, Vasant Kunj, New Delhi', amount: '₹3,200', type: 'Prepaid', completedAt: '20 May 2025, 06:10 PM', rating: '5.0 ★' },
];

export default function HistoryTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = historyData.filter(h => 
    h.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delivery History</h2>
        <p className="text-sm text-gray-500 font-medium">Log of completed past deliveries, ratings, and timestamped receipts.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Address</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Completed Time</th>
              <th className="py-3.5 px-6 text-right">Customer Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                <td className="py-4 px-6 font-black text-gray-900">{item.id}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{item.customer}</td>
                <td className="py-4 px-6 text-gray-600 text-xs font-medium max-w-xs truncate">{item.address}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{item.amount} ({item.type})</td>
                <td className="py-4 px-6 text-xs text-gray-500 font-medium">{item.completedAt}</td>
                <td className="py-4 px-6 text-right font-extrabold text-amber-600 text-xs">{item.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
