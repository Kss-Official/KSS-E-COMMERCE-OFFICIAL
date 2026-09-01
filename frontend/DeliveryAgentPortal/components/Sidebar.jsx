import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  Navigation,
  Clock,
  Wallet,
  Banknote,
  Bell,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  Star,
  Gift
} from 'lucide-react';
import {
  fetchDeliveryDashboardApi,
  fetchDeliveryProfileApi,
  fetchDeliveryTasksApi,
  fetchDeliveryNotificationsApi,
  fetchDeliveryCashHandoversApi,
  fetchDeliveryShiftApi,
  toggleDeliveryShiftApi
} from '../../src/services/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-deliveries', label: 'My Deliveries', icon: PackageCheck, badgeKey: 'total' },
  { id: 'active-delivery', label: 'Active Delivery', icon: Navigation, badgeKey: 'transit' },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'cash-in-hand', label: 'Cash in Hand', icon: Banknote, badgeKey: 'cashHolding' },
  { id: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'unread' },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'support', label: 'Support', icon: HelpCircle }
];

export default function Sidebar({ activeTab, setActiveTab, onExitPortal, onLogout }) {
  const [isOnline, setIsOnline] = useState(() => {
    try {
      return (localStorage.getItem('buyzo_rider_shift_status') || 'OFFLINE') === 'ONLINE';
    } catch {
      return false;
    }
  });
  const [agent, setAgent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ total: 0, open: 0, transit: 0, unread: 0, cashHolding: '' });

  const loadSidebarData = async () => {
    const [dash, prof, tasks, notes, handovers, shift] = await Promise.all([
      fetchDeliveryDashboardApi(),
      fetchDeliveryProfileApi(),
      fetchDeliveryTasksApi(),
      fetchDeliveryNotificationsApi(),
      fetchDeliveryCashHandoversApi(),
      fetchDeliveryShiftApi()
    ]);
    if (dash) setAgent(dash);
    if (prof) setProfile(prof);
    if (shift) setIsOnline(shift.shift_status === 'ONLINE');

    const rows = Array.isArray(tasks) ? tasks : [];
    const cashVal = Number(handovers?.cash_in_hand || 0);

    setCounts({
      total: rows.length,
      open: rows.filter((t) => !['DELIVERED', 'FAILED'].includes(t.status)).length,
      transit: rows.filter((t) => t.status === 'IN_TRANSIT' || t.status === 'ASSIGNED').length,
      unread: Number(notes?.unread_count || 0),
      cashHolding: cashVal > 0 ? `₹${Math.round(cashVal)}` : ''
    });
  };

  useEffect(() => {
    loadSidebarData();
    const interval = setInterval(loadSidebarData, 4000); // 4-second live polling for sidebar badge counters

    const handleShiftUpdated = (e) => {
      if (e.detail?.shift_status) {
        setIsOnline(e.detail.shift_status === 'ONLINE');
      }
    };
    window.addEventListener('buyzo_shift_updated', handleShiftUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('buyzo_shift_updated', handleShiftUpdated);
    };
  }, [activeTab]);

  const toggleOnline = async () => {
    const nextStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    setIsOnline(!isOnline);
    await toggleDeliveryShiftApi(nextStatus);
  };

  const name = profile?.full_name || agent?.agent_name || 'Delivery Agent';
  const successRate = profile?.stats?.success_rate;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  const delivered = profile?.stats?.delivered ?? agent?.total_completed ?? 0;

  return (
    <aside className="w-16 lg:w-64 bg-[#0B5E3C] text-white flex flex-col justify-between h-screen sticky top-0 border-r border-[#07452c] shadow-xl shrink-0 overflow-y-auto scrollbar-none">
      <div>
        {/* Agent Profile Header Card */}
        <div className="p-2 lg:p-5 border-b border-[#108A57]/30 flex flex-col items-center text-center relative">
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              title="Return to Store"
              className="absolute left-3 top-3 p-1 text-emerald-200 hover:text-white hover:bg-[#108A57]/40 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative mb-2">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#108A57] shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0B5E3C] to-[#108A57] text-white flex items-center justify-center text-2xl font-black border-4 border-[#108A57] shadow-md">
                {initials || 'AG'}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#07452c] ${isOnline ? 'bg-[#108A57]' : 'bg-gray-400'
                }`}
            ></span>
          </div>

          <h3 className="hidden lg:block font-extrabold text-white text-base tracking-wide">{name}</h3>

          {/* Success rate is a real aggregate over this rider's completed tasks. */}
          <div className="hidden lg:flex items-center space-x-1 mt-0.5 text-xs font-bold text-amber-300">
            <Star className="w-3.5 h-3.5 fill-amber-300 stroke-none" />
            <span>{successRate != null ? `${successRate}% success` : `${delivered} delivered`}</span>
          </div>

          {/* Interactive Online/Offline Toggle Pill */}
          <button
            onClick={toggleOnline}
            className={`mt-3 flex items-center justify-center lg:space-x-2 px-2 lg:px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${isOnline
                ? 'bg-[#108A57]/30 text-emerald-200 border border-[#108A57]/50 hover:bg-[#108A57]/40'
                : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
              }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeVal = item.badgeKey ? counts[item.badgeKey] : null;
            const showBadge = badgeVal !== null && badgeVal !== undefined && badgeVal !== '' && badgeVal !== 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-between px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-[#108A57] text-white shadow-md font-bold transform translate-x-1 border-l-4 border-white'
                    : 'text-emerald-100/90 hover:bg-[#07452c] hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-200'}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                </div>
                {showBadge && (
                  <span className="hidden lg:inline bg-[#108A57] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                    {badgeVal}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Motivational Bottom Banner & Logout */}
      <div className="p-3 space-y-3 border-t border-[#108A57]/30">
        <div className="hidden lg:block bg-[#07452c]/90 border border-[#108A57]/30 p-3.5 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-full bg-[#108A57]/30 text-emerald-200 flex items-center justify-center mx-auto mb-2">
            <Gift className="w-4 h-4 text-emerald-200" />
          </div>
          <h4 className="text-xs font-bold text-white">Excellent Job!</h4>
          <p className="text-[11px] text-emerald-200/90 mt-0.5">
            {Number(agent?.completed_today || 0) > 0
              ? `${agent.completed_today} delivered today. Keep it up!`
              : 'You are doing great. Keep it up!'}
          </p>
        </div>

        <button
          onClick={onLogout || onExitPortal}
          className="w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2 rounded-xl font-medium text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
