import React, { useState } from 'react';
import { CheckCircle2, Circle, Truck, PackageCheck, Clock, ChevronRight } from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';

// Import images
import boatRockerzImg from '../assets/images/boat_rockerz.jpg';
import noiseSmartwatchImg from '../assets/images/noise_smartwatch.jpg';
import sonyHeadphonesImg from '../assets/images/sony_headphones.jpg';

const initialOrders = [
  {
    id: 'SN123456789',
    date: 'Placed on 18 May 2024',
    status: 'Shipped',
    productName: 'boAt Rockerz 450',
    color: 'Teal Green',
    price: 1499,
    quantity: 1,
    image: boatRockerzImg,
    timeline: [
      { step: 'Order Placed', time: '18 May, 10:30 AM', completed: true },
      { step: 'Confirmed', time: '18 May, 11:00 AM', completed: true },
      { step: 'Shipped', time: '19 May, 09:15 AM', completed: true, active: true },
      { step: 'Out for Delivery', time: '20 May, 08:40 AM', completed: false },
      { step: 'Delivered', time: 'Expected by 21 May', completed: false }
    ]
  },
  {
    id: 'SN987654321',
    date: 'Placed on 10 May 2024',
    status: 'Delivered',
    productName: 'Noise ColorFit Pro 5',
    color: 'Black',
    price: 2999,
    quantity: 1,
    image: noiseSmartwatchImg,
    timeline: [
      { step: 'Order Placed', time: '10 May, 09:00 AM', completed: true },
      { step: 'Confirmed', time: '10 May, 09:30 AM', completed: true },
      { step: 'Shipped', time: '11 May, 02:15 PM', completed: true },
      { step: 'Out for Delivery', time: '13 May, 09:00 AM', completed: true },
      { step: 'Delivered', time: '13 May, 04:30 PM', completed: true, active: true }
    ]
  },
  {
    id: 'SN456789123',
    date: 'Placed on 21 May 2024',
    status: 'Processing',
    productName: 'Sony WH-CH510',
    color: 'Black',
    price: 2499,
    quantity: 1,
    image: sonyHeadphonesImg,
    timeline: [
      { step: 'Order Placed', time: '21 May, 02:15 PM', completed: true, active: true },
      { step: 'Confirmed', time: 'Expected by 21 May', completed: false },
      { step: 'Shipped', time: 'Expected by 22 May', completed: false },
      { step: 'Out for Delivery', time: 'Expected by 23 May', completed: false },
      { step: 'Delivered', time: 'Expected by 24 May', completed: false }
    ]
  }
];

const tabs = ['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const { navigateTo } = useNavigationContext();
  const [activeTab, setActiveTab] = useState('All Orders');
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  const filteredOrders = initialOrders.filter((order) => {
    if (activeTab === 'All Orders') return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 font-sans text-gray-800 relative">
      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-6">
        My Orders
      </h1>

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
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center text-gray-500 max-w-lg mx-auto">
          <p className="text-lg font-bold text-gray-700">No orders found</p>
          <p className="text-xs mt-1">There are no orders matching "{activeTab}".</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, orderIdx) => {
            const isExpanded = selectedOrderIndex === orderIdx;
            return (
              <div
                key={order.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                {/* Order Summary Box (Left 6 or 7 cols) */}
                <div
                  className={`${
                    isExpanded ? 'lg:col-span-6' : 'lg:col-span-12'
                  } bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-6`}
                >
                  {/* Order Header Row */}
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

                  {/* Order Details Body */}
                  <div className="flex items-center space-x-5">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 bg-white border border-gray-200/80 rounded-xl p-2 flex items-center justify-center shrink-0">
                      <img
                        src={order.image}
                        alt={order.productName}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Product Details */}
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

                  {/* Select order tracking view button if collapsed */}
                  {!isExpanded && (
                    <button
                      onClick={() => setSelectedOrderIndex(orderIdx)}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-brand-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Track Order Status</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Order Tracking Card (Right 6 cols if expanded) */}
                {isExpanded && (
                  <div className="lg:col-span-6 bg-white border border-gray-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                    <h3 className="text-base font-extrabold text-gray-900">Order Tracking</h3>

                    {/* Vertical Stepper Timeline */}
                    <div className="relative pl-6 space-y-6">
                      {order.timeline.map((step, idx) => {
                        const isLast = idx === order.timeline.length - 1;
                        return (
                          <div key={idx} className="relative flex items-start justify-between">
                            {/* Vertical Line Connector */}
                            {!isLast && (
                              <div
                                className={`absolute left-[-17px] top-6 w-0.5 h-10 ${
                                  step.completed ? 'bg-brand-700' : 'bg-gray-200'
                                }`}
                              />
                            )}

                            {/* Bullet Circle Icon */}
                            <div className="absolute left-[-24px] top-0.5 bg-white rounded-full">
                              {step.completed ? (
                                <div className="w-4 h-4 rounded-full bg-brand-700 flex items-center justify-center ring-4 ring-emerald-50">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
                              )}
                            </div>

                            {/* Step Label & Timestamp */}
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
    </div>
  );
}


