import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  PackageCheck,
  Navigation,
  Clock,
  Wallet,
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
  fetchDeliveryNotificationsApi
} from '../../src/services/api';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-deliveries', label: 'My Deliveries', icon: PackageCheck, badgeKey: 'open' },
  { id: 'active-delivery', label: 'Active Delivery', icon: Navigation, badgeKey: 'transit' },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'unread' },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'support', label: 'Support', icon: HelpCircle }
];

// The backend has no availability column, so the rider's on/off duty choice is
// remembered per browser.
const ONLINE_KEY = 'buyzo_rider_online';

export default function Sidebar({ activeTab, setActiveTab, onExitPortal }) {
  const [isOnline, setIsOnline] = useState(() => {
    try {
      return localStorage.getItem(ONLINE_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [agent, setAgent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ open: 0, transit: 0, unread: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [dash, prof, tasks, notes] = await Promise.all([
        fetchDeliveryDashboardApi(),
        fetchDeliveryProfileApi(),
        fetchDeliveryTasksApi(),
        fetchDeliveryNotificationsApi()
      ]);
      if (!alive) return;
      setAgent(dash || null);
      setProfile(prof || null);
      const rows = Array.isArray(tasks) ? tasks : [];
      setCounts({
        open: rows.filter((t) => !['DELIVERED', 'FAILED'].includes(t.status)).length,
        transit: rows.filter((t) => t.status === 'IN_TRANSIT').length,
        unread: Number(notes?.unread_count || 0)
      });
    })();
    return () => {
      alive = false;
    };
  }, [activeTab]);

  const toggleOnline = () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      localStorage.setItem(ONLINE_KEY, String(next));
    } catch {
      /* storage unavailable — the toggle still works for this session */
    }
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
    <aside className="w-16 lg:w-64 bg-[#063328] text-white flex flex-col justify-between min-h-screen border-r border-emerald-950/40 shadow-xl shrink-0">
      <div>
        {/* Agent Profile Header Card */}
        <div className="p-2 lg:p-5 border-b border-emerald-900/50 bg-[#04241c] flex flex-col items-center text-center relative">
          {onExitPortal && (
            <button
              onClick={onExitPortal}
              title="Return to Store"
              className="absolute left-3 top-3 p-1 text-emerald-300 hover:text-white hover:bg-emerald-800/60 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative mb-2">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 text-white flex items-center justify-center text-2xl font-black border-4 border-emerald-500 shadow-md">
                {initials || 'AG'}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#04241c] ${
                isOnline ? 'bg-emerald-400' : 'bg-gray-400'
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
            className={`mt-3 flex items-center justify-center lg:space-x-2 px-2 lg:px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isOnline
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30'
                : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badge = item.badgeKey ? counts[item.badgeKey] : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-between px-2 lg:px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1b4d3e] text-white shadow-md font-bold transform translate-x-1 border-l-4 border-[#ff5100]'
                    : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#ff5100]' : 'text-emerald-300'}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                </div>
                {badge > 0 && (
                  <span className="hidden lg:inline bg-[#ff5100] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Motivational Bottom Banner & Logout */}
      <div className="p-3 space-y-3">
        <div className="hidden lg:block bg-emerald-950/60 border border-emerald-800/50 p-3.5 rounded-2xl text-center shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-800/60 text-emerald-300 flex items-center justify-center mx-auto mb-2">
            <Gift className="w-4 h-4 text-emerald-300" />
          </div>
          <h4 className="text-xs font-bold text-white">Excellent Job!</h4>
          <p className="text-[11px] text-emerald-300/80 mt-0.5">
            {Number(agent?.completed_today || 0) > 0
              ? `${agent.completed_today} delivered today. Keep it up!`
              : 'You are doing great. Keep it up!'}
          </p>
        </div>

        <button
          onClick={onExitPortal}
          className="w-full flex items-center justify-center lg:justify-start space-x-3.5 px-2 lg:px-4 py-2 rounded-xl font-medium text-sm text-red-300 hover:bg-red-950/40 hover:text-red-200 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
