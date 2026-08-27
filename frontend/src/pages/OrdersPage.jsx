import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Truck, PackageCheck, Clock, ChevronRight, XCircle, FileText, AlertTriangle, RefreshCw, X, Wallet } from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { fetchCustomerOrdersApi, cancelOrderApi } from '../services/api';
import { getProductImage } from '../utils/productAssets';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  canCustomerCancelOrder
} from '../utils/orderStatus';

export default function OrdersPage() {
  const { navigateTo } = useNavigationContext();
  const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    const { apiOrders = [], localOrders = [] } = await fetchCustomerOrdersApi();

    const formattedApi = (apiOrders || []).map((o) => {
      const firstItem = o.items && o.items[0] ? o.items[0] : {};
      const pName = firstItem.product_title || 'Product Item';
      const pImg = getProductImage(pName, firstItem.product_image || o.product_image);

      let timeline = [
        { step: 'Order Placed', time: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : 'Completed', completed: true },
        { step: 'Confirmed', time: 'Warehouse Confirmed', completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes((o.status || '').toUpperCase()) },
        { step: 'Shipped', time: 'Handed to Courier', completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes((o.status || '').toUpperCase()) },
        { step: 'Out for Delivery', time: 'En-route to Customer', completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes((o.status || '').toUpperCase()) },
        { step: 'Delivered', time: 'Delivered via OTP', completed: (o.status || '').toUpperCase() === 'DELIVERED' }
      ];

      if (o.milestones && o.milestones.length > 0) {
        timeline = o.milestones.map((m) => ({
          step: m.step_title,
          time: m.description,
          completed: m.is_completed
        }));
      }

      const unitPrice = parseFloat(firstItem.unit_price || (firstItem.total_price && firstItem.quantity ? firstItem.total_price / firstItem.quantity : 0) || o.total_amount || 0);

      return {
        id: o.order_number || `ORD-${o.id}`,
        rawId: o.id,
        order_number: o.order_number,
        date: o.created_at ? `Placed on ${new Date(o.created_at).toLocaleDateString('en-IN')}` : 'Recent Order',
        status: o.status || 'CONFIRMED',
        productName: pName,
        color: firstItem.selected_color || 'Default Variant',
        price: unitPrice > 0 ? unitPrice : 1499,
        total_amount: parseFloat(o.total_amount || unitPrice),
        quantity: firstItem.quantity || 1,
        delivery_otp: o.delivery_otp || '----',
        image: pImg,
        timeline
      };
    });

    const formattedLocal = (localOrders || []).map((o) => {
      const firstItem = o.items && o.items[0] ? o.items[0] : {};
      const itemName = firstItem.name || firstItem.product_title || firstItem.title || (typeof firstItem === 'string' ? firstItem : 'Product Item');
      const parsedPaid = o.totalPaid ? parseFloat(String(o.totalPaid).replace(/,/g, '')) : 0;
      const unitPrice = parseFloat(firstItem.price || firstItem.unit_price || (parsedPaid > 0 ? parsedPaid : 0)) || 1499;

      return {
        id: o.orderId || o.order_number || o.id || 'ORD-LOCAL',
        rawId: o.orderId || o.order_number || o.id,
        order_number: o.orderId || o.order_number || o.id,
        date: o.orderDate ? `Placed on ${o.orderDate}` : o.date || 'Recent Order',
        status: o.status || 'CONFIRMED',
        productName: itemName,
        color: firstItem.selectedColor || firstItem.selected_color || 'Standard',
        price: unitPrice,
        total_amount: parsedPaid > 0 ? parsedPaid : unitPrice,
        quantity: firstItem.quantity || (o.items ? o.items.length : 1),
        delivery_otp: o.delivery_otp || '1234',
        image: getProductImage(itemName, firstItem.image || firstItem.product_image || ''),
        timeline: o.timeline || [
          { step: 'Order Placed', time: 'Just now', completed: true },
          { step: 'Confirmed', time: 'Confirmed', completed: true },
          { step: 'Shipped', time: 'In Queue', completed: o.status === 'SHIPPED' },
          { step: 'Out for Delivery', time: 'Pending', completed: o.status === 'OUT_FOR_DELIVERY' },
          { step: 'Delivered', time: 'Pending', completed: o.status === 'DELIVERED' }
        ]
      };
    });

    // Merge API orders and local placed orders without duplicates
    const combined = [...formattedApi, ...formattedLocal];
    const unique = [];
    const seen = new Set();
    for (const item of combined) {
      const cleanKey = String(item.id || item.order_number).trim();
      if (cleanKey && !seen.has(cleanKey)) {
        seen.add(cleanKey);
        unique.push(item);
      }
    }

    setOrdersList(unique);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Order placed by mistake');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleCancelClick = (order) => {
    setActionError(null);
    setCancelSuccessMsg(null);
    if (!canCustomerCancelOrder(order.status)) {
      setActionError(`Order ${order.id} cannot be cancelled because it is already ${getOrderStatusLabel(order.status)}.`);
      return;
    }
    setCancelModalOrder(order);
    setCancelReason('Order placed by mistake');
  };

  const executeOrderCancellation = async () => {
    if (!cancelModalOrder) return;
    setIsSubmittingCancel(true);
    const order = cancelModalOrder;
    const orderNum = order.order_number || order.id || order.rawId;

    const res = await cancelOrderApi(orderNum, cancelReason);

    let isCancelled = false;
    let refundMsg = '';

    if (res && res.status !== 'error' && (!res.status_code || res.status_code < 400)) {
      isCancelled = true;
      refundMsg = res?.message || `Order ${order.id} has been cancelled successfully.`;
    } else {
      // Local fallback for orders saved in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('buyzo_orders') || '[]');
        let found = false;
        const cleanTarget = String(orderNum).replace('#', '').trim();

        const updated = stored.map(o => {
          const key = String(o.orderId || o.order_number || o.id || '').replace('#', '').trim();
          if (key && (key === cleanTarget || key.includes(cleanTarget) || cleanTarget.includes(key))) {
            found = true;
            return { ...o, status: 'CANCELLED', paymentStatus: 'REFUNDED' };
          }
          return o;
        });

        if (found || (res && res.status_code === 404)) {
          localStorage.setItem('buyzo_orders', JSON.stringify(updated));
          isCancelled = true;
          refundMsg = `Order ${order.id} has been cancelled successfully. Refund credited to your BuyZo Wallet.`;
        }
      } catch (e) {
        console.warn('Error updating local order cancellation:', e);
      }
    }

    setIsSubmittingCancel(false);

    if (isCancelled) {
      setCancelSuccessMsg(refundMsg);
      window.dispatchEvent(new Event('buyzo_auth_change'));
      setCancelModalOrder(null);
      await loadOrders();
    } else {
      setActionError(res?.message || 'Failed to cancel order.');
    }
  };

  const filteredOrders = ordersList.filter((order) => {
    if (activeTab === 'All Orders') return true;
    const normTab = activeTab.toUpperCase();
    const normStatus = (order.status || '').toUpperCase();
    if (normTab === 'PROCESSING') return ['CONFIRMED', 'PROCESSING', 'PENDING'].includes(normStatus);
    return normStatus === normTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 font-sans text-gray-800 relative">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
        My Orders
      </h1>

      {cancelSuccessMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-[#0d5c46] p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-2xs">
          <span>{cancelSuccessMsg}</span>
          <button onClick={() => setCancelSuccessMsg(null)} className="text-emerald-700 font-bold hover:underline ml-4">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-500 font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-6 border-b border-gray-200 pb-3 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold transition-colors pb-3 -mb-3 whitespace-nowrap ${
              activeTab === tab
                ? 'text-brand-700 border-b-2 border-brand-700'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 font-bold">Syncing order records...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center text-gray-500 max-w-lg mx-auto">
          <p className="text-lg font-bold text-gray-700">No orders found</p>
          <p className="text-xs mt-1">There are no orders matching "{activeTab}".</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, orderIdx) => {
            const isExpanded = selectedOrderIndex === orderIdx;
            const canCancel = canCustomerCancelOrder(order.status);
            return (
              <div
                key={order.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Order Summary Box */}
                <div
                  className={`${
                    isExpanded ? 'lg:col-span-6' : 'lg:col-span-12'
                  } bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-6`}
                >
                  <div className="flex flex-wrap justify-between items-center pb-4 border-b border-gray-100 gap-2">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                        Order ID: <span className="font-bold text-gray-700">{order.id}</span>
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">{order.date}</p>
                    </div>

                    {/* Status Pill Badge */}
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-brand-700 border-emerald-200'
                          : order.status === 'Shipped'
                          ? 'bg-emerald-50 text-brand-700 border-emerald-200'
                          : order.status === 'Processing'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-5">
                    <div className="w-24 h-24 bg-white border border-gray-200/80 rounded-xl p-2 flex items-center justify-center shrink-0">
                      <img
                        src={order.image}
                        alt={order.productName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getProductImage(order.productName, '');
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <h4
                        onClick={() => navigateTo('electronics')}
                        className="font-bold text-gray-900 text-base hover:text-brand-700 cursor-pointer transition-colors"
                      >
                        {order.productName}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium mt-1">{order.color}</p>

                      <div className="mt-3 flex items-baseline space-x-4">
                        <span className="text-base font-black text-gray-900">
                          ₹{order.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">
                          Qty: {order.quantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => setSelectedOrderIndex(orderIdx)}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-brand-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Track Order Status</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Tracking Card */}
                {isExpanded && (
                  <div className="lg:col-span-6 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-gray-900">Order Tracking</h3>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                        Delivery OTP: {order.delivery_otp}
                      </span>
                    </div>

                    <div className="relative pl-6 space-y-6">
                      {order.timeline.map((step, idx) => {
                        const isLast = idx === order.timeline.length - 1;
                        return (
                          <div key={idx} className="relative flex items-start justify-between">
                            {!isLast && (
                              <div
                                className={`absolute left-[-17px] top-6 w-0.5 h-10 ${
                                  step.completed ? 'bg-brand-700' : 'bg-gray-200'
                                }`}
                              />
                            )}

                            <div className="absolute left-[-24px] top-0.5 bg-white rounded-full">
                              {step.completed ? (
                                <div className="w-4 h-4 rounded-full bg-brand-700 flex items-center justify-center ring-4 ring-emerald-50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                              )}
                            </div>

                            <div className="flex justify-between items-center w-full">
                              <span
                                className={`text-xs font-bold ${
                                  step.completed ? 'text-gray-900' : 'text-gray-400'
                                }`}
                              >
                                {step.step}
                              </span>
                              <span className="text-xs font-semibold text-gray-400">
                                {step.time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => alert(`Tracking details for ${order.id}`)}
                        className="py-2.5 px-4 bg-white border border-brand-700 text-brand-700 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors text-center"
                      >
                        Track Order
                      </button>
                      <button
                        onClick={() => navigateTo('product-detail')}
                        className="py-2.5 px-4 bg-white border border-brand-700 text-brand-700 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors text-center"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Order Cancellation Popup Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/10 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-rose-200" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Cancel Order #{cancelModalOrder.id}?</h3>
                  <p className="text-xs text-rose-100 font-medium">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                disabled={isSubmittingCancel}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start space-x-3">
                <Wallet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed font-medium">
                  <span className="font-extrabold block text-emerald-950">Instant Wallet Refund</span>
                  If this order was prepaid, the amount of <strong className="font-black text-emerald-700">₹{parseFloat(cancelModalOrder.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> will be credited directly to your BuyZo Wallet.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-sm font-semibold border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition-all cursor-pointer"
                >
                  <option value="Order placed by mistake">Order placed by mistake</option>
                  <option value="Item price dropped / Found cheaper elsewhere">Item price dropped / Found cheaper elsewhere</option>
                  <option value="Shipping time is too long">Shipping time is too long</option>
                  <option value="Need to change shipping address or payment method">Need to change address / payment</option>
                  <option value="Other / Changed my mind">Other / Changed my mind</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  disabled={isSubmittingCancel}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={executeOrderCancellation}
                  disabled={isSubmittingCancel}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSubmittingCancel ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


