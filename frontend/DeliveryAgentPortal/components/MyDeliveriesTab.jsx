import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Package, RefreshCw, Check } from 'lucide-react';
import {
  fetchDeliveryTasksApi,
  updateDeliveryTaskStatusApi,
  advanceDeliveryStageApi
} from '../../src/services/api';

// Rider-facing labels for the DeliveryTask.status values the API returns.
const STATUS_LABEL = {
  ASSIGNED: 'Pending',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed'
};

const FILTERS = ['All', 'Out for Delivery', 'Pending', 'Delivered'];

export default function MyDeliveriesTab() {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadDeliveries = async () => {
    setIsLoading(true);
    const rows = await fetchDeliveryTasksApi();
    setDeliveries(Array.isArray(rows) ? rows : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  // "Start Delivery" moves the task to IN_TRANSIT, which the backend pushes onto the
  // order as OUT_FOR_DELIVERY so the customer's tracking page updates too.
  const handleStart = async (task) => {
    setBusyId(task.id);
    const updated = await updateDeliveryTaskStatusApi(task.task_id || task.id, 'IN_TRANSIT');
    setBusyId(null);
    if (updated) {
      setDeliveries((prev) => prev.map((d) => (d.id === task.id ? { ...d, ...updated } : d)));
      notify(`${task.order_number} is now out for delivery.`);
    } else {
      notify('Could not start this delivery.');
    }
  };

  // Completion needs the customer's OTP, so this only walks the task to the doorstep
  // stage and hands the rider over to the Active Delivery screen.
  const handleAdvance = async (task) => {
    setBusyId(task.id);
    const res = await advanceDeliveryStageApi(task.task_id || task.id);
    setBusyId(null);
    if (res?.status === 'success' && res.data) {
      setDeliveries((prev) => prev.map((d) => (d.id === task.id ? { ...d, ...res.data } : d)));
      notify(res.message || 'Stage advanced. Verify the OTP to finish.');
    } else {
      notify(res?.message || 'Could not advance this delivery.');
    }
  };

  const filtered = deliveries.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      (d.order_number || '').toLowerCase().includes(term) ||
      (d.recipient_name || '').toLowerCase().includes(term) ||
      (d.task_id || '').toLowerCase().includes(term);
    const label = STATUS_LABEL[d.status] || d.status;
    const matchFilter = selectedFilter === 'All' || label === selectedFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1b4d3e] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Deliveries</h2>
          <p className="text-sm text-gray-500 font-medium">Manage assigned packages, pickup locations, and completion status.</p>
        </div>
        <button
          onClick={loadDeliveries}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedFilter === status
                  ? 'bg-[#1b4d3e] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading && deliveries.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 animate-pulse">
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
              <div className="h-9 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xs text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900">No deliveries in this view</h4>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {searchTerm || selectedFilter !== 'All'
              ? 'Try a different filter or search term.'
              : 'Parcels assigned by the warehouse will show up here.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const label = STATUS_LABEL[item.status] || item.status;
          const cod = Number(item.cod_amount || 0);
          const amount = cod > 0 ? cod : Number(item.order_total || 0);
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-gray-900 text-base">{item.order_number}</span>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 ${
                    label === 'Out for Delivery'
                      ? 'bg-emerald-100 text-emerald-800'
                      : label === 'Delivered'
                        ? 'bg-gray-100 text-gray-700'
                        : label === 'Failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {label}
                </span>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-gray-900 text-sm">{item.recipient_name}</h4>
                <p className="text-xs text-gray-500 font-medium flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    {item.delivery_address}
                    {item.shipping_pincode ? ` - ${item.shipping_pincode}` : ''}
                  </span>
                </p>
                <p className="text-[11px] text-gray-400 font-semibold">
                  <span className="font-mono">{item.task_id}</span> &middot; {item.items_count} item(s) &middot; {item.stage_name}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">COD / Prepaid</span>
                  <span className="font-extrabold text-gray-900">
                    ₹{amount.toLocaleString('en-IN')} ({cod > 0 ? 'COD' : 'Prepaid'})
                  </span>
                </div>
                <a
                  href={`tel:${item.recipient_phone}`}
                  className="p-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {item.status !== 'DELIVERED' && item.status !== 'FAILED' && (
                <div className="pt-2 flex space-x-2">
                  {item.status === 'ASSIGNED' || item.status === 'PICKED_UP' ? (
                    <button
                      onClick={() => handleStart(item)}
                      disabled={busyId === item.id}
                      className="w-full bg-[#1b4d3e] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#0f382c] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busyId === item.id ? 'Starting...' : 'Start Delivery'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAdvance(item)}
                      disabled={busyId === item.id || item.current_stage >= 4}
                      className="w-full bg-[#ff5100] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#e64900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {busyId === item.id
                        ? 'Updating...'
                        : item.current_stage >= 3
                          ? 'Verify OTP in Active Delivery'
                          : 'Mark Arrived'}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
