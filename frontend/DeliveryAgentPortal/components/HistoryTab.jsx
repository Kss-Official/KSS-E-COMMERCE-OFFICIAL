import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, RefreshCw, Clock, IndianRupee, XCircle, History } from 'lucide-react';
import { fetchDeliveryHistoryApi } from '../../src/services/api';

const RANGES = [
  { key: 7, label: 'Last 7 days' },
  { key: 30, label: 'Last 30 days' },
  { key: 90, label: 'Last 90 days' },
  { key: 365, label: 'This year' }
];

export default function HistoryTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [days, setDays] = useState(90);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async (period = days) => {
    setIsLoading(true);
    const data = await fetchDeliveryHistoryApi(period);
    setRows(Array.isArray(data?.history) ? data.history : []);
    setSummary(data?.summary || {});
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory(days);
  }, [days]);

  const filtered = rows.filter((h) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (h.order_number || '').toLowerCase().includes(term) ||
      (h.recipient_name || '').toLowerCase().includes(term) ||
      (h.task_id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delivery History</h2>
          <p className="text-sm text-gray-500 font-medium">Log of completed past deliveries, payouts, and timestamped receipts.</p>
        </div>
        <button
          onClick={() => loadHistory(days)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Live period summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Deliveries</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{summary.total_deliveries || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Success Rate</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{summary.success_rate || 0}%</p>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
            {summary.successful || 0} delivered &middot; {summary.failed || 0} failed
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <IndianRupee className="w-4 h-4 text-[#ff5100]" />
            <span>Payout Earned</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{Number(summary.total_earned || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>COD Collected</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{Number(summary.cod_collected || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDays(r.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                days === r.key ? 'bg-[#1b4d3e] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Address</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Completed Time</th>
                <th className="py-3.5 px-6 text-right">Rider Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && rows.length === 0 &&
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No completed deliveries in this period</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Nothing matched that search.' : 'Finish a delivery and it will be logged here.'}
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map((item) => {
                const cod = Number(item.cod_amount || 0);
                const failed = item.status === 'FAILED';
                return (
                  <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4 px-6 font-black text-gray-900">
                      {item.order_number}
                      <span className="block text-[11px] font-mono font-semibold text-gray-400 mt-0.5">{item.task_id}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.recipient_name}
                      <span className="block text-[11px] font-semibold text-gray-400">{item.recipient_phone}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-xs font-medium max-w-xs truncate">
                      {item.delivery_address}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      ₹{Number(item.order_total || 0).toLocaleString('en-IN')}
                      <span className="block text-[11px] font-semibold text-gray-400">
                        {cod > 0 ? `COD ₹${cod.toLocaleString('en-IN')}` : 'Prepaid'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                      {item.completed_on}
                      <span
                        className={`mt-1 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                          failed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {failed ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {failed ? 'Failed' : 'Delivered'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-[#ff5100] text-xs">
                      ₹{Number(item.earned || 0).toLocaleString('en-IN')}
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
