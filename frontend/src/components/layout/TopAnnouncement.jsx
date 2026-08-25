import React from 'react';
import { Settings2, Bike, Warehouse, Truck } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

export default function TopAnnouncement() {
  const { navigateTo } = useNavigationContext();

  const portals = [
    { label: 'Admin', page: 'admin', icon: Settings2, cls: 'text-accent' },
    { label: 'Delivery', page: 'delivery-agent', icon: Bike, cls: 'text-brand-500' },
    { label: 'Warehouse', page: 'warehouse', icon: Warehouse, cls: 'text-gold' },
  ];

  return (
    <div className="bg-brand-800 text-white text-xs py-2 px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2 overflow-hidden">
      <div className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-center">
        <span className="inline-flex items-center gap-1.5 font-semibold text-white/90">
          <Truck className="w-3.5 h-3.5 text-gold" />
          Free Delivery on orders above ₹499
        </span>
        <span className="text-white/30 hidden md:inline">|</span>
        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
          {portals.map((p, i) => {
            const Icon = p.icon;
            return (
              <span key={p.page} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/40">|</span>}
                <button
                  onClick={() => navigateTo(p.page)}
                  className={`font-extrabold hover:underline px-1.5 py-0.5 rounded cursor-pointer inline-flex items-center gap-1 ${p.cls}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-x-3 text-white/90">
        <button onClick={() => navigateTo('shop')} className="text-gold hover:underline cursor-pointer">Download App</button>
        <span className="text-white/30">|</span>
        <button onClick={() => navigateTo('orders')} className="text-gold hover:underline cursor-pointer">Track Order</button>
        <span className="text-white/30">|</span>
        <button onClick={() => navigateTo('contact')} className="text-gold hover:underline cursor-pointer">Help Center</button>
      </div>
    </div>
  );
}
