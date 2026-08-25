import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, AlertTriangle, Minus, X, RefreshCw } from 'lucide-react';
import { fetchProducts, updateProductApi, createProductApi } from '../../src/services/api';

export default function InventoryTab() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ product: '', sku: '', stock: 50 });

  const formatInventoryItem = (p) => {
    const titleName = p.name || p.title || `Product #${p.id}`;
    const stockQty = Number(p.stock || p.stock_quantity || 0);
    const skuCode = p.sku || `SKU-${p.id}`;
    return {
      id: p.id,
      product: titleName,
      sku: skuCode,
      stock: stockQty,
      lowStockThreshold: 15
    };
  };

  const loadInventory = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchProducts();
      if (Array.isArray(data)) {
        setItems(data.map(formatInventoryItem));
      }
    } catch (err) {
      console.warn('[InventoryTab] Error loading inventory:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
    const interval = setInterval(() => {
      loadInventory(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [loadInventory]);

  const handleAdjustStock = async (id, delta) => {
    const target = items.find(i => i.id === id);
    if (!target) return;
    const newStock = Math.max(0, target.stock + delta);
    
    // Optimistic UI update
    setItems(items.map(i => i.id === id ? { ...i, stock: newStock } : i));

    try {
      await updateProductApi(id, { stock: newStock });
      loadInventory(true);
    } catch (err) {
      alert('Failed to update stock in database: ' + err.message);
      loadInventory();
    }
  };

  const handleAddStockItem = async (e) => {
    e.preventDefault();
    if (!newItem.product) return;
    try {
      await createProductApi({
        name: newItem.product,
        stock: Number(newItem.stock) || 0,
        price: '999'
      });
      setIsModalOpen(false);
      setNewItem({ product: '', sku: '', stock: 50 });
      loadInventory();
    } catch (err) {
      alert('Failed to add product stock: ' + err.message);
    }
  };

  const filtered = items.filter(i => 
    i.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inventory</h2>
            {isRefreshing && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Live Syncing</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Manage database stock levels, SKUs, and low-stock alerts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadInventory()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Stock Item</span>
          </button>
        </div>
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
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading product inventory from database...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">SKU Code</th>
                <th className="py-3.5 px-6">Live Stock</th>
                <th className="py-3.5 px-6">Low Stock Warning</th>
                <th className="py-3.5 px-6 text-right">Adjust Stock (Database)</th>
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
                          title="Reduce 5 in database"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(item.id, 10)}
                          className="p-1.5 text-white bg-[#1b4d3e] hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer font-bold text-xs px-2.5"
                          title="Add 10 in database"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400 font-medium">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Product Stock</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStockItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Office Desk"
                  value={newItem.product}
                  onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl cursor-pointer">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
