import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

export default function Toast({ message, visible, type = 'success' }) {
  const Icon = type === 'success' ? CheckCircle2 : Info;
  const iconCls = type === 'success' ? 'text-brand-500' : 'text-gold';
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 bg-white rounded-2xl px-5 py-3.5 shadow-lift border border-gray-100 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Icon className={`w-5 h-5 ${iconCls}`} />
      <span className="text-sm font-bold text-ink">{message}</span>
    </div>
  );
}
