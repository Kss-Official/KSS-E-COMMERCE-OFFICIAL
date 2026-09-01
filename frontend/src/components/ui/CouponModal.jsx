import React, { useState, useEffect } from 'react';
import { Tag, X, Check, Copy, Sparkles, Clock } from 'lucide-react';
import { fetchAvailableCoupons } from '../../services/api';

export default function CouponModal({ isOpen, onClose, onApplyCoupon, cartTotal = 0 }) {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    (async () => {
      try {
        const data = await fetchAvailableCoupons();
        if (Array.isArray(data) && data.length > 0) {
          setCoupons(data);
        } else {
          // Fallback mock active coupons
          setCoupons([
            { id: 1, code: 'BUYZO100', title: 'FLAT ₹100 OFF', min_order_amount: 999, discount_value: 100, is_percentage: false, description: 'Valid on orders above ₹999' },
            { id: 2, code: 'WELCOME15', title: '15% Instant Discount', min_order_amount: 499, discount_value: 15, is_percentage: true, description: 'Special welcome offer for new customers' },
            { id: 3, code: 'FREESHIP', title: 'FREE Shipping', min_order_amount: 299, discount_value: 49, is_percentage: false, description: 'Waives standard ₹49 delivery charge' },
            { id: 4, code: 'MEGA250', title: 'FLAT ₹250 OFF', min_order_amount: 1999, discount_value: 250, is_percentage: false, description: 'Exclusive mega discount on orders above ₹1,999' }
          ]);
        }
      } catch (err) {
        console.error('Failed to load coupons', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (code) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
    } catch {
      setCopiedCode(code);
    }
  };

  const handleApply = (coupon) => {
    if (onApplyCoupon) {
      onApplyCoupon(coupon);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-brand-700 font-extrabold text-sm mb-1">
          <Tag className="w-5 h-5 text-accent" />
          <span>Available Offers & Coupons</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-4">
          Save Big on Your Order 🏷️
        </h2>

        {isLoading ? (
          <div className="py-8 text-center text-xs font-bold text-gray-500">Loading live coupons...</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-1">
            {coupons.map((coupon) => {
              const isEligible = cartTotal >= (coupon.min_order_amount || 0);
              return (
                <div
                  key={coupon.id || coupon.code}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEligible
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-500'
                      : 'bg-gray-50/60 border-gray-200 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-700 text-white font-black text-[11px] px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                          {coupon.code}
                        </span>
                        {isEligible && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                            Eligible
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-extrabold text-gray-900 mt-1.5">{coupon.title || coupon.code}</h4>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">{coupon.description}</p>
                    </div>

                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shrink-0 ml-2"
                      title="Copy code"
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span className="text-[10px] text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200/60">
                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Min. Order: ₹{Number(coupon.min_order_amount || 0).toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => handleApply(coupon)}
                      disabled={!isEligible}
                      className="px-3 py-1 bg-brand-800 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      {isEligible ? 'Apply Coupon' : `Add ₹${(coupon.min_order_amount - cartTotal).toLocaleString('en-IN')} More`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
