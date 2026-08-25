import React from 'react';

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
};

export default function PriceBlock({ price, originalPrice, discount, size = 'md' }) {
  const fmt = (v) => '₹' + Number(v).toLocaleString('en-IN');
  return (
    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span className={`${sizeClasses[size]} font-extrabold text-ink tracking-tight`}>
        {fmt(price)}
      </span>
      {originalPrice && Number(originalPrice) > Number(price) && (
        <span className={`${size === 'lg' ? 'text-sm' : 'text-xs'} text-gray-400 line-through font-normal`}>
          {fmt(originalPrice)}
        </span>
      )}
      {discount && (
        <span className={`${size === 'lg' ? 'text-xs' : 'text-[10px]'} font-bold text-accent`}>
          {discount}
        </span>
      )}
    </div>
  );
}
