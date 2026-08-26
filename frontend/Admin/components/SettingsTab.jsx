import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Store,
  Shield,
  Key,
  CheckCircle,
  RefreshCw,
  SlidersHorizontal,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  UserCog
} from 'lucide-react';
import {
  fetchStoreSettingsApi,
  updateStoreSettingsApi,
  updateStaffProfileApi
} from '../../src/services/api';

const EMPTY = {
  store_name: '',
  tagline: '',
  support_email: '',
  support_phone: '',
  currency: 'INR',
  auto_approve_orders: true,
  auto_approve_limit: '5000.00',
  email_low_stock_alerts: true,
  free_delivery_threshold: '499.00',
  low_stock_threshold: 10,
  cod_enabled: true,
  maintenance_mode: false
};

export default function SettingsTab() {
  const [storeData, setStoreData] = useState(EMPTY);
  const [stats, setStats] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [updatedBy, setUpdatedBy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  const applyPayload = useCallback((data) => {
    if (!data) return;
    setStoreData({
      store_name: data.store_name || '',
      tagline: data.tagline || '',
      support_email: data.support_email || '',
      support_phone: data.support_phone || '',
      currency: data.currency || 'INR',
      auto_approve_orders: data.auto_approve_orders !== false,
      auto_approve_limit: data.auto_approve_limit ?? '5000.00',
      email_low_stock_alerts: data.email_low_stock_alerts !== false,
      free_delivery_threshold: data.free_delivery_threshold ?? '499.00',
      low_stock_threshold: data.low_stock_threshold ?? 10,
      cod_enabled: data.cod_enabled !== false,
      maintenance_mode: Boolean(data.maintenance_mode)
    });
    setStats(data.stats || null);
    setUpdatedAt(data.updated_at || null);
    setUpdatedBy(data.updated_by_email || '');
    if (data.administrator) {
      setAdmin(data.administrator);
      setAdminForm({
        first_name: data.administrator.first_name || '',
        last_name: data.administrator.last_name || '',
        phone: data.administrator.phone || ''
      });
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      applyPayload(await fetchStoreSettingsApi());
    } catch (err) {
      console.warn('[SettingsTab] Error loading store settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applyPayload]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const flash = (text) => {
    setSaved(text);
    setTimeout(() => setSaved(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = await updateStoreSettingsApi({
        ...storeData,
        auto_approve_limit: Number(storeData.auto_approve_limit) || 0,
        free_delivery_threshold: Number(storeData.free_delivery_threshold) || 0,
        low_stock_threshold: Number(storeData.low_stock_threshold) || 0
      });
      applyPayload(data);
      flash('Store settings saved to database successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStaffProfileApi(adminForm);
      await loadSettings();
      flash('Administrator account updated successfully!');
    } catch (err) {
      alert('Failed to update administrator: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const statCards = [
    { key: 'total_products', label: 'Active Products', icon: Package, tone: 'bg-emerald-50 text-emerald-700' },
    { key: 'total_orders', label: 'Total Orders', icon: ShoppingBag, tone: 'bg-blue-50 text-blue-700' },
    { key: 'total_customers', label: 'Customers', icon: Users, tone: 'bg-purple-50 text-purple-700' },
    { key: 'low_stock_products', label: 'Low Stock Items', icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
          <p className="text-sm text-gray-500 font-medium">Configure store preferences, admin security, and integration defaults.</p>
        </div>
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xs text-center text-gray-400 font-medium flex items-center justify-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading store settings from database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h2>
          <p className="text-sm text-gray-500 font-medium">Configure store preferences, admin security, and integration defaults.</p>
        </div>
        <button
          onClick={loadSettings}
          className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer shrink-0"
          title="Reload settings from database"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saved}</span>
        </div>
      )}

      {/* Live store counters straight from MySQL */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${tone}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-lg font-black text-gray-900">{stats[key] ?? 0}</p>
              </div>
            </div>
          ))}
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
                value={storeData.store_name}
                onChange={(e) => setStoreData({ ...storeData, store_name: e.target.value })}
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
                value={storeData.support_email}
                onChange={(e) => setStoreData({ ...storeData, support_email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Support Phone</label>
              <input
                type="text"
                value={storeData.support_phone}
                onChange={(e) => setStoreData({ ...storeData, support_phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Currency</label>
              <select
                value={storeData.currency}
                onChange={(e) => setStoreData({ ...storeData, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Storefront Rules */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Storefront Rules</h3>
              <p className="text-xs text-gray-500">Thresholds applied across checkout and inventory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Free Delivery Above (₹)</label>
              <input
                type="number"
                min="0"
                value={storeData.free_delivery_threshold}
                onChange={(e) => setStoreData({ ...storeData, free_delivery_threshold: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Low Stock Threshold (units)</label>
              <input
                type="number"
                min="0"
                value={storeData.low_stock_threshold}
                onChange={(e) => setStoreData({ ...storeData, low_stock_threshold: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {stats && (
                <p className="text-[11px] text-gray-400 font-semibold mt-1">
                  {stats.low_stock_products} product{stats.low_stock_products === 1 ? '' : 's'} currently at or below this level.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeData.cod_enabled}
                onChange={(e) => setStoreData({ ...storeData, cod_enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Accept Cash on Delivery at checkout</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeData.maintenance_mode}
                onChange={(e) => setStoreData({ ...storeData, maintenance_mode: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Put the storefront in maintenance mode</span>
            </label>
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
                checked={storeData.auto_approve_orders}
                onChange={(e) => setStoreData({ ...storeData, auto_approve_orders: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">
                Auto-approve orders under ₹{Number(storeData.auto_approve_limit || 0).toLocaleString('en-IN')}
              </span>
            </label>

            <div className="pl-7">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Auto-approve limit (₹)</label>
              <input
                type="number"
                min="0"
                value={storeData.auto_approve_limit}
                onChange={(e) => setStoreData({ ...storeData, auto_approve_limit: e.target.value })}
                className="w-full md:w-56 px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={storeData.email_low_stock_alerts}
                onChange={(e) => setStoreData({ ...storeData, email_low_stock_alerts: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="text-sm font-semibold text-gray-700">Send email notification on low inventory alerts</span>
            </label>
          </div>

          {stats && (
            <div className="pt-3 border-t border-gray-100 flex items-center space-x-2 text-xs font-semibold text-gray-500">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              <span>
                {stats.staff_accounts} staff account{stats.staff_accounts === 1 ? '' : 's'} can reach the internal portals ·{' '}
                {stats.pending_orders} order{stats.pending_orders === 1 ? '' : 's'} awaiting approval
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 font-semibold">
            {updatedAt
              ? `Last saved ${new Date(updatedAt).toLocaleString('en-IN')}${updatedBy ? ` by ${updatedBy}` : ''}`
              : 'Not saved yet.'}
          </p>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] disabled:opacity-60 text-white px-7 py-3 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Administrator Account — the signed-in operator's own record */}
      {admin && (
        <form onSubmit={handleAdminSave} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Administrator Account</h3>
              <p className="text-xs text-gray-500">
                Signed in as {admin.email} · {admin.is_superuser ? 'Superuser' : admin.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label>
              <input
                type="text"
                value={adminForm.first_name}
                onChange={(e) => setAdminForm({ ...adminForm, first_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
              <input
                type="text"
                value={adminForm.last_name}
                onChange={(e) => setAdminForm({ ...adminForm, last_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={adminForm.phone}
                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 font-semibold">
              Account created {new Date(admin.date_joined).toLocaleDateString('en-IN')}
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 bg-[#093529] hover:bg-[#0c4737] disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Account</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
