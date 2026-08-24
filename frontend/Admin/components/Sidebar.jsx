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
                className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
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
      <div className="p-3 border-t border-emerald-900/50 space-y-1.5 bg-[#062920]/80">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'settings'
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
    </aside>
  );
}
