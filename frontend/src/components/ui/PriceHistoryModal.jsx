import React from 'react';
import { X, TrendingDown, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';

export default function PriceHistoryModal({ product, onClose }) {
  if (!product) return null;

  const currentPrice = Number(product.price) || 0;
  const origPrice = Number(product.originalPrice) || Math.round(currentPrice * 1.35);
  const lowest30Days = Math.round(currentPrice * 0.95);
  const highest30Days = origPrice;
  const priceDropAmount = origPrice - currentPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 duration-200 border border-gray-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">30-Day Price History</h3>
              <p className="text-[11px] text-gray-500 font-medium line-clamp-1">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Current Deal Highlight */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Current Best Price
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-950">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {origPrice > currentPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{origPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
          {priceDropAmount > 0 && (
            <div className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-2xs text-center">
              <span>Save ₹{priceDropAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* 30-Day Price Range Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-gray-700">
            <span>30-Day Lowest: ₹{lowest30Days.toLocaleString('en-IN')}</span>
            <span>30-Day Highest: ₹{highest30Days.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(15, ((currentPrice - lowest30Days) / (highest30Days - lowest30Days)) * 100))}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 text-center font-medium">
            This item is currently priced near its <strong className="text-emerald-700">30-day lowest price point</strong>.
          </p>
        </div>

        {/* Timeline Visual Mock */}
        <div className="border border-gray-100 rounded-2xl p-3.5 bg-gray-50/60 space-y-2">
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-800" />
            <span>Price Trend Timeline</span>
          </h4>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="font-medium text-gray-500">Today</span>
              <span className="font-bold text-emerald-700">₹{currentPrice.toLocaleString('en-IN')} (Lowest)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="font-medium text-gray-500">15 Days Ago</span>
              <span className="font-semibold text-gray-700">₹{Math.round(currentPrice * 1.15).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-500">30 Days Ago</span>
              <span className="font-semibold text-gray-700">₹{origPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Best Price Guarantee */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 p-3 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>BuyZo Best Price Guarantee — 100% price protection matching.</span>
        </div>
      </div>
    </div>
  );
}
