import React, { useState } from 'react';
import { Download, Calendar, TrendingUp, IndianRupee, ShoppingBag, Users, CheckCircle } from 'lucide-react';

const topProducts = [
  { name: 'Wireless Headphones', percentage: 12 },
  { name: 'Smart Watch', percentage: 10 },
  { name: 'Running Shoes', percentage: 8 },
  { name: 'Coffee Maker', percentage: 6 },
  { name: 'Backpack', percentage: 5 },
];

export default function ReportsTab() {
  const [selectedMonth, setSelectedMonth] = useState('May 2024');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Growth'],
      ['Total Revenue', '1245230', '18%'],
      ['Total Orders', '892', '14%'],
      ['New Users', '5432', '8%'],
      ['Avg. Order Value', '1398', '6%'],
      [],
      ['Top Product', 'Percentage Sales'],
      ['Wireless Headphones', '12%'],
      ['Smart Watch', '10%'],
      ['Running Shoes', '8%'],
      ['Coffee Maker', '6%'],
      ['Backpack', '5%']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuyZo_Sales_Report_${selectedMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 font-medium">Deep-dive business metrics, sales performance, and sales breakdown.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-xs cursor-pointer outline-none"
          >
            <option value="May 2024">May 2024</option>
            <option value="April 2024">April 2024</option>
            <option value="March 2024">March 2024</option>
            <option value="YTD 2024">YTD 2024</option>
          </select>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Report downloaded to your computer (`BuyZo_Sales_Report_{selectedMonth}.csv`)!</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-5 rounded-2xl border border-cyan-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹12,45,230</h3>
            </div>
            <div className="p-3 bg-cyan-100 text-cyan-700 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">↑ 18%</span>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">892</h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">↑ 14%</span>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Users</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">5,432</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">↑ 8%</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg. Order Value</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹1,398</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">↑ 6%</span>
        </div>
      </div>

      {/* Grid: Bar Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Revenue Trend ({selectedMonth})</h3>
            <p className="text-xs text-gray-500">Daily sales distribution for current period</p>
          </div>

          <div className="h-56 mt-6 flex items-end justify-between gap-1.5 px-2 pb-2 border-b border-gray-200">
            {[35, 45, 60, 40, 75, 50, 90, 65, 80, 55, 70, 85, 95, 60, 75, 85, 100, 70, 80, 90, 65, 75, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                <div
                  style={{ height: `${height}%` }}
                  className="w-full bg-[#1b4d3e] hover:bg-[#ff5100] transition-colors rounded-t-sm"
                ></div>
                <div className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                  Day {i + 1}: ₹{(height * 1200).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-3 px-2">
            <span>Day 1</span>
            <span>Day 5</span>
            <span>Day 9</span>
            <span>Day 13</span>
            <span>Day 17</span>
            <span>Day 21</span>
            <span>Day 25</span>
            <span>Day 30</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Top Products</h3>
              <span className="text-xs text-emerald-700 font-bold">Sales Share</span>
            </div>

            <div className="space-y-4">
              {topProducts.map((prod, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{prod.name}</span>
                    <span className="font-extrabold text-emerald-800">{prod.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1b4d3e] h-full rounded-full transition-all duration-500"
                      style={{ width: `${prod.percentage * 7}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
