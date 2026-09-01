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
  ChevronLeft,
  Headphones
} from 'lucide-react';
import {
  fetchAdminDashboardSummaryApi,
  fetchAdminUsers,
  fetchCategoriesApi,
  fetchCouponsApi,
  fetchProducts
} from '../../src/services/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package, badgeKey: 'products' },
  { id: 'categories', label: 'Categories', icon: FolderTree, badgeKey: 'categories' },
  { id: 'users', label: 'Users', icon: Users, badgeKey: 'users' },
  { id: 'orders', label: 'Orders', icon: ShoppingBag, badgeKey: 'pendingOrders', alert: true },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: Boxes, badgeKey: 'lowStock', alert: true },
  { id: 'coupons', label: 'Coupons', icon: Ticket, badgeKey: 'coupons' },
  { id: 'support', label: 'Helpdesk Tickets', icon: Headphones },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

const LOW_STOCK_THRESHOLD = 10;

export default function Sidebar({ activeTab, setActiveTab, onExitAdmin, onCloseMobile }) {
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
    <aside className="flex w-full md:w-64 bg-[#004d47] text-white flex-col justify-between h-full md:h-screen md:sticky md:top-0 border-r border-[#003b37] shadow-xl shrink-0 overflow-y-auto scrollbar-none font-sans">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#006059]/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/15 shadow-xs">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-bold text-white leading-tight tracking-wide">
                Admin Panel
              </h1>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-200/90">Online</span>
              </div>
            </div>
          </div>
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              title="Return to Store"
              className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between space-x-3.5 px-3 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#008277] text-white shadow-lg shadow-[#008277]/25 font-semibold'
                    : 'text-emerald-100/90 hover:bg-[#005c54] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-200/90'}`} />
                  <span className="font-semibold text-left">{item.label}</span>
                </div>
                {badge > 0 && (
                  <span
                    className={`flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full text-[11px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#003833] text-emerald-200'
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

      {/* Footer Navigation: Settings & Exit Admin */}
      <div className="p-3 border-t border-[#006059]/60 space-y-1">
        <button
          onClick={() => {
            setActiveTab('settings');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center space-x-3.5 px-3 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#008277] text-white shadow-lg shadow-[#008277]/25 font-semibold'
              : 'text-emerald-100/90 hover:bg-[#005c54] hover:text-white'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-white' : 'text-emerald-200/90'}`} />
          <span className="font-semibold">Settings</span>
        </button>

        {onExitAdmin && (
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center space-x-3.5 px-3 lg:px-4 py-2.5 rounded-xl font-medium text-sm text-[#ff7878] hover:bg-[#ff7878]/10 hover:text-red-300 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-[#ff7878]" />
            <span className="font-semibold">Exit Admin</span>
          </button>
        )}
      </div>
    </aside>
  );
}
