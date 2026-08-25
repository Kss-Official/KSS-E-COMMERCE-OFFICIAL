import React from 'react';
import { Sparkles } from 'lucide-react';

const tones = {
  gold: 'bg-gold/15 text-gold border-gold/40',
  crimson: 'bg-crimson/15 text-red-200 border-crimson/40',
};

export default function FestiveBadge({ text, tone = 'gold' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-md ${tones[tone] || tones.gold}`}
    >
      <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
      {text}
      <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
    </span>
  );
}
