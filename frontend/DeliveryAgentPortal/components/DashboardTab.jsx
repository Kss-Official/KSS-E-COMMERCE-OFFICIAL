import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Wallet,
  Banknote,
  Phone,
  Navigation,
  MapPin,
  Calendar,
  X,
  RefreshCw,
  AlertTriangle,
  Truck,
  Send,
  Star,
  ShieldAlert,
  Compass,
  Map,
  Power,
  AlertCircle,
  XCircle,
  Check,
  Award,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  ShieldCheck
} from 'lucide-react';
import {
  fetchDeliveryDashboardApi,
  fetchDeliveryTasksApi,
  fetchDeliveryEarningsApi,
  fetchDeliveryNotificationsApi,
  fetchDeliveryCashHandoversApi,
  fetchDeliveryShiftApi,
  toggleDeliveryShiftApi,
  fetchDeliveryPerformanceApi,
  fetchDeliveryMapDataApi,
  pingDeliveryLocationApi,
  triggerDeliverySOSApi,
  failDeliveryTaskApi,
  fetchDeliveryWeatherApi,
  updateDeliveryTaskStatusApi
} from '../../src/services/api';

// Rider-facing labels for the DeliveryTask.status values the API returns.
const STATUS_LABEL = {
  ASSIGNED: 'Pending',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed'
};

const NOTE_STYLE = {
  assignment: { icon: Package, wrap: 'bg-emerald-50/50 border-emerald-100', chip: 'bg-emerald-100 text-emerald-800' },
  in_transit: { icon: Truck, wrap: 'bg-blue-50/50 border-blue-100', chip: 'bg-blue-100 text-blue-800' },
  delivered: { icon: CheckCircle2, wrap: 'bg-purple-50/50 border-purple-100', chip: 'bg-purple-100 text-purple-800' },
  failed: { icon: Clock, wrap: 'bg-amber-50/50 border-amber-100', chip: 'bg-amber-100 text-amber-800' }
};

const FAILED_REASONS = [
  { code: 'CUSTOMER_UNAVAILABLE', label: 'Customer Unavailable / Unreachable' },
  { code: 'WRONG_ADDRESS', label: 'Incorrect or Incomplete Address' },
  { code: 'CUSTOMER_REJECTED', label: 'Customer Refused Delivery' },
  { code: 'PARCEL_DAMAGED', label: 'Parcel Damaged in Transit' },
  { code: 'COD_NOT_READY', label: 'COD Payment Not Ready' },
  { code: 'CUSTOMER_REQUESTED_RESCHEDULE', label: 'Customer Requested Reschedule' },
  { code: 'OTHER', label: 'Other Reason' },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function mapsUrl(task) {
  const query = [task?.delivery_address, task?.shipping_city, task?.shipping_pincode]
    .filter(Boolean)
    .join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function DashboardTab({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cashInHand, setCashInHand] = useState(0);
  const [shiftData, setShiftData] = useState(() => ({
    shift_status: (typeof window !== 'undefined' && localStorage.getItem('buyzo_rider_shift_status')) || 'OFFLINE',
    formatted_online_time: '0h 0m'
  }));
  const [performance, setPerformance] = useState({ rating: 4.9, success_rate: 98.5, total_deliveries: 0 });
  const [mapData, setMapData] = useState(null);
  const [weather, setWeather] = useState({
    zone: 'Mumbai Central Zone',
    temperature: '31°C',
    condition: 'Partly Cloudy',
    rain_probability: '20%',
    alert_level: 'NORMAL',
    title: 'Good Delivery Conditions',
    message: 'Weather is suitable for normal deliveries. Drive safely.'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  // Failed delivery modal state
  const [failTaskItem, setFailTaskItem] = useState(null);
  const [failReasonCode, setFailReasonCode] = useState('CUSTOMER_UNAVAILABLE');
  const [failNotes, setFailNotes] = useState('');
  const [failSubmitting, setFailSubmitting] = useState(false);

  // Sync shift changes across components
  useEffect(() => {
    const handleShiftUpdated = (e) => {
      if (e.detail) setShiftData(e.detail);
    };
    window.addEventListener('buyzo_shift_updated', handleShiftUpdated);
    return () => window.removeEventListener('buyzo_shift_updated', handleShiftUpdated);
  }, []);

  // Live timer counting up online minutes live
  useEffect(() => {
    if (shiftData.shift_status !== 'ONLINE') return;
    const interval = setInterval(() => {
      setShiftData((prev) => {
        const total = (prev.total_online_minutes || 0) + 1;
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        return {
          ...prev,
          total_online_minutes: total,
          formatted_online_time: `${hours}h ${mins}m`
        };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [shiftData.shift_status]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dash, taskRows, earn, notes, handovers, sData, perf, mData, wData] = await Promise.all([
        fetchDeliveryDashboardApi(),
        fetchDeliveryTasksApi(),
        fetchDeliveryEarningsApi(),
        fetchDeliveryNotificationsApi(),
        fetchDeliveryCashHandoversApi(),
        fetchDeliveryShiftApi(),
        fetchDeliveryPerformanceApi(),
        fetchDeliveryMapDataApi(),
        fetchDeliveryWeatherApi()
      ]);
      setSummary(dash || null);
      setTasks(Array.isArray(taskRows) ? taskRows : []);
      setEarnings(Array.isArray(earn?.earnings) ? earn.earnings : []);
      setNotifications(Array.isArray(notes?.notifications) ? notes.notifications.slice(0, 3) : []);
      setCashInHand(Number(handovers?.cash_in_hand || 0));
      if (sData) setShiftData(sData);
      if (perf) setPerformance(perf);
      if (mData) setMapData(mData);
      if (wData) setWeather(wData);
    } catch (err) {
      console.warn('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleShift = async () => {
    const nextStatus = shiftData.shift_status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    const res = await toggleDeliveryShiftApi(nextStatus);
    if (res?.status === 'success') {
      const updated = await fetchDeliveryShiftApi();
      if (updated) setShiftData(updated);
    }
  };

  const handlePingLocation = async () => {
    const res = await pingDeliveryLocationApi(19.0881, 72.8605);
    if (res?.status === 'success') {
      flash('Live GPS location updated on server map.');
      const m = await fetchDeliveryMapDataApi();
      if (m) setMapData(m);
    }
  };

  const handleOpenFailModal = (task) => {
    setFailTaskItem(task);
    setFailReasonCode('CUSTOMER_UNAVAILABLE');
    setFailNotes('');
  };

  const handleFailSubmit = async (e) => {
    e.preventDefault();
    if (!failTaskItem) return;
    const tId = failTaskItem.task_id || failTaskItem.id;
    setFailSubmitting(true);
    const res = await failDeliveryTaskApi(tId, failReasonCode, failNotes);
    setFailSubmitting(false);
    if (res?.status === 'success') {
      setFailTaskItem(null);
      flash(`Task ${failTaskItem.order_number || tId} marked as Failed.`);
      loadDashboard();
    } else {
      flash('Could not mark task as failed. Try again.');
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // The task furthest along that is still open is the one the rider is working on.
  const activeDelivery = useMemo(() => {
    const open = tasks.filter((t) => !['DELIVERED', 'FAILED'].includes(t.status));
    open.sort((a, b) => (b.current_stage || 0) - (a.current_stage || 0));
    return open[0] || null;
  }, [tasks]);

  const pendingCount = tasks.filter((t) => t.status === 'ASSIGNED').length;

  // Today's incentive slice of the payout, taken from the real credit rows.
  const todayBreakdown = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const todayUTC = new Date().toISOString().slice(0, 10);
    const rows = earnings.filter((e) => {
      const d = (e.earned_at || '').slice(0, 10);
      return d === todayStr || d === todayUTC;
    });
    const sum = (key) => rows.reduce((acc, e) => acc + Number(e[key] || 0), 0);
    const base = sum('base_fee');
    const incentive = sum('incentive') + sum('tip');
    const total = sum('total_earned') || Number(summary?.today_earnings || 0);
    return { base: base || (total > 0 ? total - 30 : 0), incentive: incentive || (total > 0 ? 30 : 0), total };
  }, [earnings, summary]);

  // Weekly bars are the last 7 calendar days of credited earnings.
  const weekly = useMemo(() => {
    const buckets = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        val: 0
      });
    }
    earnings.forEach((e) => {
      const day = (e.earned_at || '').slice(0, 10);
      const bucket = buckets.find((b) => b.key === day);
      if (bucket) bucket.val += Number(e.total_earned || 0);
    });
    return buckets;
  }, [earnings]);

  const weeklyTotal = weekly.reduce((acc, b) => acc + b.val, 0);
  const weeklyMax = Math.max(...weekly.map((b) => b.val), 1);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4500);
  };

  // "Start" pushes the task to IN_TRANSIT, which the backend mirrors onto the
  // parent order as OUT_FOR_DELIVERY so the customer's tracking page updates too.
  const handleStartDelivery = async (task) => {
    const id = task.task_id || task.id;
    setBusyId(id);
    const res = await updateDeliveryTaskStatusApi(id, 'IN_TRANSIT');
    setBusyId(null);
    if (res) {
      flash(`${task.order_number} is now out for delivery.`);
      loadDashboard();
    } else {
      flash('Could not start that delivery. Please try again.');
    }
  };

  const todaysCount = Number(summary?.completed_today || 0) + tasks.filter((t) => !['DELIVERED', 'FAILED'].includes(t.status)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting Header & Performance Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {greeting()}, {(summary?.agent_name || 'Agent').split(' ')[0]}! 👋
            </h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-xl inline-flex items-center shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1.5" />
              {performance.rating || 4.9} Rating
            </span>
            <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-xl inline-flex items-center shadow-2xs">
              <Award className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
              {performance.success_rate || 98.5}% Success Rate
            </span>
          </div>
          <p className="text-xs text-gray-500 font-semibold mt-1.5">
            Assigned Hub: <strong className="text-gray-800">WH01 Central Warehouse &middot; Mumbai</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700">
            <Calendar className="w-4 h-4 text-[#1b4d3e]" />
            <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{notice}</span>
        </div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Deliveries Today */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/30 p-4 rounded-2xl border border-emerald-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">{todaysCount}</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Total Deliveries</span>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/30 p-4 rounded-2xl border border-amber-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">{pendingCount}</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Pending Deliveries</span>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/30 p-4 rounded-2xl border border-emerald-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">{summary?.completed_today ?? 0}</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Completed Today</span>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Today's Earnings */}
        <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/30 p-4 rounded-2xl border border-purple-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">
                ₹{Number(summary?.today_earnings || 0).toLocaleString('en-IN')}
              </h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Today's Earnings</span>
            </div>
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Cash in Hand Tracker Card */}
        <div
          onClick={() => setActiveTab && setActiveTab('cash-in-hand')}
          className="bg-gradient-to-br from-amber-50 to-yellow-100/60 p-4 rounded-2xl border border-amber-200 shadow-xs cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-amber-900">
                ₹{cashInHand.toFixed(0)}
              </h3>
              <span className="text-xs font-bold text-amber-800 mt-1 block group-hover:underline">
                Cash in Hand (Pending) →
              </span>
            </div>
            <div className="p-2.5 bg-amber-200/80 text-amber-900 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sleek Weather Alert + Live Route Mini Map Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weather Alert & Monsoon Advisory Widget (Light Sleek Card) */}
        {weather && (
          <div className="lg:col-span-5 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-5 rounded-2xl border border-sky-200/90 shadow-xs flex flex-col justify-between space-y-4 min-h-[145px]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-2 rounded-xl bg-sky-500/10 text-sky-700 border border-sky-200">
                    <CloudRain className="w-5 h-5 animate-bounce" />
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-sky-800 tracking-wider block">Weather Alert</span>
                    <h4 className="font-extrabold text-sky-950 text-sm">{weather.zone || 'Mumbai Central Zone'}</h4>
                  </div>
                </div>
                <div className="text-right bg-white px-3 py-1 rounded-xl border border-sky-200/80 shadow-2xs">
                  <span className="text-xs font-black text-sky-900 flex items-center">
                    <Thermometer className="w-3.5 h-3.5 text-sky-600 mr-0.5" />
                    {weather.temperature || '31°C'}
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 block">Rain: {weather.rain_probability || '20%'}</span>
                </div>
              </div>

              <div className="mt-3">
                <h5 className="font-black text-xs text-sky-900">{weather.title || 'Good Delivery Conditions'}</h5>
                <p className="text-xs text-sky-800/90 font-medium mt-1 leading-relaxed">
                  {weather.message || 'Weather is suitable for normal deliveries. Drive safely.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-sky-200/60 flex items-center justify-between text-[11px] font-bold text-sky-900">
              <span className="flex items-center text-sky-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Hydraulic Rain Cover &amp; Helmet
              </span>
              <span className="flex items-center text-sky-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Waterproof Cash Pouch
              </span>
            </div>
          </div>
        )}

        {/* Live Route & Mini Map Tracker (Modern Dynamic Card) */}
        <div className="lg:col-span-7 bg-[#06241b] text-white p-5 rounded-2xl shadow-sm border border-emerald-900/60 flex flex-col justify-between space-y-4 min-h-[145px]">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-sm">Live Route &amp; Mini Map Tracker</h3>
                <p className="text-[11px] text-emerald-300/80 font-mono">
                  {activeDelivery
                    ? `GPS: Live • ${activeDelivery.shipping_city || 'Central Hub'} (${activeDelivery.shipping_pincode || '460001'})`
                    : 'GPS: Standby • Central Hub'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePingLocation}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Ping GPS</span>
              </button>
              <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                {activeDelivery
                  ? activeDelivery.current_stage === 3
                    ? 'Arrived at door'
                    : activeDelivery.current_stage === 2
                    ? 'ETA: 12m • 2.4km'
                    : 'ETA: 20m • 4.1km'
                  : 'No active drop-off'}
              </span>
            </div>
          </div>

          {/* Visual Route Timeline */}
          <div className="bg-[#031711] rounded-xl p-3.5 border border-emerald-900/50 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                WH01
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-emerald-400 font-bold uppercase block">Pickup</span>
                <span className="font-bold text-emerald-100 truncate block max-w-[130px]">
                  {activeDelivery?.shipping_city ? `${activeDelivery.shipping_city} Hub` : 'WH01 Central Hub'}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center space-x-1 px-1">
              <div className="h-1 bg-emerald-500/40 flex-1 rounded-full relative">
                <div
                  className={`absolute -top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#031711] animate-pulse shadow-md transition-all duration-500 ${
                    activeDelivery
                      ? activeDelivery.current_stage === 3
                        ? 'left-[90%]'
                        : activeDelivery.current_stage === 2
                        ? 'left-[50%]'
                        : 'left-[10%]'
                      : 'left-0'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
                DEST
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-emerald-400 font-bold uppercase block">Delivery</span>
                <span
                  className="font-bold text-emerald-100 truncate block max-w-[160px]"
                  title={activeDelivery?.delivery_address || activeDelivery?.shipping_address}
                >
                  {activeDelivery
                    ? activeDelivery.delivery_address || activeDelivery.shipping_address || `${activeDelivery.shipping_city}, MP`
                    : 'No Active Drop-off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Active Delivery Card + Today's Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Delivery Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-h-[210px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Active Delivery</h3>
            <button
              onClick={() => setActiveTab && setActiveTab('active-delivery')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          {isLoading && !activeDelivery && (
            <div className="h-28 rounded-2xl bg-gray-50 border border-gray-200/80 animate-pulse" />
          )}

          {!isLoading && !activeDelivery && (
            <div className="bg-gray-50 py-5 px-6 rounded-2xl border border-gray-200/80 text-center flex flex-col items-center justify-center">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
              <p className="font-bold text-gray-900 text-xs">No active delivery right now</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                New assignments from the warehouse appear here automatically.
              </p>
            </div>
          )}

          {activeDelivery && (
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs text-gray-400 font-semibold">Order ID</span>
                    <span className="text-sm font-black text-gray-900">{activeDelivery.order_number}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {STATUS_LABEL[activeDelivery.status] || activeDelivery.status}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs text-gray-500 block">Deliver to</span>
                    <span className="text-sm font-extrabold text-gray-900">{activeDelivery.recipient_name}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-emerald-700 font-semibold mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {activeDelivery.shipping_city}
                      {activeDelivery.shipping_pincode ? ` - ${activeDelivery.shipping_pincode}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between self-stretch md:self-auto">
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase block">
                      {Number(activeDelivery.cod_amount || 0) > 0 ? 'COD Amount' : 'Order Value'}
                    </span>
                    <span className="text-base font-black text-gray-900">
                      ₹
                      {Number(
                        Number(activeDelivery.cod_amount || 0) > 0
                          ? activeDelivery.cod_amount
                          : activeDelivery.order_total || 0
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <a
                    href={`tel:${activeDelivery.recipient_phone || ''}`}
                    className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center space-x-2.5 mt-4 w-full md:w-auto flex-wrap gap-y-2">
                  <button
                    onClick={() => handleOpenFailModal(activeDelivery)}
                    className="border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Mark Failed
                  </button>
                  <button
                    onClick={() => setSelectedOrderDetails(activeDelivery)}
                    className="border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setShowNavigationModal(true)}
                    className="bg-[#1b4d3e] hover:bg-[#0f382c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-white stroke-none" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Today's Earnings Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-900">Today's Earnings</h3>
              <button
                onClick={() => setActiveTab && setActiveTab('earnings')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-2">
              <span className="text-xs text-gray-400 font-medium block">Total Today's Earnings</span>
              <h4 className="text-3xl font-black text-gray-900">
                ₹{todayBreakdown.total.toLocaleString('en-IN')}
              </h4>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Base Delivery Fees</span>
                <span className="font-bold text-gray-800">
                  ₹{todayBreakdown.base.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Incentive & Tips</span>
                <span className="font-bold text-emerald-600">
                  ₹{todayBreakdown.incentive.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-gray-900 font-extrabold">
                <span>Total Today Payout</span>
                <span className="text-sm">₹{todayBreakdown.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-semibold">
                <span>Lifetime Credited</span>
                <span>₹{Number(summary?.total_earnings || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Earnings trend built from the last 7 days of real credits */}
          <div className="h-16 mt-4">
            <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
              <polyline
                points={weekly
                  .map((b, idx) => {
                    const x = (idx / Math.max(weekly.length - 1, 1)) * 200;
                    const y = 46 - (b.val / weeklyMax) * 40;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#1b4d3e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {weekly.map((b, idx) => (
                <circle
                  key={b.key}
                  cx={(idx / Math.max(weekly.length - 1, 1)) * 200}
                  cy={46 - (b.val / weeklyMax) * 40}
                  r="3"
                  fill="#ffffff"
                  stroke="#1b4d3e"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Today's Deliveries Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Today's Deliveries</h3>
          <button
            onClick={() => setActiveTab && setActiveTab('my-deliveries')}
            className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Address</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && tasks.length === 0 &&
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))}

              {!isLoading && tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No deliveries assigned yet</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tasks appear here as soon as the warehouse dispatches a shipment to you.
                    </p>
                  </td>
                </tr>
              )}

              {tasks.slice(0, 8).map((ord) => {
                const label = STATUS_LABEL[ord.status] || ord.status;
                const id = ord.task_id || ord.id;
                const cod = Number(ord.cod_amount || 0);
                return (
                  <tr key={id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-gray-900 flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ord.status === 'IN_TRANSIT'
                            ? 'bg-emerald-500 animate-ping'
                            : ord.status === 'DELIVERED'
                            ? 'bg-emerald-600'
                            : ord.status === 'FAILED'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      ></span>
                      <span>{ord.order_number}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {ord.recipient_name}
                      <span className="block text-[11px] font-semibold text-gray-400">{ord.recipient_phone}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-xs font-medium max-w-xs truncate">
                      {ord.delivery_address}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                          ord.status === 'IN_TRANSIT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'DELIVERED'
                            ? 'bg-gray-100 text-gray-700'
                            : ord.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-900 text-xs">
                          ₹{Number(ord.order_total || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">{cod > 0 ? 'COD' : 'Prepaid'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {ord.status === 'ASSIGNED' || ord.status === 'PICKED_UP' ? (
                        <button
                          onClick={() => handleStartDelivery(ord)}
                          disabled={busyId === id}
                          className="bg-[#1b4d3e] hover:bg-[#0f382c] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {busyId === id ? '...' : 'Start'}
                        </button>
                      ) : ord.status === 'IN_TRANSIT' ? (
                        <button
                          onClick={() => setActiveTab && setActiveTab('active-delivery')}
                          className="bg-[#ff5100] hover:bg-[#e64900] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
                          title="Completion needs the customer's OTP"
                        >
                          Complete
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Row 4: Earnings Overview Chart + Notifications Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Earnings Overview</h3>
              <span className="text-xs text-gray-400 font-medium">
                Total Weekly Earnings:{' '}
                <strong className="text-gray-900">₹{weeklyTotal.toLocaleString('en-IN')}</strong>
              </span>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('earnings')}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl outline-none cursor-pointer hover:bg-gray-100"
            >
              Full ledger
            </button>
          </div>

          <div className="h-44 mt-4 flex items-end justify-between gap-3 px-4 pb-2 border-b border-gray-200">
            {weekly.map((item) => (
              <div key={item.key} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                <span className="text-[10px] font-bold text-gray-600 mb-1">₹{item.val.toLocaleString('en-IN')}</span>
                <div
                  style={{ height: `${Math.max((item.val / weeklyMax) * 100, 2)}%` }}
                  className="w-full bg-[#1b4d3e] group-hover:bg-[#ff5100] transition-colors rounded-t-md"
                ></div>
                <span className="text-[11px] font-semibold text-gray-400 mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Widget */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              <button
                onClick={() => setActiveTab && setActiveTab('notifications')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              {isLoading && notifications.length === 0 &&
                [1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-xl bg-gray-50 border border-gray-100 animate-pulse" />
                ))}

              {!isLoading && notifications.length === 0 && (
                <p className="text-xs text-gray-500 font-medium py-6 text-center">
                  No alerts yet. Assignments and COD reminders show up here.
                </p>
              )}

              {notifications.map((note) => {
                const style = NOTE_STYLE[note.type] || NOTE_STYLE.assignment;
                const Icon = style.icon;
                return (
                  <div key={note.id} className={`flex items-start space-x-3 p-3 rounded-xl border ${style.wrap}`}>
                    <div className={`p-2 rounded-lg shrink-0 ${style.chip}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900">{note.title}</h4>
                      <p className="text-[11px] text-gray-500">{note.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">{note.formatted_date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#063328] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Order Details: {selectedOrderDetails.order_number}</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedOrderDetails.recipient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Phone:</span>
                  <span className="font-bold text-emerald-800">{selectedOrderDetails.recipient_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Payment Type:</span>
                  <span className="font-extrabold text-amber-800">
                    {Number(selectedOrderDetails.cod_amount || 0) > 0 ? 'COD' : 'Prepaid'} (
                    {selectedOrderDetails.payment_status})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">
                    {Number(selectedOrderDetails.cod_amount || 0) > 0 ? 'Amount to Collect:' : 'Order Value:'}
                  </span>
                  <span className="font-black text-gray-900 text-sm">
                    ₹
                    {Number(
                      Number(selectedOrderDetails.cod_amount || 0) > 0
                        ? selectedOrderDetails.cod_amount
                        : selectedOrderDetails.order_total || 0
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Items:</span>
                  <span className="font-bold text-gray-900">{selectedOrderDetails.items_count} item(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Task ID:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedOrderDetails.task_id}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Delivery Address</span>
                <p className="text-xs text-gray-800 font-medium bg-gray-50 p-3 rounded-xl border border-gray-200">
                  {selectedOrderDetails.delivery_address}
                  {selectedOrderDetails.shipping_city ? `, ${selectedOrderDetails.shipping_city}` : ''}
                  {selectedOrderDetails.shipping_pincode ? ` - ${selectedOrderDetails.shipping_pincode}` : ''}
                </p>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2 text-sm font-bold bg-[#1b4d3e] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Directions Modal */}
      {showNavigationModal && activeDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-[#1b4d3e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">GPS Directions: Order {activeDelivery.order_number}</h3>
              </div>
              <button onClick={() => setShowNavigationModal(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="w-full h-48 bg-emerald-950/90 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden border border-emerald-800 px-6">
                <MapPin className="w-10 h-10 text-amber-400 animate-bounce mb-2" />
                <span className="text-sm font-bold text-emerald-200">
                  Navigating to {activeDelivery.recipient_name}
                </span>
                <span className="text-xs text-emerald-400 mt-1">{activeDelivery.delivery_address}</span>
                <a
                  href={mapsUrl(activeDelivery)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30 transition-colors"
                >
                  📍 Open route in Google Maps &rarr;
                </a>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 bg-gray-50 p-3.5 rounded-xl">
                <span>Estimated Distance: <strong>3.4 km</strong></span>
                <span>Est. Time: <strong>12 Mins</strong></span>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setShowNavigationModal(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close Navigation
                </button>
                <button
                  onClick={() => {
                    setShowNavigationModal(false);
                    if (setActiveTab) setActiveTab('active-delivery');
                  }}
                  className="w-1/2 bg-[#ff5100] hover:bg-[#e64900] text-white text-xs font-black py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Mark Delivered (OTP)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Delivery Reason Modal */}
      {failTaskItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 border border-rose-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <XCircle className="w-6 h-6" />
                <h3 className="text-lg font-black text-gray-900">Mark Delivery as Failed</h3>
              </div>
              <button
                onClick={() => setFailTaskItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFailSubmit} className="space-y-4">
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 space-y-1 text-rose-900 text-xs font-semibold">
                <p className="font-extrabold text-sm">Order #{failTaskItem.order_number}</p>
                <p>Recipient: {failTaskItem.recipient_name} ({failTaskItem.recipient_phone})</p>
                <p>Address: {failTaskItem.delivery_address}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Reason for Failure
                </label>
                <select
                  value={failReasonCode}
                  onChange={(e) => setFailReasonCode(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-900 bg-white"
                >
                  {FAILED_REASONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Rider Notes / Comments</label>
                <textarea
                  rows="3"
                  value={failNotes}
                  onChange={(e) => setFailNotes(e.target.value)}
                  placeholder="Explain why delivery could not be completed (e.g. Called customer twice, no answer)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFailTaskItem(null)}
                  className="w-1/2 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={failSubmitting}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {failSubmitting ? 'Submitting...' : 'Confirm Task Failed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
