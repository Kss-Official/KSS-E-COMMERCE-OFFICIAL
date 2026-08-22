import React, { useState } from 'react';
import { Search, Boxes, MapPin, Edit, Plus, X } from 'lucide-react';

const initialStock = [
  { sku: 'WH-1001', name: 'Wireless Headphones', bin: 'Bin A-102', total: 1200, avail: 850, reserved: 250, transit: 100 },
  { sku: 'SW-2001', name: 'Smart Watch', bin: 'Bin B-304', total: 850, avail: 600, reserved: 150, transit: 100 },
  { sku: 'BS-3001', name: 'Bluetooth Speaker', bin: 'Bin C-105', total: 450, avail: 300, reserved: 100, transit: 50 },
  { sku: 'EP-4001', name: 'Earphones', bin: 'Bin A-201', total: 1500, avail: 1200, reserved: 200, transit: 100 },
  { sku: 'PB-5001', name: 'Power Bank', bin: 'Bin D-402', total: 900, avail: 700, reserved: 150, transit: 50 },
];

export default function InventoryTab() {
  const [stockList, setStockList] = useState(initialStock);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = stockList.filter(s => 
    s.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.bin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Inventory & Bin Locations</h2>
          <p className="text-sm text-gray-500 font-medium">Track total units, reserved stock, bin numbers (Bin A-102, B-304), and transit levels.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SKU, item or bin..."
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
              <th className="py-3.5 px-6">SKU Code</th>
              <th className="py-3.5 px-6">Item Title</th>
              <th className="py-3.5 px-6">Bin Location</th>
              <th className="py-3.5 px-6">Total Units</th>
              <th className="py-3.5 px-6">Available</th>
              <th className="py-3.5 px-6">Reserved</th>
              <th className="py-3.5 px-6">In Transit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.sku} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-blue-900">{item.sku}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{item.name}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{item.bin}</span>
                  </span>
                </td>
                <td className="py-4 px-6 font-black text-gray-900">{item.total}</td>
                <td className="py-4 px-6 font-extrabold text-emerald-600">{item.avail}</td>
                <td className="py-4 px-6 font-bold text-blue-600">{item.reserved}</td>
                <td className="py-4 px-6 font-bold text-orange-600">{item.transit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
