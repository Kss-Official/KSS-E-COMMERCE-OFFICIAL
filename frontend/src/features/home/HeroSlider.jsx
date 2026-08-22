import React from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import heroHomePageImg from '../../assets/HerohomePage.png';

export default function HeroSlider() {
  const { navigateTo } = useNavigationContext();

  return (
    <div className="relative text-white w-full overflow-hidden min-h-[390px] flex items-center shadow-none select-none bg-[#074b43] rounded-none mt-0">
      {/* Background Image (Teal textured background) */}
      <img
        src={heroHomePageImg}
        alt="BuyZo hero background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Left Slider Arrow */}
      <button
        onClick={() => navigateTo('deals')}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#042822]/60 hover:bg-[#042822]/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
        title="Previous offer"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Slider Arrow */}
      <button
        onClick={() => navigateTo('deals')}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#042822]/60 hover:bg-[#042822]/90 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
        title="Next offer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Content Container */}
      <div className="relative w-full h-full px-8 sm:px-14 md:px-20 py-8 z-10 flex items-center justify-between">
        {/* Left Text Block */}
        <div className="max-w-xs sm:max-w-md md:max-w-lg space-y-4 z-10">
          <h1 className="text-3xl sm:text-5xl md:text-[52px] font-bold leading-[1.08] tracking-tight text-white drop-shadow-xs">
            Discover.<br />
            Shop. Save More.
          </h1>
          <p className="text-white/95 text-xs sm:text-base md:text-lg font-normal max-w-md leading-relaxed drop-shadow-xs">
            Top brands, best prices &amp;<br />
            exclusive offers on every purchase.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => navigateTo('electronics')}
              className="bg-[#ff5100] hover:bg-[#e64900] text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg shadow-md transition-all active:scale-[0.98] text-xs sm:text-base cursor-pointer"
              >
              Shop Now
            </button>
            <button
              onClick={() => navigateTo('deals')}
              className="border-1.5 border-white hover:bg-white/10 text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-colors text-xs sm:text-base cursor-pointer"
            >
              Explore Offers
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

