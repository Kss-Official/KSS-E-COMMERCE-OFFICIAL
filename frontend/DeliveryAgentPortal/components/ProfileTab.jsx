import React, { useState } from 'react';
import { User, ShieldCheck, Truck, Star, Phone, Mail, MapPin, Save, CheckCircle } from 'lucide-react';

export default function ProfileTab() {
  const [profile, setProfile] = useState({
    name: 'Amit Kumar',
    phone: '+91 98765 43210',
    email: 'amit.kumar@buyzo.com',
    city: 'New Delhi',
    vehicleType: 'Electric Scooter (Hero Electric)',
    vehicleNumber: 'DL 01 AB 4829',
    drivingLicense: 'DL-042021008892',
    rating: '4.8 ★',
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
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Agent Profile & Vehicle Details</h2>
        <p className="text-sm text-gray-500 font-medium">Manage personal credentials, driving license, and assigned vehicle info.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Profile information saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          {/* Avatar & Header */}
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Amit Kumar"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
            <div>
              <h3 className="font-extrabold text-lg text-gray-900">{profile.name}</h3>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-600">
                <Star className="w-4 h-4 fill-amber-500 stroke-none" />
                <span>{profile.rating} Rating (850+ Deliveries Completed)</span>
              </div>
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
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
            <div>
              <label className="block text-gray-700 mb-1">Driving License No.</label>
              <input
                type="text"
                value={profile.drivingLicense}
                onChange={(e) => setProfile({ ...profile, drivingLicense: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-normal uppercase"
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
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
