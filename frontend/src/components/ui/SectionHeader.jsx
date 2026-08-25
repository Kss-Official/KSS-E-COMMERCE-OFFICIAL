import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

export default function SectionHeader({
  kicker,
  title,
  description,
  linkLabel,
  linkPage,
  align = 'left',
}) {
  const { navigateTo } = useNavigationContext();
  const alignCls = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 ${alignCls}`}>
      <div className={align === 'center' ? 'mx-auto text-center' : ''}>
        {kicker && (
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.18em] text-accent mb-1.5">
            {kicker}
          </span>
        )}
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-gray-500 font-medium mt-1.5 max-w-xl">{description}</p>
        )}
      </div>
      {linkLabel && linkPage && (
        <button
          onClick={() => navigateTo(linkPage)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:text-accent-600 transition-colors cursor-pointer group shrink-0"
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
