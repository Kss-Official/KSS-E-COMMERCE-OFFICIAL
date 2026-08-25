import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowDownToLine, CheckCircle2, X } from 'lucide-react';
import { fetchWarehouseInboundApi } from '../../src/services/api';

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

  useEffect(() => {
    async function loadInbound() {
      const data = await fetchWarehouseInboundApi();
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(i => ({
          id: i.receipt_number || `RCPT-${i.id}`,
          supplier: i.supplier_name || 'Vendor Partner',
          item: i.product_name || 'Stock Items',
          qty: i.quantity_received || 100,
          status: i.status || 'Verified',
          date: i.received_at ? new Date(i.received_at).toLocaleDateString('en-IN') : 'Recent'
        }));
        const combined = [...formatted, ...initialInbound];
        const unique = [];
        const seen = new Set();
        for (const item of combined) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            unique.push(item);
          }
        }
        setItems(unique);
      }
    }
    loadInbound();
  }, []);

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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inbound Goods Receipts</h2>
          <p className="text-sm text-gray-500 font-medium">Log supplier deliveries, verify stock quality, and update warehouse bin allocations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#ff5100] hover:bg-[#e64900] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Goods Receipt</span>
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
              <th className="py-3.5 px-6">Supplier Partner</th>
              <th className="py-3.5 px-6">Item / Category</th>
              <th className="py-3.5 px-6">Qty Received</th>
              <th className="py-3.5 px-6">Log Date</th>
              <th className="py-3.5 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.id}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{item.supplier}</td>
                <td className="py-4 px-6 text-gray-700 font-semibold text-xs">{item.item}</td>
                <td className="py-4 px-6 font-extrabold text-gray-900">{item.qty}</td>
                <td className="py-4 px-6 text-gray-500 text-xs font-medium">{item.date}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-lg text-gray-900">Create Inbound Goods Receipt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddInbound} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier / Logistics Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony India Pvt Ltd"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item Title / SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones (WH-1001)"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity Received</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#ff5100] text-white font-extrabold text-xs rounded-xl shadow-xs">
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
