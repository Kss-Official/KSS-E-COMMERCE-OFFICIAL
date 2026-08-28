import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ArrowDownToLine,
  Boxes,
  ArrowUpFromLine,
  ShoppingBag,
  Truck,
  RotateCcw,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Users,
  Settings,
  ChevronLeft,
  Warehouse,
  PackageCheck
} from 'lucide-react';
import { fetchWarehouseSummaryApi, fetchWarehouseAlertsApi } from '../../src/services/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbound', label: 'Inbound', icon: ArrowDownToLine, badgeKey: 'pending_verification' },
  { id: 'inventory', label: 'Inventory', icon: Boxes, badgeKey: 'low_stock_count' },
  { id: 'outbound', label: 'Outbound', icon: ArrowUpFromLine, badgeKey: 'orders_awaiting_pack' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'shipments', label: 'Shipments', icon: Truck, badgeKey: 'pending_dispatch' },
  { id: 'returns', label: 'Returns', icon: RotateCcw, badgeKey: 'pending_returns' },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight, badgeKey: 'open_transfers' },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell, badgeKey: 'alerts' },
];

export default function Sidebar({ activeTab, setActiveTab, onExitPortal }) {
  const [isOnline, setIsOnline] = useState(true);
  const [counts, setCounts] = useState({});
  const [warehouseCode, setWarehouseCode] = useState('WH01');

  // Badge counts come straight from the warehouse summary + alerts endpoints.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [summary, alertData] = await Promise.all([
        fetchWarehouseSummaryApi(),
        fetchWarehouseAlertsApi()
      ]);
      if (cancelled) return;
      setCounts({ ...(summary || {}), alerts: alertData?.total || 0 });
      if (summary?.warehouse_code) setWarehouseCode(summary.warehouse_code);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="w-16 lg:w-64 bg-[#1D4ED8] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-[#173eb2] shadow-xl shrink-0 overflow-y-auto scrollbar-none">
      <div>
        {/* Warehouse Header Card */}
        <div className="p-2 lg:p-5 border-b border-[#3B82F6]/30 bg-[#173eb2] flex flex-col items-center text-center relative">
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              title="Return to Store"
              className="absolute left-3 top-3 p-1 text-blue-200 hover:text-white hover:bg-[#3B82F6]/40 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#60a5fa] flex items-center justify-center text-white mb-2 shadow-md border-2 border-blue-300/40">
            <Warehouse className="w-9 h-9" />
          </div>

          <h3 className="hidden lg:block font-extrabold text-white text-base tracking-wide leading-tight">
            Warehouse - {warehouseCode}
          </h3>
          <span className="hidden lg:inline text-[11px] text-blue-100 font-medium">
            {counts.total_skus ? `${counts.total_skus.toLocaleString('en-IN')} SKUs on floor` : 'Main Warehouse'}
          </span>

          {/* Interactive Status Toggle Pill */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`mt-2.5 flex items-center justify-center lg:space-x-2 px-2 lg:px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${isOnline
              ? 'bg-[#3B82F6]/30 text-blue-100 border border-[#3B82F6]/50 hover:bg-[#3B82F6]/40'
              : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-300 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.badgeKey ? Number(counts[item.badgeKey] || 0) : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-between px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-[#3B82F6] text-white shadow-md font-bold transform translate-x-1 border-l-4 border-white'
                  : 'text-blue-100/90 hover:bg-[#173eb2] hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                </div>
                {badge > 0 && (
                  <span className="hidden lg:inline bg-[#3B82F6] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & Motivation Widget */}
      <div className="p-3 space-y-2 border-t border-[#3B82F6]/30 ">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === 'settings'
            ? 'bg-[#3B82F6] text-white font-bold'
            : 'text-blue-100/90 hover:bg-[#173eb2] hover:text-white'
            }`}
        >
          <Settings className="w-5 h-5 text-blue-200" />
          <span className="hidden lg:inline">Settings</span>
        </button>

        <div className="hidden lg:block bg-[#173eb2]/90 border border-[#3B82F6]/40 p-3.5 rounded-2xl text-center shadow-xs mt-2">
          <div className="w-8 h-8 rounded-full bg-[#3B82F6]/30 text-blue-200 flex items-center justify-center mx-auto mb-1.5">
            <PackageCheck className="w-4 h-4 text-blue-200" />
          </div>
          <p className="text-[11px] text-blue-100/90 font-medium leading-tight">
            Keep your stock organized and orders moving! 📦
          </p>
        </div>
      </div>
    </aside>
  );
}
