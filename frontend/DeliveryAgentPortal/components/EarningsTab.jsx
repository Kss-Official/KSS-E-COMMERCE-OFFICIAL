import React, { useState } from 'react';
import { Wallet, TrendingUp, DollarSign, CheckCircle, ArrowDownRight } from 'lucide-react';

export default function EarningsTab() {
  const [withdrawn, setWithdrawn] = useState(false);

  const handleWithdraw = () => {
    setWithdrawn(true);
    setTimeout(() => setWithdrawn(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Earnings & Incentives</h2>
          <p className="text-sm text-gray-500 font-medium">Track daily payouts, peak-hour incentives, and bank settlements.</p>
        </div>
        <button
          onClick={handleWithdraw}
          className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Wallet className="w-4 h-4" />
          <span>Request Payout (₹4,680)</span>
        </button>
      </div>

      {withdrawn && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Payout request of ₹4,680 submitted to HDFC Bank (A/C ending *4829)!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Weekly Base Earnings</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹3,800</h3>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-2xl border border-purple-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bonus & Incentives</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹880</h3>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Available Payout</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">₹4,680</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900">Recent Payout Settlements</h3>

        <div className="space-y-3 text-sm">
          {[
            { date: 'May 22, 2025', amount: '₹850', status: 'Pending Transfer' },
            { date: 'May 21, 2025', amount: '₹1,200', status: 'Settled to Bank' },
            { date: 'May 20, 2025', amount: '₹1,450', status: 'Settled to Bank' },
            { date: 'May 19, 2025', amount: '₹1,180', status: 'Settled to Bank' },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/80 border border-gray-100">
              <div>
                <span className="font-bold text-gray-900 block">{item.date}</span>
                <span className="text-xs text-gray-500">{item.status}</span>
              </div>
              <span className="font-black text-emerald-800 text-base">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
