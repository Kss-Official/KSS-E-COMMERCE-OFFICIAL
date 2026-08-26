import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Package,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import {
  fetchDeliveryTasksApi,
  advanceDeliveryStageApi,
  verifyDeliveryOtpApi,
  collectCodApi
} from '../../src/services/api';

// Mirrors DeliveryTask.STAGE_CHOICES on the backend.
const STEPS = [
  { title: 'Picked up from Warehouse', desc: 'Parcel scanned out of the hub' },
  { title: 'On the Way', desc: 'Navigating to customer address' },
  { title: 'Arrived at Destination', desc: 'Notify the customer' },
  { title: 'Payment & OTP Verification', desc: 'Collect payment and close the task' }
];

export default function ActiveDeliveryTab() {
  const [task, setTask] = useState(null);
  const [otp, setOtp] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [codDone, setCodDone] = useState(false);

  const loadActiveTask = async () => {
    setLoading(true);
    setError(null);
    setIsCompleted(false);
    setOtp('');

    const tasks = await fetchDeliveryTasksApi();
    const open = (Array.isArray(tasks) ? tasks : []).filter(
      (t) => t.status !== 'DELIVERED' && t.status !== 'FAILED'
    );
    // The task furthest along is the one the rider is actually working on.
    open.sort((a, b) => (b.current_stage || 0) - (a.current_stage || 0));

    const active = open[0] || null;
    setTask(active);
    setCodDone(Boolean(active?.is_cod_collected));
    setLoading(false);
  };

  useEffect(() => {
    loadActiveTask();
  }, []);

  const currentStep = Math.min(Number(task?.current_stage || 1), 4);
  const codAmount = Number(task?.cod_amount || 0);
  const isCod = codAmount > 0;

  const handleAdvance = async () => {
    if (!task) return;
    setBusy(true);
    setError(null);

    if (currentStep < 4) {
      const res = await advanceDeliveryStageApi(task.task_id || task.id);
      setBusy(false);
      if (res?.status === 'success' && res.data) {
        setTask(res.data);
      } else {
        setError(res?.message || 'Could not advance this delivery. Please retry.');
      }
      return;
    }

    // Stage 4 — verify the customer's code, which completes the order and credits earnings.
    if (!/^\d{4}$/.test(otp)) {
      setBusy(false);
      setError('Enter the 4-digit code the customer received.');
      return;
    }

    const res = await verifyDeliveryOtpApi(task.task_id || task.id, otp, isCod);
    setBusy(false);
    if (res?.status === 'success') {
      setTask(res.data || task);
      setIsCompleted(true);
    } else {
      setError(res?.message || 'That code did not match. Ask the customer to re-read it.');
    }
  };

  const handleCollectCod = async () => {
    if (!task) return;
    setBusy(true);
    const res = await collectCodApi(task.task_id || task.id);
    setBusy(false);
    if (res?.status === 'success') {
      setCodDone(true);
      setTask((prev) => ({ ...(prev || {}), is_cod_collected: true }));
    } else {
      setError(res?.message || 'Could not record the cash collection.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Delivery Execution</h2>
          <p className="text-sm text-gray-500 font-medium">Live task stages, customer contact, and OTP verification.</p>
        </div>
        <button
          onClick={loadActiveTask}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {loading && !task && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-xs animate-pulse space-y-4 ${n === 2 ? 'md:col-span-2' : ''}`}
            >
              <div className="h-4 w-1/3 bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="h-10 w-full bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!loading && !task && !isCompleted && (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xs text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-900">No active delivery right now</h4>
          <p className="text-xs text-gray-500 font-medium mt-1">
            New tasks appear here the moment the warehouse assigns you a parcel.
          </p>
        </div>
      )}

      {isCompleted && task && (
        <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-emerald-950">Delivery Completed Successfully!</h3>
          <p className="text-sm text-emerald-800 font-medium max-w-md mx-auto">
            Order <strong>{task.order_number}</strong> has been delivered to <strong>{task.recipient_name}</strong>
            {isCod ? (
              <>
                {' '}and payment of <strong>₹{codAmount.toLocaleString('en-IN')}</strong> was verified.
              </>
            ) : (
              ' and the prepaid order is now closed.'
            )}
          </p>
          <button
            onClick={loadActiveTask}
            className="mt-4 bg-[#1b4d3e] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer"
          >
            Start Next Delivery
          </button>
        </div>
      )}

      {!isCompleted && task && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Tracker Column */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <h3 className="font-bold text-base text-gray-900">Delivery Stages</h3>

            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {STEPS.map((st, idx) => {
                const stepNum = idx + 1;
                const isPassed = stepNum <= currentStep;
                const desc =
                  stepNum === 4 && isCod
                    ? `Collect ₹${codAmount.toLocaleString('en-IN')} COD`
                    : stepNum === 4
                      ? 'Prepaid — verify OTP only'
                      : st.desc;
                return (
                  <div key={st.title} className="relative flex items-start space-x-3.5 z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isPassed ? 'bg-[#1b4d3e] text-white ring-4 ring-emerald-50' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {stepNum}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>{st.title}</h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Task ID</span>
              <span className="text-xs font-mono font-bold text-[#1b4d3e]">{task.task_id}</span>
              <span className="block text-[11px] font-semibold text-gray-400 mt-1">
                {task.items_count} item(s) &middot; assigned {task.formatted_date}
              </span>
            </div>
          </div>

          {/* Active Work Area */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-bold block">Current Order</span>
                <span className="text-lg font-black text-gray-900">{task.order_number}</span>
                <span className="block text-[11px] font-semibold text-gray-400">
                  {task.stage_name} &middot; {(task.order_status || '').replace(/_/g, ' ')}
                </span>
              </div>
              <a
                href={`tel:${task.recipient_phone}`}
                className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold"
              >
                <Phone className="w-4 h-4" />
                <span>Call Customer</span>
              </a>
            </div>

            {/* Delivery Location Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 font-semibold shrink-0">Customer:</span>
                <span className="font-bold text-gray-900 text-right">
                  {task.recipient_name}
                  <span className="block font-semibold text-gray-500">{task.recipient_phone}</span>
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 font-semibold shrink-0">Address:</span>
                <span className="font-semibold text-gray-800 text-right">
                  {task.delivery_address}
                  {task.shipping_pincode ? ` - ${task.shipping_pincode}` : ''}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 font-semibold shrink-0">Order Value:</span>
                <span className="font-bold text-gray-900">
                  ₹{Number(task.order_total || 0).toLocaleString('en-IN')} &middot; {task.payment_method}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-500 font-semibold shrink-0">Collect Amount (COD):</span>
                <span className="font-black text-[#ff5100] text-sm">
                  {isCod ? `₹${codAmount.toLocaleString('en-IN')}` : 'Prepaid'}
                </span>
              </div>
            </div>

            {/* Navigate + COD collection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${task.delivery_address} ${task.shipping_city || ''} ${task.shipping_pincode || ''}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-2 bg-[#1b4d3e]/5 border border-[#1b4d3e]/20 text-[#1b4d3e] py-2.5 rounded-xl text-xs font-bold hover:bg-[#1b4d3e]/10"
              >
                <MapPin className="w-4 h-4" />
                <span>Navigate to Address</span>
              </a>
              {isCod && (
                <button
                  onClick={handleCollectCod}
                  disabled={busy || codDone}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold border cursor-pointer disabled:cursor-not-allowed ${
                    codDone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  <span>{codDone ? 'Cash Collected' : 'Mark Cash Collected'}</span>
                </button>
              )}
            </div>

            {/* OTP Input Form at Stage 4 */}
            {currentStep === 4 && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <ShieldCheck className="w-5 h-5" />
                  <h4 className="font-bold text-xs">Customer OTP Verification</h4>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Ask the customer to read out the 4-digit code shown on their order page
                  {task.delivery_otp ? ` (code on file: ${task.delivery_otp})` : ''}.
                </p>
                <input
                  type="text"
                  maxLength="4"
                  inputMode="numeric"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-emerald-300 rounded-xl font-mono text-center tracking-widest font-black focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            )}

            {/* Stage Action Control */}
            <button
              onClick={handleAdvance}
              disabled={busy}
              className="w-full bg-[#ff5100] hover:bg-[#e64900] text-white py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>
                {busy
                  ? 'Working...'
                  : currentStep === 4
                    ? 'Confirm & Finish Delivery'
                    : 'Advance to Next Stage'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
