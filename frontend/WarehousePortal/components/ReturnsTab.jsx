import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, CheckCircle2, Trash2, RefreshCw, PackageX } from 'lucide-react';
import {
  fetchWarehouseReturnsApi,
  restockReturnApi,
  discardReturnApi
} from '../../src/services/api';

export default function ReturnsTab() {
  const [returnsList, setReturnsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadReturns = async () => {
    setIsLoading(true);
    const rows = await fetchWarehouseReturnsApi();
    setReturnsList(Array.isArray(rows) ? rows : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const applyAction = async (row, kind) => {
    setBusyId(row.id);
    const res = kind === 'restock' ? await restockReturnApi(row.id) : await discardReturnApi(row.id);
    setBusyId(null);

    if (res?.status === 'success') {
      setReturnsList((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...res.data } : r)));
      notify(res.message || 'Return updated.');
    } else {
      notify(res?.message || 'Could not update this return.');
    }
  };

  const filtered = returnsList.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.return_id || '').toLowerCase().includes(term) ||
      (r.item_title || '').toLowerCase().includes(term) ||
      (r.order_number || '').toLowerCase().includes(term) ||
      (r.customer_name || '').toLowerCase().includes(term)
    );
  });

  const pendingCount = returnsList.filter(
    (r) => r.status !== 'Restocked' && r.status !== 'Discarded'
  ).length;

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? value
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
          ', ' +
          d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Returns &amp; Restocking</h2>
          <p className="text-sm text-gray-500 font-medium">Inspect returned products, record reason for return, and restock clean inventory.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search return ID, item, order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold shrink-0">
          <span className="text-gray-500">
            Total: <span className="text-gray-900">{returnsList.length}</span>
          </span>
          <span className="text-gray-500">
            Awaiting action: <span className="text-amber-600">{pendingCount}</span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Return ID</th>
                <th className="py-3.5 px-6">Item / SKU</th>
                <th className="py-3.5 px-6">Quantity</th>
                <th className="py-3.5 px-6">Return Reason</th>
                <th className="py-3.5 px-6">Restock Status</th>
                <th className="py-3.5 px-6">Received Time</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && returnsList.length === 0 && (
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
                    <PackageX className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No returns to inspect</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Nothing matched that search.' : 'Customer returns will appear here as they arrive at the dock.'}
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map((item) => {
                const isClosed = item.status === 'Restocked' || item.status === 'Discarded';
                return (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900">
                      {item.return_id}
                      {item.order_number && (
                        <span className="block text-[11px] font-sans font-semibold text-gray-400 mt-0.5">
                          {item.order_number}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 text-xs">
                      <span className="line-clamp-1">{item.item_title}</span>
                      {item.customer_name && (
                        <span className="block text-[11px] font-semibold text-gray-400 mt-0.5">
                          {item.customer_name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-gray-900">{item.quantity}</td>
                    <td className="py-4 px-6 text-gray-600 font-semibold text-xs">
                      {item.reason}
                      {item.condition && (
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          Condition: {item.condition}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                          item.status === 'Restocked'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Discarded'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                      {formatDate(item.inspected_at)}
                    </td>
                    <td className="py-4 px-6">
                      {isClosed ? (
                        <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-gray-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Closed
                        </span>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => applyAction(item, 'restock')}
                            disabled={busyId === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                          <button
                            onClick={() => applyAction(item, 'discard')}
                            disabled={busyId === item.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Discard</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
