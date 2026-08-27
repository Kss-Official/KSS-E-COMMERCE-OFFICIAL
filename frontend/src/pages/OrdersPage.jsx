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
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const buildTimeline = (rawTimeline, orderStatus = 'CONFIRMED', createdDate = '') => {
    const norm = String(orderStatus || 'CONFIRMED').toUpperCase();

    const isStepCompleted = (stepTitle) => {
      const s = String(stepTitle || '').toLowerCase();
      if (s.includes('place') || s.includes('confirm')) return true;
      if (s.includes('process') || s.includes('pack')) {
        return ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(norm);
      }
      if (s.includes('ship')) {
        return ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(norm);
      }
      if (s.includes('out for delivery') || s.includes('transit') || s.includes('doorstep') || s.includes('arrive')) {
        return ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(norm);
      }
      if (s.includes('deliver')) {
        return norm === 'DELIVERED';
      }
      return false;
    };

    const isStepCurrent = (stepTitle) => {
      const s = String(stepTitle || '').toLowerCase();
      if (norm === 'CONFIRMED' && (s.includes('confirm') || s.includes('place'))) return true;
      if (norm === 'PROCESSING' && (s.includes('process') || s.includes('pack'))) return true;
      if (norm === 'SHIPPED' && s.includes('ship')) return true;
      if (norm === 'OUT_FOR_DELIVERY' && s.includes('out for delivery')) return true;
      if (norm === 'DELIVERED' && s.includes('deliver')) return true;
      return false;
    };

    if (Array.isArray(rawTimeline) && rawTimeline.length > 0) {
      return rawTimeline.map((item, idx) => {
        const stepTitle = item.step || item.step_title || item.status || item.title || `Step ${idx + 1}`;
        const stepTime = item.time || item.description || item.formatted_time || item.date || 'In Progress';
        const isDone = isStepCompleted(stepTitle) || Boolean(item.completed || item.is_completed);
        const isCurrent = isStepCurrent(stepTitle) || Boolean(item.current || item.is_active);
        return {
          step: stepTitle,
          time: stepTime,
          completed: isDone,
          current: isCurrent
        };
      });
    }

    return [
      { step: 'Order Confirmed', time: createdDate || 'Completed', completed: true, current: norm === 'CONFIRMED' },
      { step: 'Processing', time: 'We are packing your order', completed: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(norm), current: norm === 'PROCESSING' },
      { step: 'Shipped', time: 'Handed to Courier', completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(norm), current: norm === 'SHIPPED' },
      { step: 'Out for Delivery', time: 'Expected Soon', completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(norm), current: norm === 'OUT_FOR_DELIVERY' },
      { step: 'Delivered', time: 'Delivered via OTP', completed: norm === 'DELIVERED', current: norm === 'DELIVERED' }
    ];
  };

  const loadOrders = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const { apiOrders = [], localOrders = [] } = await fetchCustomerOrdersApi();

      const formattedApi = (apiOrders || []).map((o) => {
        const rawItems = (Array.isArray(o.items) && o.items.length > 0) ? o.items : [
          {
            product_title: o.primary_product_name || 'Product Item',
            product_image: o.primary_image || '',
            unit_price: o.total_amount || 0,
            quantity: o.item_count || 1,
            selected_color: 'Standard'
          }
        ];

        const parsedTotal = typeof o.total_amount === 'string'
          ? parseFloat(o.total_amount.replace(/,/g, ''))
          : parseFloat(o.total_amount || 0);

        const items = rawItems.map((item, idx) => {
          const title = item.product_title || item.name || item.title || 'Product Item';
          const rawPrice = item.unit_price ?? item.price ?? 0;
          const parsedPrice = typeof rawPrice === 'string'
            ? parseFloat(rawPrice.replace(/,/g, ''))
            : parseFloat(rawPrice || 0);
          const qty = Number(item.quantity) || 1;
          const img = getProductImage(title, item.product_image || item.image || '');

          return {
            id: item.id || item.product || idx,
            productId: item.product || item.productId || item.id,
            name: title,
            product_title: title,
            price: parsedPrice > 0 ? parsedPrice : (parsedTotal > 0 ? parsedTotal : 0),
            unit_price: parsedPrice > 0 ? parsedPrice : (parsedTotal > 0 ? parsedTotal : 0),
            quantity: qty,
            selectedColor: item.selected_color || item.selectedColor || item.variant || 'Standard',
            selected_color: item.selected_color || item.selectedColor || item.variant || 'Standard',
            image: img
          };
        });

        const firstItem = items[0] || {};
        const placedDateStr = o.formatted_date || (o.created_at ? `Placed on ${new Date(o.created_at).toLocaleDateString('en-IN')}` : 'Recent Order');

        return {
          id: o.order_number || `ORD-${o.id}`,
          rawId: o.id,
          order_number: o.order_number || `ORD-${o.id}`,
          date: placedDateStr,
          status: o.status || 'CONFIRMED',
          productName: firstItem.name || 'Product Item',
          color: firstItem.selectedColor || 'Standard',
          price: firstItem.price || 0,
          total_amount: parsedTotal > 0 ? parsedTotal : firstItem.price,
          quantity: firstItem.quantity || 1,
          delivery_otp: o.delivery_otp || '----',
          image: firstItem.image,
          items,
          timeline: buildTimeline(o.milestones, o.status, placedDateStr)
        };
      });

      const formattedLocal = (localOrders || []).map((o) => {
        const rawItems = (Array.isArray(o.items) && o.items.length > 0) ? o.items : [
          {
            name: o.productName || 'Product Item',
            image: o.image || '',
            price: o.price || o.totalPaid || 0,
            quantity: o.quantity || 1,
            selectedColor: o.color || 'Standard'
          }
        ];

        const parsedPaid = o.totalPaid
          ? parseFloat(String(o.totalPaid).replace(/,/g, ''))
          : (parseFloat(o.total_amount) || 0);

        const items = rawItems.map((item, idx) => {
          const title = item.name || item.product_title || item.title || (typeof item === 'string' ? item : 'Product Item');
          const rawPrice = item.unit_price ?? item.price ?? 0;
          const parsedPrice = typeof rawPrice === 'string'
            ? parseFloat(rawPrice.replace(/,/g, ''))
            : parseFloat(rawPrice || 0);
          const qty = Number(item.quantity) || 1;
          const img = getProductImage(title, item.image || item.product_image || '');

          return {
            id: item.id || idx,
            productId: item.productId || item.id,
            name: title,
            product_title: title,
            price: parsedPrice > 0 ? parsedPrice : (parsedPaid > 0 ? parsedPaid : 0),
            unit_price: parsedPrice > 0 ? parsedPrice : (parsedPaid > 0 ? parsedPaid : 0),
            quantity: qty,
            selectedColor: item.selectedColor || item.selected_color || item.variant || 'Standard',
            selected_color: item.selectedColor || item.selected_color || item.variant || 'Standard',
            image: img
          };
        });

        const firstItem = items[0] || {};
        const placedDateStr = o.orderDate ? `Placed on ${o.orderDate}` : (o.date || 'Recent Order');

        return {
          id: o.orderId || o.order_number || o.id || 'ORD-LOCAL',
          rawId: o.orderId || o.order_number || o.id,
          order_number: o.orderId || o.order_number || o.id,
          date: placedDateStr,
          status: o.status || 'CONFIRMED',
          productName: firstItem.name || 'Product Item',
          color: firstItem.selectedColor || 'Standard',
          price: firstItem.price || 0,
          total_amount: parsedPaid > 0 ? parsedPaid : firstItem.price,
          quantity: firstItem.quantity || 1,
          delivery_otp: o.delivery_otp || '1234',
          image: firstItem.image,
          items,
          timeline: buildTimeline(o.timeline, o.status, placedDateStr)
        };
      });

      // Merge API orders and local placed orders without duplicates
      const combined = [...formattedLocal, ...formattedApi];
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        const cleanKey = String(item.id || item.order_number || '').trim();
        if (cleanKey && !seen.has(cleanKey)) {
          seen.add(cleanKey);
          unique.push(item);
        }
      }

      setOrdersList(unique);
    } catch (e) {
      console.warn('Error loading orders:', e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(false);

    const handleRealtimeUpdate = () => {
      loadOrders(true);
    };

    window.addEventListener('buyzo_order_updated', handleRealtimeUpdate);
    window.addEventListener('storage', handleRealtimeUpdate);

    // Silent background poll every 3 seconds for active cross-panel real-time updates
    const pollInterval = setInterval(() => {
      loadOrders(true);
    }, 3000);

    return () => {
      window.removeEventListener('buyzo_order_updated', handleRealtimeUpdate);
      window.removeEventListener('storage', handleRealtimeUpdate);
      clearInterval(pollInterval);
    };
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
        const cleanTarget = String(orderNum).replace('#', '').trim();
        const updateStorage = (storageKey) => {
          const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
          let found = false;
          const updated = stored.map((o) => {
            const key = String(o.orderId || o.order_number || o.id || '').replace('#', '').trim();
            if (key && (key === cleanTarget || key.includes(cleanTarget) || cleanTarget.includes(key))) {
              found = true;
              return { ...o, status: 'CANCELLED', paymentStatus: 'REFUNDED' };
            }
            return o;
          });
          if (found) {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          }
          return found;
        };

        const foundInOrders = updateStorage('buyzo_orders');
        const foundInPlaced = updateStorage('buyzo_placed_orders');

        if (foundInOrders || foundInPlaced || (res && res.status_code === 404)) {
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
            const items = (Array.isArray(order.items) && order.items.length > 0) ? order.items : [{
              name: order.productName,
              image: order.image,
              price: order.price,
              quantity: order.quantity,
              selectedColor: order.color
            }];

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

                  {/* List of Ordered Items */}
                  <div className="divide-y divide-gray-100 space-y-4">
                    {items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center space-x-5 pt-3 first:pt-0">
                        <div className="w-24 h-24 bg-white border border-gray-200/80 rounded-xl p-2 flex items-center justify-center shrink-0">
                          <img
                            src={item.image || getProductImage(item.name || item.product_title, '')}
                            alt={item.name || item.product_title || 'Product'}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getProductImage(item.name || item.product_title, '');
                            }}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => navigateTo('shop')}
                            className="font-bold text-gray-900 text-base hover:text-brand-700 cursor-pointer transition-colors line-clamp-2"
                          >
                            {item.name || item.product_title || 'Product Item'}
                          </h4>
                          {(item.selectedColor || item.selected_color || item.color) && (
                            <p className="text-xs text-gray-400 font-medium mt-1">
                              Variant: {item.selectedColor || item.selected_color || item.color}
                            </p>
                          )}

                          <div className="mt-3 flex items-baseline space-x-4">
                            <span className="text-base font-black text-gray-900">
                              ₹{(Number(item.price || item.unit_price || 0)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                              Qty: {item.quantity || 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Order Summary footer if multi-item */}
                  {items.length > 1 && (
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
                      <span>Total Order Amount:</span>
                      <span className="text-sm font-black text-gray-900">
                        ₹{(Number(order.total_amount || 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => setSelectedOrderIndex((prev) => (prev === orderIdx ? null : orderIdx))}
                      className={`w-full py-2.5 font-bold text-xs rounded-xl border transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                        isExpanded
                          ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-brand-700 border-gray-200'
                      }`}
                    >
                      <span>{isExpanded ? 'Hide Tracking' : 'Track Order Status'}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(order)}
                        className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer shrink-0"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Order Tracking Card */}
                {isExpanded && (
                  <div className="lg:col-span-6 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-6 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-gray-900">Order Tracking</h3>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                        Delivery OTP: {order.delivery_otp}
                      </span>
                    </div>

                    <div className="relative pl-6 space-y-6">
                      {(order.timeline || []).map((step, idx) => {
                        const isLast = idx === (order.timeline || []).length - 1;
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
                                  step.completed ? 'text-gray-900' : 'text-gray-500'
                                }`}
                              >
                                {step.step || step.status || step.step_title || 'Status Step'}
                              </span>
                              <span className="text-xs font-semibold text-gray-500">
                                {step.time || step.date || step.description || 'Pending'}
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


