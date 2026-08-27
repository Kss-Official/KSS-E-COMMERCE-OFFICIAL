import React, { useState, useEffect } from 'react';
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
import {
  fetchAdminDashboardSummaryApi,
  fetchAdminUsers,
  fetchCategoriesApi,
  fetchCouponsApi,
  fetchProducts
} from '../../src/services/api';

// badgeKey points at a counter loaded from MySQL below; items without one never
// show a pill.
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package, badgeKey: 'products' },
  { id: 'categories', label: 'Categories', icon: FolderTree, badgeKey: 'categories' },
  { id: 'users', label: 'Users', icon: Users, badgeKey: 'users' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'pendingOrders', alert: true },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: Boxes, badgeKey: 'lowStock', alert: true },
  { id: 'coupons', label: 'Coupons', icon: Ticket, badgeKey: 'coupons' },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const LOW_STOCK_THRESHOLD = 10;

export default function Sidebar({ activeTab, setActiveTab, onExitAdmin }) {
  const [counts, setCounts] = useState({});

  // Refreshed whenever the operator switches tabs, so the pills track the writes
  // they just made in another tab.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [summary, users, categories, coupons, products] = await Promise.all([
          fetchAdminDashboardSummaryApi(),
          fetchAdminUsers(),
          fetchCategoriesApi(),
          fetchCouponsApi(),
          fetchProducts({ no_page: 'true' })
        ]);
        if (!alive) return;

        const breakdown = summary?.order_status_breakdown || {};
        const pendingOrders =
          Number(breakdown.pending || 0) + Number(breakdown.confirmed || 0);
        const productList = Array.isArray(products) ? products : [];
        const lowStock = productList.filter(
          (p) => Number(p.stock_quantity ?? 0) <= LOW_STOCK_THRESHOLD
        ).length;

        setCounts({
          products: Number(summary?.total_products || productList.length || 0),
          categories: Array.isArray(categories) ? categories.length : 0,
          users: Array.isArray(users) ? users.length : Number(summary?.total_customers || 0),
          pendingOrders,
          coupons: Array.isArray(coupons) ? coupons.filter((c) => c.is_active !== false).length : 0,
          lowStock
        });
      } catch (err) {
        console.warn('[Admin Sidebar] Badge counts unavailable:', err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeTab]);

  return (
    <aside className="w-16 lg:w-64 bg-[#0D9488] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-[#097168] shadow-xl shrink-0 overflow-y-auto scrollbar-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#14B8A6]/30 flex items-center justify-between bg-[#097168]">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <span className="text-teal-100 font-bold tracking-wide text-lg">Admin</span>
          </div>
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              title="Return to Store"
              className="p-1 text-teal-200 hover:text-white hover:bg-[#14B8A6]/40 rounded-md transition-colors"
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
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-[#14B8A6] text-white shadow-md font-bold transform translate-x-1'
                  : 'text-teal-100/90 hover:bg-[#097168] hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-teal-100'}`} />
                <span className="hidden lg:inline">{item.label}</span>
                {badge > 0 && (
                  <span
                    className={`hidden lg:flex ml-auto items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full text-[10px] font-black ${isActive
                      ? 'bg-white/25 text-white'
                      : item.alert
                        ? 'bg-[#14B8A6] text-white'
                        : 'bg-[#097168] text-teal-100'
                      }`}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Settings & Logout */}
      <div style={{ position: 'relative', background: '#097168' }}>
        {/* Wave layers at the top */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Layer 1: bright back wave */}



        </div>

        {/* Buttons */}
        <div className="p-3 space-y-0.5">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${activeTab === 'settings'
              ? 'bg-[#14B8A6] text-white shadow-md font-bold'
              : 'text-teal-100/90 hover:bg-[#097168] hover:text-white'
              }`}
          >
            <Settings className="w-5 h-5 text-teal-100" />
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
    </aside >
  );
}
