import React, { useState, useEffect, useRef } from 'react';
import { Truck, Bell, Calendar, Store, ChevronDown, Package, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchDeliveryProfileApi, fetchDeliveryNotificationsApi } from '../../src/services/api';

// Same key the Sidebar toggle writes, so both indicators agree.
const ONLINE_KEY = 'buyzo_rider_online';

const NOTE_ICON = {
  assignment: Package,
  in_transit: Truck,
  delivered: CheckCircle2,
  failed: AlertTriangle
};

export default function Topbar({ title, onExitPortal, setActiveTab }) {
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
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-emerald-50 text-[#1b4d3e]">
          <Truck className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 capitalize">
          Delivery Agent Portal
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Date Selector */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-emerald-800" />
          <span>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* Return to Store */}
        {onExitPortal && (
          <button
            onClick={onExitPortal}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#1b4d3e] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
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
              <span className="absolute top-1 right-1 bg-[#ff5100] text-white text-[10px] font-black rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
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
                      className={`px-4 py-3 flex items-start gap-3 ${note.is_read ? '' : 'bg-emerald-50/40'}`}
                    >
                      <Icon className="w-4 h-4 text-[#1b4d3e] mt-0.5 shrink-0" />
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
                  className="w-full px-4 py-2.5 text-xs font-bold text-[#1b4d3e] bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                >
                  View all notifications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Agent Profile Dropdown */}
        <button
          onClick={() => setActiveTab && setActiveTab('profile')}
          className="flex items-center space-x-3 pl-3 border-l border-gray-200 cursor-pointer"
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={name}
              className="w-9 h-9 rounded-full object-cover border border-emerald-500 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1b4d3e] to-emerald-500 text-white flex items-center justify-center text-xs font-black border border-emerald-500 shadow-xs shrink-0">
              {initials || 'AG'}
            </div>
          )}
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-tight">{name}</span>
            <span
              className={`text-[10px] font-bold leading-tight flex items-center space-x-1 ${
                isOnline ? 'text-emerald-600' : 'text-gray-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden md:block" />
        </button>
      </div>
    </header>
  );
}
