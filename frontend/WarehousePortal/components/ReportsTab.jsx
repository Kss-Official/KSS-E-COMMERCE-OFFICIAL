import React, { useState, useEffect } from 'react';
import { Download, Calendar, BarChart3, CheckCircle, RefreshCw, ArrowDownToLine, ArrowUpFromLine, RotateCcw, Package, TrendingUp, Award, Layers } from 'lucide-react';
import { fetchWarehouseReportsApi } from '../../src/services/api';

const PERIODS = [
  { days: 7, label: '7 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' }
];

export default function ReportsTab() {
  const [downloaded, setDownloaded] = useState(false);
  const [report, setReport] = useState(null);
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      const data = await fetchWarehouseReportsApi(days);
      if (cancelled) return;
      setReport(data);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const summary = report?.summary || {};
  const daily = report?.daily || [];
  const byCategory = report?.by_category || [];
  const topMovers = report?.top_movers || [];

  const handleDownload = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Reporting Period (days)', report?.period_days ?? days],
      ['Inbound Receipts', summary.inbound_receipts ?? 0],
      ['Inbound Units', summary.inbound_units ?? 0],
      ['Outbound Shipments', summary.outbound_shipments ?? 0],
      ['Outbound Units', summary.outbound_units ?? 0],
      ['Stock Transfers', summary.transfers ?? 0],
      ['Returns Received', summary.returns ?? 0],
      ['Returns Restocked', summary.returns_restocked ?? 0],
      ['Returns Discarded', summary.returns_discarded ?? 0],
      ['Dispatch Rate (%)', summary.dispatch_rate ?? 0],
      [],
      ['Date', 'Inbound Units', 'Outbound Units'],
      ...daily.map((d) => [d.label, d.inbound_units, d.outbound_units]),
      [],
      ['Category', 'SKUs', 'Units on Hand'],
      ...byCategory.map((c) => [c.category, c.skus, c.units]),
      [],
      ['SKU', 'Item', 'Units Shipped', 'Shipments'],
      ...topMovers.map((m) => [m.sku, `"${m.title}"`, m.units, m.shipments])
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Warehouse_WH01_Stock_Report_${days}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const peakUnits = Math.max(
    10,
    ...daily.map((d) => Math.max(d.inbound_units || 0, d.outbound_units || 0))
  );

  const totalCatUnits = byCategory.reduce((acc, c) => acc + (c.units || 0), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Reports &amp; Audit Logs</h2>
          <p className="text-sm text-gray-500 font-medium">Throughput analytics, daily movement trends, category distribution, and exportable audit CSVs.</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer shrink-0 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Audit CSV</span>
        </button>
      </div>

      {downloaded && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Stock Audit CSV Report generated &amp; downloaded successfully!</span>
        </div>
      )}

      {/* Period Selector Tabs */}
      <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-xs w-fit">
        <div className="flex items-center space-x-1.5 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Time Horizon:</span>
        </div>
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              days === p.days
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p.label}
          </button>
        ))}
        {isLoading && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin ml-2" />}
      </div>

      {/* Summary Audit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Inbound Volume</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700 mt-2">
            {(summary.inbound_units ?? 0).toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-gray-500">Units</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {summary.inbound_receipts ?? 0} supplier receipts verified
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Outbound Volume</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-700 mt-2">
            {(summary.outbound_units ?? 0).toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-gray-500">Units</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {summary.outbound_shipments ?? 0} dispatched shipments (Rate: {summary.dispatch_rate ?? 0}%)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Restocked Returns</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-700 mt-2">
            {(summary.returns_restocked ?? 0).toLocaleString('en-IN')}{' '}
            <span className="text-sm font-bold text-gray-500">Units</span>
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {summary.returns_discarded ?? 0} written off &middot; {summary.transfers ?? 0} transfers
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </div>
      </div>

      {/* Daily Inbound vs Outbound Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-extrabold text-lg text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Daily Inbound vs Outbound Throughput</span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Unit movement per day over the last {days} days. Hover over any bar to view exact counts.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-extrabold">
            <span className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Inbound Stock</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-lg border border-blue-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              <span>Outbound Dispatched</span>
            </span>
          </div>
        </div>

        {/* Chart Body with horizontal Y-axis gridlines */}
        <div className="relative pt-6 pb-2">
          {/* Y-axis background gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 text-[10px] text-gray-400 font-semibold">
            <div className="border-b border-gray-100 flex justify-between">
              <span>{peakUnits} units</span>
            </div>
            <div className="border-b border-gray-100 flex justify-between">
              <span>{Math.round(peakUnits * 0.75)} units</span>
            </div>
            <div className="border-b border-gray-100 flex justify-between">
              <span>{Math.round(peakUnits * 0.5)} units</span>
            </div>
            <div className="border-b border-gray-100 flex justify-between">
              <span>{Math.round(peakUnits * 0.25)} units</span>
            </div>
            <div className="border-b border-gray-200 flex justify-between">
              <span>0</span>
            </div>
          </div>

          {/* Bar Chart Columns */}
          <div className="relative z-10 flex items-end justify-around gap-2 h-56 pt-6">
            {daily.map((d) => {
              const inHeight = Math.max(4, Math.round(((d.inbound_units || 0) / peakUnits) * 100));
              const outHeight = Math.max(4, Math.round(((d.outbound_units || 0) / peakUnits) * 100));

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  {/* Hover Tooltip Popup */}
                  <div className="opacity-0 group-hover:opacity-100 transition-all pointer-events-none absolute -top-12 bg-gray-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl z-20 whitespace-nowrap flex items-center space-x-2">
                    <span className="text-emerald-400">In: {d.inbound_units || 0}</span>
                    <span>&middot;</span>
                    <span className="text-blue-400">Out: {d.outbound_units || 0}</span>
                  </div>

                  <div className="flex items-end space-x-1.5 w-full justify-center h-full px-1">
                    {/* Inbound Bar */}
                    <div
                      style={{ height: `${inHeight}%` }}
                      className="w-1/2 max-w-[20px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md shadow-xs transition-all group-hover:brightness-110"
                    />
                    {/* Outbound Bar */}
                    <div
                      style={{ height: `${outHeight}%` }}
                      className="w-1/2 max-w-[20px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md shadow-xs transition-all group-hover:brightness-110"
                    />
                  </div>

                  <span className="text-[11px] font-bold text-gray-500 mt-2 whitespace-nowrap truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Top Movers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        {byCategory.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Stock on Hand by Category</h3>
                <p className="text-xs text-gray-500 mt-0.5">{byCategory.length} active product categories in inventory.</p>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-96 overflow-y-auto divide-y divide-gray-50">
              {byCategory.map((row) => {
                const pct = Math.round(((row.units || 0) / totalCatUnits) * 100);
                return (
                  <div key={row.category} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-900">{row.category}</span>
                      <span className="text-xs font-extrabold text-gray-600">
                        {row.skus} SKUs &middot;{' '}
                        <span className="text-blue-700 font-black">
                          {(row.units || 0).toLocaleString('en-IN')}
                        </span>{' '}
                        units
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Fastest-Moving SKUs */}
        {topMovers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Fastest-Moving SKUs</h3>
                <p className="text-xs text-gray-500 mt-0.5">Highest outbound dispatch volume this period.</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {topMovers.map((row, idx) => (
                <div key={`${row.sku}-${idx}`} className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                      idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : idx === 1 ? 'bg-gray-200 text-gray-700' : 'bg-orange-50 text-orange-800'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{row.title}</p>
                      <p className="text-[11px] font-mono font-bold text-blue-900 mt-0.5">{row.sku}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-700">{row.units} units</p>
                    <p className="text-[11px] font-semibold text-gray-400">{row.shipments} shipments</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
