import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  HelpCircle,
  Building2,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import {
  fetchDeliveryCashTrackerApi,
  fetchDeliveryCashHandoversApi,
  createDeliveryCashHandoverApi
} from '../../src/services/api';

export default function CashInHandTab() {
  const [tracker, setTracker] = useState(null);
  const [handoverData, setHandoverData] = useState({ cash_in_hand: 0, active_pending_request: null, handovers: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [handoverType, setHandoverType] = useState('full'); // 'full' or 'partial'
  const [customAmount, setCustomAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [tr, ho] = await Promise.all([
        fetchDeliveryCashTrackerApi(),
        fetchDeliveryCashHandoversApi()
      ]);
      setTracker(tr || null);
      setHandoverData(ho || { cash_in_hand: 0, active_pending_request: null, handovers: [] });
    } catch (err) {
      console.warn('Error loading cash handover data:', err);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cashInHand = Number((handoverData?.cash_in_hand > 0 ? handoverData?.cash_in_hand : tracker?.cash_in_hand) || 0);
  const activePending = handoverData?.active_pending_request || (Array.isArray(handoverData?.handovers) ? handoverData.handovers.find(h => h.status === 'PENDING') : null);
  const history = Array.isArray(handoverData?.handovers) && handoverData.handovers.length > 0 ? handoverData.handovers : (Array.isArray(tracker?.recent_transactions) ? tracker.recent_transactions : []);

  const handleOpenModal = () => {
    if (cashInHand <= 0) {
      setAlert({ type: 'warning', message: 'You do not have any pending cash in hand to hand over.' });
      return;
    }
    if (activePending) {
      setAlert({ type: 'warning', message: 'You already have an active pending handover request awaiting warehouse confirmation.' });
      return;
    }
    setHandoverType('full');
    setCustomAmount(String(cashInHand));
    setNotes('');
    setAlert(null);
    setShowModal(true);
  };

  const handleSubmitHandover = async (e) => {
    e.preventDefault();
    const amountToHandover = handoverType === 'full' ? cashInHand : Number(customAmount);

    if (!amountToHandover || amountToHandover <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid amount greater than ₹0.' });
      return;
    }

    if (amountToHandover > cashInHand) {
      setAlert({ type: 'error', message: `Amount cannot exceed your current cash in hand (₹${cashInHand.toFixed(2)}).` });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    const res = await createDeliveryCashHandoverApi(amountToHandover, notes);
    setSubmitting(false);

    if (res?.status === 'success') {
      setShowModal(false);
      setAlert({ type: 'success', message: res.message || 'Handover request submitted successfully!' });
      loadData();
    } else {
      setAlert({ type: 'error', message: res?.message || 'Failed to submit handover request.' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirmed / Settled
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Disputed Amount
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 mr-1" /> Pending Warehouse Confirmation
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner & Refresh */}
      <div className="bg-[#042820] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-[#094738] flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Banknote className="w-4 h-4" />
            <span>CASH COLLECTION &amp; WAREHOUSE SETTLEMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Cash in Hand Tracker</h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 font-medium max-w-xl">
            Track COD cash collected from customer deliveries and initiate physical handovers to warehouse staff for settlement.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 relative z-10">
          <button
            onClick={handleOpenModal}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-2 cursor-pointer ${
              cashInHand > 0 && !activePending
                ? 'bg-[#ff5100] hover:bg-[#e64900] text-white shadow-orange-500/25 active:scale-[0.98]'
                : 'bg-white/10 text-emerald-300/40 cursor-not-allowed border border-white/10'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Handover to Warehouse</span>
          </button>
        </div>
      </div>

      {/* Alert Notification Banner */}
      {alert && (
        <div
          className={`p-4 rounded-2xl text-xs font-extrabold flex items-center justify-between shadow-xs border ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : alert.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {alert.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-gray-400 hover:text-gray-600 text-xs font-extrabold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Cash Holding Pending Handover */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Cash in Hand (Pending)</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tight mt-3">₹{cashInHand.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Unsettled cash from COD deliveries</p>
        </div>

        {/* Active Handover Request Status */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Active Request Status</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          {activePending ? (
            <div className="mt-3">
              <p className="text-2xl font-black text-blue-700 tracking-tight">₹{Number(activePending.requested_amount).toFixed(2)}</p>
              <div className="mt-1.5">{getStatusBadge(activePending.status)}</div>
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-base font-black text-gray-400">No Active Request</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">Ready to submit new handover</p>
            </div>
          )}
        </div>

        {/* Total Settled Handovers */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs relative overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Settled to Warehouse</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700 tracking-tight mt-3">
            ₹
            {history
              .filter((h) => h.status === 'CONFIRMED')
              .reduce((sum, h) => sum + Number(h.confirmed_amount || h.requested_amount), 0)
              .toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Verified &amp; credited to total earnings</p>
        </div>
      </div>

      {/* Active Handover Status Progress Bar (if active) */}
      {activePending && (
        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-gray-900 text-base">Handover Request Progress</h3>
            </div>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
              ID: {activePending.handover_id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center py-2">
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold mb-1">
                1
              </div>
              <p className="text-xs font-bold text-emerald-900">Request Submitted</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">{activePending.formatted_created_at}</p>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto text-xs font-bold mb-1">
                2
              </div>
              <p className="text-xs font-bold text-blue-900">Pending Handover to Hub</p>
              <p className="text-[11px] text-blue-700 mt-0.5">Visit Warehouse Control Room</p>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl opacity-60">
              <div className="w-7 h-7 rounded-full bg-gray-400 text-white flex items-center justify-center mx-auto text-xs font-bold mb-1">
                3
              </div>
              <p className="text-xs font-bold text-gray-700">Warehouse Staff Confirmation</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Awaiting physical verification</p>
            </div>
          </div>
        </div>
      )}

      {/* Handover History Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <h3 className="font-extrabold text-gray-900 text-base">Handover History Log</h3>
          </div>
          <span className="text-xs font-extrabold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{history.length} records</span>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center bg-emerald-50/40 border border-emerald-100/80 m-6 rounded-3xl space-y-3">
            <div className="w-14 h-14 bg-emerald-100/80 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <Banknote className="w-7 h-7" />
            </div>
            <h4 className="text-base font-black text-gray-900">No Cash Handovers Generated Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
              When you collect COD cash from customer deliveries and complete a physical handover at the warehouse, records will be logged here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-[11px] font-black tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-4 px-5">Handover ID</th>
                  <th className="py-4 px-5">Date &amp; Time</th>
                  <th className="py-4 px-5">Requested</th>
                  <th className="py-4 px-5">Confirmed</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Warehouse Staff</th>
                  <th className="py-4 px-5">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-xs">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-gray-900">{item.handover_id}</td>
                    <td className="py-4 px-5 text-gray-500">{item.formatted_created_at}</td>
                    <td className="py-4 px-5 font-black text-gray-900">₹{Number(item.requested_amount).toFixed(2)}</td>
                    <td className="py-4 px-5 font-black text-emerald-700">
                      {item.confirmed_amount != null ? `₹${Number(item.confirmed_amount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(item.status)}</td>
                    <td className="py-4 px-5 text-gray-600 font-medium">
                      {item.warehouse_staff_email || '—'}
                    </td>
                    <td className="py-4 px-5 text-gray-500 max-w-xs truncate font-medium">
                      {item.dispute_reason ? (
                        <span className="text-amber-700 font-bold">{item.dispute_reason}</span>
                      ) : (
                        item.notes || '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Handover Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2 text-[#0B5E3C]">
                <Banknote className="w-6 h-6" />
                <h3 className="text-lg font-black text-gray-900">Handover to Warehouse</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitHandover} className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Available Cash in Hand</p>
                <p className="text-2xl font-black text-emerald-950 mt-0.5">₹{cashInHand.toFixed(2)}</p>
              </div>

              {/* Full vs Partial Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Handover Amount Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHandoverType('full');
                      setCustomAmount(String(cashInHand));
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      handoverType === 'full'
                        ? 'bg-[#0B5E3C] text-white border-[#0B5E3C] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Full Amount (₹{cashInHand.toFixed(2)})
                  </button>

                  <button
                    type="button"
                    onClick={() => setHandoverType('partial')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      handoverType === 'partial'
                        ? 'bg-[#0B5E3C] text-white border-[#0B5E3C] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Partial Amount
                  </button>
                </div>
              </div>

              {/* Custom Partial Amount Input */}
              {handoverType === 'partial' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Enter Partial Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={cashInHand}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter cash amount..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E3C] focus:border-[#0B5E3C] text-sm font-semibold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Notes / Hub Remarks (Optional)</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Handed over ₹1500 cash bundle to Warehouse Supervisor"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B5E3C] text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-[#0B5E3C] hover:bg-[#07452c] rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
