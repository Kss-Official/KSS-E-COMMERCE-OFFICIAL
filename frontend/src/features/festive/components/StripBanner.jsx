import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigationContext } from '../../../context/NavigationContext';
import { campaigns, activeCampaign } from '../campaigns';
import FestiveBadge from './FestiveBadge';

export default function StripBanner({ compact = false }) {
  const { navigateTo } = useNavigationContext();
  const camp = campaigns[activeCampaign];
  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-lift ${compact ? 'px-6 py-5' : 'px-6 sm:px-10 py-8 sm:py-10'} text-white bg-gradient-to-r from-crimson-900 via-crimson to-crimson`}>
      <div className="absolute -top-10 right-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute -bottom-12 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <FestiveBadge text={camp.ornament} tone="gold" />
          <h3 className={`font-display font-extrabold tracking-tight ${compact ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
            {camp.headline[0]} <span className="text-gold">{camp.headline[2]}</span>
          </h3>
          <p className="text-sm text-white/85 max-w-xl">
            {camp.badge} on handpicked festive picks. {camp.subtitle}
          </p>
        </div>
        <button
          onClick={() => navigateTo(camp.cta.page)}
          className="inline-flex items-center gap-2 shrink-0 bg-white text-crimson-900 font-black text-sm px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {camp.cta.label}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
