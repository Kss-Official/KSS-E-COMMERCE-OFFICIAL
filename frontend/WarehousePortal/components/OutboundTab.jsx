import React, { useState } from 'react';
import { Search, ArrowUpFromLine, Truck, CheckCircle2 } from 'lucide-react';

const initialOutbound = [
  { id: 'SHP-250522-037', destination: 'Delhi Hub', item: 'Smart Watch (SW-2001)', qty: 80, courier: 'BlueDart Express', status: 'Dispatched', time: '22 May, 10:30 AM' },
  { id: 'SHP-250522-038', destination: 'Mumbai Hub', item: 'Wireless Headphones (WH-1001)', qty: 150, courier: 'Delhivery', status: 'Packing In Progress', time: '22 May, 01:45 PM' },
  { id: 'SHP-250522-039', destination: 'Bengaluru Hub', item: 'Bluetooth Speaker (BS-3001)', qty: 60, courier: 'Ecom Express', status: 'Ready for Pickup', time: '22 May, 03:20 PM' },
];

export default function OutboundTab() {
  const [items, setItems] = useState(initialOutbound);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = items.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Outbound Packing & Shipments</h2>
        <p className="text-sm text-gray-500 font-medium">Process outgoing customer orders, packing slips, and courier manifest handover.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shipment ID, hub..."
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
              <th className="py-3.5 px-6">Shipment ID</th>
              <th className="py-3.5 px-6">Destination Hub</th>
              <th className="py-3.5 px-6">Item / SKU</th>
              <th className="py-3.5 px-6">Quantity</th>
              <th className="py-3.5 px-6">Courier Partner</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.id}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{item.destination}</td>
                <td className="py-4 px-6 text-gray-700 font-semibold text-xs">{item.item}</td>
                <td className="py-4 px-6 font-extrabold text-gray-900">{item.qty}</td>
                <td className="py-4 px-6 text-gray-600 font-bold text-xs">{item.courier}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    item.status === 'Dispatched' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
