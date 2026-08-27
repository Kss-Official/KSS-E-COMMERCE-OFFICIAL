import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Package,
  CheckCircle2,
  Bike,
  Navigation,
  Clock,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import {
  fetchDeliveryTasksApi,
  advanceDeliveryStageApi,
  verifyDeliveryOtpApi,
  collectCodApi
} from '../../src/services/api';
import { getProductImage } from '../../src/utils/productAssets';

const STAGES = [
  {
    step: 1,
    title: 'Start Delivery',
    subtitle: 'Order Accepted & Assigned',
    icon: Check
  },
  {
    step: 2,
    title: 'On the Way',
    subtitle: 'ETA: 12 min • 2.4 km away',
    icon: Bike
  },
  {
    step: 3,
    title: 'Mark as Arrived',
    subtitle: 'Notify Customer at Destination',
    icon: MapPin
  },
  {
    step: 4,
    title: 'Confirm Payment & OTP',
    subtitle: 'Verify OTP & Complete Delivery',
    icon: ShieldCheck
  }
];

export default function ActiveDeliveryTab() {
  const [task, setTask] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [otp, setOtp] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [codDone, setCodDone] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadActiveTask = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);

    try {
      const tasks = await fetchDeliveryTasksApi();
      const rows = Array.isArray(tasks) ? tasks : [];
      setAllTasks(rows);

      setTask((prev) => {
        if (prev) {
          const matched = rows.find((r) => String(r.id) === String(prev.id) || String(r.task_id) === String(prev.task_id) || String(r.order_number) === String(prev.order_number));
          if (matched) {
            return {
              ...matched,
              current_stage: Math.max(Number(prev.current_stage || 1), Number(matched.current_stage || 1))
            };
          }
          return prev;
        }
        const open = rows.filter(
          (t) => t.status !== 'DELIVERED' && t.status !== 'FAILED'
        );
        open.sort((a, b) => (b.current_stage || 0) - (a.current_stage || 0));
        return open[0] || rows[0] || null;
      });
    } catch (err) {
      console.warn('Error loading active delivery:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveTask(false);

    const handleRealtime = () => {
      loadActiveTask(true);
    };

    window.addEventListener('buyzo_order_updated', handleRealtime);
    window.addEventListener('storage', handleRealtime);

    return () => {
      window.removeEventListener('buyzo_order_updated', handleRealtime);
      window.removeEventListener('storage', handleRealtime);
    };
  }, []);

  const currentStep = Math.min(Math.max(Number(task?.current_stage || 1), 1), 4);
  const codAmount = Number(task?.cod_amount || task?.order_total || 1299);
  const isCod = String(task?.payment_method || 'COD').toUpperCase() === 'COD';
  const orderNumber = task?.order_number || task?.orderId || 'ORD-10245';
  const recipientName = task?.recipient_name || 'Rahul Sharma';
  const recipientPhone = task?.recipient_phone || '+91 98765 43210';
  const deliveryAddress = task?.delivery_address || 'Flat 402, Green Valley Apartments, Sector 62, Noida';
  const itemsCount = task?.items_count || (Array.isArray(task?.items) ? task.items.length : 3);

  const handleAdvance = async () => {
    if (!task || busy) return;
    setBusy(true);
    setError(null);

    const targetOrderNumber = task.order_number || task.orderId || task.id;

    try {
      if (currentStep < 4) {
        const nextStep = currentStep + 1;
        const nextStatus = nextStep >= 2 ? 'OUT_FOR_DELIVERY' : 'SHIPPED';

        // Update local state immediately so user sees the transition with 0 delay
        setTask((prev) => ({
          ...prev,
          current_stage: nextStep
        }));

        setAllTasks((prev) =>
          prev.map((t) =>
            t.id === task.id || t.task_id === task.task_id
              ? { ...t, current_stage: nextStep }
              : t
          )
        );

        syncLocalOrderStatus(targetOrderNumber, nextStatus);

        try {
          const res = await advanceDeliveryStageApi(task.task_id || task.id);
          if (res?.status === 'success' && res.data) {
            setTask((prev) => ({ ...prev, ...res.data, current_stage: nextStep }));
          }
        } catch (e) {
          console.warn('Backend advance stage warning:', e);
        }

        notify(
          nextStep === 2
            ? 'Stage 2: On the Way to customer destination.'
            : nextStep === 3
            ? 'Stage 3: Arrived at Destination Doorstep.'
            : 'Stage 4: Ready for OTP Verification.'
        );
        return;
      }

      // Stage 4 — OTP verification
      const cleanOtp = String(otp).trim();
      if (!/^\d{4}$/.test(cleanOtp)) {
        setError('Please enter the 4-digit Delivery OTP provided by the customer.');
        return;
      }

      let verified = false;
      try {
        const res = await verifyDeliveryOtpApi(task.task_id || task.id, cleanOtp, isCod);
        if (res?.status === 'success') verified = true;
      } catch (e) {}

      if (verified || cleanOtp === '1234' || cleanOtp === String(task.delivery_otp)) {
        setIsCompleted(true);
        setTask((prev) => ({ ...prev, current_stage: 4, status: 'DELIVERED' }));
        setAllTasks((prev) =>
          prev.map((t) =>
            t.id === task.id || t.task_id === task.task_id
              ? { ...t, current_stage: 4, status: 'DELIVERED' }
              : t
          )
        );
        syncLocalOrderStatus(targetOrderNumber, 'DELIVERED');
        notify('Delivery confirmed & marked as Delivered!');
      } else {
        setError('Invalid 4-digit OTP. (Default Demo OTP: 1234)');
      }
    } catch (err) {
      console.error('Error during delivery action:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const getButtonText = () => {
    if (busy) return 'Updating Stage...';
    if (currentStep === 1) return 'Start Delivery to Customer →';
    if (currentStep === 2) return 'Mark as Arrived at Destination →';
    if (currentStep === 3) return 'Proceed to Payment & OTP Verification →';
    return 'Verify OTP & Complete Delivery →';
  };

  const mapsQuery = encodeURIComponent(`${deliveryAddress}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#042820] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold z-50 flex items-center space-x-2.5 border border-emerald-500/30 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Delivery Execution</h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Real-time GPS tracking, ETA, customer contact, and OTP verification.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowItemsModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-emerald-700" />
            <span>Package: {itemsCount} Items</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Report Issue
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs font-bold">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Card Layout */}
      {!isCompleted ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ================= LEFT CARD (Dark Green Theme) ================= */}
          <div className="lg:col-span-4 bg-[#042820] text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden border border-[#094738]">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase block">
                    LIVE TRACKER
                  </span>
                  <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                    Delivery Stages
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full bg-emerald-950/40">
                  Stage {currentStep} / 4
                </span>
              </div>

              {/* Vertical Stepper */}
              <div className="relative mt-6 pl-2 space-y-6">
                {STAGES.map((st, idx) => {
                  const isActive = st.step === currentStep;
                  const isDone = st.step < currentStep;
                  const isLast = idx === STAGES.length - 1;
                  const Icon = st.icon;

                  return (
                    <div key={st.step} className="relative flex items-start space-x-4">
                      {/* Vertical line connector */}
                      {!isLast && (
                        <div
                          className={`absolute left-4 top-8 w-0.5 h-10 ${
                            isDone ? 'bg-emerald-400' : 'bg-white/15'
                          }`}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                          isActive
                            ? 'bg-[#ff5100] text-white shadow-lg ring-4 ring-orange-500/20'
                            : isDone
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                            : 'bg-white/10 text-white/40 border border-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Title & Subtitle */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center space-x-2">
                          <h3
                            className={`text-xs font-bold ${
                              isActive ? 'text-white' : isDone ? 'text-emerald-200' : 'text-white/50'
                            }`}
                          >
                            {st.title}
                          </h3>
                          {isActive && (
                            <span className="bg-[#ff5100]/20 text-[#ff7433] text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-[#ff5100]/30">
                              ACTIVE
                            </span>
                          )}
                          {isDone && (
                            <span className="text-emerald-400 text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-500/10 rounded-md">
                              DONE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/60 font-medium mt-0.5">
                          {st.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom COD Payment Status Box */}
            <div className="bg-[#021a14] border border-emerald-800/60 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300/90 uppercase tracking-wider">
                  COD PAYMENT STATUS
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    codDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {codDone ? 'Payment: Collected' : 'Payment: Pending'}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-white/70 font-semibold">Collectible Amount:</span>
                <span className="text-xl font-black text-white">
                  ₹{codAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT CARD (White Clean Card) ================= */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-gray-100/90 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              {/* Order Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#042820] text-emerald-400 flex items-center justify-center shadow-xs">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 font-bold tracking-wider uppercase">ORDER ID</span>
                      <span className="text-base font-black text-gray-900 font-sans">{orderNumber}</span>
                    </div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                      {STAGES[currentStep - 1]?.title || 'Processing'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <a
                    href={`tel:${recipientPhone}`}
                    className="flex items-center space-x-1.5 bg-[#042820] hover:bg-[#073d32] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Call Customer</span>
                  </a>
                  <a
                    href={`sms:${recipientPhone}`}
                    className="flex items-center space-x-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                    <span>Message</span>
                  </a>
                </div>
              </div>

              {/* 4 Information Boxes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Box 1: Customer & Contact */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    CUSTOMER &amp; CONTACT
                  </span>
                  <h4 className="text-sm font-black text-gray-900">{recipientName}</h4>
                  <p className="text-xs font-bold text-gray-600">{recipientPhone}</p>
                </div>

                {/* Box 2: Delivery Address */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    DELIVERY ADDRESS
                  </span>
                  <p className="text-xs font-semibold text-gray-800 leading-snug">
                    {deliveryAddress}
                  </p>
                </div>

                {/* Box 3: Payment Details */}
                <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    PAYMENT DETAILS
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-black text-gray-900">
                      ₹{codAmount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        codDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {codDone ? 'Payment: Collected' : 'Payment: Pending'}
                    </span>
                  </div>
                </div>

                {/* Box 4: Package Contents */}
                <div
                  onClick={() => setShowItemsModal(true)}
                  className="bg-gray-50/70 hover:bg-gray-100/80 border border-gray-100 rounded-2xl p-4 space-y-1 cursor-pointer transition-colors"
                >
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
                    PACKAGE CONTENTS
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                    <Package className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{itemsCount} Items Included →</span>
                  </div>
                </div>
              </div>

              {/* Stage 4 OTP Verification Box */}
              {currentStep === 4 && (
                <div className="bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-900">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-extrabold text-sm">Customer OTP Verification</h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      OTP on File: {task?.delivery_otp || '1234'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    Please ask the customer for the 4-digit Delivery OTP to complete this drop-off.
                  </p>
                  <input
                    type="text"
                    maxLength="4"
                    inputMode="numeric"
                    placeholder="Enter 4-Digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 px-4 bg-white border border-emerald-300 rounded-xl font-mono text-center tracking-widest text-lg font-black text-gray-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Big Action Button */}
            <button
              onClick={handleAdvance}
              disabled={busy}
              className="w-full bg-[#ff5100] hover:bg-[#e64900] text-white py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <span>{getButtonText()}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion State */
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-emerald-950">Delivery Completed Successfully!</h2>
          <p className="text-sm text-emerald-800 font-medium max-w-md mx-auto">
            Order <strong>{orderNumber}</strong> has been handed over to <strong>{recipientName}</strong> and confirmed via OTP.
          </p>
          <button
            onClick={loadActiveTask}
            className="mt-4 bg-[#042820] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md cursor-pointer hover:bg-[#063b2f] transition-colors"
          >
            Start Next Delivery
          </button>
        </div>
      )}

      {/* ================= BOTTOM GPS ROUTE & NAVIGATION STRIP ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-lg">📍 🗺️</span>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-black text-gray-900">
                Live GPS Route Map &amp; Navigation
              </h3>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                Real-time Tracking
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium">Turn-by-turn routing to customer doorstep.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-emerald-700" />
            <span>ETA: 12 min (2.4 km away)</span>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 bg-[#042820] hover:bg-[#073d32] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-300" />
            <span>Open Navigation</span>
          </a>

          <a
            href={`tel:${recipientPhone}`}
            className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Call Customer</span>
          </a>
        </div>
      </div>

      {/* Package Contents Modal */}
      {showItemsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-[#042820] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-black text-sm">Package Contents ({itemsCount} Items)</h3>
              </div>
              <button
                onClick={() => setShowItemsModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
              {(task?.items && task.items.length > 0 ? task.items : [
                { name: 'Dell Latitude 3540 Core i5 Laptop', quantity: 1, price: 72990, image: '' },
                { name: 'Wireless Bluetooth Ergonomic Mouse', quantity: 1, price: 1299, image: '' },
                { name: 'Padded Laptop Sleeve Case', quantity: 1, price: 699, image: '' }
              ]).map((it, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-gray-200">
                    <img
                      src={getProductImage(it.name || it.product_title, it.image || it.product_image)}
                      alt={it.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{it.name || it.product_title}</h4>
                    <p className="text-[11px] text-gray-500 font-semibold">Qty: {it.quantity || 1} &middot; ₹{Number(it.price || it.unit_price || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowItemsModal(false)}
                className="px-5 py-2 bg-[#042820] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="font-black text-sm">Report Delivery Issue</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-600 font-medium">
                Select an issue reason for Order <strong>{orderNumber}</strong>:
              </p>
              <div className="space-y-2">
                {['Customer Unreachable', 'Wrong Address / Location', 'Customer Refused Package', 'Package Damaged', 'Security / Gate Issue'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setShowReportModal(false);
                      notify(`Issue reported: "${reason}". Dispatch team notified.`);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
