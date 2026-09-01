import React, { useState } from 'react';
import { Gift, X, Sparkles, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import { fetchProducts } from '../../services/api';
import { getProductImage } from '../../utils/productAssets';

export default function GiftFinderModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const { navigateTo } = useNavigationContext();

  if (!isOpen) return null;

  const handleSearch = async () => {
    setIsSearching(true);
    setStep(4);
    try {
      const data = await fetchProducts({ no_page: 'true', page_size: 100 });
      if (Array.isArray(data)) {
        let maxPrice = 100000;
        if (budget === 'under-1000') maxPrice = 1000;
        else if (budget === '1000-3000') maxPrice = 3000;
        else if (budget === '3000-5000') maxPrice = 5000;

        const filtered = data
          .filter((p) => Number(p.price || p.current_price || 0) <= maxPrice)
          .slice(0, 6)
          .map((p) => ({
            ...p,
            name: p.name || p.title,
            price: Number(p.price || p.current_price || 0),
            image: getProductImage(p.name || p.title, p.image || p.primary_image)
          }));
        setResults(filtered);
      }
    } catch (err) {
      console.error('Gift finder search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const resetFinder = () => {
    setStep(1);
    setRecipient('');
    setOccasion('');
    setBudget('');
    setResults([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-brand-700 font-extrabold text-sm mb-1">
          <Gift className="w-5 h-5 text-accent" />
          <span>BuyZo AI Gift Finder</span>
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-4">
          Find the Perfect Gift in 30 Seconds 🎁
        </h2>

        {/* Step Progress Indicators */}
        <div className="flex items-center space-x-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step >= s ? 'bg-brand-700' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Recipient Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-700">Step 1: Who are you shopping for?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {['Friend or Colleague', 'Partner or Spouse', 'Parents or Family', 'Kids or Teens'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setRecipient(option);
                    setStep(2);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    recipient === option
                      ? 'border-brand-700 bg-brand-50/50 text-brand-800'
                      : 'border-gray-200 hover:border-brand-700/60 bg-white text-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Occasion Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-700">Step 2: What is the special occasion?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {['Birthday Party 🎂', 'Anniversary 💍', 'Festival / Rakhi 🪔', 'Just Because 🎉'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setOccasion(option);
                    setStep(3);
                  }}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                    occasion === option
                      ? 'border-brand-700 bg-brand-50/50 text-brand-800'
                      : 'border-gray-200 hover:border-brand-700/60 bg-white text-gray-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Budget Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-700">Step 3: What is your budget limit?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: 'Under ₹1,000', val: 'under-1000' },
                { label: '₹1,000 – ₹3,000', val: '1000-3000' },
                { label: '₹3,000 – ₹5,000', val: '3000-5000' },
                { label: 'No Limit 🚀', val: 'no-limit' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    setBudget(opt.val);
                    handleSearch();
                  }}
                  className="p-3 rounded-2xl border border-gray-200 hover:border-brand-700/60 bg-white text-xs font-bold text-left text-gray-800 transition-all cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Results Display */}
        {step === 4 && (
          <div className="space-y-4">
            {isSearching ? (
              <div className="text-center py-8 space-y-3">
                <RefreshCw className="w-8 h-8 text-brand-700 animate-spin mx-auto" />
                <p className="text-xs font-bold text-gray-600">Generating AI Gift Recommendations for {recipient}...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    ✨ Top Gift Recommendations for {recipient} ({occasion})
                  </span>
                  <button
                    onClick={resetFinder}
                    className="text-[11px] font-bold text-brand-700 hover:underline cursor-pointer"
                  >
                    Start Over
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto no-scrollbar p-0.5">
                  {results.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onClose();
                        navigateTo('product-detail', item);
                      }}
                      className="bg-gray-50 hover:bg-white rounded-2xl p-2.5 border border-gray-200 hover:border-brand-700 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="w-full h-20 bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden mb-2">
                          <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
                        </div>
                        <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1 group-hover:text-brand-700">{item.name}</h4>
                      </div>
                      <div className="mt-2 text-xs font-extrabold text-brand-800">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
