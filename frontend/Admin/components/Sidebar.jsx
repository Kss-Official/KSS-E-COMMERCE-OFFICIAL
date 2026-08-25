import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingBag,
  CreditCard,
  Boxes,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderTree },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'coupons', label: 'Coupons', icon: Ticket },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ activeTab, setActiveTab, onExitAdmin }) {
  return (
    <aside className="w-16 lg:w-64 bg-[#093529] text-white flex flex-col justify-between min-h-screen border-r border-emerald-950/40 shadow-xl shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-emerald-900/50 flex items-center justify-between bg-[#062920]">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <span className="text-emerald-100 font-bold tracking-wide text-lg">Admin</span>
          </div>
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              title="Return to Store"
              className="p-1 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-[#ff5100] text-white shadow-md font-bold transform translate-x-1'
                  : 'text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-300'}`} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Settings & Logout */}
      <div style={{ position: 'relative', background: '#0a5f55' }}>
        {/* Wave layers at the top */}
        <div style={{ position: 'relative', height: '50px', overflow: 'hidden' }}>
          {/* Layer 1: bright back wave */}
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="sw1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ac9b0" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0e7a6e" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
          {/* Layer 2: mid wave */}
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <linearGradient id="sw2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f9e8e" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0a5f55" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0,0 L0,26 C50,12 90,36 140,24 C168,16 185,26 200,20 L200,0 Z" fill="url(#sw2)" />
          </svg>
          {/* Layer 3: dark foreground wave blending into body */}
          <svg viewBox="0 0 200 50" preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M0,0 L0,36 C60,22 110,44 160,32 C182,26 194,30 200,28 L200,0 Z" fill="#0a5f55" />
          </svg>
        </div>

        {/* Buttons */}
        <div className="p-3 space-y-1.5">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${activeTab === 'settings'
              ? 'bg-[#ff5100] text-white shadow-md font-bold'
              : 'text-emerald-100/80 hover:bg-emerald-800/50 hover:text-white'
              }`}
          >
            <Settings className="w-5 h-5 text-emerald-300" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="hidden lg:inline">Exit Admin</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
