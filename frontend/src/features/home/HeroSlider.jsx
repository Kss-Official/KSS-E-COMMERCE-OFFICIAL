import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, Award, Tag, ShieldCheck, ArrowRight, Gift, Truck, Sparkles } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import { fetchHeroBanner } from '../../services/api';
import heroArmchairSlide1Img from '../../assets/images/hero_armchair_slide1.png';
import heroPendantLampImg from '../../assets/images/hero_pendant_lamp.png';
import heroGearSlide2Img from '../../assets/images/hero_gear_slide2.png';
import heroPendantLampSlide2Img from '../../assets/images/hero_pendant_lamp_slide2.png';
import heroFashionSlide3Img from '../../assets/images/hero_fashion_slide3.png';
import heroBanner4RakhiImg from '../../assets/images/HeroBanner4Rakhi.png';
import rakhiHangingLampsImg from '../../assets/images/rakhi_hanging_lamps.png';

const baseSlides = [
  {
    id: 1,
    alt: 'Discover, Shop, Save More - BuyZo',
    bgColor: '#024b4e',
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
      className: 'bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-lg shadow-orange-500/20',
    },
    secondaryBtn: {
      label: 'Explore Offers',
      page: 'deals',
      className: 'bg-transparent hover:bg-white/10 border border-white/80 hover:border-white text-white font-semibold backdrop-blur-xs',
    },
  },
  {
    id: 2,
    alt: 'Discover, Shop, Save More - BuyZo',
    bgColor: '#f7eee1',
    isDarkTheme: false,
    title: (
      <>
        Discover.<br />
        Deals. <span className="text-[#ff5100]">Save More.</span>
      </>
    ),
    subtitle: (
      <>
        Shop trending products at<br />
        amazing prices with exclusive deals every day
      </>
    ),
    titleColor: 'text-[#182a26]',
    subtitleColor: 'text-[#384844]',
    primaryBtn: {
      label: 'Shop Now',
      page: 'electronics',
      className: 'bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-md shadow-orange-500/20',
    },
    secondaryBtn: {
      label: 'Explore Offers',
      page: 'deals',
      className: 'bg-transparent hover:bg-[#182a26]/10 border-2 border-[#182a26]/80 hover:border-[#182a26] text-[#182a26] font-bold backdrop-blur-xs',
    },
  },
  {
    id: 3,
    alt: 'Streetwear & Trending Fashion - BuyZo',
    bgColor: '#E6F4D6',
    isDarkTheme: false,
    title: (
      <div>
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-orange-200/90 px-3.5 py-1 rounded-full text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5 shadow-2xs">
          <Star className="w-3.5 h-3.5 fill-[#ff5100] text-[#ff5100]" />
          <span>NEW COLLECTION</span>
        </div>
        <div className="text-3xl sm:text-5xl md:text-[54px] lg:text-[58px] font-black text-[#0b2b26] leading-[1.06] tracking-tight">
          Style Redefined.<br />
          Fresh &amp; <span className="text-[#ff5100]">Iconic.</span>
        </div>
        <div className="w-16 h-1 bg-[#ff5100] rounded-full mt-2.5 mb-1"></div>
      </div>
    ),
    subtitle: (
      <>
        Trending hoodies, signature kicks &amp;<br />
        streetwear essentials at unbeatable prices.
      </>
    ),
    titleColor: 'text-[#0b2b26]',
    subtitleColor: 'text-[#324540]',
    primaryBtn: {
      label: 'Shop Fashion',
      page: 'fashion',
      className: 'bg-[#ff5100] hover:bg-[#e64900] text-white font-bold shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2',
    },
    secondaryBtn: {
      label: 'Explore Offers',
      page: 'deals',
      className: 'bg-[#dcd1c4] hover:bg-[#d0c3b4] text-[#1c2e29] font-bold shadow-xs flex items-center justify-center space-x-2',
    },
    hasTrustBadges: true,
  },
  {
    id: 4,
    alt: 'Celebrate Rakhi & Raksha Bandhan with Love - BuyZo',
    bgColor: '#faf4eb',
    isDarkTheme: false,
    title: (
      <div>
        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-[#a81c53]/40 px-3.5 py-1 rounded-full text-xs font-bold text-[#a81c53] uppercase tracking-wider mb-2 shadow-2xs">
          <span className="w-3.5 h-3.5 rounded-full bg-[#a81c53] text-amber-300 flex items-center justify-center text-[7px] font-bold">✦</span>
          <span>FESTIVAL OF BONDS</span>
        </div>
        <div className="text-2xl sm:text-3xl md:text-[38px] lg:text-[42px] font-serif font-bold text-[#153a32] leading-[1.02] tracking-tight">
          Celebrate
        </div>
        <div className="text-3xl sm:text-4xl md:text-[50px] lg:text-[58px] font-serif font-black text-[#a81c53] leading-[0.96] tracking-tight my-0.5">
          Rakhi with Gifts
        </div>
        <div className="text-xl sm:text-3xl md:text-[34px] font-serif italic text-[#c69a48] tracking-normal flex items-center gap-1.5 leading-none mt-1">
          <span>Made with Love</span>
          <span className="not-italic text-[#c69a48] text-xl sm:text-2xl font-light">♡</span>
        </div>
        {/* Delicate Gold divider ornament */}
        <div className="flex items-center gap-2 my-2 max-w-xs opacity-75">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#c69a48]" />
          <span className="text-[10px] text-[#c69a48]">❖</span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#c69a48]" />
        </div>
      </div>
    ),
    subtitle: (
      <>
        Strengthen bonds of love.<br />
        Surprise your siblings with sweets,<br />
        chocolates &amp; beautiful Rakhis.
      </>
    ),
    titleColor: 'text-[#153a32]',
    subtitleColor: 'text-[#384844]',
    primaryBtn: {
      label: 'Shop Rakhis',
      page: 'deals',
      className: 'bg-[#a81c53] hover:bg-[#8f1544] text-white font-bold shadow-lg shadow-pink-900/20 flex items-center justify-center space-x-1.5',
    },
    secondaryBtn: {
      label: 'Explore Gifts',
      page: 'deals',
      className: 'bg-[#faf2ea] hover:bg-white border border-[#a81c53]/70 text-[#a81c53] font-bold shadow-xs flex items-center justify-center space-x-1.5',
    },
    isRakhi: true,
  },
];

export default function HeroSlider() {
  const { navigateTo } = useNavigationContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroBanner, setHeroBanner] = useState(null);

  // The lead slide's copy and CTAs are editable from the Admin portal
  // (catalog.HeroBanner). The bespoke artwork of every slide is untouched.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const banner = await fetchHeroBanner();
      if (!cancelled && banner) setHeroBanner(banner);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides = useMemo(() => {
    if (!heroBanner) return baseSlides;

    return baseSlides.map((slide) => {
      if (slide.id !== 1) return slide;

      const lines = String(heroBanner.title || '')
        .split('\n')
        .filter((line) => line.trim() !== '');

      return {
        ...slide,
        title: lines.length > 0
          ? (
            <>
              {lines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </>
          )
          : slide.title,
        subtitle: heroBanner.subtitle || slide.subtitle,
        primaryBtn: {
          ...slide.primaryBtn,
          label: heroBanner.primary_button_text || slide.primaryBtn.label,
          page: heroBanner.primary_button_link || slide.primaryBtn.page
        },
        secondaryBtn: {
          ...slide.secondaryBtn,
          label: heroBanner.secondary_button_text || slide.secondaryBtn.label,
          page: heroBanner.secondary_button_link || slide.secondaryBtn.page
        }
      };
    });
  }, [heroBanner]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? baseSlides.length - 1 : prev - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === baseSlides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div
      className="relative w-full overflow-hidden min-h-[360px] sm:min-h-[420px] md:min-h-[470px] lg:min-h-[500px] flex items-center shadow-none select-none rounded-none mt-0 transition-colors duration-500"
      style={{ backgroundColor: slides[currentIndex].bgColor }}
    >
      {/* Background Images for smooth transition */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
        >
          {slide.id === 1 ? (
            /* Exact 100% Vector Recreation of First Banner Reference (Deep Teal, Wavy Curve, White Halo Circle & Flowing Line) */
            <div className="w-full h-full relative overflow-hidden bg-[#024a4d]">
              <svg
                viewBox="0 0 1440 720"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover select-none pointer-events-none"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Deep Teal Base Gradient */}
                  <linearGradient id="exactSlide1BaseBg" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" stopColor="#013b3d" />
                    <stop offset="45%" stopColor="#024d50" />
                    <stop offset="100%" stopColor="#04676b" />
                  </linearGradient>

                  {/* Lighter Teal Smooth Organic Wave Gradient */}
                  <linearGradient id="exactSlide1WaveGrad" x1="0%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#148386" />
                    <stop offset="50%" stopColor="#1a979a" />
                    <stop offset="100%" stopColor="#096568" />
                  </linearGradient>
                </defs>

                {/* 1. Base Deep Teal Canvas */}
                <rect width="1440" height="720" fill="url(#exactSlide1BaseBg)" />

                {/* 2. Distinct Lighter Teal Organic Wavy Hill on Bottom/Center */}
                <path
                  d="M 520 720 C 620 540, 740 380, 940 340 C 1140 300, 1320 380, 1440 430 L 1440 720 L 520 720 Z"
                  fill="url(#exactSlide1WaveGrad)"
                />
              </svg>
            </div>
          ) : slide.id === 2 ? (
            /* Exact 100% Faithful Vector Recreation of 2nd Banner Reference (Sun Orb, White Arc, Pine Arch, Gold Wire, Rolling Dune) */
            <div className="w-full h-full relative overflow-hidden bg-[#f4e4d2]">
              <svg
                viewBox="0 0 1440 720"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover select-none pointer-events-none"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Base Warm Linen Peach Gradient */}
                  <linearGradient id="exactSlide2BaseBg" x1="0%" y1="0%" x2="60%" y2="100%">
                    <stop offset="0%" stopColor="#f7ede2" />
                    <stop offset="50%" stopColor="#f4e4d2" />
                    <stop offset="100%" stopColor="#ecd6bf" />
                  </linearGradient>

                  {/* Soft Glowing Sun / Moon Orb */}
                  <radialGradient id="exactSlide2SunOrb" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="45%" stopColor="#fef7ed" stopOpacity="0.75" />
                    <stop offset="80%" stopColor="#f8ead7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f4e4d2" stopOpacity="0" />
                  </radialGradient>

                  {/* Deep Forest Pine Green Arch Gradient */}
                  <linearGradient id="exactSlide2PineArch" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#244c41" />
                    <stop offset="50%" stopColor="#1a3c33" />
                    <stop offset="100%" stopColor="#112923" />
                  </linearGradient>

                  {/* Metallic Gold Arc Wire Gradient */}
                  <linearGradient id="exactSlide2GoldWire" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dfb76c" />
                    <stop offset="50%" stopColor="#c59843" />
                    <stop offset="100%" stopColor="#9a7126" />
                  </linearGradient>

                  {/* Foreground Rolling Sand Dune Gradient */}
                  <linearGradient id="exactSlide2DuneGrad" x1="0%" y1="0%" x2="30%" y2="100%">
                    <stop offset="0%" stopColor="#f1e1cf" />
                    <stop offset="50%" stopColor="#ebd6be" />
                    <stop offset="100%" stopColor="#dec5a8" />
                  </linearGradient>
                </defs>

                {/* 1. Base Warm Linen Canvas */}
                <rect width="1440" height="720" fill="url(#exactSlide2BaseBg)" />

                {/* 2. Top-Left Glowing Sun / Moon Orb */}
                <circle cx="140" cy="130" r="92" fill="url(#exactSlide2SunOrb)" />

                {/* 3. Middle-Right Concentric Sand Arch */}
                <path
                  d="M 684 720 C 670 460, 780 160, 975 0 L 1440 0 L 1440 720 Z"
                  fill="#eedbc5"
                />

                {/* 4. Crisp White Hairline Arc Accent Outline */}
                <path
                  d="M 684 720 C 670 460, 780 160, 975 0"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeOpacity="0.95"
                />

                {/* 5. Right Deep Forest Pine Green Arch Sector */}
                <path
                  d="M 1160 0 C 1030 140, 980 320, 1070 600 L 1440 600 L 1440 0 Z"
                  fill="url(#exactSlide2PineArch)"
                />

                {/* 6. Golden Wire Arc Curve on Green Arch */}
                <path
                  d="M 1260 175 A 220 220 0 0 1 1440 530"
                  fill="none"
                  stroke="url(#exactSlide2GoldWire)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* 7. Foreground Rolling Sand Dune Hill */}
                <path
                  d="M 0 670 C 350 655, 650 560, 950 528 C 1170 505, 1330 555, 1440 575 L 1440 720 L 0 720 Z"
                  fill="url(#exactSlide2DuneGrad)"
                />

                {/* 8. Dune Crest Soft Highlight Line */}
                <path
                  d="M 0 670 C 350 655, 650 560, 950 528 C 1170 505, 1330 555, 1440 575"
                  fill="none"
                  stroke="#fdf8f0"
                  strokeWidth="1.8"
                  strokeOpacity="0.75"
                />
              </svg>
            </div>
          ) : slide.id === 3 ? (
            /* Fresh Light Lime / Green Canvas for Slide 3 with subtle dot grid */
            <div className="w-full h-full relative overflow-hidden bg-[#E6F4D6]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#ffffff_0%,transparent_60%)] pointer-events-none opacity-40" />
              {/* Bottom Left Dot Grid */}
              <div className="absolute bottom-4 left-6 grid grid-cols-4 gap-2 opacity-20 pointer-events-none">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#1b4332]" />
                ))}
              </div>
            </div>
          ) : (
            /* Luxury Festive Champagne / Ivory Canvas for Slide 4 Rakhi */
            <div className="w-full h-full relative overflow-hidden bg-gradient-to-r from-[#fdf7ee] via-[#faf4eb] to-[#f4e8dc]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#ffffff_0%,transparent_60%)] pointer-events-none" />
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-1/3 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none" />
              {/* Floating Petal Accents */}
              <div className="absolute top-12 right-[42%] text-pink-700/60 text-xs animate-pulse pointer-events-none">🌸</div>
              <div className="absolute bottom-16 right-[38%] text-pink-600/50 text-[10px] pointer-events-none">🌸</div>
              <div className="absolute top-28 right-[32%] text-pink-600/40 text-[9px] pointer-events-none">🌸</div>
            </div>
          )}
        </div>
      ))}

      {/* Left Slider Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
        title="Previous banner"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Right Slider Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
        title="Next banner"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Main Content Container */}
      <div className="relative w-full h-full px-4 sm:px-8 md:px-14 lg:px-20 py-4 sm:py-6 md:py-8 z-10 flex items-center justify-between pointer-events-none">
        {slides.map((slide, idx) => (
          <div
            key={`content-${slide.id}`}
            className={`w-full grid grid-cols-12 items-center gap-2 sm:gap-4 md:gap-8 z-10 transition-all duration-700 ease-in-out pointer-events-auto ${idx === currentIndex
              ? 'opacity-100 translate-y-0 relative'
              : 'opacity-0 translate-y-4 absolute pointer-events-none'
              }`}
          >
            {/* Left Text Block (7 cols on mobile, 6 cols on md+) */}
            <div className="col-span-7 sm:col-span-7 md:col-span-6 lg:col-span-6 space-y-2.5 sm:space-y-4 md:space-y-5">
              <h1
                className={`text-xl sm:text-3xl md:text-[44px] lg:text-[54px] font-black leading-[1.08] tracking-tight drop-shadow-sm ${slide.titleColor}`}
              >
                {slide.title}
              </h1>
              <p
                className={`text-[11px] sm:text-xs md:text-base font-normal max-w-md leading-relaxed drop-shadow-xs ${slide.subtitleColor}`}
              >
                {slide.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 pt-1 sm:pt-2">
                <button
                  onClick={() => navigateTo(slide.primaryBtn.page)}
                  className={`px-3 sm:px-6 md:px-7 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all active:scale-[0.98] text-[11px] sm:text-xs md:text-base cursor-pointer ${slide.primaryBtn.className}`}
                >
                  <span>{slide.primaryBtn.label}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 inline" />
                </button>
                <button
                  onClick={() => navigateTo(slide.secondaryBtn.page)}
                  className={`px-3 sm:px-6 md:px-7 py-1.5 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl transition-all active:scale-[0.98] text-[11px] sm:text-xs md:text-base cursor-pointer ${slide.secondaryBtn.className}`}
                >
                  <span>{slide.secondaryBtn.label}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 inline" />
                </button>
              </div>

              {/* Trust Badges for Slide 3 (Fashion) */}
              {slide.id === 3 && (
                <div className="hidden sm:flex items-center gap-2 sm:gap-3 pt-1.5 sm:pt-2 text-[#1f312c]">
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#dfd2be]/80 shadow-2xs">
                    <div className="w-5 h-5 rounded-lg bg-orange-500/10 flex items-center justify-center text-gray-900">
                      <Award className="w-3 h-3 text-gray-800" />
                    </div>
                    <div className="text-[10px] leading-tight font-medium">
                      <div className="font-bold text-gray-900">Top Quality</div>
                      <div className="text-gray-500 text-[9px]">Premium Materials</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#dfd2be]/80 shadow-2xs">
                    <div className="w-5 h-5 rounded-lg bg-orange-500/10 flex items-center justify-center text-gray-900">
                      <Tag className="w-3 h-3 text-gray-800" />
                    </div>
                    <div className="text-[10px] leading-tight font-medium">
                      <div className="font-bold text-gray-900">Best Prices</div>
                      <div className="text-gray-500 text-[9px]">Great Everyday Deals</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#dfd2be]/80 shadow-2xs">
                    <div className="w-5 h-5 rounded-lg bg-orange-500/10 flex items-center justify-center text-gray-900">
                      <ShieldCheck className="w-3 h-3 text-gray-800" />
                    </div>
                    <div className="text-[10px] leading-tight font-medium">
                      <div className="font-bold text-gray-900">100% Original</div>
                      <div className="text-gray-500 text-[9px]">Authentic Products</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trust Badges for Slide 4 (Rakhi) */}
              {slide.id === 4 && (
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2.5 pt-1.5 sm:pt-2 text-[#1f312c]">
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2 py-1 rounded-xl border border-[#a81c53]/25 shadow-2xs">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#a81c53]/40 flex items-center justify-center text-[#a81c53]">
                      <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#a81c53]" />
                    </div>
                    <div className="text-[9px] sm:text-[10px] leading-tight font-semibold text-[#153a32]">
                      <div>Premium</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2 py-1 rounded-xl border border-[#a81c53]/25 shadow-2xs">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#a81c53]/40 flex items-center justify-center text-[#a81c53]">
                      <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#a81c53]" />
                    </div>
                    <div className="text-[9px] sm:text-[10px] leading-tight font-semibold text-[#153a32]">
                      <div>Fast Delivery</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2 py-1 rounded-xl border border-[#a81c53]/25 shadow-2xs">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#a81c53]/40 flex items-center justify-center text-[#a81c53]">
                      <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#a81c53]" />
                    </div>
                    <div className="text-[9px] sm:text-[10px] leading-tight font-semibold text-[#153a32]">
                      <div>Secure</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/75 backdrop-blur-xs px-2 py-1 rounded-xl border border-[#a81c53]/25 shadow-2xs">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#a81c53]/40 flex items-center justify-center text-[#a81c53]">
                      <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#a81c53]" />
                    </div>
                    <div className="text-[9px] sm:text-[10px] leading-tight font-semibold text-[#153a32]">
                      <div>100% Trusted</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Hero Armchair Graphic & Offer Badge for Slide 1 (5 cols on mobile, 6 cols on md+) */}
            {slide.id === 1 && (
              <div className="col-span-5 sm:col-span-5 md:col-span-6 lg:col-span-6 flex items-end justify-end shrink-0 h-[180px] sm:h-[260px] md:h-[380px] lg:h-[460px] relative pointer-events-none select-none group/chair">
                {/* Multi-layer Ambient Backlight Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5100]/20 via-emerald-400/20 to-amber-300/15 rounded-full blur-2xl md:blur-3xl pointer-events-none" />

                {/* Hanging Pendant Ceiling Lamp */}
                <div className="hidden sm:flex absolute -top-4 sm:-top-6 md:-top-8 lg:-top-10 right-0 sm:right-2 md:right-4 lg:right-6 z-20 flex-col items-center pointer-events-none">
                  <div className="absolute top-[65px] md:top-[85px] w-16 h-16 bg-amber-300/35 rounded-full blur-lg pointer-events-none" />
                  <img
                    src={heroPendantLampImg}
                    alt="Modern Cyan Pendant Ceiling Lamp"
                    className="h-[110px] md:h-[165px] w-auto object-contain object-top drop-shadow-md"
                  />
                </div>

                {/* Exact Circular Offer Badge - Smaller & Shifted Right */}
                <div className="absolute top-10 sm:top-14 md:top-16 lg:top-20 left-[14%] sm:left-[16%] md:left-[18%] lg:left-[20%] z-30 pointer-events-none select-none">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] flex flex-col items-center justify-center border-[3px] border-white/95">
                    <span className="text-[7px] sm:text-[10px] md:text-[11px] lg:text-xs font-black tracking-wider text-gray-950 uppercase leading-none">
                      UP TO
                    </span>
                    <span className="text-sm sm:text-xl md:text-2xl lg:text-[32px] font-black text-[#ff5500] leading-none my-0.5 tracking-tight">
                      60%
                    </span>
                    <span className="text-[7px] sm:text-[10px] md:text-[11px] lg:text-xs font-black tracking-wider text-gray-950 uppercase leading-none">
                      OFF
                    </span>
                  </div>
                </div>

                {/* Modern Armchair PNG Image */}
                <img
                  src={heroArmchairSlide1Img}
                  alt="Modern Luxury Teal Armchair"
                  className="relative z-10 h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)]"
                />
              </div>
            )}

            {/* Right Hero Gear Showcase Graphic for Slide 2 */}
            {slide.id === 2 && (
              <div className="col-span-5 sm:col-span-5 md:col-span-6 lg:col-span-6 flex items-end justify-end shrink-0 h-[180px] sm:h-[260px] md:h-[380px] lg:h-[460px] relative pointer-events-none select-none group/gear">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-orange-400/15 to-emerald-600/10 rounded-full blur-2xl md:blur-3xl pointer-events-none" />

                {/* Hanging Pendant Dome Lamp - Lowered Position */}
                <div className="hidden sm:flex absolute -top-4 sm:-top-6 md:-top-8 lg:-top-10 right-2 md:right-8 z-20 flex-col items-center pointer-events-none">
                  <div className="absolute top-[80px] w-20 h-20 bg-amber-300/40 rounded-full blur-xl pointer-events-none" />
                  <img
                    src={heroPendantLampSlide2Img}
                    alt="Modern Copper Pendant Dome Ceiling Lamp"
                    className="h-[120px] sm:h-[145px] md:h-[175px] w-auto object-contain object-top drop-shadow-md"
                  />
                </div>

                {/* Circular Offer Badge */}
                <div className="absolute -top-1 -left-2 sm:top-2 sm:-left-3 md:top-6 md:-left-6 z-25 pointer-events-none select-none">
                  <div className="w-13 h-13 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center border-2 border-white/90">
                    <span className="text-[7px] sm:text-[9px] md:text-xs font-black tracking-widest text-gray-950 uppercase leading-none">
                      UP TO
                    </span>
                    <span className="text-sm sm:text-xl md:text-[28px] font-black text-[#ff5100] leading-none my-0.5 tracking-tight">
                      60%
                    </span>
                    <span className="text-[7px] sm:text-[9px] md:text-xs font-black tracking-widest text-gray-950 uppercase leading-none">
                      OFF
                    </span>
                  </div>
                </div>

                {/* Modern Gear Showcase PNG */}
                <img
                  src={heroGearSlide2Img}
                  alt="Modern Backpack, Smart Audio, Active Flask & Lifestyle Gear"
                  className="relative z-10 h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
                />
              </div>
            )}

            {/* Right Hero Fashion Showcase Graphic for Slide 3 */}
            {slide.id === 3 && (
              <div className="col-span-5 sm:col-span-5 md:col-span-6 lg:col-span-6 flex items-end justify-end shrink-0 h-[180px] sm:h-[260px] md:h-[390px] lg:h-[470px] relative pointer-events-none select-none group/fashion">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5100]/20 via-emerald-600/15 to-amber-400/15 rounded-full blur-2xl md:blur-3xl pointer-events-none" />

                {/* Modern Streetwear & Fashion Showcase PNG */}
                <img
                  src={heroFashionSlide3Img}
                  alt="Trending Streetwear, Hoodies, Iconic Cap & Sneakers"
                  className="relative z-10 h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.3)]"
                />
              </div>
            )}

            {/* Right Hero Rakhi Celebration Showcase Graphic & Hanging Brass Lamps for Slide 4 */}
            {slide.id === 4 && (
              <div className="col-span-5 sm:col-span-5 md:col-span-6 lg:col-span-6 flex items-end justify-end shrink-0 h-[180px] sm:h-[260px] md:h-[380px] lg:h-[460px] relative pointer-events-none select-none group/rakhi">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-pink-400/10 to-amber-200/15 rounded-full blur-2xl md:blur-3xl pointer-events-none" />

                {/* Hanging Brass Diya Lamps with Glowing Flames on Far Right Edge */}
                <div className="absolute -top-3 sm:-top-5 md:-top-7 lg:-top-8 -right-1 sm:-right-3 md:-right-5 lg:-right-6 z-25 flex flex-col items-center pointer-events-none select-none">
                  {/* Glowing flame flicker aura for upper lamp */}
                  <div className="absolute top-[38px] sm:top-[56px] md:top-[82px] left-[7px] sm:left-[11px] md:left-[16px] w-4 sm:w-6 md:w-9 h-4 sm:h-6 md:h-9 bg-amber-400/50 rounded-full blur-md animate-pulse" />
                  {/* Glowing flame flicker aura for lower lamp */}
                  <div className="absolute top-[72px] sm:top-[105px] md:top-[155px] right-[7px] sm:right-[11px] md:right-[16px] w-4 sm:w-6 md:w-9 h-4 sm:h-6 md:h-9 bg-amber-400/50 rounded-full blur-md animate-pulse" />
                  <img
                    src={rakhiHangingLampsImg}
                    alt="Festive Hanging Brass Diya Lamps"
                    className="h-[95px] sm:h-[135px] md:h-[195px] lg:h-[235px] w-auto object-contain object-top drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                  />
                </div>

                {/* Rakhi Festive Showcase PNG */}
                {/* Rakhi Festive Showcase */}
                <div className="relative h-full w-full flex items-end justify-end">

                  {/* Exact Circular Offer Badge */}
                  <div className="absolute top-12 sm:top-16 md:top-20 lg:top-24 -left-7 sm:-left-10 md:-left-13 lg:-left-16 z-30 pointer-events-none select-none">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-white shadow-[0_10px_28px_rgba(0,0,0,0.28)] flex flex-col items-center justify-center border-[3px] border-white/95">

                      <span className="text-[7px] sm:text-[10px] md:text-[11px] lg:text-xs font-black tracking-wider text-gray-950 uppercase leading-none">
                        UP TO
                      </span>

                      <span className="text-sm sm:text-xl md:text-2xl lg:text-[32px] font-black text-[#ff5500] leading-none my-0.5 tracking-tight">
                        60%
                      </span>

                      <span className="text-[7px] sm:text-[10px] md:text-[11px] lg:text-xs font-black tracking-wider text-gray-950 uppercase leading-none">
                        OFF
                      </span>

                    </div>
                  </div>

                  {/* Rakhi Festive Showcase PNG */}
                  <img
                    src={heroBanner4RakhiImg}
                    alt="Celebrate Rakhi & Raksha Bandhan with Love - Happy Rakhi Gift Box, Sweets, Chocolates, Diya & Rakhi"
                    className="relative z-10 h-full w-auto max-w-full object-contain object-right-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
                  />

                </div>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 sm:bottom-7 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((slide, idx) => (
          <button
            key={`dot-${slide.id}`}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentIndex ? 'w-3 h-3 bg-[#ff5100] shadow-sm' : 'w-2.5 h-2.5 bg-black/30 hover:bg-black/50'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
