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
  Banknote,
  Users,
  Settings,
  ChevronLeft,
  Warehouse,
  PackageCheck,
  LogOut
} from 'lucide-react';
import {
  fetchWarehouseSummaryApi,
  fetchWarehouseAlertsApi,
  fetchWarehouseCashHandoversApi,
  logoutUser
} from '../../src/services/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbound', label: 'Inbound', icon: ArrowDownToLine, badgeKey: 'pending_verification' },
  { id: 'inventory', label: 'Inventory', icon: Boxes, badgeKey: 'low_stock_count' },
  { id: 'outbound', label: 'Outbound', icon: ArrowUpFromLine, badgeKey: 'orders_awaiting_pack' },
  { id: 'cash-handovers', label: 'Cash Handovers', icon: Banknote, badgeKey: 'pending_cash_handovers' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'shipments', label: 'Shipments', icon: Truck, badgeKey: 'pending_dispatch' },
  { id: 'returns', label: 'Returns', icon: RotateCcw, badgeKey: 'pending_returns' },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight, badgeKey: 'open_transfers' },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell, badgeKey: 'alerts' },
];

export default function Sidebar({ activeTab, setActiveTab, onExitPortal, onLogout }) {
  const [isOnline, setIsOnline] = useState(true);
  const [counts, setCounts] = useState({});
  const [warehouseCode, setWarehouseCode] = useState('WH01');

  // Badge counts come straight from the warehouse summary + alerts endpoints.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [summary, alertData, cashHandovers] = await Promise.all([
        fetchWarehouseSummaryApi(),
        fetchWarehouseAlertsApi(),
        fetchWarehouseCashHandoversApi()
      ]);
      if (cancelled) return;
      setCounts({
        ...(summary || {}),
        alerts: alertData?.total || 0,
        pending_cash_handovers: cashHandovers?.pending_count || 0
      });
      if (summary?.warehouse_code) setWarehouseCode(summary.warehouse_code);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleLogoutClick = () => {
    logoutUser();
    if (onLogout) {
      onLogout();
    } else if (onExitPortal) {
      onExitPortal();
    } else {
      window.location.hash = '#login';
    }
  };

  return (
    <aside className="flex w-full md:w-64 bg-[#1D4ED8] text-white flex-col justify-between h-full md:h-screen md:sticky md:top-0 border-r border-[#173eb2] shadow-xl shrink-0 overflow-y-auto scrollbar-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#3B82F6]/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 shadow-xs">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-bold text-white leading-tight tracking-wide">
                Warehouse Panel
              </h1>
              <button
                onClick={() => setIsOnline(!isOnline)}
                title="Click to toggle status"
                className="flex items-center space-x-1.5 mt-0.5 text-xs font-medium text-blue-100/90 hover:text-white cursor-pointer transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-300 animate-pulse' : 'bg-gray-400'}`} />
                <span>{warehouseCode} • {isOnline ? 'Online' : 'Offline'}</span>
              </button>
            </div>
          </div>
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              title="Return to Store"
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
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
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-[#3B82F6] text-white shadow-md font-bold border-l-4 border-white'
                  : 'text-blue-100/90 hover:bg-[#173eb2] hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {badge > 0 && (
                  <span className="bg-[#3B82F6] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
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
          onClick={() => {
            setActiveTab('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center space-x-3.5 px-3.5 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${activeTab === 'settings'
            ? 'bg-[#3B82F6] text-white font-bold'
            : 'text-blue-100/90 hover:bg-[#173eb2] hover:text-white'
            }`}
        >
          <Settings className="w-5 h-5 text-blue-200" />
          <span className="font-semibold">Settings</span>
        </button>

        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm text-[#ff6b6b] hover:bg-[#ff6b6b]/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-[#ff6b6b]" />
          <span className="hidden lg:inline font-semibold">Logout</span>
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
