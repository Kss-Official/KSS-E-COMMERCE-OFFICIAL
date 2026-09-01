import React, { useState, useEffect, useRef } from 'react';
import { Truck, Bell, Calendar, Store, Package, CheckCircle2, AlertTriangle, Menu } from 'lucide-react';
import { fetchDeliveryProfileApi, fetchDeliveryNotificationsApi } from '../../src/services/api';
import ProfileDropdown from '../../src/components/ui/ProfileDropdown';

// Same key the Sidebar toggle writes, so both indicators agree.
const ONLINE_KEY = 'buyzo_rider_online';

const NOTE_ICON = {
  assignment: Package,
  in_transit: Truck,
  delivered: CheckCircle2,
  failed: AlertTriangle
};

export default function Topbar({ title, onExitPortal, setActiveTab, onToggleMobileSidebar }) {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [openBell, setOpenBell] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const bellRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [prof, notes] = await Promise.all([fetchDeliveryProfileApi(), fetchDeliveryNotificationsApi()]);
      if (!alive) return;
      setProfile(prof || null);
      setNotifications(Array.isArray(notes?.notifications) ? notes.notifications.slice(0, 5) : []);
      setUnread(Number(notes?.unread_count || 0));
    })();
    return () => {
      alive = false;
    };
  }, [title]);

  useEffect(() => {
    try {
      setIsOnline(localStorage.getItem(ONLINE_KEY) !== 'false');
    } catch {
      setIsOnline(true);
    }
  }, [title]);

  useEffect(() => {
    const onClickAway = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpenBell(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const name = profile?.full_name || 'Delivery Agent';

  return (
    <header className="bg-white border-b border-gray-200 py-3 sm:py-3.5 px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      {/* Title + Mobile Hamburger Menu */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-[#0B5E3C] transition-colors cursor-pointer"
            title="Open Navigation Menu"
          >
            <Menu className="w-5.5 h-5.5 stroke-[2.2]" />
          </button>
        )}
        <div className="p-2 rounded-xl bg-[#e6f5ef] text-[#0B5E3C]">
          <Truck className="w-5 h-5" />
        </div>
        <h1 className="text-base sm:text-xl font-bold text-gray-900 capitalize truncate">
          Delivery Agent Portal
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Date Selector */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-[#0B5E3C]" />
          <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>

        {/* Return to Store */}
        {onExitPortal && (
          <button
            onClick={onExitPortal}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#0B5E3C] bg-[#e6f5ef] hover:bg-[#d0edd5] px-3 py-1.5 rounded-xl border border-[#108A57]/30 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store View</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setOpenBell(!openBell)}
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 bg-[#108A57] text-white text-[10px] font-black rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
                {unread}
              </span>
            )}
          </button>

          {openBell && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 && (
                  <p className="px-4 py-6 text-center text-xs font-semibold text-gray-400">
                    Nothing to review right now.
                  </p>
                )}
                {notifications.map((note) => {
                  const Icon = NOTE_ICON[note.type] || Package;
                  return (
                    <div
                      key={note.id}
                      className={`px-4 py-3 flex items-start gap-3 ${note.is_read ? '' : 'bg-[#e6f5ef]/60'}`}
                    >
                      <Icon className="w-4 h-4 text-[#0B5E3C] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900">{note.title}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{note.message}</p>
                        <span className="text-[10px] text-gray-400 font-semibold">{note.formatted_date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {setActiveTab && (
                <button
                  onClick={() => {
                    setOpenBell(false);
                    setActiveTab('notifications');
                  }}
                  className="w-full px-4 py-2.5 text-xs font-bold text-[#0B5E3C] bg-[#e6f5ef] hover:bg-[#d0edd5] cursor-pointer"
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Agent Profile Dropdown */}
        <div className="pl-3 border-l border-gray-200">
          <ProfileDropdown
            user={{
              name: name,
              designation: isOnline ? 'Delivery Agent (Online)' : 'Delivery Agent (Offline)',
              avatar: profile?.avatar
            }}
            setActiveTab={setActiveTab}
            onLogout={onExitPortal}
            portalType="delivery"
          />
        </div>
      </div>
    </header>
  );
}
