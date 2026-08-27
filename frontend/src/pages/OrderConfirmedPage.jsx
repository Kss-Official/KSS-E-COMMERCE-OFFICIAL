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
  Sparkles
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { getProductImage } from '../utils/productAssets';
import { fetchLatestOrderApi, downloadInvoiceApi } from '../services/api';

const formatDateShort = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const formatMoney = (value) => Number(value || 0).toLocaleString('en-IN');

// Used when an order has no OrderTrackingMilestone rows yet.
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

// Maps a real MySQL order row onto the shape this screen renders.
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

  // Order data comes from the checkout hand-off, the last-order cache, or MySQL.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadInvoice = async () => {
    if (!orderData?.orderId || isDownloading) return;
    setIsDownloading(true);
    await downloadInvoiceApi(String(orderData.orderId).replace('#', ''));
    setIsDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs animate-pulse space-y-6">
              <div className="w-14 h-14 rounded-full bg-gray-200 mx-auto" />
              <div className="h-7 w-2/3 bg-gray-200 rounded-lg mx-auto" />
              <div className="h-24 bg-gray-100 rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-40 bg-gray-100 rounded-2xl" />
                <div className="h-40 bg-gray-100 rounded-2xl" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs animate-pulse space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-gray-200 mx-auto" />
              <div className="h-5 w-1/2 bg-gray-200 rounded mx-auto" />
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                  <div className="h-4 flex-1 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed-out visitor landing here directly with nothing to show.
  if (!orderData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-gray-800">
        <div className="bg-white rounded-3xl border border-gray-200/90 p-12 text-center shadow-xs max-w-lg mx-auto my-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-800">
            <PackageCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">No recent order found</h1>
          <p className="text-sm text-gray-500 mb-6">
            Once you place an order, your confirmation and tracking timeline will appear here.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="py-3 px-8 bg-brand-800 hover:bg-brand-900 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
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

  // Dynamic items to display (handle "View All Items" toggle if > 2 items)
  const itemsToDisplay = showAllItems ? orderItems : orderItems.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-gray-800">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 font-medium mb-5">
        <button onClick={() => navigateTo('home')} className="hover:text-gray-900 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <button onClick={() => navigateTo('checkout')} className="hover:text-gray-900 cursor-pointer">
          Checkout
        </button>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-900 font-semibold">Order Confirmed</span>
      </nav>

      {/* Main Grid: Left Order Details (8 cols) + Right Delivery Tracker (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Order Details Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
            {/* Confetti Sparkles Decoration */}
            <div className="absolute top-4 left-1/4 text-brand-500 pointer-events-none animate-sparkle"><Sparkles className="w-4 h-4" /></div>
            <div className="absolute top-6 right-1/4 text-gold pointer-events-none animate-sparkle"><Sparkles className="w-4 h-4" /></div>

            {/* Celebratory Header */}
            <div className="text-center max-w-lg mx-auto mb-8 pt-2">
              <div className="w-14 h-14 rounded-full bg-brand-800 text-white flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-emerald-50">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Order Placed Successfully!
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                Thank you for shopping with BuyZo.<br />
                We have received your order and it is being processed.
              </p>
            </div>

            {/* Order Meta Highlight Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-200/80 mb-6">
              {/* Order ID */}
              <div className="flex items-center space-x-3 sm:border-r sm:border-gray-200 sm:pr-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-800 shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Order ID</div>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900">{orderData.orderId}</div>
                </div>
              </div>

              {/* Order Date */}
              <div className="flex items-center space-x-3 sm:border-r sm:border-gray-200 sm:pr-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-800 shrink-0 shadow-2xs">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Order Date</div>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900">{orderData.orderDate}</div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center space-x-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-800 shrink-0 shadow-2xs">
                  <Truck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Estimated Delivery</div>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900">{orderData.estimatedDelivery}</div>
                </div>
              </div>
            </div>

            {/* 2-Column Split: Order Items (Left) vs Delivery Address & Payment (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Order Items Box */}
              <div className="rounded-2xl border border-gray-200/90 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-3">
                    Order Items ({orderItems.length})
                  </h3>
                  <div className="space-y-3">
                    {itemsToDisplay.map((item, index) => (
                      <div key={item.id || index} className="flex items-center justify-between space-x-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200/70 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={getProductImage(item.name, item.image)} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-gray-900 line-clamp-1">{item.name}</div>
                            <div className="text-[11px] text-gray-500">{item.variant}</div>
                            <div className="text-[11px] text-gray-500">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-extrabold text-xs sm:text-sm text-gray-900 shrink-0">
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
                      className="text-xs font-semibold text-gray-600 hover:text-black cursor-pointer inline-flex items-center space-x-1"
                    >
                      <span>{showAllItems ? 'Show Less' : `View All ${orderItems.length} Items`}</span>
                      <span className="transform transition-transform">{showAllItems ? '▴' : '⌄'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Address & Payment Details Box */}
              <div className="rounded-2xl border border-gray-200/90 p-4 space-y-4 flex flex-col justify-between">
                {/* Delivery Address */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2">Delivery Address</h3>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="font-bold text-xs text-gray-900">{orderAddress.name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {orderAddress.type || 'HOME'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{orderAddress.details}</p>
                      {orderAddress.phone && (
                        <p className="text-xs text-gray-700 font-semibold mt-1">{orderAddress.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Payment Details */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 mb-2 flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-gray-700" />
                    <span>Payment Details</span>
                  </h3>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Paid via {orderData.paymentMethod}</span>
                    <span className="font-black italic text-brand-800 text-xs">
                      {orderData.paymentMethod} <span className="text-accent">▶</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-gray-700">Total Paid</span>
                    <span className="text-base sm:text-lg font-black text-gray-900">₹{orderData.totalPaid}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Notice */}
            <p className="text-xs text-gray-500 text-center mb-5">
              You will receive an email and SMS with your order details.
            </p>

            {/* Bottom 3 Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigateTo('orders')}
                className="py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <Compass className="w-4 h-4 text-emerald-300" />
                <span>Track Your Order</span>
              </button>

              <button
                onClick={() => setShowInvoiceModal(true)}
                className="py-3 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <FileText className="w-4 h-4 text-gray-600" />
                <span>View Invoice</span>
              </button>

              <button
                onClick={() => navigateTo('home')}
                className="py-3 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-gray-600" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Delivery Timeline Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-7 shadow-xs space-y-6">
            {/* Top Package Graphic & Message */}
            <div className="text-center pt-2">
              <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center relative">
                {/* 3D Delivery Box Illustration */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 via-[#063328] to-emerald-950 p-3 flex items-center justify-center text-white shadow-xl relative transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Package className="w-10 h-10 text-emerald-200" />
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-300/60" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-300/60" />
                </div>
                {/* Subtle speed lines */}
                <div className="absolute -left-2 top-8 w-4 h-0.5 bg-emerald-300/70 rounded-full" />
                <div className="absolute -left-4 top-12 w-6 h-0.5 bg-emerald-400/80 rounded-full" />
                <div className="absolute -right-2 top-10 w-4 h-0.5 bg-emerald-300/70 rounded-full" />
              </div>

              <h2 className="text-lg font-black text-gray-900">We're Getting It Ready!</h2>
              <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto leading-relaxed">
                Your order is confirmed and will be delivered to you soon.
              </p>
            </div>

            <hr className="border-gray-100" />

            {/* Vertical Stepper Timeline */}
            <div className="space-y-6 relative pl-3">
              {orderTimeline.map((step, idx) => {
                const isLast = idx === orderTimeline.length - 1;
                return (
                  <div key={idx} className="relative flex items-start space-x-3.5 group">
                    {/* Vertical Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute left-3.5 top-6 bottom-[-24px] w-0.5 ${
                          step.completed ? 'bg-emerald-600' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Step Icon Node */}
                    <div className="relative z-10 shrink-0">
                      {step.completed ? (
                        <div className="w-7 h-7 rounded-full bg-brand-800 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : step.current ? (
                        <div className="w-7 h-7 rounded-full border-2 border-emerald-700 bg-emerald-50 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-ping" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="pt-0.5">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.status}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-black text-gray-900">Tax Invoice / Receipt</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-bold text-gray-900">INV-{(orderData.orderId || '').replace('#BZ', '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-bold text-gray-900">{orderData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-bold text-gray-900">{orderData.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billed To:</span>
                <span className="font-bold text-gray-900">{orderAddress.name}</span>
              </div>

              <div className="border-t border-b border-gray-100 py-2 my-2 space-y-1.5">
                {orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} ({item.variant}) x{item.quantity}</span>
                    <span className="font-bold text-gray-900">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-black pt-1">
                <span>Total Amount Paid:</span>
                <span className="text-brand-800">₹{orderData.totalPaid}</span>
              </div>
            </div>

            <div className="pt-5 flex justify-end space-x-3">
              <button
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-6 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


