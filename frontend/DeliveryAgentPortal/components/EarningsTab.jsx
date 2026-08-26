import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, CheckCircle, RefreshCw, IndianRupee, TrendingUp } from 'lucide-react';
import { fetchDeliveryEarningsApi, createDeliveryTicketApi } from '../../src/services/api';

export default function EarningsTab() {
  const [earnings, setEarnings] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadEarnings = async () => {
    setIsLoading(true);
    const data = await fetchDeliveryEarningsApi();
    setEarnings(Array.isArray(data?.earnings) ? data.earnings : []);
    setTotalEarned(Number(data?.total_earned || 0));
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
      if (!byDay.has(day)) byDay.set(day, { day, amount: 0, trips: 0 });
      const bucket = byDay.get(day);
      bucket.amount += Number(e.total_earned || 0);
      bucket.trips += 1;
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
        // Same-day credits are still awaiting the nightly bank sweep.
        status: row.day === today ? 'Pending Transfer' : 'Settled to Bank'
      }));
  }, [earnings]);

  // No payout gateway is wired yet, so a request is logged as a real rider ticket
  // the helpdesk can action.
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
        ? `Payout request of ₹${totalEarned.toLocaleString('en-IN')} raised with the rider helpdesk (${res.data?.ticket_number}).`
        : 'Could not raise the payout request. Please try again.'
    );
    setTimeout(() => setNotice(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Earnings &amp; Incentives</h2>
          <p className="text-sm text-gray-500 font-medium">Track daily payouts, peak-hour incentives, and bank settlements.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadEarnings}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleWithdraw}
            disabled={busy}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Wallet className="w-4 h-4" />
            <span>
              {busy ? 'Requesting...' : `Request Payout (₹${totalEarned.toLocaleString('en-IN')})`}
            </span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Base Delivery Fees</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totals.base.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">{totals.trips} credited trip(s)</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bonus &amp; Incentives</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totals.bonus.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Tips and peak-hour incentives</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Available Payout</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totalEarned.toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Lifetime credited earnings</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Recent Payout Settlements</h3>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Grouped by credit date
          </span>
        </div>

        <div className="space-y-3 text-sm">
          {isLoading && settlements.length === 0 &&
            [1, 2, 3].map((n) => (
              <div key={n} className="h-14 rounded-xl bg-gray-50 border border-gray-100 animate-pulse" />
            ))}

          {!isLoading && settlements.length === 0 && (
            <div className="p-8 text-center">
              <IndianRupee className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-bold text-gray-900">No settlements yet</p>
              <p className="text-xs text-gray-500 mt-1">
                Complete and verify a delivery — the base fee and incentive are credited instantly.
              </p>
            </div>
          )}

          {settlements.map((item) => (
            <div
              key={item.day || item.label}
              className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 border border-gray-100"
            >
              <div>
                <span className="font-bold text-gray-900 block">{item.label}</span>
                <span className="text-xs text-gray-500">
                  {item.status} &middot; {item.trips} delivery/deliveries
                </span>
              </div>
              <span className="font-black text-emerald-800 text-base">
                ₹{item.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-delivery credit ledger */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Credit Ledger</h3>
          <p className="text-xs text-gray-500 font-medium">Every fee credited against a delivered order.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-6">Order</th>
                <th className="py-3 px-6">Base Fee</th>
                <th className="py-3 px-6">Tip</th>
                <th className="py-3 px-6">Incentive</th>
                <th className="py-3 px-6">Credited On</th>
                <th className="py-3 px-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {!isLoading && earnings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 px-6 text-center text-xs font-semibold text-gray-400">
                    No credits recorded yet.
                  </td>
                </tr>
              )}
              {earnings.map((e) => (
                <tr key={e.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-gray-900">{e.order_number}</td>
                  <td className="py-3.5 px-6 text-gray-700 font-semibold">₹{Number(e.base_fee || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-6 text-gray-700 font-semibold">₹{Number(e.tip || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-6 text-gray-700 font-semibold">₹{Number(e.incentive || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-6 text-xs text-gray-500 font-medium">{e.formatted_date}</td>
                  <td className="py-3.5 px-6 text-right font-black text-emerald-800">
                    ₹{Number(e.total_earned || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
