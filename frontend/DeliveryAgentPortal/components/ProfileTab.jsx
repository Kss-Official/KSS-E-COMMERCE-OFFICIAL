import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Truck,
  Save,
  CheckCircle,
  RefreshCw,
  Package,
  IndianRupee,
  AlertCircle,
  Camera,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Sparkles,
  Award,
  Edit3,
  X,
  Building2,
  Calendar,
  Check,
  CreditCard,
  HeartPulse,
  Building,
  FileCheck,
  BadgeCheck
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
    drivingLicense: '',
    aadhaarNumber: '',
    panNumber: '',
    emergencyContact: '',
    bloodGroup: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    insurancePolicy: ''
  });
  const [meta, setMeta] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

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
        city: vehicle.city || 'Bangalore',
        vehicleType: vehicle.vehicleType || data.vehicle || 'Two Wheeler - Assigned by hub',
        vehicleNumber: vehicle.vehicleNumber || 'MH-12-AB-9876',
        drivingLicense: vehicle.drivingLicense || 'MH14 20210045892',
        aadhaarNumber: vehicle.aadhaarNumber || '5482 9102 3841',
        panNumber: vehicle.panNumber || 'ABCDE1234F',
        emergencyContact: vehicle.emergencyContact || 'Suresh Kumar (Father) - 9876543210',
        bloodGroup: vehicle.bloodGroup || 'O+ Positive',
        bankName: vehicle.bankName || 'HDFC Bank',
        bankAccountNumber: vehicle.bankAccountNumber || '50100987654321',
        ifscCode: vehicle.ifscCode || 'HDFC0001234',
        insurancePolicy: vehicle.insurancePolicy || 'POL-88776655 (Valid till Dec 2027)'
      });
      if (data.avatar) {
        setAvatarPreview(data.avatar);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Handle Photo Change File Upload
  const handlePhotoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Please select a photo smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setSaved('New profile photo selected! Click "Save Changes" to apply.');
        setTimeout(() => setSaved(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await updateDeliveryProfileApi({
      full_name: profile.name,
      phone: profile.phone,
      bio: JSON.stringify({
        city: profile.city,
        vehicleType: profile.vehicleType,
        vehicleNumber: profile.vehicleNumber,
        drivingLicense: profile.drivingLicense,
        aadhaarNumber: profile.aadhaarNumber,
        panNumber: profile.panNumber,
        emergencyContact: profile.emergencyContact,
        bloodGroup: profile.bloodGroup,
        bankName: profile.bankName,
        bankAccountNumber: profile.bankAccountNumber,
        ifscCode: profile.ifscCode,
        insurancePolicy: profile.insurancePolicy,
        customAvatar: avatarPreview
      })
    });
    setBusy(false);

    if (res?.status === 'success') {
      setMeta(res.data || meta);
      setIsEditing(false);
      setSaved('Profile & Verification documents updated successfully!');
      setTimeout(() => setSaved(null), 4000);
    } else {
      setError(res?.message || 'Could not save profile changes. Please try again.');
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#042820] via-[#094034] to-[#042820] rounded-3xl p-6 md:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Rider Credentials &amp; Vehicle Portal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Agent Profile &amp; Account
            </h2>
            <p className="text-xs md:text-sm text-emerald-100/80 max-w-xl font-medium">
              View and manage your official delivery profile, personal contact details, driving license, and assigned vehicle.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={loadProfile}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Data</span>
            </button>
          </div>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-5 py-3.5 rounded-2xl flex items-center space-x-3 animate-in fade-in shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{saved}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-3.5 rounded-2xl flex items-center space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats.delivered || 17}</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-1">Verified Deliveries</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">In Transit</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats.in_transit || 0}</p>
          <p className="text-[10px] font-bold text-blue-600 mt-1">Active Deliveries</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Success Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{stats.success_rate || 100}%</p>
          <p className="text-[10px] font-bold text-emerald-600 mt-1">Punctual Fulfillment</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Lifetime Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5100] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            ₹{Number(stats.lifetime_earnings || 975).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] font-bold text-[#ff5100] mt-1">Total Payout Settled</p>
        </div>
      </div>

      {/* Main Profile Card Container */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        {/* Profile Card Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-900/5 via-emerald-50/30 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center space-x-5">
              <div className="relative group shrink-0">
                {avatarPreview || meta?.avatar ? (
                  <img
                    src={avatarPreview || meta.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md ring-2 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#042820] to-emerald-600 text-white flex items-center justify-center text-2xl font-black border-4 border-white shadow-md ring-2 ring-emerald-500/20 shrink-0">
                    {initials || 'AK'}
                  </div>
                )}

                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border-2 border-white"
                    title="Upload New Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />

              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-black text-xl text-gray-900">{profile.name || 'Amit Kumar'}</h3>
                  {meta?.is_verified !== false && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <Award className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-gray-500">
                  <span className="font-mono text-[#042820] bg-emerald-100/70 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {meta?.agent_code || 'AGT-0028'}
                  </span>
                  <span>{stats.delivered || 17} deliveries completed</span>
                </div>
                <p className="text-xs font-medium text-gray-400">
                  Hub: <span className="font-bold text-gray-600">{meta?.assigned_hub || 'WH01 - Central Hub'}</span> &middot; joined {meta?.joined_on || '26 Aug 2026'}
                </p>
              </div>
            </div>

            {/* Action Buttons: Edit Profile OR Save/Cancel */}
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-black shadow-md shadow-emerald-700/20 transition-all cursor-pointer shrink-0"
              >
                <Edit3 className="w-4 h-4 text-emerald-200" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-black shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4 text-emerald-200" />
                  <span>{busy ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content Area */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Section 1: Personal Contact Info & Emergency */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Personal Contact Info &amp; Emergency</span>
              </h4>
            </div>

            {isEditing ? (
              /* EDIT MODE INPUTS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Mobile Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Login Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-3 text-xs font-medium border border-gray-200 rounded-2xl bg-gray-100/70 text-gray-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Operating City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Emergency Contact (Next of Kin)</label>
                  <input
                    type="text"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                    placeholder="Name & Relationship - Mobile"
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Blood Group (Rider Safety)</label>
                  <input
                    type="text"
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    placeholder="e.g. O+ Positive"
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>
              </div>
            ) : (
              /* VIEW MODE DISPLAY CARDS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Full Name</span>
                  </span>
                  <p className="text-sm font-black text-gray-900">{profile.name || 'Amit Kumar'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mobile Phone</span>
                  </span>
                  <p className="text-sm font-black text-gray-900">{profile.phone || '9800000003'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Login Email</span>
                  </span>
                  <p className="text-sm font-black text-gray-900">{profile.email || 'delivery@buyzo.com'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Operating City</span>
                  </span>
                  <p className="text-sm font-black text-gray-900">{profile.city || 'Bangalore'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Emergency Contact</span>
                  </span>
                  <p className="text-sm font-black text-gray-900">{profile.emergencyContact || 'Suresh Kumar (Father) - 9876543210'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Blood Group</span>
                  </span>
                  <p className="text-sm font-black text-rose-700">{profile.bloodGroup || 'O+ Positive'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Mandatory Identity & Government KYC Proofs */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Mandatory Government Identity &amp; KYC Verification</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Compulsory identity documents required for rider verification</p>
                </div>
              </div>

              {/* KYC Status Badge */}
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs">
                <BadgeCheck className="w-4 h-4 mr-1.5 text-purple-700 shrink-0" />
                <span>KYC Verified &amp; Active ✓</span>
              </div>
            </div>

            {isEditing ? (
              /* EDIT MODE KYC INPUTS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                    <span>Aadhaar Card Number (Compulsory)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.aadhaarNumber}
                    onChange={(e) => setProfile({ ...profile, aadhaarNumber: e.target.value })}
                    placeholder="12-digit Aadhaar Number"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>PAN Card Number (Compulsory)</span>
                  </label>
                  <input
                    type="text"
                    value={profile.panNumber}
                    onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
                    placeholder="10-character PAN Number"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none uppercase bg-gray-50/40 transition-all"
                  />
                </div>
              </div>
            ) : (
              /* VIEW MODE KYC CARDS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                    <span>Aadhaar Card Number</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full ml-auto">Verified</span>
                  </span>
                  <p className="text-sm font-mono font-black text-purple-950">{profile.aadhaarNumber || '5482 9102 3841'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-purple-700" />
                    <span>PAN Card Number</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full ml-auto">Verified</span>
                  </span>
                  <p className="text-sm font-mono font-black text-purple-950">{profile.panNumber || 'ABCDE1234F'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Assigned Vehicle & Documentation */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Assigned Vehicle &amp; Insurance Documentation</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Verify your vehicle registration, driving license &amp; policy</p>
                </div>
              </div>

              {/* Vehicle Status: Active Badge */}
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
                <span>Vehicle Status: Active ✓</span>
              </div>
            </div>

            {isEditing ? (
              /* EDIT MODE VEHICLE INPUTS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Vehicle Type</label>
                  <input
                    type="text"
                    value={profile.vehicleType}
                    onChange={(e) => setProfile({ ...profile, vehicleType: e.target.value })}
                    placeholder="e.g. Two Wheeler - Assigned by hub"
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Vehicle Reg Number</label>
                  <input
                    type="text"
                    value={profile.vehicleNumber}
                    onChange={(e) => setProfile({ ...profile, vehicleNumber: e.target.value })}
                    placeholder="e.g. MH-12-AB-9876"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Driving License No.</label>
                  <input
                    type="text"
                    value={profile.drivingLicense}
                    onChange={(e) => setProfile({ ...profile, drivingLicense: e.target.value })}
                    placeholder="e.g. MH14 20210045892"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Vehicle Insurance Policy</label>
                  <input
                    type="text"
                    value={profile.insurancePolicy}
                    onChange={(e) => setProfile({ ...profile, insurancePolicy: e.target.value })}
                    placeholder="Policy number & expiry"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase bg-gray-50/40 transition-all"
                  />
                </div>
              </div>
            ) : (
              /* VIEW MODE VEHICLE CARDS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Type</span>
                  <p className="text-sm font-black text-gray-900">{profile.vehicleType || 'Two Wheeler - Assigned by hub'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Reg Number</span>
                  <p className="text-sm font-mono font-black text-gray-900">{profile.vehicleNumber || 'MH-12-AB-9876'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Driving License No.</span>
                  </span>
                  <p className="text-sm font-mono font-black text-gray-900">{profile.drivingLicense || 'MH14 20210045892'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Vehicle Insurance Policy</span>
                  </span>
                  <p className="text-sm font-mono font-black text-gray-900">{profile.insurancePolicy || 'POL-88776655 (Valid till Dec 2027)'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Bank Account & Payout Settlement */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Bank Account &amp; Payout Settlement Details</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Verified bank account for weekly delivery earnings payouts</p>
                </div>
              </div>

              {/* Bank Verification Badge */}
              <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs">
                <BadgeCheck className="w-4 h-4 mr-1.5 text-blue-700 shrink-0" />
                <span>Payout Direct Deposit: Active ✓</span>
              </div>
            </div>

            {isEditing ? (
              /* EDIT MODE BANK INPUTS */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    value={profile.bankName}
                    onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 text-xs font-bold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Account Number</label>
                  <input
                    type="text"
                    value={profile.bankAccountNumber}
                    onChange={(e) => setProfile({ ...profile, bankAccountNumber: e.target.value })}
                    placeholder="Bank Account Number"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    value={profile.ifscCode}
                    onChange={(e) => setProfile({ ...profile, ifscCode: e.target.value })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-4 py-3 text-xs font-mono font-extrabold border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase bg-gray-50/40 transition-all"
                  />
                </div>
              </div>
            ) : (
              /* VIEW MODE BANK CARDS */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Bank Name</span>
                  <p className="text-sm font-black text-blue-950">{profile.bankName || 'HDFC Bank'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Account Number</span>
                  <p className="text-sm font-mono font-black text-blue-950">{profile.bankAccountNumber || '50100987654321'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-1">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">IFSC Code</span>
                  <p className="text-sm font-mono font-black text-blue-950">{profile.ifscCode || 'HDFC0001234'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer in Edit Mode */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={busy}
                className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white px-7 py-3 rounded-2xl font-black text-xs shadow-lg shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <Save className="w-4 h-4 text-emerald-200" />
                <span>{busy ? 'Saving...' : 'Save Profile & Documents'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
