import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowLeftRight, X, RefreshCw, Check, Truck, CheckCircle2 } from 'lucide-react';
import {
  fetchWarehouseTransfersApi,
  createStockTransferApi,
  advanceStockTransferApi
} from '../../src/services/api';

// Initiated → In Transit → Completed
const NEXT_STATUS = {
  Initiated: 'In Transit',
  'In Transit': 'Completed'
};

export default function StockTransfersTab() {
  const [transfers, setTransfers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    to: 'Warehouse WH02 (Mumbai)',
    item: '',
    sku: '',
    qty: 50
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadTransfers = async () => {
    setIsLoading(true);
    const rows = await fetchWarehouseTransfersApi();
    setTransfers(Array.isArray(rows) ? rows : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleAddTransfer = async (e) => {
    e.preventDefault();
    if (!formData.item) return;

    setIsSaving(true);
    const res = await createStockTransferApi({
      source_warehouse: 'Warehouse WH01 (Delhi)',
      destination_warehouse: formData.to,
      item_title: formData.item,
      sku: formData.sku,
      quantity: Number(formData.qty) || 50,
      status: 'Initiated'
    });
    setIsSaving(false);

    if (res?.status === 'success') {
      setTransfers((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ to: 'Warehouse WH02 (Mumbai)', item: '', sku: '', qty: 50 });
      notify('Stock transfer created.');
    } else {
      notify(res?.message || 'Could not create this transfer.');
    }
  };

  const handleAdvance = async (row) => {
    const next = NEXT_STATUS[row.status];
    if (!next) return;

    setBusyId(row.id);
    const res = await advanceStockTransferApi(row.id, next);
    setBusyId(null);

    if (res?.status === 'success') {
      setTransfers((prev) => prev.map((t) => (t.id === row.id ? { ...t, ...res.data } : t)));
      notify(res.message || `Transfer marked ${next}.`);
    } else {
      notify(res?.message || 'Could not update this transfer.');
    }
  };

  const filtered = transfers.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      (t.transfer_id || '').toLowerCase().includes(term) ||
      (t.item_title || '').toLowerCase().includes(term) ||
      (t.sku || '').toLowerCase().includes(term) ||
      (t.destination_warehouse || '').toLowerCase().includes(term)
    );
  });

  const openCount = transfers.filter((t) => t.status !== 'Completed').length;

  const statusChip = (status) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-800';
    if (status === 'In Transit') return 'bg-blue-100 text-blue-800';
    return 'bg-amber-100 text-amber-800';
  };

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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inter-Warehouse Stock Transfers</h2>
          <p className="text-sm text-gray-500 font-medium">Transfer stock between regional hubs (WH01, WH02, WH03).</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Stock Transfer</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
        <div className="flex items-center gap-4 text-xs font-bold shrink-0">
          <span className="text-gray-500">
            Total: <span className="text-gray-900">{transfers.length}</span>
          </span>
          <span className="text-gray-500">
            Open: <span className="text-blue-700">{openCount}</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Transfer ID</th>
                <th className="py-3.5 px-6">Source Hub</th>
                <th className="py-3.5 px-6">Destination Hub</th>
                <th className="py-3.5 px-6">Item / SKU</th>
                <th className="py-3.5 px-6">Quantity</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && transfers.length === 0 && (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <ArrowLeftRight className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No stock transfers</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Nothing matched that search.' : 'Create a transfer to move stock to another hub.'}
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.transfer_id}</td>
                  <td className="py-4 px-6 text-gray-600 font-medium text-xs">{item.source_warehouse}</td>
                  <td className="py-4 px-6 text-gray-900 font-bold text-xs">{item.destination_warehouse}</td>
                  <td className="py-4 px-6 text-gray-800 font-semibold text-xs">
                    <span className="line-clamp-1">{item.item_title}</span>
                    {item.sku && (
                      <span className="block text-[11px] font-mono text-gray-400 mt-0.5">{item.sku}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-gray-900">{item.quantity}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${statusChip(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {NEXT_STATUS[item.status] ? (
                      <button
                        onClick={() => handleAdvance(item)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Truck className="w-3 h-3" />
                        <span>
                          {busyId === item.id
                            ? 'Updating...'
                            : `Mark ${NEXT_STATUS[item.status]}`}
                        </span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Closed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#092540] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">New Inter-Warehouse Transfer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-300 hover:text-white cursor-pointer">
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
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Earbuds"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKU Code (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WE-1001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="50"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Dispatching...' : 'Dispatch Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
