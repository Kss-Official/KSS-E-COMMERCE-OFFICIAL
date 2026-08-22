import React, { useState } from 'react';
import { Search, Plus, ArrowDownToLine, CheckCircle2, X } from 'lucide-react';

const initialInbound = [
  { id: 'RCPT-250522-001', supplier: 'Samsung India Logistics', item: 'Wireless Headphones (WH-1001)', qty: 120, status: 'Verified', date: '22 May, 09:15 AM' },
  { id: 'RCPT-250522-002', supplier: 'Anker Tech Pvt Ltd', item: 'Power Bank (PB-5001)', qty: 200, status: 'Verified', date: '22 May, 02:05 PM' },
  { id: 'RCPT-250522-003', supplier: 'BoAt Lifestyle Logistics', item: 'Bluetooth Speaker (BS-3001)', qty: 150, status: 'Pending Verification', date: '22 May, 04:30 PM' },
];

export default function InboundTab() {
  const [items, setItems] = useState(initialInbound);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ supplier: '', item: '', qty: 50 });

  const handleAddInbound = (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.item) return;
    const newItem = {
      id: `RCPT-${Date.now().toString().slice(-6)}`,
      supplier: formData.supplier,
      item: formData.item,
      qty: Number(formData.qty) || 50,
      status: 'Pending Verification',
      date: 'Just Now'
    };
    setItems([newItem, ...items]);
    setIsModalOpen(false);
    setFormData({ supplier: '', item: '', qty: 50 });
  };

  const filtered = items.filter(i => 
    i.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inbound Receipts & POs</h2>
          <p className="text-sm text-gray-500 font-medium">Verify incoming supplier stock shipments and generate receipts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Inbound Receipt</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt ID, supplier..."
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
              <th className="py-3.5 px-6">Receipt ID</th>
              <th className="py-3.5 px-6">Supplier</th>
              <th className="py-3.5 px-6">Item / SKU</th>
              <th className="py-3.5 px-6">Quantity</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Time Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.id}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{item.supplier}</td>
                <td className="py-4 px-6 text-gray-700 font-semibold text-xs">{item.item}</td>
                <td className="py-4 px-6 font-extrabold text-gray-900">{item.qty}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#092540] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Create Inbound Stock Receipt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddInbound} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony India Logistics"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item Title / SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Watch (SW-2001)"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Received Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="100"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl">Generate Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
