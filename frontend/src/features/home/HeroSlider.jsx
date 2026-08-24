import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Gift, Shirt, Watch, ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import heroHomePageImg from '../../assets/HerohomePage.png';
import heroHomePage2Img from '../../assets/HerohomePage2.png';
import heroHomePage3Img from '../../assets/HerohomePage3.png';
import rakhiVisualImg from '../../assets/rakhi_hero_visual.png';

const slides = [
  {
    id: 1,
    image: heroHomePageImg,
    alt: 'Discover, Shop, Save More - BuyZo',
    bgColor: '#074b43',
    isDarkTheme: true,
    title: (
      <>
        Discover.<br />
        Shop. Save More.
      </>
    ),
    subtitle: (
      <>
        Top brands, best prices &amp;<br />
        exclusive offers on every purchase.
      </>
    ),
    titleColor: 'text-white',
    subtitleColor: 'text-white/95',
    primaryBtn: {
      label: 'Shop Now',
      page: 'electronics',
      className: 'bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-md',
    },
    secondaryBtn: {
      label: 'Explore Offers',
      page: 'deals',
      className: 'bg-white/20 hover:bg-white/30 text-white font-bold backdrop-blur-xs',
    },
  },
  {
    id: 2,
    image: heroHomePage2Img,
    alt: 'Everyday Gear & Accessories - BuyZo',
    bgColor: '#f5e6d3',
    isDarkTheme: false,
    title: (
      <>
        Everyday Gear.<br />
        Smart &amp; Modern.
      </>
    ),
    subtitle: (
      <>
        Premium backpacks, smart audio &amp;<br />
        active essentials for your lifestyle.
      </>
    ),
    titleColor: 'text-[#182a26]',
    subtitleColor: 'text-[#2e4741]',
    primaryBtn: {
      label: 'Shop Collection',
      page: 'fashion',
      className: 'bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-md',
    },
    secondaryBtn: {
      label: 'Explore Offers',
      page: 'deals',
      className: 'bg-[#182a26]/15 hover:bg-[#182a26]/25 text-[#182a26] font-bold backdrop-blur-xs',
    },
  },
  {
    id: 3,
    image: heroHomePage3Img,
    alt: 'Streetwear & Trending Fashion - BuyZo',
    bgColor: '#f7f1ea',
    isDarkTheme: false,
    title: (
      <>
        Style Redefined.<br />
        Fresh &amp; Iconic.
      </>
    ),
    subtitle: (
      <>
        Trending hoodies, signature kicks &amp;<br />
        streetwear essentials at unbeatable prices.
      </>
    ),
    titleColor: 'text-[#182a26]',
    subtitleColor: 'text-[#2e4741]',
    primaryBtn: {
      label: 'Shop Fashion',
      page: 'fashion',
      className: 'bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-md',
    },
    secondaryBtn: {
      label: 'Explore Offers',
      page: 'deals',
      className: 'bg-[#182a26]/15 hover:bg-[#182a26]/25 text-[#182a26] font-bold backdrop-blur-xs',
    },
  },
  {
    id: 4,
    alt: 'Rakhi Special - More Love. More Gifts. More Savings.',
    bgColor: '#063328',
    isDarkTheme: true,
    isCustom: true,
  },
];

export default function HeroSlider() {
  const { navigateTo } = useNavigationContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div
      className="relative w-full overflow-hidden min-h-[390px] md:min-h-[420px] flex items-center shadow-none select-none rounded-none mt-0 transition-colors duration-500"
      style={{ backgroundColor: slides[currentIndex].bgColor }}
    >
      {/* Background Images for smooth transition */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          {slide.image ? (
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center select-none"
            />
          ) : (
            /* Custom Rich Background matching reference artwork #063328 */
            <div className="w-full h-full bg-[#063328] relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-transparent via-[#063328]/30 to-[#032019]/90 pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-10 w-80 h-80 bg-[#ff5100]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-10 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Sparkling confetti & stars across banner */}
              <div className="absolute top-8 left-1/4 text-amber-300 text-sm animate-pulse pointer-events-none">✦</div>
              <div className="absolute top-20 right-1/3 text-amber-200 text-xs animate-pulse pointer-events-none">✦</div>
              <div className="absolute bottom-16 left-1/2 text-orange-400 text-xs pointer-events-none">✦</div>
              <div className="absolute top-12 right-16 text-amber-300 text-lg animate-pulse pointer-events-none">✦</div>

              <div className="absolute top-14 right-1/4 w-2 h-2 rotate-45 bg-amber-400/80 pointer-events-none" />
              <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 rotate-45 bg-orange-400/80 pointer-events-none" />
              <div className="absolute top-32 right-12 w-2 h-2 rotate-45 bg-emerald-300/60 pointer-events-none" />
              <div className="absolute bottom-12 right-20 w-1.5 h-1.5 rotate-45 bg-amber-300/70 pointer-events-none" />
            </div>
          )}
        </div>
      ))}

      {/* Left Slider Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
        title="Previous banner"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Slider Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
        title="Next banner"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main Content Container */}
      <div className="relative w-full h-full px-8 sm:px-14 md:px-20 py-8 z-10 flex items-center justify-between pointer-events-none">
        {slides.map((slide, idx) => {
          /* Custom Slide 4 Layout */
          if (slide.isCustom) {
            return (
              <div
                key={`content-${slide.id}`}
                className={`w-full flex flex-col md:flex-row items-center justify-between gap-6 z-10 transition-all duration-700 ease-in-out pointer-events-auto ${
                  idx === currentIndex
                    ? 'opacity-100 translate-y-0 relative'
                    : 'opacity-0 translate-y-4 absolute pointer-events-none'
                }`}
              >
                {/* Left Text Block matching exact reference */}
                <div className="max-w-xs sm:max-w-md md:max-w-xl space-y-3.5">
                  {/* Rakhi Special Ornamental Badge */}
                  <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-black tracking-widest uppercase drop-shadow-xs">
                    <span>❖</span>
                    <span>RAKHI SPECIAL</span>
                    <span>❖</span>
                  </div>

                  {/* Main Headings */}
                  <h1 className="text-3xl sm:text-5xl md:text-[50px] font-black leading-[1.08] tracking-tight drop-shadow-xs text-white">
                    More Love.<br />
                    More Gifts.<br />
                    <span className="text-[#ff5100]">More Savings.</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xs sm:text-sm md:text-base font-normal max-w-md leading-relaxed drop-shadow-xs text-white/90">
                    Celebrate the bond of love with special <span className="text-amber-300 font-bold">Rakhi deals</span> on fashion &amp; more!
                  </p>

                  {/* 3 Quick Benefit Badges */}
                  <div className="hidden sm:flex items-center gap-4 pt-1 text-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg border border-amber-400/50 flex items-center justify-center text-amber-400 bg-black/25">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <div className="font-bold">Rakhi Gifts</div>
                        <div className="text-white/70 text-[10px]">For Every Bond</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg border border-emerald-400/50 flex items-center justify-center text-emerald-400 bg-black/25">
                        <Shirt className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <div className="font-bold">Fashion</div>
                        <div className="text-white/70 text-[10px]">For Everyone</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg border border-orange-400/50 flex items-center justify-center text-orange-400 bg-black/25">
                        <Watch className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <div className="font-bold">Accessories</div>
                        <div className="text-white/70 text-[10px]">For Every Style</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => navigateTo('deals')}
                      className="px-7 py-3 rounded-xl transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-lg shadow-orange-500/20 flex items-center space-x-2"
                    >
                      <span>Shop Rakhi Deals</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Visual with 3D Depth, Floating Ambient Glow & Design Improvements */}
                <div className="hidden md:flex items-center justify-end shrink-0 h-[260px] sm:h-[300px] md:h-[340px] max-w-[420px] lg:max-w-[490px] relative pointer-events-none select-none group">
                  {/* 3D Multi-layer Glow Backlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-[#ff5100]/15 to-emerald-400/20 rounded-full blur-3xl pointer-events-none transform group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute -bottom-4 right-10 w-48 h-16 bg-black/40 rounded-full blur-xl pointer-events-none" />

                  {/* Floating Sparkle Stars */}
                  <div className="absolute -top-2 right-12 text-amber-300 text-sm animate-pulse pointer-events-none">✦</div>
                  <div className="absolute bottom-8 left-4 text-orange-400 text-xs pointer-events-none">✦</div>
                  <div className="absolute top-1/2 -left-2 text-amber-200 text-xs animate-pulse pointer-events-none">✦</div>

                  {/* 3D High-Res Graphic Image */}
                  <img
                    src={rakhiVisualImg}
                    alt="Rakhi Special Gifts"
                    className="relative z-10 h-full w-auto max-w-full object-contain object-right drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-[1.03]"
                  />
                </div>
              </div>
            );
          }

          /* Slides 1, 2, 3 Standard Layout */
          return (
            <div
              key={`content-${slide.id}`}
              className={`w-full flex items-center justify-between z-10 transition-all duration-700 ease-in-out pointer-events-auto ${idx === currentIndex
                ? 'opacity-100 translate-y-0 relative'
                : 'opacity-0 translate-y-4 absolute pointer-events-none'
                }`}
            >
              {/* Left Text Block */}
              <div className="max-w-xs sm:max-w-md md:max-w-lg space-y-4">
                <h1
                  className={`text-3xl sm:text-5xl md:text-[52px] font-bold leading-[1.08] tracking-tight drop-shadow-xs ${slide.titleColor}`}
                >
                  {slide.title}
                </h1>
                <p
                  className={`text-xs sm:text-base md:text-lg font-normal max-w-md leading-relaxed drop-shadow-xs ${slide.subtitleColor}`}
                >
                  {slide.subtitle}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    onClick={() => navigateTo(slide.primaryBtn.page)}
                    className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all active:scale-[0.98] text-xs sm:text-base cursor-pointer ${slide.primaryBtn.className}`}
                  >
                    {slide.primaryBtn.label}
                  </button>
                  <button
                    onClick={() => navigateTo(slide.secondaryBtn.page)}
                    className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all active:scale-[0.98] text-xs sm:text-base cursor-pointer ${slide.secondaryBtn.className}`}
                  >
                    {slide.secondaryBtn.label}
                  </button>
                </div>
              </div>

              {/* Circular Offer Badge for Slide 1 placed at exact same location on the circle outline */}
              {/* Circular Offer Badge for Slide 1 */}
              {slide.id === 1 && (
                <div className="absolute left-[61%] sm:left-[62%] md:left-[63%] lg:left-[64%] -top-5 sm:-top-7 md:-top-9 lg:-top-10 -translate-x-1/2 z-20 pointer-events-none select-none">
                  <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-[86px] lg:h-[86px] rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.28)] flex flex-col items-center justify-center border-2 border-white/95">
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-wider text-[#0e2723] uppercase leading-none">
                      UP TO
                    </span>
                    <span className="text-sm sm:text-lg md:text-xl lg:text-[23px] font-black text-[#ff5100] leading-none my-0.5 tracking-tight">
                      60%
                    </span>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-wider text-[#0e2723] uppercase leading-none">
                      OFF
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 sm:bottom-7 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((slide, idx) => (
          <button
            key={`dot-${slide.id}`}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentIndex
              ? 'w-3 h-3 bg-[#ff5100] shadow-sm'
              : 'w-2.5 h-2.5 bg-black/30 hover:bg-black/50'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}


