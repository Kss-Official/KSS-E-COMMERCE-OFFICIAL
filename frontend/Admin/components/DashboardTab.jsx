import React, { useState } from 'react';
import { Package, Users, ShoppingBag, IndianRupee, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

const recentOrders = [
  { id: '#ORD1042', customer: 'Rahul Sharma', amount: '₹1,299', status: 'Pending' },
  { id: '#ORD1041', customer: 'Priya Nair', amount: '₹2,499', status: 'Shipped' },
  { id: '#ORD1040', customer: 'Amit Verma', amount: '₹799', status: 'Delivered' },
  { id: '#ORD1039', customer: 'Sneha Iyer', amount: '₹1,999', status: 'Pending' },
];

export default function DashboardTab({ setActiveTab }) {
  const [hoveredPoint, setHoveredPoint] = useState({ date: 'May 18', sales: '₹62,000', x: 260, y: 55 });

  const chartData = [
    { label: 'May 1', val: 20, x: 20, y: 120 },
    { label: 'May 5', val: 35, x: 70, y: 100 },
    { label: 'May 9', val: 28, x: 120, y: 110 },
    { label: 'May 13', val: 55, x: 170, y: 75 },
    { label: 'May 17', val: 40, x: 220, y: 95 },
    { label: 'May 21', val: 75, x: 270, y: 45 },
    { label: 'May 25', val: 60, x: 320, y: 65 },
    { label: 'May 29', val: 90, x: 370, y: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Welcome back, Admin! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-xs">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Products */}
        <div className="bg-gradient-to-br from-cyan-50/70 to-teal-50/30 p-5 rounded-2xl border border-cyan-100/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">1,248</h3>
            </div>
            <div className="p-3 bg-cyan-100/70 text-cyan-700 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 12%</span>
            <span className="text-gray-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/30 p-5 rounded-2xl border border-blue-100/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Users</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">5,432</h3>
            </div>
            <div className="p-3 bg-blue-100/70 text-blue-700 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 8%</span>
            <span className="text-gray-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-orange-50/70 to-amber-50/30 p-5 rounded-2xl border border-orange-100/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">892</h3>
            </div>
            <div className="p-3 bg-orange-100/80 text-orange-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 14%</span>
            <span className="text-gray-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/30 p-5 rounded-2xl border border-emerald-100/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹12,45,230</h3>
            </div>
            <div className="p-3 bg-emerald-100/80 text-emerald-700 rounded-xl">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 mt-3 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>↑ 18%</span>
            <span className="text-gray-400 font-normal">from last month</span>
          </div>
        </div>
      </div>

      {/* Grid: Sales Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview SVG Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Sales Overview</h3>
              <p className="text-xs text-gray-500">Monthly revenue trends</p>
            </div>
            <div className="flex items-center space-x-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Revenue Trend</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="relative w-full h-56 mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 140" preserveAspectRatio="none">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#f1f5f9" strokeWidth="1" />

              {/* Gradient Area Fill */}
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1b4d3e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1b4d3e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 20 120 Q 70 100 120 110 T 220 95 T 320 65 T 370 25 L 370 130 L 20 130 Z"
                fill="url(#salesGrad)"
              />

              {/* Line path */}
              <path
                d="M 20 120 Q 70 100 120 110 T 220 95 T 320 65 T 370 25"
                fill="none"
                stroke="#1b4d3e"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points */}
              {chartData.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#1b4d3e"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setHoveredPoint({ date: pt.label, sales: `₹${(pt.val * 1000).toLocaleString('en-IN')}`, x: pt.x, y: pt.y })}
                />
              ))}
            </svg>

            {/* Hover Tooltip Box */}
            {hoveredPoint && (
              <div 
                className="absolute bg-[#093529] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex flex-col items-center pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-150"
                style={{ left: `${(hoveredPoint.x / 400) * 100}%`, top: `${(hoveredPoint.y / 140) * 100}%` }}
              >
                <span className="text-[10px] text-emerald-300 font-normal">{hoveredPoint.date}</span>
                <span>{hoveredPoint.sales}</span>
                <div className="w-2 h-2 bg-[#093529] rotate-45 -mb-2.5 mt-0.5"></div>
              </div>
            )}
          </div>

          {/* Month Axis Labels */}
          <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-2 px-2">
            {chartData.map((pt, i) => (
              <span key={i}>{pt.label}</span>
            ))}
          </div>
        </div>

        {/* Recent Orders Widget */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
              <button 
                onClick={() => setActiveTab && setActiveTab('orders')}
                className="text-xs font-bold text-[#ff5100] hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentOrders.map((ord, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-emerald-50/40 transition-colors border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-900">{ord.id}</span>
                    <span className="text-xs text-gray-500 font-medium">{ord.customer}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-gray-900">{ord.amount}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'Shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Showing latest 4 orders</span>
            <span className="font-semibold text-emerald-800">Updated just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
