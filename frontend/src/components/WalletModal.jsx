import React, { useState, useEffect } from 'react';
import { Wallet, X, ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchUserWalletApi } from '../services/api';

export default function WalletModal({ isOpen, onClose }) {
  const [walletData, setWalletData] = useState({ wallet_balance: 0, transactions: [] });
  const [isLoading, setIsLoading] = useState(false);

  const loadWallet = async () => {
    setIsLoading(true);
    const data = await fetchUserWalletApi();
    setWalletData(data || { wallet_balance: 0, transactions: [] });
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadWallet();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const balance = parseFloat(walletData.wallet_balance || 0);
  const txns = Array.isArray(walletData.transactions) ? walletData.transactions : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#063328] to-[#0d5c46] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">BuyZo Wallet</h2>
              <p className="text-xs text-emerald-200 font-medium">Instant Refunds & Rewards Balance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Available Balance</span>
              <h3 className="text-3xl font-black text-gray-900 mt-1">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <button
              onClick={loadWallet}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#0d5c46] rounded-xl transition-colors"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Secure & Usable instantly at Checkout</span>
          </div>
        </div>

        {/* Transaction History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">
            Transaction History ({txns.length})
          </h4>

          {isLoading ? (
            <div className="py-12 text-center text-sm font-semibold text-gray-400 animate-pulse">
              Syncing wallet history...
            </div>
          ) : txns.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="font-bold">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-0.5">Refunds from cancelled orders will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {txns.map((tx) => {
                const isCredit = (tx.transaction_type || '').toUpperCase() === 'CREDIT';
                const amt = parseFloat(tx.amount || 0);
                const dateStr = tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

                return (
                  <div
                    key={tx.id}
                    className="p-4 bg-white border border-gray-100 rounded-xl shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">{tx.reason}</h5>
                        <p className="text-xs text-gray-400 font-medium">{dateStr} {tx.order_number ? `• #${tx.order_number}` : ''}</p>
                      </div>
                    </div>
                    <span className={`font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCredit ? '+' : '-'}₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500 font-medium">
          Need help with refunds? Contact support at <span className="font-bold text-gray-700">support@buyzo.com</span>
        </div>
      </div>
    </div>
  );
}
