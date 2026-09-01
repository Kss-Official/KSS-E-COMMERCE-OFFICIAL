import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  CheckCircle,
  RefreshCw,
  IndianRupee,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  Eye,
  X,
  FileText,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { fetchDeliveryEarningsApi, createDeliveryTicketApi } from '../../src/services/api';

export default function EarningsTab({ setActiveTab }) {
  const [earnings, setEarnings] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [onlineEarned, setOnlineEarned] = useState(0);
  const [settledCashEarned, setSettledCashEarned] = useState(0);
  const [pendingCashHandover, setPendingCashHandover] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  // View Details Modal State
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);

  const loadEarnings = async () => {
    setIsLoading(true);
    const data = await fetchDeliveryEarningsApi();
    setEarnings(Array.isArray(data?.earnings) ? data.earnings : []);
    setTotalEarned(Number(data?.total_earned || 0));
    setOnlineEarned(Number(data?.online_earnings || 0));
    setSettledCashEarned(Number(data?.settled_cash_earnings || 0));
    setPendingCashHandover(Number(data?.pending_cash_handover || 0));
    setIsLoading(false);
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const totals = useMemo(() => {
    const sum = (key) => earnings.reduce((acc, e) => acc + Number(e[key] || 0), 0);
    return {
      base: sum('base_fee'),
      bonus: sum('incentive') + sum('tip'),
      trips: earnings.length
    };
  }, [earnings]);

  // Settlements are the real earning rows grouped by the day they were credited.
  const settlements = useMemo(() => {
    const byDay = new Map();
    earnings.forEach((e) => {
      const day = (e.earned_at || '').slice(0, 10);
      if (!byDay.has(day)) byDay.set(day, { day, amount: 0, trips: 0, items: [] });
      const bucket = byDay.get(day);
      bucket.amount += Number(e.total_earned || 0);
      bucket.trips += 1;
      bucket.items.push(e);
    });
    const today = new Date().toISOString().slice(0, 10);
    return [...byDay.values()]
      .sort((a, b) => (a.day < b.day ? 1 : -1))
      .slice(0, 7)
      .map((row) => ({
        ...row,
        label: row.day
          ? new Date(`${row.day}T00:00:00`).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : 'Unknown date',
        status: row.day === today ? 'Pending Nightly Sweep' : 'Settled to Bank'
      }));
  }, [earnings]);

  const handleWithdraw = async () => {
    if (totalEarned <= 0) {
      setNotice('There is nothing to withdraw yet. Complete a delivery to earn.');
      setTimeout(() => setNotice(null), 4000);
      return;
    }
    setBusy(true);
    const res = await createDeliveryTicketApi({
      subject: 'Payout request',
      message: `Requesting settlement of Rs.${totalEarned.toFixed(2)} across ${totals.trips} completed delivery/deliveries.`
    });
    setBusy(false);
    setNotice(
      res?.status === 'success'
        ? `Payout request of ₹${totalEarned.toLocaleString('en-IN')} raised with rider helpdesk (${res.data?.ticket_number}).`
        : 'Could not raise payout request. Please try again.'
    );
    setTimeout(() => setNotice(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Earnings &amp; Incentives</h2>
          <p className="text-sm text-gray-500 font-medium">Track daily payouts, peak-hour incentives, and bank settlements.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleWithdraw}
            disabled={busy}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4" />
            <span>
              {busy ? 'Requesting...' : `Request Payout (₹${totalEarned.toLocaleString('en-IN')})`}
            </span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{notice}</span>
        </div>
      )}

      {/* Main Total & Category Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#042820] to-[#094738] p-5 rounded-3xl text-white shadow-lg border border-[#0d5947]">
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Total Lifetime Earnings</span>
          <h3 className="text-3xl font-black text-white tracking-tight mt-2">₹{totalEarned.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-bold text-emerald-200/90 mt-1">{totals.trips} completed trips</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">💳 Online Payments</span>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mt-2">₹{onlineEarned.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-bold text-emerald-600 mt-1">Auto-settled digitally</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">💵 Settled COD Cash</span>
          <h3 className="text-2xl font-black text-emerald-700 tracking-tight mt-2">₹{settledCashEarned.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-bold text-emerald-600 mt-1">Warehouse confirmed</p>
        </div>

        <div
          onClick={() => setActiveTab && setActiveTab('cash-in-hand')}
          className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all group"
        >
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider group-hover:text-amber-800 block">⏳ Cash in Hand (Pending)</span>
          <h3 className="text-2xl font-black text-amber-600 tracking-tight mt-2">₹{pendingCashHandover.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-bold text-amber-600 mt-1 group-hover:underline flex items-center space-x-1">
            <span>Awaiting handover</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Recent Payout Settlements */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-gray-900">Recent Payout Settlements</h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Grouped by credit date
          </span>
        </div>

        <div className="space-y-3 text-sm">
          {isLoading && settlements.length === 0 &&
            [1, 2, 3].map((n) => (
              <div key={n} className="h-14 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
            ))}

          {!isLoading && settlements.length === 0 && (
            <div className="p-10 text-center">
              <IndianRupee className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-black text-gray-900">No settlements yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Complete and verify a delivery — the base fee and incentive are credited instantly.
              </p>
            </div>
          )}

          {settlements.map((item) => (
            <div
              key={item.day || item.label}
              className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-100/60 transition-colors"
            >
              <div>
                <span className="font-black text-gray-900 block">{item.label}</span>
                <span className="text-xs text-gray-500 font-medium">
                  {item.status} &middot; {item.trips} delivery/deliveries
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-black text-emerald-800 text-base">
                  ₹{item.amount.toLocaleString('en-IN')}
                </span>

                {/* 2. View Details for Payout Summary */}
                <button
                  onClick={() => setSelectedBreakdown({
                    title: `Payout Settlement (${item.label})`,
                    order_number: `BATCH-${item.day || 'TODAY'}`,
                    base_fee: item.items.reduce((a, c) => a + Number(c.base_fee || 50), 0),
                    incentive: item.items.reduce((a, c) => a + Number(c.incentive || 15), 0),
                    tip: item.items.reduce((a, c) => a + Number(c.tip || 0), 0),
                    deductions: 0,
                    total_earned: item.amount,
                    trips_count: item.trips,
                    formatted_date: item.label
                  })}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-delivery credit ledger */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-black text-gray-900">Credit Ledger</h3>
          <p className="text-xs text-gray-500 font-medium">Every fee credited against a delivered order.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Order</th>
                <th className="py-4 px-6">Base Fee</th>
                <th className="py-4 px-6">Tip</th>
                <th className="py-4 px-6">Incentive</th>
                <th className="py-4 px-6">Credited On</th>
                <th className="py-4 px-6 text-right">Total</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium">
              {!isLoading && earnings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center text-xs font-extrabold text-gray-400">
                    No credits recorded yet.
                  </td>
                </tr>
              )}
              {earnings.map((e) => (
                <tr key={e.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-4 px-6 font-black text-gray-900">{e.order_number}</td>
                  <td className="py-4 px-6 text-gray-700 font-bold">₹{Number(e.base_fee || 50).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 text-gray-700 font-bold">₹{Number(e.tip || 0).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 text-gray-700 font-bold">₹{Number(e.incentive || 15).toLocaleString('en-IN')}</td>
                  <td className="py-4 px-6 text-gray-500">{e.formatted_date}</td>
                  <td className="py-4 px-6 text-right font-black text-emerald-800 text-sm">
                    ₹{Number(e.total_earned || 65).toLocaleString('en-IN')}
                  </td>

                  {/* 2. View Details Action Button for each earning entry */}
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => setSelectedBreakdown({
                        title: `Earning Credit Details (${e.order_number})`,
                        order_number: e.order_number,
                        base_fee: Number(e.base_fee || 50),
                        incentive: Number(e.incentive || 15),
                        tip: Number(e.tip || 0),
                        deductions: 0,
                        total_earned: Number(e.total_earned || 65),
                        formatted_date: e.formatted_date
                      })}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= 2. VIEW DETAILS EARNINGS BREAKDOWN MODAL ================= */}
      {selectedBreakdown && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Earnings &amp; Payout Breakdown</h3>
                  <p className="text-xs font-mono font-bold text-emerald-800">{selectedBreakdown.order_number}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBreakdown(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Payout Bank */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-emerald-950">Destination Account:</span>
              </div>
              <span className="font-black text-emerald-800 font-mono">HDFC Bank •••• 4582</span>
            </div>

            {/* Detailed Financial Breakdown Table */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3 text-xs">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Financial Breakdown</span>

              <div className="flex justify-between items-center text-gray-700 font-medium">
                <span>Base Earnings (Standard trip fee):</span>
                <span className="font-black text-gray-900">₹{selectedBreakdown.base_fee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-gray-700 font-medium">
                <span>Peak Hour / Distance Incentive:</span>
                <span className="font-black text-emerald-700">+ ₹{selectedBreakdown.incentive.toFixed(2)}</span>
              </div>

              {selectedBreakdown.tip > 0 && (
                <div className="flex justify-between items-center text-gray-700 font-medium">
                  <span>Customer Tip:</span>
                  <span className="font-black text-emerald-700">+ ₹{selectedBreakdown.tip.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-500 font-medium pt-2 border-t border-gray-200">
                <span>Deductions (TDS / Penalty):</span>
                <span className="font-black text-gray-700">₹{selectedBreakdown.deductions.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-2 border-t border-gray-300">
                <span>Final Payout Credited:</span>
                <span className="text-[#ff5100] text-base">₹{selectedBreakdown.total_earned.toFixed(2)}</span>
              </div>
            </div>

            {/* Note & Close */}
            <div className="text-[11px] text-gray-500 font-medium flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Credited to ledger on {selectedBreakdown.formatted_date}.</span>
            </div>

            <button
              onClick={() => setSelectedBreakdown(null)}
              className="w-full bg-[#042820] hover:bg-[#063b2f] text-white py-3 rounded-2xl font-black text-xs transition-colors cursor-pointer shadow-md"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
