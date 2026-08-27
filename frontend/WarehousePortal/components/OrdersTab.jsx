import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  RefreshCw,
  Check,
  PackageCheck,
  Truck,
  IndianRupee,
  Clock
} from 'lucide-react';
import { fetchWarehouseOrderQueueApi, updateOrderStatusApi } from '../../src/services/api';

const FILTERS = [
  { key: 'queue', label: 'In Warehouse' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'all', label: 'All Orders' }
];

// What the warehouse can do next for an order it is holding.
const NEXT_STAGE = {
  PENDING: { status: 'PROCESSING', label: 'Start Processing' },
  CONFIRMED: { status: 'PROCESSING', label: 'Start Processing' },
  PROCESSING: { status: 'SHIPPED', label: 'Mark Shipped' }
};

const STATUS_CHIP = {
  PENDING: 'bg-gray-100 text-gray-700',
  CONFIRMED: 'bg-amber-100 text-amber-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-rose-100 text-rose-800',
  RETURNED: 'bg-orange-100 text-orange-800',
  REFUNDED: 'bg-slate-100 text-slate-700'
};

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('queue');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    const rows = await fetchWarehouseOrderQueueApi();
    setOrders(Array.isArray(rows) ? rows : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const handleRealtime = () => {
      loadOrders();
    };

    window.addEventListener('buyzo_order_updated', handleRealtime);
    window.addEventListener('storage', handleRealtime);

    const interval = setInterval(() => {
      loadOrders();
    }, 2500);

    return () => {
      window.removeEventListener('buyzo_order_updated', handleRealtime);
      window.removeEventListener('storage', handleRealtime);
      clearInterval(interval);
    };
  }, []);

  const handleAdvance = async (order) => {
    const next = NEXT_STAGE[order.status];
    if (!next) return;

    setBusyId(order.id);
    const res = await updateOrderStatusApi(order.id, next.status);
    setBusyId(null);

    if (res) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: next.status } : o))
      );
      notify(`Order ${order.order_number} marked ${next.status.toLowerCase()}.`);
    } else {
      notify('Could not update this order.');
    }
  };

  const isQueueStatus = (st) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'ORDER CONFIRMED', 'NEW'].includes(String(st || '').toUpperCase());

  const visible = orders
    .filter((o) => {
      if (filter === 'all') return true;
      if (filter === 'queue') return isQueueStatus(o.status);
      return String(o.status || '').toUpperCase() === String(filter).toUpperCase();
    })
    .filter((o) => {
      const term = searchTerm.toLowerCase();
      if (!term) return true;
      return (
        (o.order_number || o.id || '').toLowerCase().includes(term) ||
        (o.shipping_name || '').toLowerCase().includes(term) ||
        (o.shipping_city || '').toLowerCase().includes(term)
      );
    });

  const queueCount = orders.filter((o) => isQueueStatus(o.status)).length;
  const shippedCount = orders.filter((o) => String(o.status).toUpperCase() === 'SHIPPED').length;
  const queueValue = orders
    .filter((o) => isQueueStatus(o.status))
    .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

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
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Customer Order Fulfilment</h2>
          <p className="text-sm text-gray-500 font-medium">Every live customer order the warehouse is holding, picking or shipping.</p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>In Warehouse</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{queueCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Shipped</span>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-1">{shippedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Queue Value</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{Math.round(queueValue).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order number, customer, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                filter === f.key
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order Number</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Items</th>
                <th className="py-3.5 px-6">Order Value</th>
                <th className="py-3.5 px-6">Placed On</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && orders.length === 0 && (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No orders in this view</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Nothing matched that search.' : 'New customer orders will land here automatically.'}
                    </p>
                  </td>
                </tr>
              )}

              {visible.map((order) => {
                const items = order.items || [];
                const units = items.reduce((acc, i) => acc + (parseInt(i.quantity, 10) || 1), 0);
                const next = NEXT_STAGE[order.status];
                return (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900">
                      {order.order_number}
                      <span className="block text-[11px] font-sans font-semibold text-gray-400 mt-0.5">
                        {order.payment_method} &middot; {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <span className="font-bold text-gray-900 block">{order.shipping_name}</span>
                      <span className="text-gray-400 font-semibold">
                        {order.shipping_city}
                        {order.shipping_pincode ? ` - ${order.shipping_pincode}` : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-700 font-semibold">
                      <span className="line-clamp-1">
                        {items[0]?.product_title || 'Order item'}
                      </span>
                      <span className="block text-[11px] text-gray-400 mt-0.5">
                        {items.length} line(s) &middot; {units} unit(s)
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-gray-900">
                      ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-medium">{order.formatted_date}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${STATUS_CHIP[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {(order.status || '').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {next ? (
                        <button
                          onClick={() => handleAdvance(order)}
                          disabled={busyId === order.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <PackageCheck className="w-3 h-3" />
                          <span>{busyId === order.id ? 'Updating...' : next.label}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400">Out of warehouse</span>
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
