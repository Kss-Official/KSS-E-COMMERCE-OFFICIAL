import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  Settings,
  Bell,
  Database,
  Users,
  Shield,
  ClipboardList,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { logoutUser } from '../../services/api';

export default function ProfileDropdown({
  user,
  setActiveTab,
  onLogout,
  portalType = 'admin'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const name = user?.name || user?.full_name || 'Arnav Kapoor';
  const designation = user?.designation || (
    portalType === 'warehouse'
      ? 'Warehouse Operations Lead'
      : portalType === 'delivery'
        ? 'Logistics & Delivery Manager'
        : 'System Administrator'
  );

  const initial = (name.charAt(0) || 'A').toUpperCase();

  const handleAction = (tabName) => {
    setIsOpen(false);
    if (setActiveTab && tabName) {
      setActiveTab(tabName);
    }
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    logoutUser();
    if (onLogout) {
      onLogout();
    } else {
      window.location.hash = '#home';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-left focus:outline-none cursor-pointer group py-1 px-2 rounded-xl hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-xs"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#063328] text-white flex items-center justify-center text-sm font-black ring-2 ring-emerald-500/20 shadow-xs shrink-0">
            {initial}
          </div>
        )}

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-extrabold text-gray-900 leading-tight group-hover:text-emerald-800 transition-colors">
            {name}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold leading-tight mt-0.5">
            {designation}
          </span>
        </div>

        <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-3.5">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#063328] text-white flex items-center justify-center text-lg font-black ring-2 ring-emerald-500/30 shadow-sm shrink-0">
                {initial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate leading-snug">{name}</h4>
              <p className="text-xs text-emerald-700 font-semibold truncate leading-snug">{designation}</p>
              <button
                onClick={() => handleAction(portalType === 'delivery' ? 'profile' : 'settings')}
                className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 mt-1 cursor-pointer"
              >
                <span>View Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 text-sm text-gray-700">
            {/* Personal Account Section */}
            <button
              onClick={() => handleAction(portalType === 'delivery' ? 'profile' : 'settings')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <User className="w-4 h-4 text-gray-500 shrink-0" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => handleAction(portalType === 'delivery' ? 'profile' : 'settings')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <Settings className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => handleAction(portalType === 'warehouse' ? 'alerts' : portalType === 'delivery' ? 'notifications' : 'dashboard')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <Bell className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Notifications</span>
            </button>

            <div className="my-1.5 border-t border-gray-100"></div>

            {/* ADMINISTRATION Section */}
            <div className="px-4 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
              Administration
            </div>

            <button
              onClick={() => handleAction(portalType === 'delivery' ? 'my-deliveries' : 'inventory')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <Database className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Database Management</span>
            </button>

            <button
              onClick={() => handleAction(portalType === 'admin' ? 'users' : portalType === 'delivery' ? 'profile' : 'settings')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <Users className="w-4 h-4 text-gray-500 shrink-0" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => handleAction(portalType === 'delivery' ? 'profile' : 'settings')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <Shield className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Roles &amp; Permissions</span>
            </button>

            <button
              onClick={() => handleAction(portalType === 'delivery' ? 'history' : 'reports')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Activity Logs</span>
            </button>

            <div className="my-1.5 border-t border-gray-100"></div>

            {/* Help & Support */}
            <button
              onClick={() => handleAction(portalType === 'delivery' ? 'support' : 'reports')}
              className="w-full px-4 py-2.5 flex items-center space-x-3 hover:bg-emerald-50/60 hover:text-emerald-900 transition-colors text-left font-semibold cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Help &amp; Support</span>
            </button>

            <div className="my-1.5 border-t border-gray-100"></div>

            {/* Logout Button */}
            <button
              onClick={handleLogoutClick}
              className="w-full px-4 py-2.5 flex items-center space-x-3 text-red-600 hover:bg-red-50 transition-colors text-left font-bold cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
