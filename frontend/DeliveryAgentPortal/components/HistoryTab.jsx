import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  RefreshCw,
  Clock,
  IndianRupee,
  XCircle,
  History,
  Calendar,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Phone,
  User,
  Check,
  FileText
} from 'lucide-react';
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

  // 1. Date Range Filter State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 2. View Details Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // 3. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  // Filter rows based on search, status, and specific date range
  const filtered = useMemo(() => {
    return rows.filter((h) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (h.order_number || '').toLowerCase().includes(term) ||
        (h.recipient_name || '').toLowerCase().includes(term) ||
        (h.task_id || '').toLowerCase().includes(term) ||
        (h.delivery_address || '').toLowerCase().includes(term);

      // Date filtering
      let matchDate = true;
      const rawDateStr = h.delivered_at || h.created_at || '';
      if (rawDateStr) {
        const itemDate = new Date(rawDateStr);
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          if (itemDate < from) matchDate = false;
        }
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          if (itemDate > to) matchDate = false;
        }
      }

      return matchSearch && matchDate;
    });
  }, [rows, searchTerm, fromDate, toDate]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, fromDate, toDate, days]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const clearDateFilters = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delivery History</h2>
          <p className="text-sm text-gray-500 font-medium">Log of completed past deliveries, payouts, and timestamped receipts.</p>
        </div>
      </div>

      {/* Live Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Total Deliveries</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{summary.total_deliveries || filtered.length || 0}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Success Rate</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{summary.success_rate || 100}%</p>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
            {summary.successful || filtered.length} delivered &middot; {summary.failed || 0} failed
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <IndianRupee className="w-4 h-4 text-[#ff5100]" />
            <span>Payout Earned</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            ₹{Number(summary.total_earned || (filtered.length * 65)).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>COD Collected</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            ₹{Number(summary.cod_collected || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* ================= 1. SEARCH & DATE RANGE FILTER BAR ================= */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search order ID, customer, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
            />
          </div>

          {/* Quick Period Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto shrink-0">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => {
                  setDays(r.key);
                  clearDateFilters();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  days === r.key && !fromDate && !toDate
                    ? 'bg-[#042820] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Date / Date Range Selector */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-gray-700 font-extrabold">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Specific Date Range Filter:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500 font-bold text-[11px]">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium text-xs text-gray-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-gray-500 font-bold text-[11px]">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl font-medium text-xs text-gray-800 focus:outline-none focus:border-emerald-600 cursor-pointer"
              />
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={clearDateFilters}
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= TABLE & LISTING ================= */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Completed Time</th>
                <th className="py-4 px-6 text-right">Rider Payout</th>
                {/* 2. View Details Action Column Header */}
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && rows.length === 0 &&
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))}

              {!isLoading && paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 px-6 text-center">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-extrabold text-gray-900 text-base">No completed deliveries found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm || fromDate || toDate
                        ? 'Try adjusting your search query or date range filters.'
                        : 'Finish a delivery and it will be logged here.'}
                    </p>
                  </td>
                </tr>
              )}

              {paginatedRows.map((item) => {
                const cod = Number(item.cod_amount || 0);
                const failed = item.status === 'FAILED';
                return (
                  <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-6 font-black text-gray-900">
                      {item.order_number}
                      <span className="block text-[11px] font-mono font-bold text-gray-400 mt-0.5">{item.task_id}</span>
                    </td>

                    <td className="py-4 px-6 font-bold text-gray-900">
                      {item.recipient_name}
                      <span className="block text-[11px] font-semibold text-gray-400">{item.recipient_phone}</span>
                    </td>

                    <td className="py-4 px-6 text-gray-600 text-xs font-medium max-w-xs truncate" title={item.delivery_address}>
                      {item.delivery_address}
                    </td>

                    <td className="py-4 px-6 font-black text-gray-900">
                      ₹{Number(item.order_total || 0).toLocaleString('en-IN')}
                      <span className="block text-[11px] font-bold text-gray-400">
                        {cod > 0 ? `COD ₹${cod.toLocaleString('en-IN')}` : 'Prepaid ✓'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                      {item.completed_on}
                      <span
                        className={`mt-1 inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          failed ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {failed ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {failed ? 'Failed' : 'Delivered'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-black text-[#ff5100] text-sm">
                      ₹{Number(item.earned || 65).toLocaleString('en-IN')}
                    </td>

                    {/* 2. View Details Action Button */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= 3. PAGINATION CONTROLS ================= */}
        {filtered.length > 0 && (
          <div className="p-4 sm:p-5 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-600">
            <div>
              Showing <span className="font-black text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-black text-gray-900">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
              <span className="font-black text-gray-900">{filtered.length}</span> completed deliveries
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    currentPage === pg ? 'bg-[#042820] text-white shadow-xs' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. VIEW DETAILS / RECEIPT MODAL ================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Delivery Receipt &amp; Details</h3>
                  <p className="text-xs font-mono font-bold text-emerald-800">{selectedReceipt.order_number}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Summary Pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</span>
                <div className="mt-1 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-emerald-900">Delivered &amp; Verified</span>
                </div>
              </div>

              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Rider Payout</span>
                <p className="text-base font-black text-[#ff5100] mt-0.5">₹{Number(selectedReceipt.earned || 65).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Customer &amp; Drop-off Location</span>
              <div className="flex items-center justify-between font-bold text-gray-900">
                <span className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>{selectedReceipt.recipient_name}</span>
                </span>
                <span className="flex items-center space-x-1 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{selectedReceipt.recipient_phone}</span>
                </span>
              </div>
              <div className="flex items-start space-x-1.5 text-gray-600 pt-1 border-t border-gray-200/50">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{selectedReceipt.delivery_address}</span>
              </div>
            </div>

            {/* Package Contents */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Package Items</span>
              <div className="bg-white border border-gray-200/80 rounded-2xl p-3 space-y-2 text-xs">
                {Array.isArray(selectedReceipt.order_items) && selectedReceipt.order_items.length > 0 ? (
                  selectedReceipt.order_items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between font-bold text-gray-800">
                      <span className="flex items-center space-x-2">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{it.product_name || 'Item'}</span>
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono">Qty: {it.quantity || 1}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span className="flex items-center space-x-2">
                      <Package className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Standard Order Package ({selectedReceipt.items_count || 1} items)</span>
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono">1 pkg</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2 text-xs font-medium">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Payment &amp; Earnings Summary</span>
              <div className="flex justify-between text-emerald-200">
                <span>Order Total Amount:</span>
                <span className="font-bold text-white">₹{Number(selectedReceipt.order_total || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Payment Method:</span>
                <span className="font-bold text-amber-300">
                  {Number(selectedReceipt.cod_amount) > 0 ? `COD (Collected ₹${selectedReceipt.cod_amount})` : 'Prepaid'}
                </span>
              </div>
              <div className="flex justify-between text-emerald-200 pt-2 border-t border-white/10">
                <span>Base Delivery Fee:</span>
                <span className="font-bold text-white">₹50.00</span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Incentive &amp; Bonus:</span>
                <span className="font-bold text-white">₹15.00</span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-400 pt-2 border-t border-white/15">
                <span>Total Credit Earned:</span>
                <span className="text-[#ff5100]">₹{Number(selectedReceipt.earned || 65).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full bg-[#042820] hover:bg-[#063b2f] text-white py-3 rounded-2xl font-black text-xs transition-colors cursor-pointer shadow-md"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
