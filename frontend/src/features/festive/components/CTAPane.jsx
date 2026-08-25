import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../../context/NavigationContext';
import { campaigns, activeCampaign } from '../campaigns';
import CountdownTimer from './CountdownTimer';

export default function CTAPane({ title, description }) {
  const { navigateTo } = useNavigationContext();
  const camp = campaigns[activeCampaign];
  const p = camp.palette;
  const isNight = p.bg === 'night';
  return (
    <div className={`relative overflow-hidden rounded-3xl text-white shadow-lift ${isNight ? 'bg-night' : 'bg-crimson'}`}>
      <div className="absolute -top-16 -right-10 w-80 h-80 bg-gold/20 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute -bottom-14 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center p-8 sm:p-12">
        <div className="space-y-5">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold">
            {camp.label}
          </span>
          <h3 className="font-display text-3xl sm:text-4xl font-black leading-tight tracking-tight">
            {title || camp.headline.join(' ')}
          </h3>
          <p className="text-sm text-white/85 max-w-md leading-relaxed">{description || camp.subtitle}</p>
          <CountdownTimer targetLabel={camp.countdownTo} light />
          <button
            onClick={() => navigateTo(camp.cta.page)}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-600 text-white font-bold text-sm px-7 py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            {camp.cta.label}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden md:flex justify-center">
          <img
            src={camp.bannerImage}
            alt={camp.ornament}
            className="max-h-[320px] w-auto object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
}
