import React, { useState } from 'react';
import { Search, Plus, Edit, AlertTriangle, Minus, X } from 'lucide-react';

const initialInventory = [
  { id: 1, product: 'Wireless Headphones', sku: 'WH001', stock: 50, lowStockThreshold: 35 },
  { id: 2, product: 'Smart Watch', sku: 'SW002', stock: 32, lowStockThreshold: 35 },
  { id: 3, product: 'Running Shoes', sku: 'RS003', stock: 76, lowStockThreshold: 35 },
  { id: 4, product: 'Backpack', sku: 'BP004', stock: 45, lowStockThreshold: 35 },
  { id: 5, product: 'Coffee Maker', sku: 'CM005', stock: 20, lowStockThreshold: 35 },
];

export default function InventoryTab() {
  const [items, setItems] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ product: '', sku: '', stock: 50 });

  const handleAdjustStock = (id, delta) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = Math.max(0, item.stock + delta);
        return { ...item, stock: updated };
      }
      return item;
    }));
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!newItem.product || !newItem.sku) return;
    const item = {
      id: Date.now(),
      product: newItem.product,
      sku: newItem.sku.toUpperCase(),
      stock: Number(newItem.stock) || 0,
      lowStockThreshold: 35
    };
    setItems([item, ...items]);
    setIsModalOpen(false);
    setNewItem({ product: '', sku: '', stock: 50 });
  };

  const filtered = items.filter(i => 
    i.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inventory</h2>
          <p className="text-sm text-gray-500 font-medium">Manage stock levels, SKUs, and low-stock alerts.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Stock</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory..."
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
              <th className="py-3.5 px-6">Product</th>
              <th className="py-3.5 px-6">SKU</th>
              <th className="py-3.5 px-6">Stock Level</th>
              <th className="py-3.5 px-6">Low Stock Warning</th>
              <th className="py-3.5 px-6 text-right">Adjust Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((item) => {
              const isLow = item.stock < item.lowStockThreshold;
              return (
                <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">{item.product}</td>
                  <td className="py-4 px-6 font-mono text-xs font-bold text-gray-600">{item.sku}</td>
                  <td className="py-4 px-6 font-black text-gray-900 text-base">{item.stock}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                        isLow ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isLow && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
                      <span>{isLow ? 'Yes (Low Stock)' : 'No (Optimal)'}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleAdjustStock(item.id, -5)}
                        className="p-1.5 text-gray-700 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                        title="Reduce 5"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(item.id, 10)}
                        className="p-1.5 text-white bg-[#1b4d3e] hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer font-bold text-xs px-2.5"
                        title="Add 10"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Inventory Stock</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Mouse"
                  value={newItem.product}
                  onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WM006"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Initial Stock Count</label>
                <input
                  type="number"
                  required
                  placeholder="50"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl">Add Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
