import React, { useState } from 'react';
import { Search, Plus, ArrowLeftRight, X } from 'lucide-react';

const initialTransfers = [
  { id: 'TRF-250522-012', from: 'Warehouse WH01 (Delhi)', to: 'Warehouse WH02 (Mumbai)', item: 'Bluetooth Speaker (BS-3001)', qty: 50, performer: 'Ravi Kumar', status: 'In Transit', date: '22 May, 11:45 AM' },
  { id: 'TRF-250522-013', from: 'Warehouse WH01 (Delhi)', to: 'Warehouse WH03 (Bengaluru)', item: 'Power Bank (PB-5001)', qty: 100, performer: 'Amit Singh', status: 'Completed', date: '21 May, 04:10 PM' },
];

export default function StockTransfersTab() {
  const [transfers, setTransfers] = useState(initialTransfers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ to: 'Warehouse WH02 (Mumbai)', item: '', qty: 50 });

  const handleAddTransfer = (e) => {
    e.preventDefault();
    if (!formData.item) return;
    const item = {
      id: `TRF-${Date.now().toString().slice(-6)}`,
      from: 'Warehouse WH01 (Delhi)',
      to: formData.to,
      item: formData.item,
      qty: Number(formData.qty) || 50,
      performer: 'Rohit Verma',
      status: 'In Transit',
      date: 'Just Now'
    };
    setTransfers([item, ...transfers]);
    setIsModalOpen(false);
    setFormData({ to: 'Warehouse WH02 (Mumbai)', item: '', qty: 50 });
  };

  const filtered = transfers.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inter-Warehouse Stock Transfers</h2>
          <p className="text-sm text-gray-500 font-medium">Transfer stock between regional hubs (WH01, WH02, WH03).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfer ID, item..."
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
              <th className="py-3.5 px-6">Transfer ID</th>
              <th className="py-3.5 px-6">Source Hub</th>
              <th className="py-3.5 px-6">Destination Hub</th>
              <th className="py-3.5 px-6">Item / SKU</th>
              <th className="py-3.5 px-6">Quantity</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.id}</td>
                <td className="py-4 px-6 text-gray-600 font-medium text-xs">{item.from}</td>
                <td className="py-4 px-6 text-gray-900 font-bold text-xs">{item.to}</td>
                <td className="py-4 px-6 text-gray-800 font-semibold text-xs">{item.item}</td>
                <td className="py-4 px-6 font-extrabold text-gray-900">{item.qty}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#092540] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">New Inter-Warehouse Transfer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destination Warehouse Hub</label>
                <select
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Warehouse WH02 (Mumbai)">Warehouse WH02 (Mumbai)</option>
                  <option value="Warehouse WH03 (Bengaluru)">Warehouse WH03 (Bengaluru)</option>
                  <option value="Warehouse WH04 (Kolkata)">Warehouse WH04 (Kolkata)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item Title / SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Earbuds (WE-1001)"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl">Dispatch Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
