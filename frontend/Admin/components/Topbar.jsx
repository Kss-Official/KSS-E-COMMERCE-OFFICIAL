import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Calendar, Store, Menu, ShoppingBag, AlertTriangle, CreditCard, Ticket, CheckCircle2, ExternalLink, X } from 'lucide-react';
import { getCurrentUser } from '../../src/services/api';
import ProfileDropdown from '../../src/components/ui/ProfileDropdown';

export default function Topbar({ title, onExitAdmin, setActiveTab, onToggleMobileSidebar }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Order Received! 🛍️',
      message: 'Order #ORD-94812 (₹4,499) placed by Rahul Sharma',
      time: '2 mins ago',
      unread: true,
      targetTab: 'orders',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 2,
      title: 'Low Inventory Alert ⚠️',
      message: 'boAt Rockerz 450 stock is low (3 units left in WH-01)',
      time: '15 mins ago',
      unread: true,
      targetTab: 'inventory',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-800'
    },
    {
      id: 3,
      title: 'UPI Payment Confirmed 💳',
      message: '₹2,999 payment received via UPI for Order #ORD-94810',
      time: '45 mins ago',
      unread: true,
      targetTab: 'payments',
      icon: CreditCard,
      iconBg: 'bg-blue-100 text-blue-800'
    },
    {
      id: 4,
      title: 'New Support Request 💬',
      message: 'Ananya Verma requested return / exchange help',
      time: '1 hour ago',
      unread: true,
      targetTab: 'support',
      icon: CheckCircle2,
      iconBg: 'bg-purple-100 text-purple-800'
    },
    {
      id: 5,
      title: 'Coupon Redemption 🏷️',
      message: 'Promo code WELCOME15 redeemed 14 times today',
      time: '2 hours ago',
      unread: false,
      targetTab: 'coupons',
      icon: Ticket,
      iconBg: 'bg-rose-100 text-rose-800'
    }
  ]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setIsNotificationOpen(false);
    if (setActiveTab && item.targetTab) {
      setActiveTab(item.targetTab);
    }
  };

  const adminName = currentUser
    ? (currentUser.first_name
        ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
        : (currentUser.name || currentUser.username || (currentUser.email && !currentUser.email.startsWith('admin') ? currentUser.email.split('@')[0] : 'Arnav Kapoor')))
    : 'Arnav Kapoor';

  let adminDesignation = 'System Administrator';
  if (currentUser?.designation) {
    adminDesignation = currentUser.designation;
  } else if (currentUser?.role) {
    const r = String(currentUser.role).toUpperCase();
    if (r === 'ADMIN' || r === 'SUPERADMIN') adminDesignation = 'System Administrator';
    else if (r === 'WAREHOUSE') adminDesignation = 'Warehouse Operations Lead';
    else if (r === 'DELIVERY_AGENT') adminDesignation = 'Logistics & Delivery Manager';
    else adminDesignation = 'Store Administrator';
  } else {
    adminDesignation = 'System Administrator';
  }

  return (
    <header className="bg-white border-b border-gray-200 py-3 sm:py-3.5 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      {/* Title / Mobile Hamburger */}
      <div className="flex items-center space-x-2.5 sm:space-x-4 flex-1 max-w-2xl">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#004d47] transition-colors cursor-pointer"
            title="Open Navigation Menu"
          >
            <Menu className="w-5.5 h-5.5 stroke-[2.2]" />
          </button>
        )}
        <h1 className="text-base sm:text-xl font-bold text-gray-900 capitalize shrink-0">
          {title || 'Dashboard'}
        </h1>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0D9488] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Date Selector */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span>Last 30 Days</span>
        </div>

        {/* Return to Store */}
        {onExitAdmin && (
          <button
            onClick={onExitAdmin}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#0D9488] bg-[#ccfbf1] hover:bg-[#99f6e4] px-3 py-1.5 rounded-lg border border-[#14B8A6]/30 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store View</span>
          </button>
        )}

        {/* Interactive Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-teal-700 transition-colors cursor-pointer"
            title="System Notifications & Alerts"
          >
            <Bell className="w-5.5 h-5.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] font-black rounded-full min-w-[17px] h-[17px] px-1 flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Notifications Dropdown Menu */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5">
              {/* Dropdown Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-[#063328] to-[#0a4d3c] text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-emerald-300" />
                  <h3 className="text-xs font-black uppercase tracking-wider">System Notifications</h3>
                </div>
                {unreadCount > 0 ? (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-extrabold bg-emerald-700/80 hover:bg-emerald-600 text-white px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                  >
                    Mark All Read
                  </button>
                ) : (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    All Read
                  </span>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 font-semibold">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const IconComp = n.icon || Bell;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3.5 flex items-start space-x-3 hover:bg-emerald-50/50 cursor-pointer transition-colors group ${
                          n.unread ? 'bg-emerald-50/30' : 'bg-white'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${n.iconBg}`}>
                          <IconComp className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-1">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium leading-tight mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 mt-1.5 group-hover:underline">
                            <span>Open {n.targetTab}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        </div>
                        {n.unread && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    setIsNotificationOpen(false);
                    if (setActiveTab) setActiveTab('reports');
                  }}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  View Activity &amp; Audit Logs →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="pl-3 border-l border-gray-200">
          <ProfileDropdown
            user={{
              name: adminName,
              designation: adminDesignation,
              avatar: currentUser?.avatar
            }}
            setActiveTab={setActiveTab}
            onLogout={onExitAdmin}
            portalType="admin"
          />
        </div>
      </div>
    </header>
  );
}

