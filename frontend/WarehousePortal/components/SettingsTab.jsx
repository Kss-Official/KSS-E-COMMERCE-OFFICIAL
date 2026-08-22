import React, { useState } from 'react';
import { Save, Warehouse, Shield, CheckCircle } from 'lucide-react';

export default function SettingsTab() {
  const [config, setConfig] = useState({
    hubName: 'Warehouse - WH01',
    location: 'Main Industrial Zone, Okhla Phase 3, New Delhi - 110020',
    managerEmail: 'rohit.verma@buyzo.com',
    binCapacityLimit: 350,
    autoReorderLowStock: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Settings & Configuration</h2>
        <p className="text-sm text-gray-500 font-medium">Manage hub details, bin location layout, and reorder automation rules.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Warehouse configuration updated!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-gray-900">Hub Identity</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hub Name</label>
              <input
                type="text"
                value={config.hubName}
                onChange={(e) => setConfig({ ...config, hubName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Manager Email</label>
              <input
                type="email"
                value={config.managerEmail}
                onChange={(e) => setConfig({ ...config, managerEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warehouse Facility Address</label>
              <input
                type="text"
                value={config.location}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-gray-900">Stock Automation & Bin Controls</h3>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoReorderLowStock}
              onChange={(e) => setConfig({ ...config, autoReorderLowStock: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">Auto-generate PO when SKU stock drops below reorder threshold</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
