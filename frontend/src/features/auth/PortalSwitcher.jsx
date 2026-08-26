import React from 'react';
import { ShoppingBag, Shield, Truck, Warehouse } from 'lucide-react';
import { PORTALS } from '../../utils/roles';

const PORTAL_ICONS = {
  customer: ShoppingBag,
  admin: Shield,
  delivery: Truck,
  warehouse: Warehouse
};

/**
 * The four-way portal selector that sits above the auth form. Each tab carries
 * its dashboard's own accent identity (see `theme` in `utils/roles.js`).
 */
export default function PortalSwitcher({ activeKey, onChange, disabled = false }) {
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
      {PORTALS.map((portal) => {
        const Icon = PORTAL_ICONS[portal.key] || ShoppingBag;
        const isActive = portal.key === activeKey;
        return (
          <button
            key={portal.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(portal.key)}
            aria-pressed={isActive}
            title={portal.tagline}
            className={`flex min-w-0 items-center justify-center gap-1 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? `${portal.theme.tabActive} border-transparent`
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{portal.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { PORTAL_ICONS };
