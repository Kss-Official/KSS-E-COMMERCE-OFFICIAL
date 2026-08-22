import React, { useState } from 'react';
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

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbound', label: 'Inbound', icon: ArrowDownToLine },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'outbound', label: 'Outbound', icon: ArrowUpFromLine },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'shipments', label: 'Shipments', icon: Truck },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowLeftRight },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: Bell, badge: 4 },
];

export default function Sidebar({ activeTab, setActiveTab, onExitPortal }) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <aside className="w-16 lg:w-64 bg-[#092540] text-white flex flex-col justify-between min-h-screen border-r border-blue-950/40 shadow-xl shrink-0">
      <div>
        {/* Warehouse Header Card */}
        <div className="p-2 lg:p-5 border-b border-blue-900/50 bg-[#061a2e] flex flex-col items-center text-center relative">
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              title="Return to Store"
              className="absolute left-3 top-3 p-1 text-blue-300 hover:text-white hover:bg-blue-800/60 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mb-2 shadow-md border-2 border-blue-400/40">
            <Warehouse className="w-9 h-9" />
          </div>

          <h3 className="hidden lg:block font-extrabold text-white text-base tracking-wide leading-tight">Warehouse - WH01</h3>
          <span className="hidden lg:inline text-[11px] text-blue-300 font-medium">Main Warehouse</span>

          {/* Interactive Status Toggle Pill */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`mt-2.5 flex items-center justify-center lg:space-x-2 px-2 lg:px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-between px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-bold transform translate-x-1'
                    : 'text-blue-100/80 hover:bg-blue-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="hidden lg:inline bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & Motivation Widget */}
      <div className="p-3 space-y-2 border-t border-blue-900/50 bg-[#061a2e]/80">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-blue-100/80 hover:bg-blue-800/40 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 text-blue-300" />
          <span className="hidden lg:inline">Settings</span>
        </button>

        <div className="hidden lg:block bg-blue-950/60 border border-blue-800/50 p-3.5 rounded-2xl text-center shadow-xs mt-2">
          <div className="w-8 h-8 rounded-full bg-blue-800/60 text-blue-300 flex items-center justify-center mx-auto mb-1.5">
            <PackageCheck className="w-4 h-4 text-cyan-300" />
          </div>
          <p className="text-[11px] text-blue-200/90 font-medium leading-tight">
            Keep your stock organized and orders moving! 📦
          </p>
        </div>
      </div>
    </aside>
  );
}
