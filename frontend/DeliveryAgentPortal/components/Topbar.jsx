import React, { useState, useEffect, useRef } from 'react';
import { Truck, Bell, Calendar, Store, Package, CheckCircle2, AlertTriangle, ShieldAlert, Clock, Power, X, ArrowRight } from 'lucide-react';
import {
  fetchDeliveryProfileApi,
  fetchDeliveryNotificationsApi,
  fetchDeliveryShiftApi,
  toggleDeliveryShiftApi,
  triggerDeliverySOSApi
} from '../../src/services/api';
import { playNotificationChime } from '../../src/utils/audioAlert';
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
  const [shift, setShift] = useState(() => ({
    shift_status: (typeof window !== 'undefined' && localStorage.getItem('buyzo_rider_shift_status')) || 'OFFLINE',
    formatted_online_time: '0h 0m'
  }));
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosReason, setSosReason] = useState('ACCIDENT');
  const [sosNotes, setSosNotes] = useState('');
  const [sosSubmitting, setSosSubmitting] = useState(false);
  const [sosNotice, setSosNotice] = useState(null);
  const [realtimeBanner, setRealtimeBanner] = useState(null);

  const prevUnreadRef = useRef(null);
  const lastNotifIdRef = useRef(null);
  const bellRef = useRef(null);

  const loadShiftData = async () => {
    const s = await fetchDeliveryShiftApi();
    if (s) setShift(s);
  };

  useEffect(() => {
    const handleShiftUpdated = (e) => {
      if (e.detail) setShift(e.detail);
    };
    window.addEventListener('buyzo_shift_updated', handleShiftUpdated);
    return () => window.removeEventListener('buyzo_shift_updated', handleShiftUpdated);
  }, []);

  // Live minute timer ticking when shift is ONLINE
  useEffect(() => {
    if (shift.shift_status !== 'ONLINE') return;
    const interval = setInterval(() => {
      setShift((prev) => {
        const total = (prev.total_online_minutes || 0) + 1;
        const hours = Math.floor(total / 60);
        const mins = total % 60;
        return {
          ...prev,
          total_online_minutes: total,
          formatted_online_time: `${hours}h ${mins}m`
        };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [shift.shift_status]);

  const loadNotificationsData = async () => {
    const [prof, notes, sData] = await Promise.all([
      fetchDeliveryProfileApi(),
      fetchDeliveryNotificationsApi(),
      fetchDeliveryShiftApi()
    ]);
    if (prof) setProfile(prof);
    if (Array.isArray(notes?.notifications)) {
      setNotifications(notes.notifications.slice(0, 5));
      setUnread(Number(notes?.unread_count || 0));
    }
    if (sData) setShift(sData);
  };

  useEffect(() => {
    loadNotificationsData();
    const interval = setInterval(loadNotificationsData, 4000); // 4-second live polling for new delivery alerts
    return () => clearInterval(interval);
  }, [title]);

  useEffect(() => {
    const onClickAway = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpenBell(false);
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const [shiftToast, setShiftToast] = useState(null);

  const handleToggleShift = async () => {
    const nextStatus = shift.shift_status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setShift((prev) => ({
      ...prev,
      shift_status: nextStatus
    }));
    setShiftToast(`Shift status updated to: ${nextStatus === 'ONLINE' ? 'ONLINE (On Duty)' : 'OFFLINE (Off Duty)'}`);
    setTimeout(() => setShiftToast(null), 3000);

    const res = await toggleDeliveryShiftApi(nextStatus);
    if (res?.status === 'success') {
      const fresh = await fetchDeliveryShiftApi();
      if (fresh) setShift(fresh);
    }
  };

  const handleTriggerSos = async (e) => {
    e.preventDefault();
    setSosSubmitting(true);
    const res = await triggerDeliverySOSApi(sosReason, sosNotes);
    setSosSubmitting(false);
    if (res?.status === 'success') {
      setSosNotice('EMERGENCY SOS ALERT BROADCASTED! Support team & Hub Control Room notified.');
      setTimeout(() => {
        setSosNotice(null);
        setShowSosModal(false);
      }, 4000);
    }
  };

  const name = profile?.full_name || 'Delivery Agent';
  const isOnline = shift.shift_status === 'ONLINE';

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
        <div>
          <h1 className="text-xl font-bold text-gray-900 capitalize leading-tight">
            Delivery Agent Portal
          </h1>
          <p className="text-[11px] font-semibold text-gray-400">Hub: WH01 Central &middot; Mumbai</p>
        </div>
      </div>

      {shiftToast && (
        <div className="hidden md:flex items-center space-x-2 bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl animate-in fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{shiftToast}</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Shift / Duty Toggle Pill Button */}
        <button
          onClick={handleToggleShift}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
          }`}
          title="Click to toggle Shift On/Off Duty"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
          <span>{isOnline ? `Online (${shift.formatted_online_time || '0h 0m'})` : 'Off Duty'}</span>
          <Power className="w-3.5 h-3.5 ml-1 opacity-70" />
        </button>

        {/* SOS Emergency Quick Button */}
        <button
          onClick={() => setShowSosModal(true)}
          className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer transform hover:scale-105 active:scale-95 animate-pulse"
          title="Trigger Emergency SOS Alert"
        >
          <ShieldAlert className="w-4 h-4 fill-white text-rose-600" />
          <span>SOS</span>
        </button>

        {/* Date Selector */}
        <div className="hidden lg:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700">
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
            onLogout={onLogout}
            portalType="delivery"
          />
        </div>
      </div>

      {/* Real-Time Incoming Request Alert Toast Banner */}
      {realtimeBanner && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-[#042820] text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 animate-bounce flex items-start space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0">
            <Bell className="w-5 h-5 animate-pulse text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-500/30">
                ⚡ REAL-TIME REQUEST ALERT
              </span>
              <button onClick={() => setRealtimeBanner(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-sm font-black text-white mt-1.5 leading-tight">{realtimeBanner.title}</h4>
            <p className="text-xs text-emerald-100/90 mt-1 line-clamp-2 leading-relaxed">{realtimeBanner.message}</p>
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('notifications');
                setRealtimeBanner(null);
              }}
              className="mt-2.5 inline-flex items-center space-x-1 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-gray-950 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <span>View Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border-2 border-rose-500">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <ShieldAlert className="w-7 h-7 fill-rose-600 text-white" />
                <h3 className="text-xl font-black text-gray-900">EMERGENCY SOS ALERT</h3>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sosNotice ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-rose-600 mx-auto" />
                <p className="font-black text-sm">{sosNotice}</p>
                <p className="text-xs text-rose-700">Central Control Room: 1800 266 2996 | Police: 112</p>
              </div>
            ) : (
              <form onSubmit={handleTriggerSos} className="space-y-4">
                <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-rose-900 text-xs font-semibold">
                  🚨 This sends an immediate high-priority alert with your GPS coordinates to the WH01 Control Room & Safety Desk.
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Emergency Type / Reason
                  </label>
                  <select
                    value={sosReason}
                    onChange={(e) => setSosReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-xs text-gray-900 bg-white"
                  >
                    <option value="ACCIDENT">Road Accident / Incident</option>
                    <option value="VEHICLE_BREAKDOWN">Vehicle Breakdown / Tire Flat</option>
                    <option value="SECURITY_HAZARD">Safety Concern / Threat</option>
                    <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                    <option value="OTHER">Other Emergency</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">Location Notes &amp; Details</label>
                  <textarea
                    rows="3"
                    value={sosNotes}
                    onChange={(e) => setSosNotes(e.target.value)}
                    placeholder="Describe situation or landmark (e.g. Near Western Express Highway flyover)..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  ></textarea>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSosModal(false)}
                    className="w-1/2 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sosSubmitting}
                    className="w-1/2 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
                  >
                    {sosSubmitting ? 'BROADCASTING...' : 'BROADCAST SOS'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
