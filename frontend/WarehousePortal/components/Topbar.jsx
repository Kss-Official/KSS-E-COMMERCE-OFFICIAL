import React from 'react';
import { Warehouse, Bell, Calendar, Store, ChevronDown } from 'lucide-react';

export default function Topbar({ title, onExitPortal }) {
  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-900">
          <Warehouse className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 capitalize">
          Warehouse Portal
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Date Selector */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-blue-800" />
          <span>22 May 2025</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* Return to Store */}
        {onExitPortal && (
          <button
            onClick={onExitPortal}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store View</span>
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
            4
          </span>
        </button>

        {/* Warehouse Manager Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80"
            alt="Rohit Verma"
            className="w-9 h-9 rounded-full object-cover border border-blue-500 shadow-xs"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-tight">Rohit Verma</span>
            <span className="text-[10px] text-gray-500 font-medium leading-tight">Warehouse Manager</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
