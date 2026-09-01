import React, { useState, useEffect } from 'react';
import {
  Check,
  CheckCircle2,
  FileText,
  Calendar,
  Truck,
  MapPin,
  CreditCard,
  Compass,
  ShoppingBag,
  ChevronRight,
  Printer,
  Download,
  X,
  PackageCheck,
  Package,
  Sparkles,
  Zap,
  Gift,
  Share2,
  MessageCircle
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';
import { fetchLatestOrderApi, downloadInvoiceApi } from '../services/api';
import TaxInvoiceModal from '../components/ui/TaxInvoiceModal';

const formatDateShort = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const formatMoney = (value) => Number(value || 0).toLocaleString('en-IN');

function projectedTimeline(placedOn, orderDateStr) {
  const minDelivery = new Date(placedOn);
  minDelivery.setDate(placedOn.getDate() + 3);
  const maxDelivery = new Date(placedOn);
  maxDelivery.setDate(placedOn.getDate() + 5);

  return [
    { status: 'Order Confirmed', date: orderDateStr, completed: true, current: false },
    { status: 'Processing', date: 'We are packing your order', completed: false, current: true },
    { status: 'Shipped', date: `Expected by ${formatDateShort(minDelivery)}`, completed: false, current: false },
    { status: 'Out for Delivery', date: `Expected by ${formatDateShort(maxDelivery)}`, completed: false, current: false },
    { status: 'Delivered', date: `Expected by ${formatDateShort(maxDelivery)}`, completed: false, current: false }
  ];
}

function mapOrderRow(order) {
  const placedOn = order.created_at ? new Date(order.created_at) : new Date();
  const minDelivery = new Date(placedOn);
  minDelivery.setDate(placedOn.getDate() + 3);
  const maxDelivery = new Date(placedOn);
  maxDelivery.setDate(placedOn.getDate() + 5);

  const orderDateStr =
    order.formatted_date?.replace('Placed on ', '') ||
    placedOn.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const milestones = Array.isArray(order.milestones)
    ? [...order.milestones].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    : [];

  const addressLine = [
    order.shipping_address,
    order.shipping_city,
    order.shipping_state,
    order.shipping_pincode
  ]
    .filter(Boolean)
    .join(', ');

  return {
    orderId: order.order_number || '',
    orderDate: orderDateStr,
    estimatedDelivery: `${formatDateShort(minDelivery)} – ${formatDateShort(maxDelivery)}`,
    totalPaid: formatMoney(order.total_amount),
    paymentMethod: order.payment_method || 'UPI',
    address: {
      name: order.shipping_name || 'Customer',
      type: 'HOME',
      details: addressLine || 'Delivery Address',
      phone: order.shipping_phone || ''
    },
    items: (order.items || []).map((item, i) => {
      const title = item.product_title || item.name || 'BuyZo Product';
      const variant = [item.selected_color, item.selected_size].filter(Boolean).join(' / ') || item.selectedColor || item.variant || 'Standard';
      return {
        id: item.id || i,
        name: title,
        variant,
        quantity: item.quantity || 1,
        price: formatMoney(item.total_price ?? item.unit_price ?? item.price),
        image: getProductImage(title, item.product_image || item.image)
      };
    }),
    timeline:
      milestones.length > 0
        ? milestones.map((m) => ({
            status: m.step_title,
            date: m.description || m.formatted_time || '',
            completed: !!m.is_completed,
            current: !!m.is_active
          }))
        : projectedTimeline(placedOn, orderDateStr)
  };
}

export default function OrderConfirmedPage() {
  const { navigateTo, selectedOrderData } = useNavigationContext();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isScratched, setIsScratched] = useState(false);

  const [orderData, setOrderData] = useState(() => {
    if (selectedOrderData) return selectedOrderData;
    try {
      const saved = localStorage.getItem('buyzo_last_order');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isLoading, setIsLoading] = useState(!orderData);

  useEffect(() => {
    if (orderData) return;
    let cancelled = false;

    (async () => {
      const latest = await fetchLatestOrderApi();
      if (cancelled) return;
      if (latest) setOrderData(mapOrderRow(latest));
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownloadInvoice = async () => {
    if (!orderData?.orderId || isDownloading) return;
    setIsDownloading(true);
    await downloadInvoiceApi(String(orderData.orderId).replace('#', ''));
    setIsDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs animate-pulse space-y-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto" />
              <div className="h-8 w-2/3 bg-gray-200 rounded-lg mx-auto" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs animate-pulse space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 mx-auto" />
              <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-gray-800">
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-xs max-w-lg mx-auto my-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-800">
            <PackageCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">No recent order found</h1>
          <p className="text-xs text-gray-500 mb-6">
            Once you place an order, your confirmation and live tracking timeline will appear here.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="py-3 px-8 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Shopping</span>
          </button>
        </div>
      </div>
    );
  }

  const orderItems = orderData.items || [];
  const orderTimeline = orderData.timeline || [];
  const orderAddress = orderData.address || { name: 'Customer', type: 'HOME', details: '', phone: '' };
  const itemsToDisplay = showAllItems ? orderItems : orderItems.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-gray-800">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-6">
        <button onClick={() => navigateTo('home')} className="hover:text-gray-900 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => navigateTo('checkout')} className="hover:text-gray-900 cursor-pointer">
          Checkout
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-900 font-bold">Order Confirmed</span>
      </nav>

      {/* Hero Celebratory Header Banner */}
      <div className="bg-gradient-to-br from-[#063328] via-[#094839] to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8 border border-emerald-700/40">
        <div className="absolute top-4 right-10 text-emerald-400/30 pointer-events-none">
          <Sparkles className="w-16 h-16 animate-pulse" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-300 text-emerald-950 flex items-center justify-center shrink-0 shadow-lg ring-4 ring-emerald-400/30">
              <Check className="w-9 h-9 sm:w-11 sm:h-11 stroke-[3]" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>ORDER CONFIRMED & VERIFIED</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Thank You for Your Order! 🎉
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-lg">
                Order <strong className="text-amber-300">{orderData.orderId}</strong> has been received and sent to our warehouse team for fast dispatch.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial py-2.5 px-5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 text-emerald-800" />
              <span>{isDownloading ? 'Downloading...' : 'Download Invoice'}</span>
            </button>

            <a
              href={`https://wa.me/?text=I%20just%20ordered%20from%20BuyZo!%20Order%20${orderData.orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial py-2.5 px-5 bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-bold text-xs rounded-xl border border-emerald-400/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Track on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Order Details & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Order Items & Shipping (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Meta Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
            <div className="flex items-center space-x-3 sm:border-r sm:border-gray-100 sm:pr-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-800 shrink-0">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order ID</div>
                <div className="text-xs sm:text-sm font-black text-gray-900">{orderData.orderId}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:border-r sm:border-gray-100 sm:pr-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-800 shrink-0">
                <Calendar className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Order Date</div>
                <div className="text-xs font-bold text-gray-900">{orderData.orderDate}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-brand-800 shrink-0">
                <Truck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Delivery</div>
                <div className="text-xs font-bold text-emerald-700">{orderData.estimatedDelivery}</div>
              </div>
            </div>
          </div>

          {/* Gamified Post-Purchase Scratch Card Reward */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 p-2.5 flex items-center justify-center shrink-0">
                <Gift className="w-7 h-7 text-amber-200 fill-amber-300" />
              </div>
              <div>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Post-Purchase Bonus
                </span>
                <h4 className="text-sm font-black text-white mt-1">Scratch & Reveal Your Secret Reward Coupon! 🎁</h4>
                <p className="text-[11px] text-amber-100 font-medium">Exclusive discount voucher for your next BuyZo order.</p>
              </div>
            </div>

            <button
              onClick={() => setIsScratched(true)}
              disabled={isScratched}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md shrink-0 cursor-pointer ${
                isScratched
                  ? 'bg-white text-emerald-800'
                  : 'bg-white text-amber-900 hover:bg-amber-100 active:scale-95'
              }`}
            >
              {isScratched ? '🎉 Code: SCRATCH150 (₹150 OFF)' : 'Tap to Scratch ✨'}
            </button>
          </div>

          {/* 2-Column Split: Order Items vs Shipping & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Items Box */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <h3 className="font-extrabold text-xs text-gray-900">
                    Order Items ({orderItems.length})
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400">Total: ₹{orderData.totalPaid}</span>
                </div>
                <div className="space-y-3">
                  {itemsToDisplay.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between space-x-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0">
                          <img src={getProductImage(item.name, item.image)} alt={item.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900 line-clamp-1">{item.name}</div>
                          <div className="text-[10px] text-gray-400 font-semibold">{item.variant} • Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="font-extrabold text-xs text-gray-900 shrink-0">
                        ₹{item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {orderItems.length > 2 && (
                <div className="pt-3 text-center border-t border-gray-100 mt-3">
                  <button
                    onClick={() => setShowAllItems(!showAllItems)}
                    className="text-xs font-bold text-brand-700 hover:underline cursor-pointer inline-flex items-center space-x-1"
                  >
                    <span>{showAllItems ? 'Show Less' : `View All ${orderItems.length} Items`}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Address & Payment Box */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 flex flex-col justify-between shadow-2xs">
              <div>
                <h3 className="font-extrabold text-xs text-gray-900 mb-2.5 pb-2 border-b border-gray-100 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-brand-700" />
                  <span>Delivery Address</span>
                </h3>
                <div className="flex items-start space-x-2">
                  <div>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="font-extrabold text-xs text-gray-900">{orderAddress.name}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        {orderAddress.type || 'HOME'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{orderAddress.details}</p>
                    {orderAddress.phone && (
                      <p className="text-xs text-gray-700 font-bold mt-1">📞 {orderAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 font-semibold">Payment Mode</span>
                  <span className="font-extrabold text-emerald-800">{orderData.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-gray-700">Total Paid</span>
                  <span className="text-base font-black text-gray-900">₹{orderData.totalPaid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigateTo('orders')}
              className="py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Track Live Order Status</span>
            </button>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="py-3 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <span>View Order Details</span>
            </button>

            <button
              onClick={() => navigateTo('shop')}
              className="py-3 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-gray-600" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Delivery Stepper Timeline (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-6">
            <div className="text-center pt-2">
              <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 p-3 flex items-center justify-center text-white shadow-md">
                <Package className="w-9 h-9 text-emerald-200" />
              </div>
              <h2 className="text-base font-black text-gray-900">Delivery Status Timeline</h2>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Live delivery progress updates
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Stepper Timeline */}
            <div className="space-y-6 relative pl-3">
              {orderTimeline.map((step, idx) => {
                const isLast = idx === orderTimeline.length - 1;
                return (
                  <div key={idx} className="relative flex items-start space-x-3.5 group">
                    {!isLast && (
                      <div
                        className={`absolute left-3.5 top-6 bottom-[-24px] w-0.5 ${
                          step.completed ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs transition-colors ${
                        step.completed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : step.current
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                          : 'bg-gray-100 text-gray-400 border border-gray-300'
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <h4
                        className={`text-xs font-extrabold ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.status}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5 leading-tight">{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tax Invoice Modal */}
      <TaxInvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        orderData={orderData}
      />
    </div>
  );
}
