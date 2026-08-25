import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, Store } from 'lucide-react';
import { getCurrentUser } from '../../src/services/api';

export default function Topbar({ title, onExitAdmin }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const adminName = currentUser
    ? (currentUser.first_name
        ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
        : (currentUser.name || currentUser.username || (currentUser.email && !currentUser.email.startsWith('admin') ? currentUser.email.split('@')[0] : 'Amit Sharma')))
    : 'Amit Sharma';

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

  const avatarLetter = (adminName.charAt(0) || 'A').toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      {/* Title / Search */}
      <div className="flex items-center space-x-6 flex-1 max-w-2xl">
        <h1 className="text-xl font-bold text-gray-900 capitalize hidden md:block shrink-0">
          {title || 'Dashboard'}
        </h1>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-600 transition-colors"
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
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#1b4d3e] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store View</span>
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff5100] rounded-full border-2 border-white"></span>
        </button>

        {/* Admin Profile Badge */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#063328] to-[#1b4d3e] flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-emerald-100">
            {avatarLetter}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-extrabold text-gray-900 leading-tight">{adminName}</span>
            <span className="text-[11px] text-emerald-700 font-bold leading-tight mt-0.5">{adminDesignation}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
