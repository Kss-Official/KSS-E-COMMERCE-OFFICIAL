import React from 'react';
import { Award, Crown, Zap, Gift, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BuyZoRewardsWidget({ userPoints = 450, onRedeemPoints }) {
  const pointsValue = Math.floor(userPoints);

  const getTier = (pts) => {
    if (pts >= 2000) return { name: 'Platinum VIP', color: 'from-slate-900 to-indigo-950 text-indigo-200 border-indigo-500/40', perk: 'Free Express Shipping + 2x Points' };
    if (pts >= 1000) return { name: 'Gold Club', color: 'from-amber-500 to-amber-700 text-amber-100 border-amber-400/40', perk: 'Exclusive Early Sale Access' };
    if (pts >= 300) return { name: 'Silver Member', color: 'from-slate-700 to-slate-900 text-slate-200 border-slate-400/40', perk: '5% Extra Coupon Discounts' };
    return { name: 'Bronze Shopper', color: 'from-emerald-800 to-emerald-950 text-emerald-100 border-emerald-500/40', perk: 'Earn 1 Pt per ₹10 Spent' };
  };

  const currentTier = getTier(pointsValue);

  return (
    <div className={`w-full bg-gradient-to-r ${currentTier.color} rounded-3xl p-5 sm:p-6 shadow-xl border relative overflow-hidden my-4`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
            <Crown className="w-6 h-6 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                {currentTier.name}
              </span>
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>BuyZo Rewards</span>
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-white mt-1">
              You Have <strong className="text-amber-300">{pointsValue}</strong> BuyZo Club Points! 💎
            </h4>
            <p className="text-xs text-white/80 font-medium mt-0.5">
              Perk: {currentTier.perk}
            </p>
          </div>
        </div>

        {onRedeemPoints && pointsValue > 0 && (
          <button
            onClick={() => onRedeemPoints(pointsValue)}
            className="w-full sm:w-auto py-2.5 px-5 bg-white text-slate-900 hover:bg-amber-100 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            Redeem {pointsValue} Points (Save ₹{pointsValue})
          </button>
        )}
      </div>
    </div>
  );
}
