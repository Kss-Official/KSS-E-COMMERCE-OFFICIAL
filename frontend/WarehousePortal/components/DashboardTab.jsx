import React, { useState } from 'react';
import { 
  Boxes, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ShoppingBag, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  RotateCcw, 
  ArrowLeftRight, 
  CheckCircle2, 
  X,
  Layers,
  BarChart3
} from 'lucide-react';

const initialLowStock = [
  { id: 1, name: 'Wireless Earbuds', sku: 'WE-1001', avail: 8, reorder: 20 },
  { id: 2, name: 'Charging Cable Type-C', sku: 'CC-2001', avail: 12, reorder: 30 },
  { id: 3, name: 'Phone Case', sku: 'PC-3001', avail: 5, reorder: 15 },
  { id: 4, name: 'Screen Protector', sku: 'SP-4001', avail: 10, reorder: 25 },
];

const recentActivities = [
  { action: 'Receipt', ref: 'RCPT-250522-001', type: 'Inbound', item: 'Wireless Headphones (WH-1001)', qty: 120, performer: 'Amit Singh', time: '22 May, 09:15 AM' },
  { action: 'Shipment', ref: 'SHP-250522-037', type: 'Outbound', item: 'Smart Watch (SW-2001)', qty: 80, performer: 'Neha Sharma', time: '22 May, 10:30 AM' },
  { action: 'Stock Transfer', ref: 'TRF-250522-012', type: 'Transfer', item: 'Bluetooth Speaker (BS-3001)', qty: 50, performer: 'Ravi Kumar', time: '22 May, 11:45 AM' },
  { action: 'Return', ref: 'RTN-250522-004', type: 'Return', item: 'Earphones (EP-4001)', qty: 15, performer: 'Pooja Mehta', time: '22 May, 01:20 PM' },
  { action: 'Receipt', ref: 'RCPT-250522-002', type: 'Inbound', item: 'Power Bank (PB-5001)', qty: 200, performer: 'Amit Singh', time: '22 May, 02:05 PM' },
];

export default function DashboardTab({ setActiveTab }) {
  const [lowStockList, setLowStockList] = useState(initialLowStock);
  const [reorderedItem, setReorderedItem] = useState(null);

  const handleReorder = (item) => {
    setReorderedItem(item);
    setTimeout(() => {
      setLowStockList(lowStockList.filter(i => i.id !== item.id));
      setReorderedItem(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Good Morning, Rohit! 👋</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Here's what's happening in your warehouse today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-xs">
          <Calendar className="w-4 h-4 text-blue-700" />
          <span>22 May 2025</span>
        </div>
      </div>

      {reorderedItem && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Reorder PO generated for {reorderedItem.name} ({reorderedItem.sku})!</span>
        </div>
      )}

      {/* 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inventory */}
        <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/30 p-4.5 rounded-2xl border border-blue-100/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total Inventory</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">12,560</h3>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">↑ +8.2% from last week</span>
        </div>

        {/* Inbound Today */}
        <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/30 p-4.5 rounded-2xl border border-emerald-100/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Inbound Today</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">24</h3>
          <span className="text-[11px] font-medium text-gray-500 mt-1 block">Receipts</span>
        </div>

        {/* Outbound Today */}
        <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/30 p-4.5 rounded-2xl border border-amber-100/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Outbound Today</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">37</h3>
          <span className="text-[11px] font-medium text-gray-500 mt-1 block">Shipments</span>
        </div>

        {/* Orders Today */}
        <div className="bg-gradient-to-br from-purple-50/90 to-indigo-50/30 p-4.5 rounded-2xl border border-purple-100/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Orders Today</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">56</h3>
          <span className="text-[11px] font-medium text-gray-500 mt-1 block">To be processed</span>
        </div>

        {/* Low Stock Items */}
        <div className="bg-gradient-to-br from-rose-50/90 to-red-50/30 p-4.5 rounded-2xl border border-rose-100/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Low Stock Items</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-600 mt-2">18</h3>
          <span className="text-[11px] font-bold text-rose-600 mt-1 block">Reorder needed</span>
        </div>
      </div>

      {/* Grid Row 2: Inventory Overview Donut Chart + Stock Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Overview SVG Donut Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-900">Inventory Overview</h3>
            <button 
              onClick={() => setActiveTab && setActiveTab('inventory')}
              className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Available 62.5% */}
                <circle cx="50" cy="50" r="38" stroke="#10b981" strokeWidth="12" fill="none" strokeDasharray="238.7" strokeDashoffset="0" />
                {/* Reserved 19.5% */}
                <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="238.7" strokeDashoffset="-149.1" />
                {/* In Transit 10.5% */}
                <circle cx="50" cy="50" r="38" stroke="#f97316" strokeWidth="12" fill="none" strokeDasharray="238.7" strokeDashoffset="-195.7" />
                {/* Low Stock 7.5% */}
                <circle cx="50" cy="50" r="38" stroke="#ef4444" strokeWidth="12" fill="none" strokeDasharray="238.7" strokeDashoffset="-220.8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 leading-none">12,560</span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1">Total Items</span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2.5 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-gray-700">Available</span>
                </div>
                <span className="font-bold text-gray-900">7,850 (62.5%)</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-semibold text-gray-700">Reserved</span>
                </div>
                <span className="font-bold text-gray-900">2,450 (19.5%)</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="font-semibold text-gray-700">In Transit</span>
                </div>
                <span className="font-bold text-gray-900">1,320 (10.5%)</span>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="font-semibold text-gray-700">Low Stock</span>
                </div>
                <span className="font-bold text-gray-900">940 (7.5%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Stock Status</h3>
              <button 
                onClick={() => setActiveTab && setActiveTab('inventory')}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Total SKUs</span>
                <span className="font-bold text-gray-900 text-sm">1,245</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Total Units</span>
                <span className="font-bold text-gray-900 text-sm">12,560</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Bin Locations</span>
                <span className="font-bold text-gray-900 text-sm">320</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-gray-700">Utilization Rate</span>
              <span className="font-black text-emerald-600">72%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Recent Activities</h3>
          <button className="text-xs font-bold text-blue-700 hover:underline cursor-pointer">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Activity</th>
                <th className="py-3.5 px-6">Reference ID</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Item / SKU</th>
                <th className="py-3.5 px-6">Quantity</th>
                <th className="py-3.5 px-6">Performer</th>
                <th className="py-3.5 px-6">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentActivities.map((act, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">{act.action}</td>
                  <td className="py-4 px-6 font-mono text-xs font-bold text-gray-600">{act.ref}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      act.type === 'Inbound' ? 'bg-emerald-100 text-emerald-800' : act.type === 'Outbound' ? 'bg-orange-100 text-orange-800' : act.type === 'Transfer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {act.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-800 font-semibold text-xs">{act.item}</td>
                  <td className="py-4 px-6 font-extrabold text-gray-900">{act.qty}</td>
                  <td className="py-4 px-6 text-gray-600 text-xs font-medium">{act.performer}</td>
                  <td className="py-4 px-6 text-gray-400 text-xs font-medium">{act.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Inbound Receipts</h4>
              <p className="text-[11px] text-gray-400">Incoming stock</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('inbound')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl"
          >
            View
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Outbound Shipments</h4>
              <p className="text-[11px] text-gray-400">Outgoing shipments</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('outbound')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl"
          >
            View
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-purple-100 text-purple-800 rounded-xl">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Stock Transfers</h4>
              <p className="text-[11px] text-gray-400">Transfer stock</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('transfers')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl"
          >
            View
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Returns</h4>
              <p className="text-[11px] text-gray-400">Returned items</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab && setActiveTab('returns')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl"
          >
            View
          </button>
        </div>
      </div>

      {/* Grid Row 5: Low Stock Alerts + Inbound vs Outbound Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Low Stock Alerts</h3>
              <button 
                onClick={() => setActiveTab && setActiveTab('alerts')}
                className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              {lowStockList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{item.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{item.sku}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-xs font-black text-rose-600 block">{item.avail}</span>
                      <span className="text-[10px] text-gray-400">Reorder: {item.reorder}</span>
                    </div>
                    <button
                      onClick={() => handleReorder(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              ))}

              {lowStockList.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">All low-stock items reordered!</p>
              )}
            </div>
          </div>
        </div>

        {/* Inbound vs Outbound Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Inbound vs Outbound</h3>
              <p className="text-xs text-gray-400">Weekly comparison of stock movements</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-xl outline-none">
              <option value="This Week">This Week</option>
              <option value="Last Week">Last Week</option>
            </select>
          </div>

          <div className="h-44 mt-4 flex items-end justify-between gap-3 px-4 pb-2 border-b border-gray-200">
            {[
              { day: 'Mon', in: 40, out: 55 },
              { day: 'Tue', in: 25, out: 40 },
              { day: 'Wed', in: 50, out: 42 },
              { day: 'Thu', in: 50, out: 45 },
              { day: 'Fri', in: 60, out: 65 },
              { day: 'Sat', in: 30, out: 40 },
              { day: 'Sun', in: 28, out: 52 },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center space-x-1.5 h-32">
                  <div style={{ height: `${item.in}%` }} className="w-3 bg-emerald-500 rounded-t-sm" title={`Inbound: ${item.in}`}></div>
                  <div style={{ height: `${item.out}%` }} className="w-3 bg-blue-600 rounded-t-sm" title={`Outbound: ${item.out}`}></div>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 mt-2">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-around pt-4 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              <span>Inbound This Week: <strong className="text-gray-900">248</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
              <span>Outbound This Week: <strong className="text-gray-900">312</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
