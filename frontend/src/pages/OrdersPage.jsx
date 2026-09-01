import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Truck,
  PackageCheck,
  Clock,
  ChevronRight,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  X,
  Wallet,
  ShoppingBag,
  Download,
  RotateCcw,
  Compass,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { useCartContext } from '../context/CartContext';
import { fetchCustomerOrdersApi, cancelOrderApi, downloadInvoiceApi } from '../services/api';
import TaxInvoiceModal from '../components/ui/TaxInvoiceModal';
import { getProductImage } from '../utils/productAssets';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
  canCustomerCancelOrder
} from '../utils/orderStatus';

export default function OrdersPage() {
  const { navigateTo } = useNavigationContext();
  const { addToCart } = useCartContext();
  const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Order placed by mistake');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

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

        const items = rawItems.map((item, idx) => ({
          id: item.id || idx,
          name: item.name || 'Product Item',
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          selectedColor: item.selectedColor || 'Standard',
          image: getProductImage(item.name || '', item.image || '')
        }));

        const firstItem = items[0] || {};

        return {
          id: o.orderId || o.id || 'ORD-LOCAL',
          rawId: o.id || o.orderId,
          order_number: o.orderId || o.id || 'ORD-LOCAL',
          date: o.orderDate || o.date || 'Recent Order',
          status: o.status || 'CONFIRMED',
          productName: firstItem.name || 'Product Item',
          color: firstItem.selectedColor || 'Standard',
          price: firstItem.price || 0,
          total_amount: Number(o.totalPaid || o.price || firstItem.price),
          quantity: firstItem.quantity || 1,
          delivery_otp: o.delivery_otp || '----',
          image: firstItem.image,
          items,
          timeline: buildTimeline(o.timeline, o.status, o.orderDate)
        };
      });

      // Merge and deduplicate by order ID
      const combined = [...formattedApi];
      const existingIds = new Set(formattedApi.map((o) => String(o.id).replace('#', '')));

      formattedLocal.forEach((lo) => {
        const cleanId = String(lo.id).replace('#', '');
        if (!existingIds.has(cleanId)) {
          combined.push(lo);
        }
      });

      setOrdersList(combined);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(false);

    const handleRealtimeUpdate = () => loadOrders(true);
    window.addEventListener('buyzo_order_updated', handleRealtimeUpdate);
    window.addEventListener('storage', handleRealtimeUpdate);

    const pollInterval = setInterval(() => loadOrders(true), 4000);
    return () => {
      window.removeEventListener('buyzo_order_updated', handleRealtimeUpdate);
      window.removeEventListener('storage', handleRealtimeUpdate);
      clearInterval(pollInterval);
    };
  }, []);

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
          if (found) localStorage.setItem(storageKey, JSON.stringify(updated));
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

  const handleReorder = (order) => {
    (order.items || []).forEach((item) => {
      addToCart({
        id: item.id || item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        selectedColor: item.selectedColor || 'Standard',
        quantity: item.quantity || 1
      });
    });
    navigateTo('cart');
  };

  const handleDownloadInvoice = async (orderId) => {
    await downloadInvoiceApi(String(orderId).replace('#', ''));
  };

  const filteredOrders = ordersList.filter((order) => {
    if (activeTab === 'All Orders') return true;
    const normTab = activeTab.toUpperCase();
    const normStatus = (order.status || '').toUpperCase();
    if (normTab === 'PROCESSING') return ['CONFIRMED', 'PROCESSING', 'PENDING'].includes(normStatus);
    return normStatus === normTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-gray-800 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Orders History 📦
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track live dispatches, download tax invoices, and manage your recent purchases.
          </p>
        </div>

        {/* Orders KPI Bar */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-center shadow-2xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Orders</span>
            <span className="text-sm font-black text-brand-800">{ordersList.length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 text-center shadow-2xs">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Delivered</span>
            <span className="text-sm font-black text-emerald-800">
              {ordersList.filter((o) => o.status === 'DELIVERED' || o.status === 'Delivered').length}
            </span>
          </div>
        </div>
      </div>

      {cancelSuccessMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-[#0d5c46] p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
          <span>{cancelSuccessMsg}</span>
          <button onClick={() => setCancelSuccessMsg(null)} className="text-emerald-700 font-extrabold hover:underline ml-4 cursor-pointer">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-500 font-extrabold hover:underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-3 border-b border-gray-200 pb-3 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const count = ordersList.filter((o) => {
            if (tab === 'All Orders') return true;
            const normTab = tab.toUpperCase();
            const normStatus = (o.status || '').toUpperCase();
            if (normTab === 'PROCESSING') return ['CONFIRMED', 'PROCESSING', 'PENDING'].includes(normStatus);
            return normStatus === normTab;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-extrabold px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                activeTab === tab
                  ? 'bg-brand-800 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List Display */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-gray-500 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-700 animate-spin mx-auto" />
          <p>Syncing live order updates...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 max-w-lg mx-auto shadow-2xs">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-gray-900">No orders found</h3>
          <p className="text-xs text-gray-500 mt-1">There are no order records matching "{activeTab}".</p>
          <button
            onClick={() => navigateTo('shop')}
            className="mt-4 bg-brand-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-900 transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
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
              <div key={order.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Order Box */}
                <div className={`${isExpanded ? 'lg:col-span-6' : 'lg:col-span-12'} bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-5 transition-all`}>
                  {/* Order Header Bar */}
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-gray-100 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-gray-900 text-sm sm:text-base">{order.id}</span>
                        <span className="text-[10px] font-bold text-gray-400">• {order.date}</span>
                      </div>
                      {order.delivery_otp && order.delivery_otp !== '----' && (
                        <div className="flex items-center space-x-1 text-[11px] font-extrabold text-emerald-700 mt-0.5">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Delivery OTP: <strong className="bg-emerald-100 px-1.5 py-0.2 rounded text-emerald-900">{order.delivery_otp}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Product Line Items */}
                  <div className="divide-y divide-gray-100 space-y-3">
                    {items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center space-x-4 pt-3 first:pt-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={item.image || getProductImage(item.name || item.product_title, '')}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => navigateTo('shop')}
                            className="font-bold text-gray-900 text-xs sm:text-sm hover:text-brand-700 cursor-pointer transition-colors line-clamp-1"
                          >
                            {item.name || item.product_title}
                          </h4>
                          {(item.selectedColor || item.selected_color) && (
                            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
                              Variant: {item.selectedColor || item.selected_color}
                            </p>
                          )}
                          <div className="mt-1 flex items-baseline space-x-3 text-xs">
                            <span className="font-extrabold text-gray-900">
                              ₹{(Number(item.price || item.unit_price || 0)).toLocaleString('en-IN')}
                            </span>
                            <span className="text-gray-400 font-semibold">Qty: {item.quantity || 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Total & Toolbar Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-500">Total Paid Amount:</span>
                    <span className="text-sm font-black text-gray-900">
                      ₹{(Number(order.total_amount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <button
                      onClick={() => setSelectedOrderIndex((prev) => (prev === orderIdx ? null : orderIdx))}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                        isExpanded ? 'bg-brand-800 text-white border-brand-800' : 'bg-gray-50 hover:bg-gray-100 text-brand-700 border-gray-200'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5 shrink-0" />
                      <span>{isExpanded ? 'Hide Status' : 'Track Status'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => handleReorder(order)}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Buy Again</span>
                    </button>

                    {canCancel ? (
                      <button
                        onClick={() => handleCancelClick(order)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        disabled
                        className="py-2 px-3 bg-gray-50 text-gray-400 text-xs font-bold rounded-xl border border-gray-100 cursor-not-allowed opacity-60"
                      >
                        {order.status === 'Delivered' ? 'Completed' : 'Shipped'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking Stepper Sidebar */}
                {isExpanded && (
                  <div className="lg:col-span-6 bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4 animate-scale-in">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h3 className="text-sm font-black text-gray-900">Live Delivery Stepper</h3>
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        OTP: {order.delivery_otp}
                      </span>
                    </div>

                    <div className="space-y-5 relative pl-2">
                      {order.timeline.map((step, idx) => {
                        const isLast = idx === order.timeline.length - 1;
                        return (
                          <div key={idx} className="relative flex items-start space-x-3 group">
                            {!isLast && (
                              <div
                                className={`absolute left-3 top-5 bottom-[-20px] w-0.5 ${
                                  step.completed ? 'bg-emerald-600' : 'bg-gray-200'
                                }`}
                              />
                            )}

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-bold transition-colors ${
                                step.completed
                                  ? 'bg-emerald-600 text-white'
                                  : step.current
                                  ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                                  : 'bg-gray-100 text-gray-400 border border-gray-300'
                              }`}
                            >
                              {step.completed ? '✓' : idx + 1}
                            </div>

                            <div className="min-w-0 flex-1 pt-0.5">
                              <h4 className={`text-xs font-extrabold ${step.completed || step.current ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.step}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{step.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-scale-in">
            <button
              onClick={() => setCancelModalOrder(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-rose-600 font-extrabold text-sm mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span>Cancel Order Confirmation</span>
            </div>
            <h3 className="text-base font-black text-gray-900 mb-2">
              Are you sure you want to cancel order {cancelModalOrder.id}?
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Any paid amount will be automatically refunded to your <strong>BuyZo Wallet</strong> instantly.
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-gray-700 block">Select Reason for Cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold text-gray-800 outline-none focus:border-brand-700"
              >
                <option value="Order placed by mistake">Order placed by mistake</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Incorrect shipping address">Incorrect shipping address</option>
                <option value="Delayed delivery time">Delayed delivery time</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={executeOrderCancellation}
                disabled={isSubmittingCancel}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modern Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={Boolean(selectedInvoiceOrder)}
        onClose={() => setSelectedInvoiceOrder(null)}
        orderData={selectedInvoiceOrder}
      />
    </div>
  );
}
