import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../../context/NavigationContext';
import CountdownTimer from './CountdownTimer';
import FestiveBadge from './FestiveBadge';

function CampaignBackdrop({ campaign }) {
  const p = campaign.palette;
  const bgClass = p.bg === 'night' ? 'bg-night' : 'bg-crimson';
  return (
    <div className={`w-full h-full ${bgClass} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/50 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className={`absolute -bottom-10 right-10 w-80 h-80 ${p.glow2 === 'accent' ? 'bg-accent/20' : 'bg-amber-400/20'} rounded-full blur-3xl pointer-events-none animate-glow`} />
      <div className="absolute top-10 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}

export default function FestiveHero({ slides }) {
  const { navigateTo } = useNavigationContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 8000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const currentSlide = slides[currentIndex];

  // Determine background class
  const bgMap = {
    'brand-800': 'bg-brand-800',
    'brand-100': 'bg-brand-100',
    'brand-50': 'bg-brand-50',
    'crimson': 'bg-crimson',
    'night': 'bg-night',
  };
  const bgClass = bgMap[currentSlide.bgColor] || 'bg-brand-800';

  return (
    <div className={`relative w-full overflow-hidden min-h-[390px] md:min-h-[440px] select-none transition-colors duration-500 ${bgClass}`}>
      {/* Background layers */}
      {slides.map((slide, idx) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
        >
          {slide.image ? (
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover object-center select-none" />
          ) : slide.isCampaign ? (
            <CampaignBackdrop campaign={slide.campaign} />
          ) : null}
        </div>
      ))}

      {/* Nav arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous banner"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm shadow-md"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="relative w-full h-full px-8 sm:px-14 md:px-20 py-10 z-10 flex items-center justify-between min-h-[390px] md:min-h-[440px]">
        {slides.map((slide, idx) => {
          if (slide.isCampaign) {
            const camp = slide.campaign;
            return (
              <div
                key={`content-${slide.id}`}
                className={`w-full flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 ease-in-out ${
                  idx === currentIndex ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute pointer-events-none'
                }`}
              >
                <div className="max-w-xs sm:max-w-md md:max-w-xl space-y-4">
                  <FestiveBadge text={camp.ornament} tone="gold" />
                  <h1 className="text-3xl sm:text-5xl md:text-[50px] font-display font-black leading-[1.08] tracking-tight drop-shadow-sm text-white">
                    {camp.headline[0]}<br />
                    {camp.headline[1]}<br />
                    <span className="text-accent">{camp.headline[2]}</span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base font-normal max-w-md leading-relaxed text-white/90">
                    {camp.subtitle}
                  </p>
                  <div className="hidden sm:flex items-center gap-4 pt-1 text-white">
                    {camp.benefits.map((b) => {
                      const Icon = b.icon;
                      return (
                        <div key={b.title} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg border border-white/40 flex items-center justify-center text-white bg-black/25">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-[11px] leading-tight">
                            <div className="font-bold">{b.title}</div>
                            <div className="text-white/70 text-[10px]">{b.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => navigateTo(camp.cta.page)}
                      className="px-7 py-3 rounded-xl transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer bg-accent hover:bg-accent-600 text-white font-bold shadow-lg flex items-center gap-2"
                    >
                      <span>{camp.cta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center gap-5 shrink-0">
                  <CountdownTimer targetLabel={camp.countdownTo} light />
                  <div className="relative h-[260px] sm:h-[300px] md:h-[320px] max-w-[420px] pointer-events-none select-none group">
                    <div className="absolute inset-0 rounded-full blur-3xl pointer-events-none bg-gold/25 transform group-hover:scale-110 transition-transform duration-700" />
                    <img
                      src={camp.visual}
                      alt={camp.ornament}
                      className="relative z-10 h-full w-auto max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={`content-${slide.id}`}
              className={`w-full flex items-center justify-between transition-all duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute pointer-events-none'
              }`}
            >
              <div className="max-w-xs sm:max-w-md md:max-w-lg space-y-4">
                <h1 className={`text-3xl sm:text-5xl md:text-[52px] font-display font-bold leading-[1.08] tracking-tight drop-shadow-sm ${slide.titleColor}`}>
                  {slide.title}
                </h1>
                <p className={`text-xs sm:text-base md:text-lg font-normal max-w-md leading-relaxed ${slide.subtitleColor}`}>
                  {slide.subtitle}
                </p>
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
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((slide, idx) => (
          <button
            key={`dot-${slide.id}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex ? 'w-3 h-3 bg-accent shadow-sm' : 'w-2.5 h-2.5 bg-black/30 hover:bg-black/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
