import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUpRight, RefreshCw, CheckCircle, Clock, AlertTriangle, Eye, Download, ShieldCheck, CreditCard, Banknote, DollarSign, X } from 'lucide-react';
import { fetchAdminOrdersApi, fetchAdminDashboardSummaryApi } from '../../src/services/api';

// Robust price parser to prevent NaN
const parsePriceNum = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Map raw payment method to user-friendly label
const formatPaymentMethod = (method) => {
  if (!method) return 'Online Payment';
  const m = String(method).toUpperCase().trim();
  if (m === 'COD' || m.includes('CASH')) return 'Cash on Delivery (COD)';
  if (m === 'MOCK' || m.includes('MOCK')) return 'Mock Gateway (Test)';
  if (m === 'RAZORPAY') return 'Razorpay';
  if (m === 'STRIPE') return 'Stripe';
  if (m === 'UPI') return 'UPI Payment';
  if (m === 'CARD' || m.includes('CREDIT') || m.includes('DEBIT')) return 'Credit / Debit Card';
  if (m === 'NETBANKING') return 'Net Banking';
  return method;
};

// Helper to format date and real time (e.g. 24 Aug 2026, 07:43 pm)
const formatOrderDateTime = (rawDate) => {
  if (!rawDate) return 'Just now';
  if (typeof rawDate === 'string' && (rawDate.includes('am') || rawDate.includes('pm') || rawDate.includes('AM') || rawDate.includes('PM'))) {
    return rawDate;
  }
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);
  const datePart = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
  return `${datePart}, ${timePart}`;
};

export default function PaymentsTab() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalCollected: 0, pendingAmount: 0, failedAmount: 0, totalTxns: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const loadPaymentData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [ordersData, dashboardSummary] = await Promise.all([
        fetchAdminOrdersApi(),
        fetchAdminDashboardSummaryApi()
      ]);

      const { apiOrders = [], localOrders = [] } = ordersData || {};

      // Map API Orders
      const mappedApi = (apiOrders || []).map(o => {
        const rawId = String(o.order_number || o.id || '').trim();
        const cleanId = rawId.replace(/^#+/, '').replace(/^TXN-/, '');
        const numAmt = parsePriceNum(o.total_amount || o.amount);

        const rawPaymentStatus = (o.payment_status || '').toUpperCase();
        const rawOrderStatus = (o.status || '').toUpperCase();

        let status = 'Pending';
        if (rawPaymentStatus === 'REFUNDED' || (rawOrderStatus === 'CANCELLED' && rawPaymentStatus === 'REFUNDED')) {
          status = 'Refunded';
        } else if (rawOrderStatus === 'CANCELLED') {
          status = 'Cancelled';
        } else if (rawPaymentStatus === 'PAID' || (rawPaymentStatus !== 'FAILED' && rawOrderStatus === 'DELIVERED')) {
          status = 'Success';
        } else if (rawPaymentStatus === 'FAILED') {
          status = 'Failed';
        } else {
          status = 'Pending';
        }

        return {
          id: rawId,
          txnId: `TXN-${cleanId}`,
          orderId: cleanId ? `#${cleanId}` : '#N/A',
          rawAmount: numAmt,
          amountFormatted: `₹${numAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          method: formatPaymentMethod(o.payment_method),
          rawMethod: o.payment_method || 'MOCK',
          status,
          rawPaymentStatus: o.payment_status || 'UNPAID',
          rawOrderStatus: o.status || 'PENDING',
          customerName: o.shipping_name || o.customer?.email || 'Customer',
          customerEmail: o.shipping_email || o.customer?.email || '',
          customerPhone: o.shipping_phone || '',
          shippingAddress: o.shipping_address ? `${o.shipping_address}, ${o.shipping_city || ''}, ${o.shipping_state || ''} ${o.shipping_pincode || ''}` : 'N/A',
          deliveryOtp: o.delivery_otp || '1234',
          subtotal: parsePriceNum(o.subtotal || numAmt),
          taxAmount: parsePriceNum(o.tax_amount),
          shippingAmount: parsePriceNum(o.shipping_amount),
          discountAmount: parsePriceNum(o.discount_amount),
          items: o.items || [],
          date: formatOrderDateTime(o.created_at || o.orderDate)
        };
      });

      // Map Local Orders
      const mappedLocal = (localOrders || []).map(o => {
        const rawId = String(o.orderId || o.order_number || o.id || '').trim();
        const cleanId = rawId.replace(/^#+/, '').replace(/^TXN-/, '');
        const numAmt = parsePriceNum(o.totalPaid || o.total_amount || o.amount);

        const st = (o.status || 'PENDING').toUpperCase();
        let status = 'Pending';
        if (st === 'CANCELLED' && o.paymentStatus === 'REFUNDED') {
          status = 'Refunded';
        } else if (st === 'CANCELLED') {
          status = 'Cancelled';
        } else if (st === 'DELIVERED' || o.paymentStatus === 'PAID') {
          status = 'Success';
        } else if (o.paymentStatus === 'FAILED') {
          status = 'Failed';
        } else {
          status = 'Pending';
        }

        return {
          id: rawId,
          txnId: `TXN-${cleanId}`,
          orderId: cleanId ? `#${cleanId}` : '#N/A',
          rawAmount: numAmt,
          amountFormatted: `₹${numAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          method: formatPaymentMethod(o.paymentMethod || o.payment_method),
          rawMethod: o.paymentMethod || 'COD',
          status,
          rawPaymentStatus: status === 'Success' ? 'PAID' : status === 'Refunded' ? 'REFUNDED' : status === 'Failed' ? 'FAILED' : 'UNPAID',
          rawOrderStatus: st,
          customerName: o.address?.name || o.customer || 'Customer',
          customerEmail: o.email || 'customer@buyzo.com',
          customerPhone: o.address?.phone || '',
          shippingAddress: o.address?.details || o.address || 'India',
          deliveryOtp: '1234',
          subtotal: numAmt,
          taxAmount: 0,
          shippingAmount: 0,
          discountAmount: 0,
          items: o.items || [],
          date: formatOrderDateTime(o.orderDate || o.created_at)
        };
      });

      // Deduplicate orders by Txn ID / Order ID
      const combined = [...mappedApi, ...mappedLocal];
      const uniqueTxns = [];
      const seenIds = new Set();

      for (const t of combined) {
        if (!seenIds.has(t.txnId)) {
          seenIds.add(t.txnId);
          uniqueTxns.push(t);
        }
      }

      // Calculate dynamic revenue metrics from real database orders
      let totalCollected = 0;
      let pendingAmount = 0;
      let failedAmount = 0;
      let refundedAmount = 0;

      uniqueTxns.forEach(t => {
        if (t.status === 'Success') {
          totalCollected += t.rawAmount;
        } else if (t.status === 'Refunded') {
          refundedAmount += t.rawAmount;
        } else if (t.status === 'Pending') {
          pendingAmount += t.rawAmount;
        } else {
          failedAmount += t.rawAmount;
        }
      });

      setSummary({
        totalCollected,
        pendingAmount,
        failedAmount,
        refundedAmount,
        totalTxns: uniqueTxns.length
      });
      setTransactions(uniqueTxns);
    } catch (err) {
      console.warn('[PaymentsTab] Error fetching payment transactions:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentData();
    const interval = setInterval(() => {
      loadPaymentData(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [loadPaymentData]);

  // Filter transactions based on search and status tab
  const filtered = transactions.filter(t => {
    const matchesSearch =
      t.txnId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.amountFormatted.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' ? true :
      statusFilter === 'SUCCESS' ? t.status === 'Success' :
      statusFilter === 'PENDING' ? t.status === 'Pending' :
      t.status === 'Failed';

    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const csvRows = [
      ['Transaction ID', 'Order ID', 'Customer Name', 'Amount (INR)', 'Payment Method', 'Payment Status', 'Date']
    ];

    filtered.forEach(t => {
      csvRows.push([
        t.txnId,
        t.orderId,
        `"${t.customerName}"`,
        t.rawAmount,
        `"${t.method}"`,
        t.status,
        `"${t.date}"`
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuyZo_Payment_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payments & Settlements</h2>
            {isRefreshing && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Live Database Sync</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Monitor real revenue settlements, payment gateways, and transaction logs dynamically from database.</p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
            title="Export transaction records as CSV"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Exported!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-gray-600" />
                <span>Export CSV</span>
              </>
            )}
          </button>

          <button
            onClick={() => loadPaymentData()}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-emerald-50/70 border border-emerald-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Revenue Collected</span>
            <div className="p-2 bg-emerald-100/80 rounded-lg text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-950 mt-2">
            ₹{summary.totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-emerald-700 font-semibold mt-1">Verified settled payments</p>
        </div>

        <div className="bg-amber-50/70 border border-amber-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Settlements</span>
            <div className="p-2 bg-amber-100/80 rounded-lg text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-950 mt-2">
            ₹{summary.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-amber-700 font-semibold mt-1">COD & In-transit orders</p>
        </div>

        <div className="bg-rose-50/70 border border-rose-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Failed / Cancelled</span>
            <div className="p-2 bg-rose-100/80 rounded-lg text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-950 mt-2">
            ₹{summary.failedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-rose-700 font-semibold mt-1">Cancelled order values</p>
        </div>

        <div className="bg-cyan-50/70 border border-cyan-100 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Total Transactions</span>
            <div className="p-2 bg-cyan-100/80 rounded-lg text-cyan-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-cyan-950 mt-2">
            {summary.totalTxns.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-cyan-700 font-semibold mt-1">Processed from database</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl shrink-0 overflow-x-auto">
          {[
            { id: 'ALL', label: `All (${transactions.length})` },
            { id: 'SUCCESS', label: `Success (${transactions.filter(t => t.status === 'Success').length})` },
            { id: 'PENDING', label: `Pending (${transactions.filter(t => t.status === 'Pending').length})` },
            { id: 'FAILED', label: `Failed / Cancelled (${transactions.filter(t => t.status === 'Failed').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search TXN ID, Order ID, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading live payment records from database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Txn ID</th>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Method</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((t) => (
                  <tr
                    key={t.txnId}
                    className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedTxn(t)}
                  >
                    <td className="py-4 px-6 font-bold text-gray-900">{t.txnId}</td>
                    <td className="py-4 px-6 font-semibold text-emerald-700">{t.orderId}</td>
                    <td className="py-4 px-6 font-medium text-gray-700">
                      <div>{t.customerName}</div>
                      {t.customerEmail && <div className="text-xs text-gray-400 font-normal">{t.customerEmail}</div>}
                    </td>
                    <td className="py-4 px-6 font-black text-gray-900">{t.amountFormatted}</td>
                    <td className="py-4 px-6 text-gray-600 font-semibold text-xs">
                      <span className="inline-flex items-center space-x-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                        <CreditCard className="w-3 h-3 text-gray-500" />
                        <span>{t.method}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                          t.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          t.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {t.status === 'Success' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {t.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        {t.status === 'Failed' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>{t.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs font-medium">{t.date}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTxn(t); }}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                      No payment transactions match your search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Transaction Audit</span>
                </div>
                <h3 className="text-xl font-black mt-1">{selectedTxn.txnId}</h3>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Financial Banner */}
              <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-100 p-4 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-emerald-800 uppercase">Settlement Amount</div>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">{selectedTxn.amountFormatted}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  selectedTxn.status === 'Success' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  selectedTxn.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-rose-100 text-rose-800 border-rose-200'
                }`}>
                  {selectedTxn.status}
                </span>
              </div>

              {/* Transaction Breakdown */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Order Reference</div>
                  <div className="font-black text-gray-900 text-sm mt-1">{selectedTxn.orderId}</div>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Payment Gateway</div>
                  <div className="font-black text-gray-900 text-sm mt-1">{selectedTxn.method}</div>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Customer Name</div>
                  <div className="font-bold text-gray-800 text-sm mt-1">{selectedTxn.customerName}</div>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Date & Time</div>
                  <div className="font-bold text-gray-800 text-sm mt-1">{selectedTxn.date}</div>
                </div>
              </div>

              {/* Customer Contact & Address */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1 text-xs">
                <div className="font-bold text-gray-900 uppercase text-[10px] tracking-wider text-gray-400">Customer & Shipping Details</div>
                <div className="font-semibold text-gray-800">{selectedTxn.customerName} ({selectedTxn.customerEmail})</div>
                {selectedTxn.customerPhone && <div className="text-gray-600">Phone: {selectedTxn.customerPhone}</div>}
                <div className="text-gray-500">{selectedTxn.shippingAddress}</div>
              </div>

              {/* Items Purchased */}
              {selectedTxn.items && selectedTxn.items.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-100/70 px-4 py-2 text-xs font-bold text-gray-600 uppercase">Items Purchased ({selectedTxn.items.length})</div>
                  <div className="divide-y divide-gray-100">
                    {selectedTxn.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-gray-900">{item.product_title || item.name}</div>
                          <div className="text-gray-400">Qty: {item.quantity || item.qty || 1}</div>
                        </div>
                        <div className="font-bold text-gray-900">
                          ₹{parsePriceNum(item.total_price || item.unit_price || item.price).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedTxn(null)}
                className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Audit Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

