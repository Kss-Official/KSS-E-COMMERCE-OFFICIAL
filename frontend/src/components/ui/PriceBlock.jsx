import React from 'react';

const sizeClasses = {
  sm: 'text-[12px] sm:text-sm',
  md: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
};

export default function PriceBlock({ price, originalPrice, discount, size = 'md' }) {
  const fmt = (v) => '₹' + Number(v || 0).toLocaleString('en-IN');
  return (
    <div className="flex items-baseline gap-1 flex-wrap min-w-0 max-w-full overflow-hidden">
      <span className={`${sizeClasses[size]} font-extrabold text-ink tracking-tight shrink-0`}>
        {fmt(price)}
      </span>
      {originalPrice && Number(originalPrice) > Number(price) && (
        <span className={`${size === 'lg' ? 'text-xs' : 'text-[9px] sm:text-xs'} text-gray-400 line-through font-normal shrink-0`}>
          {fmt(originalPrice)}
        </span>
      )}
      {discount && (
        <span className={`${size === 'lg' ? 'text-xs' : 'text-[8px] sm:text-[10px]'} font-bold text-accent shrink-0`}>
          {discount}
        </span>
      )}
    </div>
  );
}
