import React, { useState } from 'react';
import { Save, Store, Shield, Bell, Key, CheckCircle } from 'lucide-react';

export default function SettingsTab() {
  const [storeData, setStoreData] = useState({
    storeName: 'BuyZo',
    tagline: 'Shop More, Save More',
    email: 'support@buyzo.com',
    phone: '+91 98765 43210',
    currency: 'INR (₹)',
    autoApproveOrders: true,
    emailAlerts: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
        <p className="text-sm text-gray-500 font-medium">Configure store preferences, admin security, and integration defaults.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Store Profile</h3>
              <p className="text-xs text-gray-500">General branding and customer support info</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Store Name</label>
              <input
                type="text"
                value={storeData.storeName}
                onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tagline</label>
              <input
                type="text"
                value={storeData.tagline}
                onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Support Email</label>
              <input
                type="email"
                value={storeData.email}
                onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Support Phone</label>
              <input
                type="text"
                value={storeData.phone}
                onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Security & System */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Admin Security</h3>
              <p className="text-xs text-gray-500">Access controls and automated order triggers</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeData.autoApproveOrders}
                onChange={(e) => setStoreData({ ...storeData, autoApproveOrders: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Auto-approve orders under ₹5,000</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeData.emailAlerts}
                onChange={(e) => setStoreData({ ...storeData, emailAlerts: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Send email notification on low inventory alerts</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-7 py-3 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
