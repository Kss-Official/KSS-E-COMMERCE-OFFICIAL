import React, { useState, useEffect, useCallback } from 'react';
import { Download, IndianRupee, ShoppingBag, Users, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchAdminDashboardSummaryApi, fetchAdminRevenueTimelineApi, fetchAdminTopProductsApi } from '../../src/services/api';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function ReportsTab() {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    orders: 0,
    users: 0,
    avgOrderValue: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Current Period');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const loadReportMetrics = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [summary, revenueTimeline, sellers] = await Promise.all([
        fetchAdminDashboardSummaryApi(),
        fetchAdminRevenueTimelineApi(),
        fetchAdminTopProductsApi()
      ]);

      const rev = summary?.total_revenue || 0;
      const ords = summary?.total_orders || 0;
      const uCount = summary?.total_customers || 0;
      const refunds = summary?.total_refunds_amount || 0;
      const refundCount = summary?.refunded_orders_count || 0;
      const avg = ords > 0 ? Math.round(rev / ords) : 0;

      setMetrics({
        revenue: rev,
        orders: ords,
        users: uCount,
        refunds,
        refundCount,
        avgOrderValue: avg
      });

      // Bars are drawn relative to the busiest bucket so the tallest one always
      // reaches the top of the plot area.
      const peak = revenueTimeline.reduce((m, p) => Math.max(m, Number(p.sales) || 0), 0);
      setTimeline(revenueTimeline.map(p => ({
        label: p.label,
        sales: Number(p.sales) || 0,
        orders: Number(p.orders_count) || 0,
        height: peak > 0 ? Math.max(3, Math.round((Number(p.sales) || 0) / peak * 100)) : 3
      })));

      if (Array.isArray(sellers) && sellers.length > 0) {
        // Share is of revenue actually booked by the top sellers, not of the catalog.
        const sellerTotal = sellers.reduce((s, p) => s + (Number(p.revenue) || 0), 0);
        const topRevenue = Number(sellers[0].revenue) || 0;
        setTopProducts(sellers.slice(0, 5).map(p => {
          const rev = Number(p.revenue) || 0;
          return {
            name: p.title,
            sku: p.sku,
            units: Number(p.units_sold) || 0,
            revenue: rev,
            percentage: sellerTotal > 0 ? Math.round(rev / sellerTotal * 100) : 0,
            barWidth: topRevenue > 0 ? Math.max(4, Math.round(rev / topRevenue * 100)) : 4
          };
        }));
      } else {
        setTopProducts([]);
      }
    } catch (err) {
      console.warn('[ReportsTab] Error loading report metrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReportMetrics();
    const interval = setInterval(() => {
      loadReportMetrics(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadReportMetrics]);

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Metric', 'Database Value'],
      ['Total Net Revenue', metrics.revenue],
      ['Total Orders', metrics.orders],
      ['Total Customers', metrics.users],
      ['Total Refunds Issued (INR)', metrics.refunds],
      ['Refunded Orders Count', metrics.refundCount],
      ['Average Order Value', metrics.avgOrderValue],
      [],
      ['Top Selling Product', 'Units Sold', 'Revenue (INR)', 'Revenue Share %']
    ];

    topProducts.forEach(p => {
      csvRows.push([`"${p.name}"`, p.units, p.revenue, `${p.percentage}%`]);
    });

    csvRows.push([]);
    csvRows.push(['Period', 'Paid Sales (INR)', 'Orders']);
    timeline.forEach(b => {
      csvRows.push([b.label, b.sales, b.orders]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BuyZo_Live_Database_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Reports & Analytics</h2>
            {isRefreshing && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Live Syncing</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Deep-dive business metrics and sales breakdown fetched from database.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadReportMetrics()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Database CSV</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Live database CSV report generated and downloaded to your device!</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-5 rounded-2xl border border-cyan-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹{metrics.revenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-cyan-100 text-cyan-700 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">Paid Database Revenue</span>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics.orders.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">Placed Orders</span>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Customers</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{metrics.users.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">Registered Accounts</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg. Order Value</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">₹{metrics.avgOrderValue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="inline-block mt-3 text-xs font-bold text-emerald-600">Live Average</span>
        </div>
      </div>

      {/* Grid: Bar Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Revenue Distribution</h3>
            <p className="text-xs text-gray-500">Paid sales per period, straight from the orders table</p>
          </div>

          <div className="h-56 mt-6 flex items-end justify-between gap-1.5 px-2 pb-2 border-b border-gray-200">
            {timeline.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                No paid orders recorded yet.
              </div>
            ) : timeline.map((bucket, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end">
                <div className="absolute -top-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#093529] text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none">
                  {bucket.label} · {money(bucket.sales)} · {bucket.orders} order{bucket.orders === 1 ? '' : 's'}
                </div>
                <div
                  style={{ height: `${bucket.height}%` }}
                  className="w-full bg-[#1b4d3e] hover:bg-[#ff5100] transition-colors rounded-t-sm"
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-3 px-2">
            <span>{timeline[0]?.label || 'Start'}</span>
            <span>{timeline[Math.floor(timeline.length / 2)]?.label || 'Mid-Period'}</span>
            <span>{timeline[timeline.length - 1]?.label || 'Current Date'}</span>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Top Selling Products</h3>
              <span className="text-xs text-emerald-700 font-bold">Revenue Share</span>
            </div>

            {topProducts.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-medium">
                No sales recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800 truncate pr-2">{prod.name}</span>
                      <span className="font-extrabold text-emerald-800 shrink-0">{prod.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#1b4d3e] h-full rounded-full transition-all duration-500"
                        style={{ width: `${prod.barWidth}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400">
                      <span>{prod.units} unit{prod.units === 1 ? '' : 's'} sold</span>
                      <span>{money(prod.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
