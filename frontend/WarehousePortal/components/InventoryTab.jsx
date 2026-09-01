import React, { useState, useEffect, useCallback } from 'react';
import { Search, Boxes, MapPin, Edit, Plus, Minus, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import {
  fetchWarehouseInventoryApi,
  updateWarehouseInventoryApi,
  adjustWarehouseStockApi
} from '../../src/services/api';

export default function InventoryTab() {
  const [stockList, setStockList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlyLow, setOnlyLow] = useState(false);
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Bin/stock editor modal state
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ bin: '', delta: '', reserved: '', transit: '' });
  const [isSaving, setIsSaving] = useState(false);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    const rows = await fetchWarehouseInventoryApi();
    setStockList(Array.isArray(rows) ? rows : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filtered = stockList.filter((s) => {
    if (onlyLow && !s.is_low_stock && (Number(s.total || 0) > Number(s.reorder_level || 10))) return false;

    const term = searchTerm.toLowerCase();
    return (
      (s.sku || '').toLowerCase().includes(term) ||
      (s.name || '').toLowerCase().includes(term) ||
      (s.bin || '').toLowerCase().includes(term)
    );
  });

  // Quick +/- 10 units straight against MySQL.
  const handleQuickAdjust = async (row, delta) => {
    setBusyId(row.id);
    const res = await adjustWarehouseStockApi(row.id, delta);
    setBusyId(null);
    if (res?.status === 'success') {
      setStockList((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...res.data } : r)));
      notify(res.message || `Stock adjusted by ${delta > 0 ? '+' : ''}${delta}.`);
    } else {
      notify(res?.message || 'Could not adjust stock.');
    }
  };

  const openEditor = (row) => {
    setEditRow(row);
    setEditForm({
      bin: row.bin || '',
      delta: '',
      reserved: String(row.reserved ?? 0),
      transit: String(row.transit ?? 0)
    });
  };

  const handleSaveEditor = async () => {
    if (!editRow) return;
    setIsSaving(true);

    const payload = {
      bin: editForm.bin,
      reserved: Number(editForm.reserved) || 0,
      transit: Number(editForm.transit) || 0
    };
    let res = await updateWarehouseInventoryApi(editRow.id, payload);

    const delta = Number(editForm.delta);
    if (res?.status === 'success' && delta) {
      res = await adjustWarehouseStockApi(editRow.id, delta, editForm.bin);
    }

    setIsSaving(false);
    if (res?.status === 'success') {
      setStockList((prev) => prev.map((r) => (r.id === editRow.id ? { ...r, ...res.data } : r)));
      notify('Bin record updated.');
      setEditRow(null);
    } else {
      notify(res?.message || 'Could not update this bin.');
    }
  };

  const totalUnits = stockList.reduce((acc, r) => acc + Number(r.total || 0), 0);
  const lowCount = stockList.filter((r) => r.is_low_stock).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <Check className="w-4 h-4 text-blue-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Inventory &amp; Bin Locations</h2>
          <p className="text-sm text-gray-500 font-medium">Track total units, reserved stock, bin numbers (Bin A-102, B-304), and transit levels.</p>
        </div>
      </div>

      {/* Live interactive counter buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setOnlyLow(false)}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            !onlyLow ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>Total SKUs</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{stockList.length}</p>
        </button>

        <button
          onClick={() => setOnlyLow(false)}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            !onlyLow ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>Units on Floor</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{totalUnits.toLocaleString('en-IN')}</p>
        </button>

        <button
          onClick={() => setOnlyLow(true)}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            onlyLow ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Below Reorder Level</span>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">{lowCount}</p>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-3">
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
        <button
          onClick={() => setOnlyLow((v) => !v)}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors cursor-pointer shrink-0 ${
            onlyLow
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {onlyLow ? 'Showing Low Stock' : 'Low Stock Only'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">SKU Code</th>
                <th className="py-3.5 px-6">Item Title</th>
                <th className="py-3.5 px-6">Bin Location</th>
                <th className="py-3.5 px-6">Total Units</th>
                <th className="py-3.5 px-6">Available</th>
                <th className="py-3.5 px-6">Reserved</th>
                <th className="py-3.5 px-6">In Transit</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && stockList.length === 0 && (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center">
                    <Boxes className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No inventory rows found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Try a different SKU, item or bin.' : 'Inbound receipts will populate this shelf list.'}
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-blue-900">{item.sku}</td>
                  <td className="py-4 px-6 font-bold text-gray-900">
                    <span className="line-clamp-1">{item.name}</span>
                    {item.is_low_stock && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600">
                        <AlertTriangle className="w-3 h-3" />
                        Below reorder level ({item.reorder_level})
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{item.bin || 'Unassigned'}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 font-black text-gray-900">{item.total}</td>
                  <td className="py-4 px-6 font-extrabold text-emerald-600">{item.avail}</td>
                  <td className="py-4 px-6 font-bold text-blue-600">{item.reserved}</td>
                  <td className="py-4 px-6 font-bold text-orange-600">{item.transit}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleQuickAdjust(item, -10)}
                        disabled={busyId === item.id}
                        title="Remove 10 units"
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(item, 10)}
                        disabled={busyId === item.id}
                        title="Add 10 units"
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditor(item)}
                        title="Edit bin & counts"
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bin & Stock Editor */}
      {editRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Adjust Bin Record</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">
                  {editRow.sku} &middot; {editRow.name}
                </p>
              </div>
              <button
                onClick={() => setEditRow(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bin Location</label>
                <input
                  type="text"
                  value={editForm.bin}
                  onChange={(e) => setEditForm({ ...editForm, bin: e.target.value })}
                  placeholder="Bin A-102"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Stock Adjustment (current: {editRow.total} units)
                </label>
                <input
                  type="number"
                  value={editForm.delta}
                  onChange={(e) => setEditForm({ ...editForm, delta: e.target.value })}
                  placeholder="e.g. 50 to add, -20 to remove"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Reserved</label>
                  <input
                    type="number"
                    value={editForm.reserved}
                    onChange={(e) => setEditForm({ ...editForm, reserved: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">In Transit</label>
                  <input
                    type="number"
                    value={editForm.transit}
                    onChange={(e) => setEditForm({ ...editForm, transit: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 flex justify-end space-x-3">
              <button
                onClick={() => setEditRow(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditor}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
