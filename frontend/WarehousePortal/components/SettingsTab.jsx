import React, { useState, useEffect } from 'react';
import { Save, Warehouse, Shield, CheckCircle, Boxes, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import {
  fetchWarehouseSummaryApi,
  fetchWarehouseAlertsApi,
  fetchWarehouseInventoryApi,
  fetchStaffProfileApi,
  updateStaffProfileApi,
  createInboundReceiptApi
} from '../../src/services/api';

export default function SettingsTab() {
  const [config, setConfig] = useState({
    hubName: '',
    location: '',
    managerEmail: '',
    managerName: '',
    managerPhone: '',
    autoReorderLowStock: true,
  });

  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [binLocations, setBinLocations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  // Everything on this screen is real: hub stats from the warehouse summary,
  // the operator card from the signed-in staff account.
  const loadSettings = async () => {
    setIsLoading(true);
    const [summaryData, alertData, inventory, profile] = await Promise.all([
      fetchWarehouseSummaryApi(),
      fetchWarehouseAlertsApi(),
      fetchWarehouseInventoryApi(),
      fetchStaffProfileApi()
    ]);

    setSummary(summaryData);
    setLowStock(
      (Array.isArray(alertData?.alerts) ? alertData.alerts : []).filter(
        (a) => a.type === 'Low Stock' || a.type === 'Out of Stock'
      )
    );

    const rows = Array.isArray(inventory) ? inventory : [];
    setBinLocations(new Set(rows.map((r) => r.bin).filter(Boolean)).size);

    const p = profile?.profile || {};
    setConfig((prev) => ({
      ...prev,
      hubName: summaryData?.warehouse_code ? `Warehouse - ${summaryData.warehouse_code}` : prev.hubName,
      managerEmail: profile?.email || '',
      managerName: p.full_name || summaryData?.operator_name || '',
      managerPhone: profile?.phone || '',
      // The facility address is stored on the operator's profile record.
      location: p.bio || '',
    }));

    setIsLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const parts = (config.managerName || '').trim().split(/\s+/);
    const res = await updateStaffProfileApi({
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' '),
      phone: config.managerPhone || '',
      bio: config.location || ''
    });

    let message =
      res?.status === 'success'
        ? 'Warehouse configuration saved to the database.'
        : 'Could not save the configuration. Please try again.';

    // "Auto-generate PO" is a real action: raise pending inbound receipts for
    // every SKU currently sitting below its reorder point.
    if (res?.status === 'success' && config.autoReorderLowStock && lowStock.length > 0) {
      const created = await Promise.all(
        lowStock.slice(0, 10).map((alert) =>
          createInboundReceiptApi({
            supplier_name: 'BuyZo Central Procurement',
            item_title: alert.title,
            sku: alert.sku || '',
            quantity: Number(alert.suggested_reorder) || 50,
            status: 'Pending Verification'
          })
        )
      );
      const ok = created.filter((r) => r?.status === 'success').length;
      if (ok > 0) message += ` ${ok} reorder receipt(s) raised for low-stock SKUs.`;
    }

    setIsSaving(false);
    setSaved(message);
    setTimeout(() => setSaved(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Settings &amp; Configuration</h2>
          <p className="text-sm text-gray-500 font-medium">Manage hub details, bin location layout, and reorder automation rules.</p>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saved}</span>
        </div>
      )}

      {/* Live facility stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>SKUs on Floor</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">
            {Number(summary?.total_skus || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
            {Number(summary?.total_stock_units || 0).toLocaleString('en-IN')} units in stock
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Bin Locations</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{binLocations.toLocaleString('en-IN')}</p>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Mapped across the hub</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Below Reorder Point</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{lowStock.length}</p>
          <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
            {Number(summary?.out_of_stock_count || 0)} fully out of stock
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <Warehouse className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-base text-gray-900">Hub Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hub Name</label>
              <input
                type="text"
                value={config.hubName}
                readOnly
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600 outline-none"
              />
              <p className="text-[11px] text-gray-400 font-medium mt-1">Assigned by BuyZo central operations.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Manager Email</label>
              <input
                type="email"
                value={config.managerEmail}
                readOnly
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600 outline-none"
              />
              <p className="text-[11px] text-gray-400 font-medium mt-1">Your sign-in address. Contact admin to change it.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Manager Name</label>
              <input
                type="text"
                value={config.managerName}
                onChange={(e) => setConfig({ ...config, managerName: e.target.value })}
                placeholder="Full name of the hub manager"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Number</label>
              <input
                type="tel"
                value={config.managerPhone}
                onChange={(e) => setConfig({ ...config, managerPhone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warehouse Facility Address</label>
              <input
                type="text"
                value={config.location}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                placeholder="Industrial zone, street, city - pincode"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-blue-700" />
            <h3 className="font-bold text-base text-gray-900">Stock Automation &amp; Bin Controls</h3>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoReorderLowStock}
              onChange={(e) => setConfig({ ...config, autoReorderLowStock: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-gray-700">Auto-generate PO when SKU stock drops below reorder threshold</span>
          </label>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold text-blue-900 leading-relaxed">
              {lowStock.length > 0
                ? `Saving with this enabled raises pending inbound receipts for the ${Math.min(lowStock.length, 10)} most urgent low-stock SKU(s). They appear in the Inbound tab, ready to verify and stock.`
                : 'No SKU is below its reorder point right now, so no purchase orders will be raised on save.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
