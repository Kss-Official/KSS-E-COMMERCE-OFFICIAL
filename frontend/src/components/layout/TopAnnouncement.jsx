import React from 'react';
import { useNavigationContext } from '../../context/NavigationContext';

export default function TopAnnouncement() {
  const { navigateTo } = useNavigationContext();

  return (
    <div className="bg-[#062920] text-white text-xs py-2 px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2 overflow-hidden">
      {/* Left & Middle-Left Section: Delivery Msg + Portal Buttons */}
      <div className="flex items-center justify-center flex-wrap gap-x-3 sm:space-x-4 gap-y-1 text-center">
        <span className="font-medium text-white/90">🚚 Free Delivery on orders above ₹499</span>
        <span className="text-white/30 hidden md:inline">|</span>

        <div className="flex items-center space-x-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
          <button
            onClick={() => navigateTo('admin')}
            className="text-[#ff5100] font-extrabold hover:underline px-1.5 py-0.5 rounded cursor-pointer"
          >
            <span>⚙️ Admin</span>
          </button>
          <span className="text-white/40">|</span>
          <button
            onClick={() => navigateTo('delivery-agent')}
            className="text-emerald-300 font-extrabold hover:underline px-1.5 py-0.5 rounded cursor-pointer"
          >
            <span>🛵 Delivery</span>
          </button>
          <span className="text-white/40">|</span>
          <button
            onClick={() => navigateTo('warehouse')}
            className="text-cyan-300 font-extrabold hover:underline px-1.5 py-0.5 rounded cursor-pointer"
          >
            <span>🏢 Warehouse</span>
          </button>
        </div>
      </div>

      {/* Far Right Section: Original Links Restored */}
      <div className="flex items-center justify-center flex-wrap gap-x-3 text-white/90">
        <a href="#download" className="text-[#f4c430] hover:underline">Download App</a>
        <span className="text-white/30">|</span>
        <a href="#track" className="text-[#f4c430] hover:underline">Track Order</a>
        <span className="text-white/30">|</span>
        <a href="#help" className="text-[#f4c430] hover:underline">Help Center</a>
      </div>
    </div>
  );
}
