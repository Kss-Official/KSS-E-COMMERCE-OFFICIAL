import React, { useState, useEffect } from 'react';
import { Download, Calendar, BarChart3, CheckCircle, RefreshCw } from 'lucide-react';
import { fetchWarehouseReportsApi } from '../../src/services/api';

const PERIODS = [
  { days: 7, label: '7 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' }
];

export default function ReportsTab() {
  const [downloaded, setDownloaded] = useState(false);
  const [report, setReport] = useState(null);
  const [days, setDays] = useState(30);
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

  // The CSV is built from the same aggregates on screen, so the export always
  // matches what the operator is looking at.
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
    1,
    ...daily.map((d) => Math.max(d.inbound_units || 0, d.outbound_units || 0))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Reports &amp; Audits</h2>
          <p className="text-sm text-gray-500 font-medium">Download stock audit CSV logs, bin space reports, and throughput analytics.</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Audit CSV</span>
        </button>
      </div>

      {downloaded && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Stock Audit CSV Report downloaded successfully!</span>
        </div>
      )}

      {/* Period switcher */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              days === p.days
                ? 'bg-blue-700 text-white border-blue-700'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {p.label}
          </button>
        ))}
        {isLoading && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin ml-1" />}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-base text-gray-900">Throughput Audit</h3>
        </div>
        <p className="text-xs text-gray-500">
          Units processed over the last {report?.period_days ?? days} days across all bin locations.
          Dispatch rate: <span className="font-bold text-gray-800">{summary.dispatch_rate ?? 0}%</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase block">Inbound Volume</span>
            <span className="text-2xl font-black text-emerald-700">
              {(summary.inbound_units ?? 0).toLocaleString('en-IN')} Units
            </span>
            <span className="text-[11px] text-gray-400 font-semibold block mt-0.5">
              {summary.inbound_receipts ?? 0} receipts
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase block">Outbound Volume</span>
            <span className="text-2xl font-black text-blue-700">
              {(summary.outbound_units ?? 0).toLocaleString('en-IN')} Units
            </span>
            <span className="text-[11px] text-gray-400 font-semibold block mt-0.5">
              {summary.outbound_shipments ?? 0} shipments
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase block">Restocked Returns</span>
            <span className="text-2xl font-black text-purple-700">
              {(summary.returns_restocked ?? 0).toLocaleString('en-IN')} Units
            </span>
            <span className="text-[11px] text-gray-400 font-semibold block mt-0.5">
              {summary.returns_discarded ?? 0} written off &middot; {summary.transfers ?? 0} transfers
            </span>
          </div>
        </div>
      </div>

      {/* Daily inbound vs outbound */}
      {daily.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <h3 className="font-bold text-base text-gray-900 mb-1">Daily Inbound vs Outbound</h3>
          <p className="text-xs text-gray-500 mb-5">Units moved per day, newest on the right.</p>
          <div className="flex items-end justify-between gap-1.5 h-40">
            {daily.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="flex items-end gap-0.5 w-full h-full justify-center">
                  <div
                    className="w-1/2 max-w-3 bg-emerald-500 rounded-t transition-all"
                    style={{ height: `${((d.inbound_units || 0) / peakUnits) * 100}%` }}
                    title={`${d.label}: ${d.inbound_units} in`}
                  />
                  <div
                    className="w-1/2 max-w-3 bg-blue-600 rounded-t transition-all"
                    style={{ height: `${((d.outbound_units || 0) / peakUnits) * 100}%` }}
                    title={`${d.label}: ${d.outbound_units} out`}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400 mt-1.5 whitespace-nowrap">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Inbound
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block" /> Outbound
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by category */}
        {byCategory.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Stock on Hand by Category</h3>
              <p className="text-xs text-gray-500 mt-0.5">{byCategory.length} categories in the bin map.</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {byCategory.map((row) => (
                <div key={row.category} className="px-5 py-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-800">{row.category}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {row.skus} SKUs &middot;{' '}
                    <span className="font-black text-gray-900">
                      {(row.units || 0).toLocaleString('en-IN')}
                    </span>{' '}
                    units
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top movers */}
        {topMovers.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Fastest-Moving SKUs</h3>
              <p className="text-xs text-gray-500 mt-0.5">Highest outbound volume this period.</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {topMovers.map((row, idx) => (
                <div key={`${row.sku}-${idx}`} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{row.title}</p>
                    <p className="text-[11px] font-mono font-bold text-blue-900">{row.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-blue-700">{row.units}</p>
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
