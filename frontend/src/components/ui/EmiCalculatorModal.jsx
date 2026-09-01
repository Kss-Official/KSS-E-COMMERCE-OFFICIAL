import React, { useState } from 'react';
import { X, CreditCard, Check, Percent } from 'lucide-react';

export default function EmiCalculatorModal({ isOpen, onClose, price = 0 }) {
  const [selectedTenure, setSelectedTenure] = useState(3); // 3, 6, 9, 12 months

  if (!isOpen) return null;

  const numPrice = Number(price) || 12999;

  const banks = [
    { name: 'HDFC Bank', rate: 0, logo: '💳' },
    { name: 'ICICI Bank', rate: 0, logo: '🏛️' },
    { name: 'State Bank of India (SBI)', rate: 0, logo: '🏦' },
    { name: 'Axis Bank', rate: 12, logo: '💳' },
    { name: 'Bajaj Finserv Insta EMI', rate: 0, logo: '⚡' }
  ];

  const calculateEmi = (months, annualRate) => {
    if (annualRate === 0) {
      return Math.round(numPrice / months);
    }
    const r = annualRate / 12 / 100;
    const emi = (numPrice * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    return Math.round(emi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 relative overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">No-Cost & Low-Cost EMI Options</h3>
              <p className="text-xs text-gray-500 font-medium">Order Value: <span className="font-bold text-gray-900">₹{numPrice.toLocaleString('en-IN')}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tenure Switcher */}
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-700 block mb-2">Select EMI Duration:</label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map((months) => (
              <button
                key={months}
                onClick={() => setSelectedTenure(months)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                  selectedTenure === months
                    ? 'border-brand-700 bg-brand-50 text-brand-900 font-black shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{months} Months</span>
                <span className="text-[10px] text-emerald-700 font-extrabold mt-0.5">
                  ₹{calculateEmi(months, 0).toLocaleString('en-IN')}/mo
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bank Breakdown Table */}
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden mb-4 text-xs">
          <div className="bg-gray-100 p-3 font-extrabold text-gray-800 flex justify-between">
            <span>Bank / Partner</span>
            <span>Monthly EMI</span>
            <span>Interest</span>
          </div>

          {banks.map((bank) => {
            const emiAmount = calculateEmi(selectedTenure, bank.rate);
            const totalCost = emiAmount * selectedTenure;
            const extraCost = totalCost - numPrice;

            return (
              <div key={bank.name} className="p-3 flex items-center justify-between font-semibold text-gray-800 hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                  <span className="text-base">{bank.logo}</span>
                  <div>
                    <span className="font-bold text-gray-900 block">{bank.name}</span>
                    <span className="text-[10px] text-gray-500">Total: ₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-brand-900 block text-sm">₹{emiAmount.toLocaleString('en-IN')}/mo</span>
                  <span className="text-[10px] text-gray-500">for {selectedTenure} months</span>
                </div>

                <div>
                  {bank.rate === 0 ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md">
                      0% No-Cost
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      +{bank.rate}% p.a (+₹{extraCost})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center space-x-2 text-xs text-blue-900">
          <Percent className="w-4 h-4 text-blue-600 shrink-0" />
          <p>
            No-Cost EMI is available on select Credit and Debit Cards. Bank processing fee of ₹199 + GST may apply at checkout.
          </p>
        </div>

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-2xs"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
}
