import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Boxes, CheckCircle2, RefreshCw, PackagePlus, Check } from 'lucide-react';
import { fetchWarehouseAlertsApi, createInboundReceiptApi } from '../../src/services/api';

const SEVERITY_STYLE = {
  critical: { chip: 'bg-rose-100 text-rose-800', label: 'Critical' },
  warning: { chip: 'bg-amber-100 text-amber-800', label: 'Warning' },
  info: { chip: 'bg-blue-100 text-blue-800', label: 'Info' }
};

export default function AlertsTab() {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState({ critical: 0, warning: 0, info: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAlerts = async () => {
    setIsLoading(true);
    const data = await fetchWarehouseAlertsApi();
    setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
    setCounts(data?.counts || { critical: 0, warning: 0, info: 0 });
    setIsLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Raising a PO writes a real InboundReceipt row that the Inbound tab picks up.
  const handleReorder = async (alert) => {
    setBusyId(alert.id);
    const res = await createInboundReceiptApi({
      supplier_name: 'BuyZo Central Procurement',
      item_title: alert.title,
      sku: alert.sku || '',
      quantity: alert.suggested_reorder || 50,
      status: 'Pending Verification'
    });
    setBusyId(null);

    if (res?.status === 'success') {
      notify(`Purchase order raised for ${alert.suggested_reorder || 50} units.`);
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    } else {
      notify(res?.message || 'Could not raise the purchase order.');
    }
  };

  const visible = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <Check className="w-4 h-4 text-blue-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Alerts &amp; System Notifications</h2>
          <p className="text-sm text-gray-500 font-medium">Critical low stock alerts, bin capacity warnings, and pending PO receipts.</p>
        </div>
      </div>

      {/* Severity filter pills with live counts */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: `All (${alerts.length})` },
          { key: 'critical', label: `Critical (${counts.critical || 0})` },
          { key: 'warning', label: `Warning (${counts.warning || 0})` },
          { key: 'info', label: `Info (${counts.info || 0})` }
        ].map((pill) => (
          <button
            key={pill.key}
            onClick={() => setFilter(pill.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              filter === pill.key
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
        {isLoading && alerts.length === 0 && (
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="p-5 flex items-start space-x-4 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-100 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            </div>
          ))
        )}

        {!isLoading && visible.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900">All clear</h4>
            <p className="text-xs text-gray-500 font-medium mt-1">
              No {filter === 'all' ? '' : `${filter} `}alerts right now. Stock levels are healthy.
            </p>
          </div>
        )}

        {visible.map((item) => {
          const style = SEVERITY_STYLE[item.severity] || SEVERITY_STYLE.info;
          return (
            <div key={item.id} className="p-5 flex items-start space-x-4 hover:bg-blue-50/20 transition-colors">
              <div className={`p-3 rounded-xl shrink-0 ${style.chip}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-3">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                    {item.type}: {item.title}
                  </h4>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${style.chip}`}>
                    {style.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-1">{item.message}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {item.sku && (
                    <span className="text-[11px] font-mono font-bold text-blue-900">{item.sku}</span>
                  )}
                  {item.category && (
                    <span className="text-[11px] font-semibold text-gray-500">{item.category}</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700">
                    <Boxes className="w-3 h-3 text-gray-400" />
                    {item.current_stock} units
                  </span>
                  {item.suggested_reorder > 0 && (
                    <button
                      onClick={() => handleReorder(item)}
                      disabled={busyId === item.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <PackagePlus className="w-3 h-3" />
                      <span>
                        {busyId === item.id ? 'Raising...' : `Reorder ${item.suggested_reorder}`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
