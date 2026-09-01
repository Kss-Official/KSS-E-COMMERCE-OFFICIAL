import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Phone,
  Package,
  RefreshCw,
  Check,
  Clock,
  Zap,
  Calendar,
  Truck,
  ShieldCheck,
  MoreVertical,
  Eye,
  User,
  Navigation,
  AlertTriangle,
  FileText,
  X,
  CheckCircle2
} from 'lucide-react';
import {
  fetchDeliveryTasksApi,
  updateDeliveryTaskStatusApi,
  advanceDeliveryStageApi
} from '../../src/services/api';

const STATUS_LABEL = {
  ASSIGNED: 'Pending',
  ACCEPTED: 'Accepted',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed'
};

const FILTERS = [
  'All',
  'Pending',
  'Accepted',
  'Picked Up',
  'Out for Delivery',
  'Delivered',
  'Failed'
];

const TIME_FILTERS = [
  { id: 'All Time', label: 'All Time' },
  { id: 'Today', label: "Today's Deliveries" },
  { id: 'This Week', label: 'This Week' },
  { id: 'Last Week', label: 'Last Week' },
  { id: 'This Month', label: 'This Month' },
  { id: 'This Year', label: 'This Year' }
];

export default function MyDeliveriesTab() {
  const [deliveries, setDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All Time');
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  // Active Modals & Dropdown State
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [itemsModalItem, setItemsModalItem] = useState(null);
  const [customerModalItem, setCustomerModalItem] = useState(null);
  const [instructionsModalItem, setInstructionsModalItem] = useState(null);
  const [orderDetailsModalItem, setOrderDetailsModalItem] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadDeliveries = async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    const rows = await fetchDeliveryTasksApi();
    setDeliveries(Array.isArray(rows) ? rows : []);
    if (!isBackground) setIsLoading(false);
  };

  useEffect(() => {
    loadDeliveries(false);
    const interval = setInterval(() => {
      loadDeliveries(true);
    }, 4000); // 4-second live polling for new assignments and stage changes
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

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

  const matchesTimeFilter = (d, filter) => {
    if (filter === 'All Time') return true;

    const dateStr = d.created_at || d.assigned_at || d.date || d.updated_at;
    if (!dateStr) return true;

    const taskDate = new Date(dateStr);
    if (isNaN(taskDate.getTime())) return true;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'Today') {
      return taskDate >= startOfToday;
    }

    if (filter === 'This Week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return taskDate >= startOfWeek;
    }

    if (filter === 'Last Week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), diff);
      startOfThisWeek.setHours(0, 0, 0, 0);

      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

      return taskDate >= startOfLastWeek && taskDate < startOfThisWeek;
    }

    if (filter === 'This Month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return taskDate >= startOfMonth;
    }

    if (filter === 'This Year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return taskDate >= startOfYear;
    }

    return true;
  };

  const filtered = deliveries.filter((d) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      (d.order_number || '').toLowerCase().includes(term) ||
      (d.recipient_name || '').toLowerCase().includes(term) ||
      (d.task_id || '').toLowerCase().includes(term);

    let matchFilter = false;
    if (selectedFilter === 'All') matchFilter = true;
    else if (selectedFilter === 'Pending') matchFilter = d.status === 'ASSIGNED';
    else if (selectedFilter === 'Accepted') matchFilter = d.status === 'ASSIGNED' || d.status === 'ACCEPTED';
    else if (selectedFilter === 'Picked Up') matchFilter = d.status === 'PICKED_UP';
    else if (selectedFilter === 'Out for Delivery') matchFilter = d.status === 'IN_TRANSIT';
    else if (selectedFilter === 'Delivered') matchFilter = d.status === 'DELIVERED';
    else if (selectedFilter === 'Failed') matchFilter = d.status === 'FAILED';

    const matchTime = matchesTimeFilter(d, selectedTimeFilter);

    return matchSearch && matchFilter && matchTime;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1b4d3e] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Deliveries</h2>
          <p className="text-sm text-gray-500 font-medium">
            Manage assigned packages, view item contents, check ETA, and complete deliveries.
          </p>
        </div>
      </div>

      {/* Search & Operational Lifecycle Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center space-x-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
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

        {/* Date / Time Range Filters */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold text-gray-500 mr-2 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Time Period:</span>
          </div>

          {TIME_FILTERS.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeFilter(tf.id)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer shrink-0 border ${
                selectedTimeFilter === tf.id
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
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

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xs text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900">No deliveries found</h4>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {searchTerm || selectedFilter !== 'All'
              ? 'Try a different filter or search term.'
              : 'Parcels assigned by the warehouse will show up here.'}
          </p>
        </div>
      )}

      {/* Deliveries Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const label = STATUS_LABEL[item.status] || item.status;
          const cod = Number(item.cod_amount || 0);
          const amount = cod > 0 ? cod : Number(item.order_total || 0);
          const isCod = cod > 0;

          // Mock default items if order_items not present
          const itemsList = item.order_items && item.order_items.length > 0
            ? item.order_items
            : [
                { product_name: 'Noise Smart Watch', quantity: 1 },
                { product_name: 'Cotton Casual T-Shirt', quantity: 2 }
              ];
          const totalItemCount = item.items_count || itemsList.reduce((acc, i) => acc + i.quantity, 0);

          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3.5 hover:shadow-md transition-shadow relative"
            >
              {/* Card Header: Order #, Status, More Menu */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
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

                {/* 3-Dots Action Menu (Requirement 8) */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === item.id ? null : item.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === item.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-8 w-52 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 z-40 text-xs font-semibold text-gray-700 space-y-0.5 animate-in fade-in zoom-in-95"
                    >
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setOrderDetailsModalItem(item);
                        }}
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-left cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        <span>View Order</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setCustomerModalItem(item);
                        }}
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-left cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span>View Customer</span>
                      </button>

                      <a
                        href={`tel:${item.recipient_phone}`}
                        onClick={() => setActiveMenuId(null)}
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-left cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Call Customer</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.delivery_address || 'Mumbai')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setActiveMenuId(null)}
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-left cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Navigate</span>
                      </a>

                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          notify(`Reported issue for ${item.order_number}`);
                        }}
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-left text-rose-600 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Report Issue</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          setInstructionsModalItem(item);
                        }}
                        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-left cursor-pointer border-t border-gray-100"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Delivery Instructions</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expected Delivery & Dynamic Status ETA Box */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  item.status === 'DELIVERED'
                    ? 'bg-emerald-50/80 border-emerald-200/80'
                    : item.status === 'FAILED'
                      ? 'bg-rose-50/80 border-rose-200/80'
                      : item.status === 'IN_TRANSIT'
                        ? 'bg-[#1b4d3e]/10 border-emerald-300'
                        : 'bg-sky-50/80 border-sky-200/80'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-semibold text-[11px]">
                  {item.status === 'DELIVERED' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-900 font-bold">Successfully Delivered</span>
                    </>
                  ) : item.status === 'FAILED' ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="text-rose-900 font-bold">Delivery Failed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="text-sky-900">Expected: Today &middot; 2:30 PM</span>
                    </>
                  )}
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shadow-2xs ${
                    item.status === 'DELIVERED'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : item.status === 'FAILED'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : item.status === 'IN_TRANSIT'
                          ? 'bg-[#1b4d3e] text-white border-[#1b4d3e]'
                          : 'bg-white text-sky-900 border-sky-200'
                  }`}
                >
                  {item.status === 'DELIVERED'
                    ? 'Completed ✓'
                    : item.status === 'FAILED'
                      ? 'Failed ✕'
                      : item.status === 'IN_TRANSIT'
                        ? 'ETA: 25 min'
                        : label}
                </span>
              </div>

              {/* Requirement 4: Items Information Widget */}
              <div
                onClick={() => setItemsModalItem(item)}
                className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/80 flex items-center justify-between cursor-pointer hover:bg-emerald-50/60 transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-[#0B5E3C] shrink-0" />
                  <div>
                    <span className="text-xs font-black text-gray-900 block group-hover:text-[#0B5E3C]">
                      Package: 1 &middot; {totalItemCount} Items
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0B5E3C] flex items-center">
                  View Items →
                </span>
              </div>

              {/* Customer Details */}
              <div className="space-y-1">
                <h4 className="font-extrabold text-gray-900 text-sm">{item.recipient_name}</h4>
                <p className="text-xs text-gray-500 font-medium flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    {item.delivery_address}
                    {item.shipping_pincode ? ` - ${item.shipping_pincode}` : ''}
                  </span>
                </p>
              </div>

              {/* Requirement 5: Payment Formatting */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 font-semibold uppercase text-[10px] block">Payment</span>
                  <span className="font-black text-gray-900 text-sm">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                    isCod
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {isCod ? 'COD' : 'Prepaid ✓'}
                </span>
              </div>

              {/* Action Button */}
              {item.status !== 'DELIVERED' && item.status !== 'FAILED' && (
                <div className="pt-2">
                  {item.status === 'ASSIGNED' || item.status === 'PICKED_UP' ? (
                    <button
                      onClick={() => handleStart(item)}
                      disabled={busyId === item.id}
                      className="w-full bg-[#1b4d3e] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#0f382c] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
                    >
                      {busyId === item.id ? 'Starting...' : 'Start Delivery'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAdvance(item)}
                      disabled={busyId === item.id || item.current_stage >= 4}
                      className="w-full bg-[#ff5100] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#e64900] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
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

      {/* Requirement 4 Modal: Items Breakdown Modal */}
      {itemsModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">Package Details</span>
                <h3 className="text-lg font-black text-gray-900">Order #{itemsModalItem.order_number}</h3>
              </div>
              <button
                onClick={() => setItemsModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-2">
              <span className="text-xs font-bold text-gray-500 block">Package Items:</span>
              <ul className="space-y-2 text-sm font-bold text-gray-800 bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                {(itemsModalItem.order_items && itemsModalItem.order_items.length > 0
                  ? itemsModalItem.order_items
                  : [
                      { product_name: 'Noise Smart Watch', quantity: 1 },
                      { product_name: 'Cotton Casual T-Shirt', quantity: 2 }
                    ]
                ).map((itm, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0"></span>
                      {itm.product_name}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                      &times; {itm.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs font-black text-[#0B5E3C]">
              <span>Total Items: {itemsModalItem.items_count || 3}</span>
              <span>Package: 1</span>
            </div>

            <button
              onClick={() => setItemsModalItem(null)}
              className="w-full bg-[#1b4d3e] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-[#0f382c] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Customer Info Modal */}
      {customerModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Customer Details</h3>
              <button onClick={() => setCustomerModalItem(null)} className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-medium text-gray-700">
              <div>
                <span className="text-gray-400 block font-semibold">Name</span>
                <span className="text-sm font-extrabold text-gray-900">{customerModalItem.recipient_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Phone</span>
                <span className="text-sm font-bold text-emerald-800">{customerModalItem.recipient_phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Delivery Address</span>
                <span className="text-xs font-bold text-gray-800">{customerModalItem.delivery_address}</span>
              </div>
            </div>
            <button onClick={() => setCustomerModalItem(null)} className="w-full bg-[#1b4d3e] text-white py-2.5 rounded-xl font-bold text-xs">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delivery Instructions Modal */}
      {instructionsModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Delivery Instructions</h3>
              <button onClick={() => setInstructionsModalItem(null)} className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 font-bold space-y-2">
              <p>📌 Leave at security gate if customer unavailable.</p>
              <p>🔔 Ring bell twice before calling customer.</p>
            </div>
            <button onClick={() => setInstructionsModalItem(null)} className="w-full bg-[#1b4d3e] text-white py-2.5 rounded-xl font-bold text-xs">
              Understood
            </button>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {orderDetailsModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-black text-gray-900">Order #{orderDetailsModalItem.order_number}</h3>
              <button onClick={() => setOrderDetailsModalItem(null)} className="p-1 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-semibold text-gray-700">
              <p>Status: <span className="font-extrabold text-emerald-800">{STATUS_LABEL[orderDetailsModalItem.status] || orderDetailsModalItem.status}</span></p>
              <p>Amount: <span className="font-black text-gray-900">₹{Number(orderDetailsModalItem.order_total || 0).toLocaleString('en-IN')}</span></p>
              <p>OTP Required: <span className="font-mono font-bold text-amber-800">{orderDetailsModalItem.delivery_otp || '----'}</span></p>
            </div>
            <button onClick={() => setOrderDetailsModalItem(null)} className="w-full bg-[#1b4d3e] text-white py-2.5 rounded-xl font-bold text-xs">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
