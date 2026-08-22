import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  Phone, 
  Navigation, 
  Eye, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Bell, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const initialDeliveries = [
  { id: '#ORD-10245', customer: 'Rahul Sharma', address: '12, Green Park, Delhi - 110016', status: 'Out for Delivery', amount: '₹1,299', type: 'COD', distance: '2.4 km away', phone: '+91 98765 43210' },
  { id: '#ORD-10246', customer: 'Sneha Verma', address: '45, Sector 7, Noida - 201301', status: 'Pending', amount: '₹899', type: 'COD', distance: '4.1 km away', phone: '+91 98765 88990' },
  { id: '#ORD-10247', customer: 'Vikram Singh', address: '88, MG Road, Gurgaon - 122001', status: 'Pending', amount: '₹1,499', type: 'Prepaid', distance: '5.8 km away', phone: '+91 98765 77665' },
  { id: '#ORD-10248', customer: 'Anjali Mehta', address: '23, Lake View, Bangalore - 560001', status: 'Delivered', amount: '₹650', type: 'COD', distance: '6.2 km away', phone: '+91 98765 11223' },
  { id: '#ORD-10249', customer: 'Rohit Das', address: '9, Salt Lake, Kolkata - 700091', status: 'Delivered', amount: '₹1,199', type: 'Prepaid', distance: '3.0 km away', phone: '+91 98765 33445' },
];

export default function DashboardTab({ setActiveTab }) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const activeDelivery = deliveries.find(d => d.status === 'Out for Delivery') || deliveries[0];

  const handleStartDelivery = (id) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'Out for Delivery' } : d));
  };

  const handleCompleteDelivery = (id) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'Delivered' } : d));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Good Morning, Amit! 👋</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Here's your delivery summary for today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-xs">
          <Calendar className="w-4 h-4 text-[#1b4d3e]" />
          <span>22 May 2025</span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Deliveries Today */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/30 p-5 rounded-2xl border border-emerald-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">12</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Total Deliveries Today</span>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Deliveries */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/30 p-5 rounded-2xl border border-amber-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">8</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Pending Deliveries</span>
            </div>
            <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/30 p-5 rounded-2xl border border-emerald-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">8</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Completed Deliveries</span>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Today's Earnings */}
        <div className="bg-gradient-to-br from-purple-50/80 to-indigo-50/30 p-5 rounded-2xl border border-purple-100/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900">₹850</h3>
              <span className="text-xs font-bold text-gray-500 mt-1 block">Today's Earnings</span>
            </div>
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Active Delivery Card + Today's Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Delivery Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">Active Delivery</h3>
            <button 
              onClick={() => setActiveTab && setActiveTab('active-delivery')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 font-semibold">Order ID</span>
                  <span className="text-sm font-black text-gray-900">{activeDelivery.id}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {activeDelivery.status}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-xs text-gray-500 block">Deliver to</span>
                  <span className="text-sm font-extrabold text-gray-900">{activeDelivery.customer}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-emerald-700 font-semibold mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{activeDelivery.distance}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between self-stretch md:self-auto">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase block">COD Amount</span>
                  <span className="text-base font-black text-gray-900">{activeDelivery.amount}</span>
                </div>
                <a
                  href={`tel:${activeDelivery.phone}`}
                  className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center space-x-2.5 mt-4 w-full md:w-auto">
                <button
                  onClick={() => setSelectedOrderDetails(activeDelivery)}
                  className="flex-1 md:flex-none border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  View Details
                </button>
                <button
                  onClick={() => setShowNavigationModal(true)}
                  className="flex-1 md:flex-none bg-[#1b4d3e] hover:bg-[#0f382c] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 fill-white stroke-none" />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Earnings Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-gray-900">Today's Earnings</h3>
              <button 
                onClick={() => setActiveTab && setActiveTab('earnings')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-2">
              <span className="text-xs text-gray-400 font-medium block">Total Earnings</span>
              <h4 className="text-3xl font-black text-gray-900">₹850</h4>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Incentive</span>
                <span className="font-bold text-emerald-600">₹150</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-gray-900 font-extrabold">
                <span>Total Payout</span>
                <span className="text-sm">₹1,000</span>
              </div>
            </div>
          </div>

          {/* SVG Earnings curve */}
          <div className="h-16 mt-4">
            <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
              <path
                d="M 0 40 Q 30 20 60 30 T 120 15 T 180 35 T 200 20"
                fill="none"
                stroke="#1b4d3e"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Data points */}
              <circle cx="60" cy="30" r="3" fill="#ffffff" stroke="#1b4d3e" strokeWidth="2" />
              <circle cx="120" cy="15" r="3" fill="#ffffff" stroke="#1b4d3e" strokeWidth="2" />
              <circle cx="180" cy="35" r="3" fill="#ffffff" stroke="#1b4d3e" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Today's Deliveries Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Today's Deliveries</h3>
          <button 
            onClick={() => setActiveTab && setActiveTab('my-deliveries')}
            className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Address</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {deliveries.map((ord) => (
                <tr key={ord.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-gray-900 flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      ord.status === 'Out for Delivery' ? 'bg-emerald-500 animate-ping' : ord.status === 'Delivered' ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}></span>
                    <span>{ord.id}</span>
                  </td>
                  <td className="py-4 px-6 font-bold text-gray-900">{ord.customer}</td>
                  <td className="py-4 px-6 text-gray-600 text-xs font-medium max-w-xs truncate">{ord.address}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                      ord.status === 'Out for Delivery' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : ord.status === 'Delivered' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900 text-xs">{ord.amount}</span>
                      <span className="text-[10px] font-bold text-gray-400">{ord.type}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {ord.status === 'Pending' ? (
                      <button
                        onClick={() => handleStartDelivery(ord.id)}
                        className="bg-[#1b4d3e] hover:bg-[#0f382c] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
                      >
                        Start
                      </button>
                    ) : ord.status === 'Out for Delivery' ? (
                      <button
                        onClick={() => handleCompleteDelivery(ord.id)}
                        className="bg-[#ff5100] hover:bg-[#e64900] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer"
                      >
                        Complete
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedOrderDetails(ord)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Row 4: Earnings Overview Chart + Notifications Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Earnings Overview</h3>
              <span className="text-xs text-gray-400 font-medium">Total Weekly Earnings: <strong className="text-gray-900">₹4,680</strong></span>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-xl outline-none cursor-pointer">
              <option value="This Week">This Week</option>
              <option value="Last Week">Last Week</option>
            </select>
          </div>

          <div className="h-44 mt-4 flex items-end justify-between gap-3 px-4 pb-2 border-b border-gray-200">
            {[
              { day: 'Mon', val: 650 },
              { day: 'Tue', val: 720 },
              { day: 'Wed', val: 580 },
              { day: 'Thu', val: 750 },
              { day: 'Fri', val: 820 },
              { day: 'Sat', val: 600 },
              { day: 'Sun', val: 460 },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                <span className="text-[10px] font-bold text-gray-600 mb-1">₹{item.val}</span>
                <div
                  style={{ height: `${(item.val / 1000) * 100}%` }}
                  className="w-full bg-[#1b4d3e] group-hover:bg-[#ff5100] transition-colors rounded-t-md"
                ></div>
                <span className="text-[11px] font-semibold text-gray-400 mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Widget */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              <button 
                onClick={() => setActiveTab && setActiveTab('notifications')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">New delivery assigned</h4>
                  <p className="text-[11px] text-gray-500">Order #ORD-10250 assigned to you</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">2 min ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Customer not available</h4>
                  <p className="text-[11px] text-gray-500">Delivery failed for Order #ORD-10231</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">1 hr ago</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800 shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Incentive earned!</h4>
                  <p className="text-[11px] text-gray-500">You earned ₹150 incentive today</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">2 hr ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#063328] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Order Details: {selectedOrderDetails.id}</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Customer:</span>
                  <span className="font-bold text-gray-900">{selectedOrderDetails.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Phone:</span>
                  <span className="font-bold text-emerald-800">{selectedOrderDetails.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Payment Type:</span>
                  <span className="font-extrabold text-amber-800">{selectedOrderDetails.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Amount to Collect:</span>
                  <span className="font-black text-gray-900 text-sm">{selectedOrderDetails.amount}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Delivery Address</span>
                <p className="text-xs text-gray-800 font-medium bg-gray-50 p-3 rounded-xl border border-gray-200">{selectedOrderDetails.address}</p>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2 text-sm font-bold bg-[#1b4d3e] text-white rounded-xl shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Directions Modal */}
      {showNavigationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-[#1b4d3e] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">GPS Directions: Order {activeDelivery.id}</h3>
              </div>
              <button onClick={() => setShowNavigationModal(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              <div className="w-full h-48 bg-emerald-950/90 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden border border-emerald-800">
                <MapPin className="w-10 h-10 text-amber-400 animate-bounce mb-2" />
                <span className="text-sm font-bold text-emerald-200">Navigating to {activeDelivery.customer}</span>
                <span className="text-xs text-emerald-400 mt-1">{activeDelivery.address}</span>
                <div className="mt-3 bg-white/20 backdrop-blur-md text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/30">
                  📍 Distance: {activeDelivery.distance} (ETA: ~8 mins)
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`tel:${activeDelivery.phone}`}
                  className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call {activeDelivery.customer}</span>
                </a>
                <button
                  onClick={() => {
                    handleCompleteDelivery(activeDelivery.id);
                    setShowNavigationModal(false);
                  }}
                  className="bg-[#ff5100] hover:bg-[#e64900] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
