import React, { useState } from 'react';
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
  Package
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';

// Import product images
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';

export default function OrderConfirmedPage() {
  const { navigateTo, selectedOrderData } = useNavigationContext();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);

  const fallbackOrderData = {
    orderId: `#BZ${Date.now().toString().slice(-8)}`,
    orderDate: 'Today',
    estimatedDelivery: '3 – 5 Days',
    totalPaid: '0',
    paymentMethod: 'UPI',
    address: {
      name: 'Customer',
      type: 'HOME',
      details: 'No delivery address provided',
      phone: ''
    },
    items: [
      {
        id: 1,
        name: 'boAt Rockerz 450',
        variant: 'Teal Green',
        quantity: 1,
        price: '1,499',
        image: boatRockerzImg
      },
      {
        id: 2,
        name: 'Noise ColorFit Pro 5',
        variant: 'Jet Black',
        quantity: 1,
        price: '2,999',
        image: noiseSmartwatchImg
      }
    ],
    timeline: [
      {
        status: 'Order Confirmed',
        date: 'Today',
        completed: true,
        current: false
      },
      {
        status: 'Processing',
        date: 'We are packing your order',
        completed: false,
        current: true
      },
      {
        status: 'Shipped',
        date: 'Expected by 26 Aug 2026',
        completed: false,
        current: false
      },
      {
        status: 'Out for Delivery',
        date: 'Expected by 28 Aug 2026',
        completed: false,
        current: false
      },
      {
        status: 'Delivered',
        date: 'Expected by 30 Aug 2026',
        completed: false,
        current: false
      }
    ]
  };

  const orderData = selectedOrderData || fallbackOrderData;

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
            <div className="absolute top-4 left-1/4 text-emerald-400 text-xs pointer-events-none">✦</div>
            <div className="absolute top-8 left-1/3 text-amber-400 text-sm pointer-events-none">▲</div>
            <div className="absolute top-6 right-1/4 text-orange-400 text-xs pointer-events-none">✦</div>
            <div className="absolute top-10 right-1/3 text-emerald-500 text-xs pointer-events-none">●</div>
            <div className="absolute top-4 right-1/2 text-amber-500 text-xs pointer-events-none">◆</div>

            {/* Celebratory Header */}
            <div className="text-center max-w-lg mx-auto mb-8 pt-2">
              <div className="w-14 h-14 rounded-full bg-[#063328] text-white flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-emerald-50">
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
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#063328] shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Order ID</div>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900">{orderData.orderId}</div>
                </div>
              </div>

              {/* Order Date */}
              <div className="flex items-center space-x-3 sm:border-r sm:border-gray-200 sm:pr-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#063328] shrink-0 shadow-2xs">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 font-medium">Order Date</div>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900">{orderData.orderDate}</div>
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center space-x-3 py-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#063328] shrink-0 shadow-2xs">
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
                    Order Items ({orderData.items.length})
                  </h3>
                  <div className="space-y-3">
                    {orderData.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between space-x-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200/70 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
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

                <div className="pt-3 text-center border-t border-gray-100 mt-3">
                  <button
                    onClick={() => setShowAllItems(!showAllItems)}
                    className="text-xs font-semibold text-gray-600 hover:text-black cursor-pointer inline-flex items-center space-x-1"
                  >
                    <span>View All Items</span>
                    <span>⌄</span>
                  </button>
                </div>
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
                        <span className="font-bold text-xs text-gray-900">{orderData.address.name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {orderData.address.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{orderData.address.details}</p>
                      <p className="text-xs text-gray-700 font-semibold mt-1">{orderData.address.phone}</p>
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
                    <span className="font-black italic text-[#063328] text-xs">
                      UPI <span className="text-[#ff5100]">▶</span>
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
                className="py-3 px-4 rounded-xl bg-[#063328] hover:bg-[#04241c] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
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
              {orderData.timeline.map((step, idx) => {
                const isLast = idx === orderData.timeline.length - 1;
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
                        <div className="w-7 h-7 rounded-full bg-[#063328] text-white flex items-center justify-center shadow-xs">
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
                <span className="font-bold text-gray-900">INV-2026-0824-001</span>
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
                <span className="font-bold text-gray-900">{orderData.address.name}</span>
              </div>

              <div className="border-t border-b border-gray-100 py-2 my-2 space-y-1.5">
                {orderData.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} ({item.variant}) x{item.quantity}</span>
                    <span className="font-bold text-gray-900">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-black pt-1">
                <span>Total Amount Paid:</span>
                <span className="text-[#063328]">₹{orderData.totalPaid}</span>
              </div>
            </div>

            <div className="pt-5 flex justify-end space-x-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#063328] hover:bg-[#04241c] text-white text-xs font-bold shadow-md cursor-pointer"
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
