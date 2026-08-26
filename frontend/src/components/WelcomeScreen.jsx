import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';

const STORAGE_KEY = 'buyzo_welcome_seen';

export function hasSeenWelcome() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return true;
  }
}

export function markWelcomeSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    /* non-fatal */
  }
}

/**
 * 3D Isometric Gift Box SVG with orange bow, shadows, and floating sparkles
 */
function GiftBoxIllustration() {
  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        viewBox="0 0 200 200"
        className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_15px_25px_rgba(4,45,36,0.25)] transition-transform duration-500 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floating Sparkles */}
        <g className="animate-sparkle" style={{ transformOrigin: '30px 40px' }}>
          <path
            d="M30 30 C30 36 34 40 40 40 C34 40 30 44 30 50 C30 44 26 40 20 40 C26 40 30 36 30 30 Z"
            fill="#FBBF24"
          />
        </g>
        <g className="animate-sparkle" style={{ transformOrigin: '170px 35px', animationDelay: '0.8s' }}>
          <path
            d="M170 28 C170 33 173 37 178 37 C173 37 170 41 170 46 C170 41 167 37 162 37 C167 37 170 33 170 28 Z"
            fill="#FBBF24"
          />
        </g>
        <g className="animate-sparkle" style={{ transformOrigin: '180px 130px', animationDelay: '1.4s' }}>
          <path
            d="M180 125 C180 128 182 130 185 130 C182 130 180 132 180 135 C180 132 178 130 175 130 C178 130 180 128 180 125 Z"
            fill="#F59E0B"
          />
        </g>
        <g className="animate-sparkle" style={{ transformOrigin: '25px 145px', animationDelay: '1.9s' }}>
          <path
            d="M25 142 C25 144 26.5 146 29 146 C26.5 146 25 148 25 150 C25 148 23.5 146 21 146 C23.5 146 25 144 25 142 Z"
            fill="#FBBF24"
          />
        </g>

        {/* Shadow under the gift box */}
        <ellipse cx="100" cy="178" rx="55" ry="12" fill="rgba(0,0,0,0.14)" />

        {/* Gift Box Base - Left Face */}
        <path
          d="M48 95 L100 122 L100 168 L48 139 Z"
          fill="url(#greenLeftGrad)"
        />

        {/* Gift Box Base - Right Face */}
        <path
          d="M100 122 L152 95 L152 139 L100 168 Z"
          fill="url(#greenRightGrad)"
        />

        {/* Vertical Orange Ribbon Left */}
        <path
          d="M69 106 L83 113 L83 158 L69 150 Z"
          fill="url(#orangeRibbonLeft)"
        />

        {/* Vertical Orange Ribbon Right */}
        <path
          d="M117 113 L131 106 L131 150 L117 158 Z"
          fill="url(#orangeRibbonRight)"
        />

        {/* Gift Box Lid - Left Face */}
        <path
          d="M42 85 L100 114 L100 124 L42 94 Z"
          fill="url(#greenLidLeft)"
        />

        {/* Gift Box Lid - Right Face */}
        <path
          d="M100 114 L158 85 L158 94 L100 124 Z"
          fill="url(#greenLidRight)"
        />

        {/* Gift Box Lid - Top Face */}
        <path
          d="M100 58 L158 85 L100 114 L42 85 Z"
          fill="url(#greenLidTop)"
        />

        {/* Top Face Ribbon - Diagonal 1 */}
        <path
          d="M69 72 L129 100 L131 93 L71 65 Z"
          fill="url(#orangeRibbonTop1)"
        />

        {/* Top Face Ribbon - Diagonal 2 */}
        <path
          d="M129 72 L69 100 L71 93 L131 65 Z"
          fill="url(#orangeRibbonTop2)"
        />

        {/* Ribbon Bow on Top */}
        {/* Left Loop */}
        <path
          d="M100 70 C85 50 60 50 68 68 C74 78 92 72 100 70 Z"
          fill="url(#bowLeft)"
          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
        />
        {/* Right Loop */}
        <path
          d="M100 70 C115 50 140 50 132 68 C126 78 108 72 100 70 Z"
          fill="url(#bowRight)"
          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.2))"
        />
        {/* Top Left Mini Loop */}
        <path
          d="M100 68 C92 48 76 46 82 58 C86 64 96 66 100 68 Z"
          fill="#FF8038"
        />
        {/* Top Right Mini Loop */}
        <path
          d="M100 68 C108 48 124 46 118 58 C114 64 104 66 100 68 Z"
          fill="#FF7020"
        />
        {/* Center Knot */}
        <ellipse cx="100" cy="69" rx="7" ry="5.5" fill="#FF5100" />
        <ellipse cx="99" cy="68" rx="4" ry="3" fill="#FFA066" />

        {/* Gradients */}
        <defs>
          <linearGradient id="greenLeftGrad" x1="48" y1="95" x2="100" y2="168" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E4D3E" />
            <stop offset="1" stopColor="#103328" />
          </linearGradient>
          <linearGradient id="greenRightGrad" x1="152" y1="95" x2="100" y2="168" gradientUnits="userSpaceOnUse">
            <stop stopColor="#133C2E" />
            <stop offset="1" stopColor="#092018" />
          </linearGradient>
          <linearGradient id="greenLidLeft" x1="42" y1="85" x2="100" y2="124" gradientUnits="userSpaceOnUse">
            <stop stopColor="#255D4C" />
            <stop offset="1" stopColor="#143C2E" />
          </linearGradient>
          <linearGradient id="greenLidRight" x1="158" y1="85" x2="100" y2="124" gradientUnits="userSpaceOnUse">
            <stop stopColor="#184838" />
            <stop offset="1" stopColor="#0B261D" />
          </linearGradient>
          <linearGradient id="greenLidTop" x1="100" y1="58" x2="100" y2="114" gradientUnits="userSpaceOnUse">
            <stop stopColor="#317862" />
            <stop offset="1" stopColor="#205645" />
          </linearGradient>
          <linearGradient id="orangeRibbonLeft" x1="69" y1="106" x2="83" y2="158" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B26" />
            <stop offset="1" stopColor="#E04600" />
          </linearGradient>
          <linearGradient id="orangeRibbonRight" x1="117" y1="113" x2="131" y2="158" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E64A00" />
            <stop offset="1" stopColor="#B33600" />
          </linearGradient>
          <linearGradient id="orangeRibbonTop1" x1="69" y1="72" x2="131" y2="93" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF8547" />
            <stop offset="1" stopColor="#FF5500" />
          </linearGradient>
          <linearGradient id="orangeRibbonTop2" x1="129" y1="72" x2="71" y2="93" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF732E" />
            <stop offset="1" stopColor="#E64900" />
          </linearGradient>
          <linearGradient id="bowLeft" x1="60" y1="50" x2="100" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFA066" />
            <stop offset="0.4" stopColor="#FF5C0A" />
            <stop offset="1" stopColor="#D94100" />
          </linearGradient>
          <linearGradient id="bowRight" x1="140" y1="50" x2="100" y2="75" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9454" />
            <stop offset="0.4" stopColor="#F55000" />
            <stop offset="1" stopColor="#C43800" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Party Popper Celebration SVG icon
 */
function PartyPopperIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 animate-bounce"
      style={{ animationDuration: '3s' }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Confetti pieces */}
      <circle cx="14" cy="18" r="2.5" fill="#3B82F6" />
      <circle cx="28" cy="10" r="2" fill="#EF4444" />
      <circle cx="42" cy="15" r="3" fill="#F59E0B" />
      <circle cx="56" cy="22" r="2.5" fill="#10B981" />
      <circle cx="52" cy="38" r="2" fill="#EC4899" />
      <rect x="22" y="16" width="3" height="6" rx="1.5" transform="rotate(35 22 16)" fill="#10B981" />
      <rect x="36" y="8" width="3" height="7" rx="1.5" transform="rotate(-25 36 8)" fill="#F97316" />
      <rect x="46" y="26" width="3" height="6" rx="1.5" transform="rotate(45 46 26)" fill="#8B5CF6" />
      <path d="M12 28 Q 16 26 18 30" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M40 22 Q 44 18 48 22" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Cone Body */}
      <g transform="translate(4, 18)">
        <path
          d="M10 40 L34 16 L6 10 Z"
          fill="url(#popperCone)"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
        />
        {/* Striped patterns on cone */}
        <path d="M12 28 L23 17 L21 14 L9 25 Z" fill="#F59E0B" opacity="0.9" />
        <path d="M8 35 L17 26 L15 23 L6 32 Z" fill="#EF4444" opacity="0.9" />
        {/* Cone Rim */}
        <ellipse cx="20" cy="13" rx="14" ry="4" transform="rotate(-30 20 13)" fill="#FF8A00" />
      </g>

      <defs>
        <linearGradient id="popperCone" x1="6" y1="10" x2="34" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB800" />
          <stop offset="0.5" stopColor="#FF7A00" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Custom Discount Price Tag Icon with %
 */
function DiscountTagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#15803D]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      <path d="M11 15l4-4" strokeWidth="1.8" />
      <circle cx="11.5" cy="11.5" r="0.75" fill="currentColor" />
      <circle cx="14.5" cy="14.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Exact replica of the Welcome Modal popup
 */
export default function WelcomeScreen({ onDismiss, onNavigate }) {
  const [leaving, setLeaving] = useState(false);
  const { navigateTo } = useNavigationContext();

  const handleDismiss = (targetRoute) => {
    if (leaving) return;
    setLeaving(true);
    markWelcomeSeen();
    setTimeout(() => {
      onDismiss?.();
      if (targetRoute) {
        if (onNavigate) {
          onNavigate(targetRoute);
        } else if (navigateTo) {
          navigateTo(targetRoute);
        }
      }
    }, 200);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [leaving]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to BuyZo"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/45 backdrop-blur-[2px] transition-opacity duration-250 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      {/* Main Modal Card */}
      <div
        className={`relative w-full max-w-5xl rounded-[28px] border border-[#F3EAD8] bg-[#FDFBF7] p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all duration-300 ${
          leaving ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Top-Right Close 'X' Button */}
        <button
          type="button"
          onClick={() => handleDismiss()}
          className="absolute right-4 top-4 sm:right-5 sm:top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close welcome modal"
        >
          <X size={20} />
        </button>

        {/* Content Layout Grid / Flex */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-4">
          
          {/* Left Column: Heading, Subtitle & Action Buttons (lg:col-span-5) */}
          <div className="flex flex-col items-start text-left lg:col-span-5 pr-0 lg:pr-2">
            <div className="flex items-center gap-3">
              <PartyPopperIcon />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Welcome to Buy<span className="text-[#FF5100]">Zo</span>!
              </h2>
            </div>

            <p className="mt-2.5 text-sm sm:text-[15px] font-normal leading-relaxed text-gray-600">
              Your one-stop shop for top brands, best prices &amp; exclusive deals.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleDismiss('deals')}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF5100] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#E64900] active:scale-[0.98]"
              >
                Shop Best Deals
                <ArrowRight size={16} className="stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => handleDismiss('shop')}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 hover:bg-black/5 active:scale-[0.98]"
              >
                Explore Categories
              </button>
            </div>
          </div>

          {/* Middle Column: 3 Value Pillars with Dividers (lg:col-span-4) */}
          <div className="grid grid-cols-3 items-center border-t border-gray-200/80 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:border-r lg:px-4 lg:py-1">
            
            {/* Feature 1: Best Prices */}
            <div className="flex flex-col items-center px-1.5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F5EB] shadow-xs">
                <DiscountTagIcon />
              </div>
              <h4 className="mt-2.5 text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight">
                Best Prices
              </h4>
              <p className="mt-1 text-[10.5px] sm:text-[11px] font-normal leading-tight text-gray-500">
                Unbeatable prices on 300+ products
              </p>
            </div>

            {/* Feature 2: Fast Delivery */}
            <div className="flex flex-col items-center border-l border-gray-200/70 px-1.5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEEFE6] shadow-xs">
                <Truck size={22} className="text-[#FF5100]" />
              </div>
              <h4 className="mt-2.5 text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight">
                Fast Delivery
              </h4>
              <p className="mt-1 text-[10.5px] sm:text-[11px] font-normal leading-tight text-gray-500">
                Quick delivery at your doorstep
              </p>
            </div>

            {/* Feature 3: Secure Shopping */}
            <div className="flex flex-col items-center border-l border-gray-200/70 px-1.5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E3F4F1] shadow-xs">
                <ShieldCheck size={22} className="text-[#0D8E7D]" />
              </div>
              <h4 className="mt-2.5 text-[13px] sm:text-[14px] font-bold text-gray-900 leading-tight">
                Secure Shopping
              </h4>
              <p className="mt-1 text-[10.5px] sm:text-[11px] font-normal leading-tight text-gray-500">
                100% safe payments &amp; easy returns
              </p>
            </div>

          </div>

          {/* Right Column: 3D Gift Box + Pinned "New Here?" Tag (lg:col-span-3) */}
          <div className="relative flex items-center justify-center lg:col-span-3 lg:pl-2">
            <GiftBoxIllustration />

            {/* Pinned "New Here?" Tag Badge */}
            <div
              onClick={() => handleDismiss('deals')}
              role="button"
              tabIndex={0}
              className="absolute right-1 sm:right-2 bottom-3 sm:bottom-4 z-10 flex cursor-pointer items-center gap-2 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-[#FFF8EE] to-[#FFF1DE] px-3.5 py-2 shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {/* Metal tag eyelet pin dot */}
              <div className="h-2 w-2 rounded-full border border-amber-300 bg-amber-400/80 shadow-inner shrink-0" />
              
              <div className="flex flex-col text-left">
                <span className="text-[13px] sm:text-[14px] font-extrabold leading-tight text-[#FF5100]">
                  New Here?
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium leading-tight text-gray-600">
                  Get amazing deals inside!
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
