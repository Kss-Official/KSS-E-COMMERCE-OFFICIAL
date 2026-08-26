import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  Save,
  CheckCircle,
  RefreshCw,
  Package,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { fetchDeliveryProfileApi, updateDeliveryProfileApi } from '../../src/services/api';

// The Profile model has one free-text field (`bio`), so the rider's vehicle
// paperwork is stored there as JSON and parsed back on load.
function parseVehicle(bio) {
  if (!bio) return {};
  try {
    const parsed = JSON.parse(bio);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export default function ProfileTab() {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    vehicleType: '',
    vehicleNumber: '',
    drivingLicense: ''
  });
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    setIsLoading(true);
    const data = await fetchDeliveryProfileApi();
    if (data) {
      const vehicle = parseVehicle(data.bio);
      setMeta(data);
      setProfile({
        name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
        city: vehicle.city || '',
        vehicleType: vehicle.vehicleType || data.vehicle || '',
        vehicleNumber: vehicle.vehicleNumber || '',
        drivingLicense: vehicle.drivingLicense || ''
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await updateDeliveryProfileApi({
      full_name: profile.name,
      phone: profile.phone,
      bio: JSON.stringify({
        city: profile.city,
        vehicleType: profile.vehicleType,
        vehicleNumber: profile.vehicleNumber,
        drivingLicense: profile.drivingLicense
      })
    });
    setBusy(false);

    if (res?.status === 'success') {
      setMeta(res.data || meta);
      setSaved('Profile information saved to the database.');
      setTimeout(() => setSaved(null), 4000);
    } else {
      setError(res?.message || 'Could not save your profile. Please try again.');
    }
  };

  const stats = meta?.stats || {};
  const initials = (profile.name || meta?.email || 'A')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Agent Profile &amp; Vehicle Details</h2>
          <p className="text-sm text-gray-500 font-medium">Manage personal credentials, driving license, and assigned vehicle info.</p>
        </div>
        <button
          type="button"
          onClick={loadProfile}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saved}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* Live performance stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Package className="w-4 h-4 text-emerald-700" />
            <span>Delivered</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.delivered || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>In Transit</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{stats.in_transit || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Success Rate</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.success_rate || 0}%</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <IndianRupee className="w-4 h-4 text-[#ff5100]" />
            <span>Lifetime Earnings</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">
            ₹{Number(stats.lifetime_earnings || 0).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          {/* Avatar & Header */}
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
            {meta?.avatar ? (
              <img
                src={meta.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1b4d3e] to-emerald-500 text-white flex items-center justify-center text-lg font-black border-2 border-emerald-500 shadow-sm shrink-0">
                {initials || 'AG'}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-lg text-gray-900">{profile.name || meta?.email || 'Delivery Agent'}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-gray-500 mt-0.5">
                <span className="font-mono text-[#1b4d3e]">{meta?.agent_code}</span>
                <span>{stats.delivered || 0} deliveries completed</span>
                {meta?.is_verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-gray-400 mt-1">
                {meta?.assigned_hub} &middot; joined {meta?.joined_on}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold uppercase">
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Login Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-600 outline-none font-normal"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Operating City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Vehicle Type</label>
              <input
                type="text"
                value={profile.vehicleType}
                onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Vehicle Reg Number</label>
              <input
                type="text"
                value={profile.vehicleNumber}
                onChange={(e) => setProfile({ ...profile, vehicleNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal uppercase"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-1">Driving License No.</label>
              <input
                type="text"
                value={profile.drivingLicense}
                onChange={(e) => setProfile({ ...profile, drivingLicense: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal uppercase"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              disabled={busy}
              className="flex items-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{busy ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
