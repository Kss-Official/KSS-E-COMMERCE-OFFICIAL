import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import { getProductImage } from '../../utils/productAssets';

const MOCK_SALES_NOTIFICATIONS = [
  { id: 1, name: 'Rahul S.', city: 'Delhi', product: 'boAt Rockerz 450', price: 1499, time: '2 mins ago' },
  { id: 2, name: 'Priya K.', city: 'Mumbai', product: 'Sony WH-1000XM5', price: 24990, time: '5 mins ago' },
  { id: 3, name: 'Anish M.', city: 'Bengaluru', product: 'Noise ColorFit Smartwatch', price: 1799, time: '8 mins ago' },
  { id: 4, name: 'Sneha R.', city: 'Pune', product: 'Organic Rosewater Mist', price: 499, time: '12 mins ago' },
  { id: 5, name: 'Vikram T.', city: 'Hyderabad', product: 'JBL Flip 6 Speaker', price: 8999, time: '15 mins ago' }
];

export default function SocialProofTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { navigateTo } = useNavigationContext();

  useEffect(() => {
    if (isDismissed) return;

    // Show initial notification after 3 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Rotate notification every 12 seconds
    const rotationInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % MOCK_SALES_NOTIFICATIONS.length);
        setIsVisible(true);
      }, 500);
    }, 12000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(rotationInterval);
    };
  }, [isDismissed]);

  if (isDismissed || !isVisible) return null;

  const currentNotification = MOCK_SALES_NOTIFICATIONS[currentIdx];

  return (
    <div
      className="fixed bottom-5 left-5 z-40 max-w-xs bg-white/95 backdrop-blur-md border border-gray-200/90 rounded-2xl p-3 shadow-xl shadow-gray-900/10 flex items-center space-x-3 animate-fade-in text-xs font-sans transition-all duration-500 hover:scale-[1.02]"
    >
      <div className="w-11 h-11 rounded-xl bg-gray-50 p-1 flex items-center justify-center border border-gray-100 shrink-0">
        <img
          src={getProductImage(currentNotification.product)}
          alt={currentNotification.product}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1 text-[11px] font-bold text-gray-900">
          <span className="truncate">{currentNotification.name}</span>
          <span className="text-gray-400 font-normal">from {currentNotification.city}</span>
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
        </div>
        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
          Purchased <strong className="text-brand-700 font-bold">{currentNotification.product}</strong>
        </p>
        <div className="flex items-center space-x-2 text-[9px] text-gray-400 font-semibold mt-1">
          <span className="text-emerald-700 font-extrabold">₹{currentNotification.price.toLocaleString('en-IN')}</span>
          <span>• {currentNotification.time}</span>
        </div>
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
        title="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
