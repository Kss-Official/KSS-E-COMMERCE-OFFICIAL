import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, Eye, Calendar, Filter, X, CheckCircle, Clock, Truck, ShoppingBag, RefreshCw } from 'lucide-react';
import { fetchAdminOrdersApi, updateOrderStatusApi } from '../../src/services/api';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);

  const parsePriceNum = (val) => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

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

  const loadAllOrders = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const { apiOrders, localOrders } = await fetchAdminOrdersApi();

      const mappedApi = (apiOrders || []).map(o => {
        let displayStatus = 'Pending';
        const st = (o.status || '').toUpperCase();
        if (st === 'CONFIRMED') displayStatus = 'Confirmed';
        else if (st === 'SHIPPED') displayStatus = 'Shipped';
        else if (st === 'OUT_FOR_DELIVERY') displayStatus = 'Out for Delivery';
        else if (st === 'DELIVERED') displayStatus = 'Delivered';
        else if (st === 'CANCELLED') displayStatus = 'Cancelled';
        else displayStatus = 'Pending';

        const numAmt = parsePriceNum(o.total_amount || o.amount);

        return {
          id: o.order_number || o.id,
          rawId: o.id || o.order_number,
          customer: o.shipping_name || o.customer?.email || 'Customer',
          email: o.shipping_email || o.customer?.email || '',
          phone: o.shipping_phone || '',
          address: o.shipping_address ? `${o.shipping_address}, ${o.shipping_city || ''}, ${o.shipping_state || ''} ${o.shipping_pincode || ''}` : 'Address Provided',
          amount: `₹${numAmt.toLocaleString('en-IN')}`,
          paymentMethod: o.payment_method || 'Online Payment',
          status: displayStatus,
          rawStatus: o.status,
          date: formatOrderDateTime(o.created_at || o.orderDate),
          items: (o.items || []).map(i => ({ name: i.product_title || i.name, qty: i.quantity || i.qty || 1, price: `₹${parsePriceNum(i.unit_price || i.price).toLocaleString('en-IN')}` }))
        };
      });

      const mappedLocal = (localOrders || []).map(o => {
        const numAmt = parsePriceNum(o.totalPaid || o.total_amount || o.amount);

        return {
          id: o.orderId || o.id,
          rawId: o.orderId || o.id,
          customer: o.address?.name || o.customer || 'Customer',
          email: o.address?.email || o.email || 'customer@buyzo.com',
          phone: o.address?.phone || o.phone || '',
          address: o.address?.details || o.address || 'India',
          amount: `₹${numAmt.toLocaleString('en-IN')}`,
          paymentMethod: o.paymentMethod || o.payment_method || 'COD',
          status: o.status || 'Pending',
          rawStatus: 'PENDING',
          date: formatOrderDateTime(o.orderDate || o.created_at),
          items: (o.items || []).map(i => ({ name: i.name || i.product_title, qty: i.quantity || i.qty || 1, price: `₹${parsePriceNum(i.price || i.unit_price).toLocaleString('en-IN')}` }))
        };
      });

      // Combine ONLY live API orders and local placed orders (No hardcoded fallback arrays)
      const combined = [...mappedApi, ...mappedLocal];
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        if (!seen.has(String(item.id))) {
          seen.add(String(item.id));
          unique.push(item);
        }
      }
      setOrders(unique);
    } catch (err) {
      console.error('[OrdersTab] Error loading orders from database:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllOrders();
    const interval = setInterval(() => {
      loadAllOrders(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [loadAllOrders]);

  const handleStatusChange = async (orderObj, newStatusLabel) => {
    // Optimistic UI Update
    setOrders(prev => prev.map(o => o.id === orderObj.id ? { ...o, status: newStatusLabel } : o));

    let backendEnum = 'PENDING';
    if (newStatusLabel === 'Confirmed') backendEnum = 'CONFIRMED';
    else if (newStatusLabel === 'Shipped') backendEnum = 'SHIPPED';
    else if (newStatusLabel === 'Out for Delivery') backendEnum = 'OUT_FOR_DELIVERY';
    else if (newStatusLabel === 'Delivered') backendEnum = 'DELIVERED';
    else if (newStatusLabel === 'Cancelled') backendEnum = 'CANCELLED';

    try {
      await updateOrderStatusApi(orderObj.rawId || orderObj.id, backendEnum);
      loadAllOrders(true);
    } catch (err) {
      console.warn('[OrdersTab] Could not sync order status to database:', err);
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) || 
                        o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Orders</h2>
            {isRefreshing && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Live Database Sync</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Track customer orders, delivery stages, and real-time database lifecycle.</p>
        </div>
        <button
          onClick={() => loadAllOrders()}
          className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading orders from database...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Status Toggle</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">{ord.id}</td>
                  <td className="py-4 px-6 font-bold text-gray-800">
                    <div>{ord.customer}</div>
                    {ord.email && <div className="text-xs font-normal text-gray-400">{ord.email}</div>}
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">{ord.amount}</td>
                  <td className="py-4 px-6">
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord, e.target.value)}
                      className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border border-transparent outline-none cursor-pointer ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Shipped' || ord.status === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'Confirmed'
                          ? 'bg-purple-100 text-purple-800'
                          : ord.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-gray-500 text-xs font-medium">{ord.date}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setViewingOrder(ord)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    No order records found in database matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Order Details ({viewingOrder.id})</h3>
                <p className="text-xs text-emerald-300">Placed on {viewingOrder.date}</p>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-emerald-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="font-bold text-gray-500 uppercase block mb-0.5">Customer</span>
                  <span className="font-extrabold text-gray-900">{viewingOrder.customer}</span>
                  <span className="block text-gray-500">{viewingOrder.email}</span>
                  <span className="block text-gray-500">{viewingOrder.phone}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 uppercase block mb-0.5">Payment Method</span>
                  <span className="font-extrabold text-gray-900">{viewingOrder.paymentMethod}</span>
                  <span className="block text-gray-500 mt-1 font-bold text-emerald-700">Total: {viewingOrder.amount}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-xs text-gray-500 uppercase block mb-1">Shipping Address</span>
                <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-200 leading-relaxed font-medium">
                  {viewingOrder.address}
                </p>
              </div>

              <div>
                <span className="font-bold text-xs text-gray-500 uppercase block mb-2">Ordered Items</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {viewingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-emerald-50/40 rounded-lg border border-emerald-100">
                      <span className="font-bold text-gray-800">{item.name}</span>
                      <span className="text-gray-500 font-semibold">Qty: {item.qty} &times; {item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2 text-sm font-bold bg-[#093529] text-white hover:bg-[#0c4737] rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
