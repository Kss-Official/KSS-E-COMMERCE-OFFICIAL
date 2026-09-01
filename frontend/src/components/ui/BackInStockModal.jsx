import React, { useState } from 'react';
import { X, BellRing, CheckCircle2, Mail, Phone } from 'lucide-react';
import { getCurrentUser } from '../../services/api';

export default function BackInStockModal({ product, onClose }) {
  const currentUser = getCurrentUser();
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email && !phone) return;
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200 border border-gray-100 p-6 space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {!isSubmitted ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
                <BellRing className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Back-in-Stock Alert</h3>
                <p className="text-xs text-gray-500 font-medium">Get notified immediately when available</p>
              </div>
            </div>

            {/* Product Summary */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 flex items-center space-x-3">
              <img
                src={product.image || product.primary_image}
                alt={product.name}
                className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-gray-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                <span className="text-xs font-black text-gray-800">₹{Number(product.price).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (SMS Alert)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-brand-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs mt-2"
              >
                Notify Me When In Stock 🔔
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center space-y-3 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900">Alert Request Saved!</h3>
            <p className="text-xs text-gray-600 font-medium px-4">
              We'll send an email &amp; SMS notification to <strong>{email || phone}</strong> as soon as stock arrives at our warehouse.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
