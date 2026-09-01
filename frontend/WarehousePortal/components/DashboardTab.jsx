import React, { useState, useEffect, useMemo } from 'react';
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
import {
  fetchWarehouseSummaryApi,
  fetchWarehouseAlertsApi,
  fetchWarehouseReportsApi,
  fetchWarehouseInventoryApi,
  createInboundReceiptApi
} from '../../src/services/api';

const DONUT_RADIUS = 38;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS; // 238.76

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardTab({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [lowStockList, setLowStockList] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [daily, setDaily] = useState([]);
  const [reorderedItem, setReorderedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [summaryData, alertData, reportData, inventoryRows] = await Promise.all([
        fetchWarehouseSummaryApi(),
        fetchWarehouseAlertsApi(),
        fetchWarehouseReportsApi(7),
        fetchWarehouseInventoryApi()
      ]);
      if (cancelled) return;

      setSummary(summaryData);
      setInventory(Array.isArray(inventoryRows) ? inventoryRows : []);
      setDaily(Array.isArray(reportData?.daily) ? reportData.daily.slice(-7) : []);

      const stockAlerts = (alertData?.alerts || [])
        .filter((a) => a.type === 'Low Stock' || a.type === 'Out of Stock')
        .slice(0, 4)
        .map((a) => ({
          id: a.id,
          name: a.title,
          sku: a.sku,
          avail: a.current_stock,
          reorder: a.threshold,
          suggested: a.suggested_reorder
        }));
      setLowStockList(stockAlerts);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Raising a reorder writes a real pending InboundReceipt row.
  const handleReorder = async (item) => {
    const res = await createInboundReceiptApi({
      supplier_name: 'BuyZo Central Procurement',
      item_title: item.name,
      sku: item.sku || '',
      quantity: item.suggested || Math.max(50, (item.reorder || 10) * 5),
      status: 'Pending Verification'
    });

    if (res?.status === 'success') {
      setReorderedItem(item);
      setTimeout(() => {
        setLowStockList((prev) => prev.filter((i) => i.id !== item.id));
        setReorderedItem(null);
      }, 2000);
    }
  };

  // Donut segments derived from the live bin rows.
  const stockSplit = useMemo(() => {
    const totals = inventory.reduce(
      (acc, row) => {
        const isLow = row.is_low_stock;
        const avail = Number(row.avail || 0);
        acc.reserved += Number(row.reserved || 0);
        acc.transit += Number(row.transit || 0);
        if (isLow) acc.low += avail;
        else acc.available += avail;
        return acc;
      },
      { available: 0, reserved: 0, transit: 0, low: 0 }
    );

    const total = totals.available + totals.reserved + totals.transit + totals.low;
    const segments = [
      { key: 'available', label: 'Available', color: '#10b981', dot: 'bg-emerald-500', value: totals.available },
      { key: 'reserved', label: 'Reserved', color: '#3b82f6', dot: 'bg-blue-500', value: totals.reserved },
      { key: 'transit', label: 'In Transit', color: '#f97316', dot: 'bg-orange-500', value: totals.transit },
      { key: 'low', label: 'Low Stock', color: '#ef4444', dot: 'bg-red-500', value: totals.low }
    ];

    let cursor = 0;
    const arcs = segments.map((seg) => {
      const fraction = total > 0 ? seg.value / total : 0;
      const arc = {
        ...seg,
        percent: total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0.0',
        dash: fraction * DONUT_CIRCUMFERENCE,
        offset: -cursor * DONUT_CIRCUMFERENCE
      };
      cursor += fraction;
      return arc;
    });

    return { total, arcs };
  }, [inventory]);

  const binLocations = useMemo(
    () => new Set(inventory.map((r) => r.bin).filter(Boolean)).size,
    [inventory]
  );

  // Utilisation = sellable units against everything the floor is holding.
  const utilization = stockSplit.total
    ? Math.round(((stockSplit.total - (stockSplit.arcs[3]?.value || 0)) / stockSplit.total) * 100)
    : 0;

  const peakUnits = Math.max(
    1,
    ...daily.map((d) => Math.max(d.inbound_units || 0, d.outbound_units || 0))
  );
  const inboundWeek = daily.reduce((acc, d) => acc + (d.inbound_units || 0), 0);
  const outboundWeek = daily.reduce((acc, d) => acc + (d.outbound_units || 0), 0);

  const activities = summary?.recent_activities || [];
  const totalUnits = summary?.total_stock_units ?? 0;

  const typeChip = (type) => {
    if (type === 'inbound') return { label: 'Inbound', cls: 'bg-emerald-100 text-emerald-800' };
    if (type === 'outbound') return { label: 'Outbound', cls: 'bg-orange-100 text-orange-800' };
    if (type === 'transfer') return { label: 'Transfer', cls: 'bg-blue-100 text-blue-800' };
    return { label: 'Return', cls: 'bg-purple-100 text-purple-800' };
  };

  const actionLabel = (type) => {
    if (type === 'inbound') return 'Receipt';
    if (type === 'outbound') return 'Shipment';
    if (type === 'transfer') return 'Stock Transfer';
    return 'Return';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {greeting()}, {summary?.operator_name || 'Warehouse Team'}! 👋
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Here's what's happening in {summary?.warehouse_code || 'your warehouse'} today.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-xs">
          <Calendar className="w-4 h-4 text-blue-700" />
          <span>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
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
        <button
          onClick={() => setActiveTab && setActiveTab('inventory')}
          className="text-left bg-gradient-to-br from-blue-50/90 to-indigo-50/30 p-4.5 rounded-2xl border border-blue-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Total Inventory</span>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{totalUnits.toLocaleString('en-IN')}</h3>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
            Across {(summary?.total_skus ?? 0).toLocaleString('en-IN')} active SKUs
          </span>
        </button>

        {/* Inbound Today */}
        <button
          onClick={() => setActiveTab && setActiveTab('inbound')}
          className="text-left bg-gradient-to-br from-emerald-50/90 to-teal-50/30 p-4.5 rounded-2xl border border-emerald-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Inbound Today</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{summary?.inbound_today ?? 0}</h3>
          <span className="text-[11px] font-medium text-gray-500 mt-1 block">
            Receipts &middot; {summary?.inbound_units_today ?? 0} units
          </span>
        </button>

        {/* Outbound Today */}
        <button
          onClick={() => setActiveTab && setActiveTab('outbound')}
          className="text-left bg-gradient-to-br from-amber-50/90 to-orange-50/30 p-4.5 rounded-2xl border border-amber-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Outbound Today</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{summary?.outbound_today ?? 0}</h3>
          <span className="text-[11px] font-medium text-gray-500 mt-1 block">Shipments</span>
        </button>

        {/* Orders Today */}
        <button
          onClick={() => setActiveTab && setActiveTab('shipments')}
          className="text-left bg-gradient-to-br from-purple-50/90 to-indigo-50/30 p-4.5 rounded-2xl border border-purple-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Pending Dispatch</span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{summary?.pending_dispatch ?? 0}</h3>
          <span className="text-[11px] font-medium text-gray-500 mt-1 block">To be processed</span>
        </button>

        {/* Low Stock Items */}
        <button
          onClick={() => setActiveTab && setActiveTab('alerts')}
          className="text-left bg-gradient-to-br from-rose-50/90 to-red-50/30 p-4.5 rounded-2xl border border-rose-100/90 shadow-xs hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500">Low Stock Items</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-600 mt-2">{summary?.low_stock_count ?? 0}</h3>
          <span className="text-[11px] font-bold text-rose-600 mt-1 block">
            {summary?.out_of_stock_count ?? 0} out of stock
          </span>
        </button>
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
                <circle cx="50" cy="50" r={DONUT_RADIUS} stroke="#f1f5f9" strokeWidth="12" fill="none" />
                {stockSplit.arcs.map((arc) => (
                  <circle
                    key={arc.key}
                    cx="50"
                    cy="50"
                    r={DONUT_RADIUS}
                    stroke={arc.color}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${arc.dash} ${DONUT_CIRCUMFERENCE - arc.dash}`}
                    strokeDashoffset={arc.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-gray-900 leading-none">
                  {stockSplit.total.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold mt-1">Total Items</span>
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="space-y-2.5 text-xs w-full sm:w-auto">
              {stockSplit.arcs.map((arc) => (
                <div className="flex items-center justify-between gap-6" key={arc.key}>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${arc.dot}`}></span>
                    <span className="font-semibold text-gray-700">{arc.label}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {arc.value.toLocaleString('en-IN')} ({arc.percent}%)
                  </span>
                </div>
              ))}
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
                <span className="font-bold text-gray-900 text-sm">
                  {(summary?.total_skus ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Total Units</span>
                <span className="font-bold text-gray-900 text-sm">{totalUnits.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Bin Locations</span>
                <span className="font-bold text-gray-900 text-sm">{binLocations}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-bold text-gray-700">Utilization Rate</span>
              <span className="font-black text-emerald-600">{utilization}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${utilization}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Recent Activities</h3>
          <button
            onClick={() => setActiveTab && setActiveTab('reports')}
            className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
          >
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
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && activities.length === 0 && (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && activities.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 px-6 text-center text-xs text-gray-400 font-semibold">
                    No warehouse movements recorded yet.
                  </td>
                </tr>
              )}

              {activities.map((act, idx) => {
                const chip = typeChip(act.type);
                return (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900">{actionLabel(act.type)}</td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-gray-600">
                      {(act.meta || '').split(' - ')[0].split(' to ')[0]}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${chip.cls}`}>
                        {chip.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-800 font-semibold text-xs">
                      <span className="line-clamp-1">{act.title}</span>
                      <span className="block text-[11px] text-gray-400 font-medium mt-0.5 line-clamp-1">
                        {act.meta}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-gray-700">{act.status}</td>
                    <td className="py-4 px-6 text-gray-400 text-xs font-medium">{act.formatted_date}</td>
                  </tr>
                );
              })}
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
              <p className="text-[11px] text-gray-400">
                {summary?.pending_verification ?? 0} awaiting verification
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('inbound')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl cursor-pointer"
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
              <p className="text-[11px] text-gray-400">
                {summary?.orders_awaiting_pack ?? 0} packing in progress
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('outbound')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl cursor-pointer"
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
              <p className="text-[11px] text-gray-400">{summary?.open_transfers ?? 0} open transfers</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('transfers')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl cursor-pointer"
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
              <p className="text-[11px] text-gray-400">{summary?.pending_returns ?? 0} awaiting action</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('returns')}
            className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl cursor-pointer"
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
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{item.sku}</span>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
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
                <p className="text-center text-xs text-gray-400 py-4">
                  {isLoading ? 'Checking stock levels...' : 'All low-stock items reordered!'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Inbound vs Outbound Weekly Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Inbound vs Outbound</h3>
              <p className="text-xs text-gray-400">Last 7 days of stock movements</p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('reports')}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Full Report</span>
            </button>
          </div>

          <div className="h-44 mt-4 flex items-end justify-between gap-3 px-4 pb-2 border-b border-gray-200">
            {daily.map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center space-x-1.5 h-32">
                  <div
                    style={{ height: `${((item.inbound_units || 0) / peakUnits) * 100}%` }}
                    className="w-3 bg-emerald-500 rounded-t-sm"
                    title={`Inbound: ${item.inbound_units}`}
                  ></div>
                  <div
                    style={{ height: `${((item.outbound_units || 0) / peakUnits) * 100}%` }}
                    className="w-3 bg-blue-600 rounded-t-sm"
                    title={`Outbound: ${item.outbound_units}`}
                  ></div>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 mt-2">{item.label}</span>
              </div>
            ))}

            {daily.length === 0 && (
              <p className="w-full text-center text-xs text-gray-400 font-semibold self-center">
                No movement recorded in the last 7 days.
              </p>
            )}
          </div>

          <div className="flex items-center justify-around pt-4 text-xs font-semibold">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              <span>Inbound This Week: <strong className="text-gray-900">{inboundWeek.toLocaleString('en-IN')}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
              <span>Outbound This Week: <strong className="text-gray-900">{outboundWeek.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
