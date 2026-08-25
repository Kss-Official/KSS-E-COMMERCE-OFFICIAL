# BuyZo Customer Portal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign BuyZo's customer-facing storefront into a top-1% premium ecommerce experience — festive banner engine (Rakhi + Diwali), full design-token system, extracted shared components, purpose-driven every element.

**Architecture:** Tailwind v4 `@theme` token layer in `index.css` (no tailwind.config file — v4 uses CSS `@theme`). Campaign-driven festive banner engine under `src/features/festive/`. Shared UI primitives under `src/components/ui/`. Existing routing is a state machine (`NavigationContext.navigateTo(page, data)`); every `navigateTo` call site is preserved.

**Tech Stack:** Vite 5, React 18.3, Tailwind v4 (`@tailwindcss/vite`), `lucide-react`, Google Fonts (Rubik + Nunito Sans). No new runtime dependencies.

## Global Constraints

- All colors from the token layer only — **no raw hex in JSX**. Tokens: `brand-950` `#03201a`, `brand-800` `#063328`, `brand-700` `#0d5c46`, `brand-500` `#18a078`, `accent` `#ff5100`, `accent-600` `#e64900`, `gold` `#f4c430`, `crimson` `#c92a3e`, `night` `#1a1030`, `cream` `#faf7f2`, `ink` `#1f2937`
- Fonts: Rubik (headings) + Nunito Sans (body); minimum body 14px; line-height 1.5
- Icons: lucide-react only. **No emoji as icons, no unicode glyphs (☰ ✦ ❖ ✔)**
- Micro-interactions 150–300ms, `transform`/`opacity` only
- `prefers-reduced-motion` respected globally (media query in `index.css`)
- Touch targets ≥ 44px, 8px spacing rhythm
- All interactive elements have `cursor-pointer`
- Focus-visible rings on all interactive elements
- Text contrast ≥ 4.5:1 on light surfaces
- No horizontal scroll at 375px
- Every task ends with a successful `npm run build` + visual check
- Do NOT delete files; overwrite in place

---

## Phase 1 — Foundation

### Task 1: Design tokens, fonts, and global motion in `index.css`

**Files:**
- Modify: `frontend/src/index.css` (full replace)
- Modify: `frontend/index.html` (add font links)

**Interfaces:**
- Consumes: nothing
- Produces: Tailwind v4 `@theme` tokens (`--color-brand-700`, `--color-accent`, `--color-gold`, `--color-crimson`, `--color-night`, `--color-cream`, `--color-ink`), `--font-display`, `--font-sans`; keyframes `float`, `glow`, `shimmer`, `sparkle`, `fade-in-up`, `scale-in`, `marquee`

- [ ] **Step 1: Replace `frontend/src/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand-950: #03201a;
  --color-brand-900: #042d24;
  --color-brand-800: #063328;
  --color-brand-700: #0d5c46;
  --color-brand-600: #08493d;
  --color-brand-500: #18a078;
  --color-brand-100: #d1efe6;
  --color-brand-50: #e3f4f0;

  --color-accent: #ff5100;
  --color-accent-600: #e64900;
  --color-accent-500: #f95700;

  --color-gold: #f4c430;
  --color-gold-300: #fceec3;
  --color-crimson: #c92a3e;
  --color-crimson-700: #851829;
  --color-crimson-900: #4a0e17;
  --color-night: #1a1030;
  --color-night-800: #2a1d4a;
  --color-cream: #faf7f2;
  --color-ink: #1f2937;

  --font-display: "Rubik", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Nunito Sans", ui-sans-serif, system-ui, sans-serif;

  --shadow-lift: 0 12px 32px -8px rgb(3 32 26 / 0.18);
  --shadow-soft: 0 4px 16px -6px rgb(3 32 26 / 0.12);

  --animate-fade-in-up: fade-in-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-scale-in: scale-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  --animate-float: float 5s ease-in-out infinite;
  --animate-glow: glow 3.5s ease-in-out infinite;
  --animate-shimmer: shimmer 2.5s linear infinite;
  --animate-sparkle: sparkle 2.4s ease-in-out infinite;
  --animate-marquee: marquee 30s linear infinite;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}

@keyframes glow {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.08); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.2; transform: scale(0.7) rotate(0deg); }
  50%      { opacity: 1; transform: scale(1.15) rotate(20deg); }
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

html,
body,
#root {
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

img,
svg {
  max-width: 100%;
}

body {
  @apply bg-cream text-ink font-sans antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@media (max-width: 640px) {
  .max-w-7xl.mx-auto.px-6 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .portal-main {
    padding: 1rem;
  }
}
```

- [ ] **Step 2: Add Google Fonts to `frontend/index.html`**

Replace the `<head>` block so it reads:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&family=Rubik:wght@500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
  <title>BuyZo - Online Shopping</title>
</head>
```

- [ ] **Step 3: Verify build**

Run: `npm run build` in `frontend/`
Expected: build succeeds; CSS output contains `--color-brand-700`, `--font-display`, `@keyframes fade-in-up`

- [ ] **Step 4: Commit**

```bash
git add frontend/src/index.css frontend/index.html
git commit -m "feat: add design token system, fonts, and motion primitives"
```

---

### Task 2: Update app shell to token colors

**Files:**
- Modify: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: shell using `bg-cream` and `text-ink`

- [ ] **Step 1: Replace the shell wrapper class**

In `frontend/src/App.jsx`, change line 93 from:

```jsx
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col justify-between">
```

to:

```jsx
    <div className="min-h-screen bg-cream font-sans text-ink flex flex-col justify-between">
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "refactor: apply design tokens to app shell"
```

---

## Phase 2 — Shared UI Components

### Task 3: `PriceBlock` component

**Files:**
- Create: `frontend/src/components/ui/PriceBlock.jsx`

**Interfaces:**
- Consumes: none
- Produces: `PriceBlock({ price, originalPrice, discount, size = 'md' })` — renders rupee price with `toLocaleString('en-IN')`, strikethrough original, orange discount badge. Sizes: `sm` (text-sm), `md` (text-lg), `lg` (text-xl)

- [ ] **Step 1: Create component**

```jsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/PriceBlock.jsx
git commit -m "feat: add PriceBlock shared component"
```

---

### Task 4: `SectionHeader` component

**Files:**
- Create: `frontend/src/components/ui/SectionHeader.jsx`

**Interfaces:**
- Consumes: `useNavigationContext` for `navigateTo`
- Produces: `SectionHeader({ kicker, title, description, linkLabel, linkPage, align = 'left' })` — kicker (uppercase accent micro-label), title (Rubik display), optional description, optional View All link

- [ ] **Step 1: Create component**

```jsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/SectionHeader.jsx
git commit -m "feat: add SectionHeader shared component"
```

---

### Task 5: `Toast` component

**Files:**
- Create: `frontend/src/components/ui/Toast.jsx`

**Interfaces:**
- Consumes: none
- Produces: `Toast({ message, visible, type = 'success' })` — fixed bottom-right toast with `aria-live="polite"`, check/success icon, auto fade via opacity/translate transition

- [ ] **Step 1: Create component**

```jsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/Toast.jsx
git commit -m "feat: add Toast shared component"
```

---

### Task 6: `Breadcrumb` component

**Files:**
- Create: `frontend/src/components/ui/Breadcrumb.jsx`

**Interfaces:**
- Consumes: `useNavigationContext`
- Produces: `Breadcrumb({ items })` where `items` is `[{ label, page?, onClick? }]`. Last item is current (gray, non-clickable). Renders chevron separators.

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

export default function Breadcrumb({ items }) {
  const { navigateTo } = useNavigationContext();
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 flex-wrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        if (i === 0) {
          return (
            <span key={i} className="flex items-center gap-1.5">
              <button
                onClick={() => (item.page ? navigateTo(item.page) : item.onClick?.())}
                className="hover:text-brand-700 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            </span>
          );
        }
        return (
          <span key={i} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-ink font-bold">{item.label}</span>
            ) : (
              <button
                onClick={() => (item.page ? navigateTo(item.page) : item.onClick?.())}
                className="hover:text-brand-700 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          </span>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/Breadcrumb.jsx
git commit -m "feat: add Breadcrumb shared component"
```

---

### Task 7: `TrustBar` component

**Files:**
- Create: `frontend/src/components/ui/TrustBar.jsx`

**Interfaces:**
- Consumes: none
- Produces: `TrustBar({ features, variant = 'panel' })` — `features` default to Free Delivery / Easy Returns / Secure Payments / 24/7 Support. `variant='panel'` = white card overlapping hero; `variant='inline'` = plain row. Each feature: lucide icon + title + desc.

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const defaultFeatures = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7 days return policy' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% secure payments' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
];

export default function TrustBar({ features = defaultFeatures, variant = 'panel' }) {
  const wrap =
    variant === 'panel'
      ? 'mx-3 sm:mx-6 lg:mx-8 -mt-5 relative z-20 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 px-4 sm:px-8 py-4 sm:py-5 shadow-lift'
      : 'mx-3 sm:mx-6 lg:mx-8';
  return (
    <div className={wrap}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-3.5 ${
                i === 0 ? 'sm:pr-6' : i === features.length - 1 ? 'sm:pl-6' : 'sm:px-6'
              } py-2.5 sm:py-0`}
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <Icon className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="font-extrabold text-ink text-sm leading-tight tracking-tight">{f.title}</h4>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/TrustBar.jsx
git commit -m "feat: add TrustBar shared component"
```

---

### Task 8: `ProductCard` component (grid + list)

**Files:**
- Create: `frontend/src/components/ui/ProductCard.jsx`

**Interfaces:**
- Consumes: `useCartContext` (`addToCart`, `isWishlisted`, `toggleWishlist`), `useNavigationContext` (`navigateTo`), `PriceBlock`
- Produces: `ProductCard({ product, view = 'grid', badge })` — `product` shape: `{ id, name, image, price, originalPrice, discount, rating, reviewsCount, isNew }`. `view='grid'` renders the 4-col card; `view='list'` renders the horizontal list row. Adds optional badge override (defaults to `NEW` when `isNew`).

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCartContext } from '../../context/CartContext';
import { useNavigationContext } from '../../context/NavigationContext';
import PriceBlock from './PriceBlock';

export default function ProductCard({ product, view = 'grid', badge }) {
  const { addToCart, isWishlisted, toggleWishlist } = useCartContext();
  const { navigateTo } = useNavigationContext();
  const wished = isWishlisted(product.id);
  const showBadge = badge ?? (product.isNew ? 'NEW' : null);

  const open = () => navigateTo('product-detail', product);

  if (view === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-brand-700 p-3 shadow-soft hover:shadow-lift transition-all flex flex-col sm:flex-row items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div onClick={open} className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 p-2 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden">
            <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div>
            {showBadge && (
              <span className="inline-block bg-brand-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase mb-1">
                {showBadge}
              </span>
            )}
            <h4 onClick={open} className="text-sm font-bold text-ink group-hover:text-brand-700 cursor-pointer transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-gray-800 font-bold">{product.rating}</span>
              <span>({product.reviewsCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
          <div className="flex flex-col text-left sm:text-right">
            <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="md" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${wished ? 'fill-red-500 text-red-500' : 'stroke-[1.8]'}`} />
            </button>
            <button
              onClick={() => addToCart(product)}
              className="bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-200 hover:border-brand-700 shadow-soft hover:shadow-lift transition-all flex flex-col justify-between group relative">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="bg-brand-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
            {showBadge || 'NEW'}
          </span>
          <button
            onClick={() => toggleWishlist(product)}
            aria-label="Toggle wishlist"
            className="w-7 h-7 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Heart className={`w-3.5 h-3.5 ${wished ? 'fill-red-500 text-red-500' : 'stroke-[1.8]'}`} />
          </button>
        </div>

        <div onClick={open} className="w-full h-36 sm:h-40 flex items-center justify-center p-2 cursor-pointer overflow-hidden rounded-xl bg-gray-50/50 mb-2">
          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </div>

        <h4 onClick={open} className="text-xs font-bold text-ink group-hover:text-brand-700 line-clamp-1 cursor-pointer transition-colors">
          {product.name}
        </h4>

        <div className="mt-1.5">
          <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="sm" />
        </div>

        <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-semibold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-gray-800 font-bold">{product.rating}</span>
          <span>({product.reviewsCount})</span>
        </div>
      </div>

      <button
        onClick={() => addToCart(product)}
        className="w-full bg-brand-700 hover:bg-brand-800 text-white text-[11px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-2.5 shadow-soft cursor-pointer"
      >
        <ShoppingCart className="w-3 h-3" />
        <span>Add to Cart</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/ProductCard.jsx
git commit -m "feat: add ProductCard shared component"
```

---

### Task 9: `CategorySidebar` component

**Files:**
- Create: `frontend/src/components/ui/CategorySidebar.jsx`

**Interfaces:**
- Consumes: none (filters are controlled by parent via props)
- Produces: `CategorySidebar({ categories, activeCategory, onSelectCategory })` — list of categories with counts, active state `bg-brand-700 text-white`, lucide `ChevronRight` affordance

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function CategorySidebar({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
      <h3 className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-900 bg-brand-50/60 border-b border-gray-100">
        Categories
      </h3>
      <ul className="py-1.5">
        {categories.map((cat) => {
          const active = activeCategory === cat.name;
          return (
            <li key={cat.name}>
              <button
                onClick={() => onSelectCategory(cat.name)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-brand-700 text-white'
                    : 'text-gray-700 hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                <span>{cat.name}</span>
                {active ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <span className="text-xs text-gray-400 font-medium">{cat.count ?? ''}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/CategorySidebar.jsx
git commit -m "feat: add CategorySidebar shared component"
```

---

## Phase 3 — Festive Banner Engine

### Task 10: `campaigns.js` — campaign configs

**Files:**
- Create: `frontend/src/features/festive/campaigns.js`

**Interfaces:**
- Consumes: imported image assets
- Produces: `export const campaigns = { rakhi: {...}, diwali: {...} }` and `export const activeCampaign = 'rakhi'`. Each campaign:
  - `rakhi`: `{ id, label: 'Rakhi Special', ornament: 'SHUBH RAKSHABANDHAN', headline: ['More Love.', 'More Gifts.', 'More Savings.'], subtitle, cta: { label: 'Shop Rakhi Deals', page: 'deals' }, badge: 'UP TO 60% OFF', palette: { bg: 'crimson', glow1: 'gold', glow2: 'accent' }, visual: rakhiVisualImg, benefits: [{icon, title, desc}], discount }`
  - `diwali`: `{ id, label: 'Diwali Dhamaka', ornament: 'शुभ दीपावली', headline: ['Light Up Your', 'Festival of Lights'], subtitle, cta: { label: 'Shop Diwali Deals', page: 'deals' }, badge: 'FLAT 50% OFF', palette: { bg: 'night', glow1: 'gold', glow2: 'amber' }, visual: rakhiVisualImg (placeholder until real asset), benefits, discount }`

- [ ] **Step 1: Create campaigns.js**

```js
import { Gift, Shirt, Watch, Sparkles, Home } from 'lucide-react';
import rakhiVisualImg from '../../assets/rakhi_hero_visual.png';
import rakhiFullBanner from '../../assets/rakhi_full_banner.png';

export const activeCampaign = 'rakhi';

export const campaigns = {
  rakhi: {
    id: 'rakhi',
    label: 'RAKHI SPECIAL',
    ornament: 'SHUBH RAKSHABANDHAN',
    headline: ['More Love.', 'More Gifts.', 'More Savings.'],
    subtitle:
      'Celebrate the bond of love with special Rakhi deals on fashion & more!',
    cta: { label: 'Shop Rakhi Deals', page: 'deals' },
    badge: 'UP TO 60% OFF',
    palette: {
      bg: 'crimson',
      glow1: 'gold',
      glow2: 'accent',
      accentText: 'gold',
    },
    visual: rakhiVisualImg,
    bannerImage: rakhiFullBanner,
    benefits: [
      { icon: Gift, title: 'Rakhi Gifts', desc: 'For Every Bond' },
      { icon: Shirt, title: 'Fashion', desc: 'For Everyone' },
      { icon: Watch, title: 'Accessories', desc: 'For Every Style' },
    ],
    discount: '60%',
    countdownTo: 'Rakhi Sale Ends In',
  },
  diwali: {
    id: 'diwali',
    label: 'DIWALI DHAMAKA',
    ornament: 'शुभ दीपावली',
    headline: ['Light Up Your', 'Festival of Lights'],
    subtitle:
      'Diyas, décor, gifts & electronics — celebrate Diwali with sparkling savings.',
    cta: { label: 'Shop Diwali Deals', page: 'deals' },
    badge: 'FLAT 50% OFF',
    palette: {
      bg: 'night',
      glow1: 'gold',
      glow2: 'amber',
      accentText: 'gold',
    },
    visual: rakhiVisualImg,
    bannerImage: rakhiFullBanner,
    benefits: [
      { icon: Sparkles, title: 'Décor & Diyas', desc: 'Warm Celebrations' },
      { icon: Home, title: 'Home Makeover', desc: 'Festive Refresh' },
      { icon: Gift, title: 'Gifting', desc: 'For Everyone' },
    ],
    discount: '50%',
    countdownTo: 'Diwali Sale Ends In',
  },
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/festive/campaigns.js
git commit -m "feat: add festive campaign configs for Rakhi and Diwali"
```

---

### Task 11: `CountdownTimer` component

**Files:**
- Create: `frontend/src/features/festive/components/CountdownTimer.jsx`

**Interfaces:**
- Consumes: nothing
- Produces: `CountdownTimer({ targetLabel, targetDate, light = false })` — targetDate is a Date (defaults to a rolling 72h countdown). Renders `label` + 4 boxes (Days/Hours/Minutes/Seconds) using tabular-nums, tick updates every second.

- [ ] **Step 1: Create component**

```jsx
import React, { useState, useEffect } from 'react';

function getRemaining(target) {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [
    { label: 'Days', value: d },
    { label: 'Hours', value: h },
    { label: 'Mins', value: m },
    { label: 'Secs', value: s },
  ];
}

export default function CountdownTimer({ targetLabel = 'Sale Ends In', targetDate, light = false }) {
  const [target] = useState(() => targetDate || new Date(Date.now() + 72 * 3600000));
  const [units, setUnits] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setUnits(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const box = light
    ? 'bg-black/25 border-white/25 text-white'
    : 'bg-white border-gray-100 text-ink';
  const labelCls = light ? 'text-white/80' : 'text-gray-500';

  return (
    <div>
      <p className={`text-[10px] font-extrabold uppercase tracking-[0.16em] mb-2 ${labelCls}`}>
        {targetLabel}
      </p>
      <div className="flex items-center gap-2">
        {units.map((u) => (
          <div key={u.label} className="flex items-center gap-2">
            <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shadow-soft ${box}`}>
              <span className="text-lg font-extrabold tabular-nums leading-none">{u.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide opacity-70 mt-0.5">{u.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/festive/components/CountdownTimer.jsx
git commit -m "feat: add festive CountdownTimer component"
```

---

### Task 12: `FestiveBadge` component

**Files:**
- Create: `frontend/src/features/festive/components/FestiveBadge.jsx`

**Interfaces:**
- Consumes: none
- Produces: `FestiveBadge({ text, tone = 'gold' })` — ornamental pill with sparkle icons either side; tone `gold` (amber glow) or `crimson`.

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { Sparkles } from 'lucide-react';

const tones = {
  gold: 'bg-gold/15 text-gold border-gold/40',
  crimson: 'bg-crimson/15 text-red-200 border-crimson/40',
};

export default function FestiveBadge({ text, tone = 'gold' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-md ${tones[tone]}`}
    >
      <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
      {text}
      <Sparkles className="w-3.5 h-3.5 animate-sparkle" />
    </span>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/festive/components/FestiveBadge.jsx
git commit -m "feat: add FestiveBadge ornamental component"
```

---

### Task 13: `FestiveHero` component

**Files:**
- Create: `frontend/src/features/festive/components/FestiveHero.jsx`

**Interfaces:**
- Consumes: `campaigns` + `activeCampaign` (Task 10), `CountdownTimer` (Task 11), `FestiveBadge` (Task 12), `useNavigationContext`
- Produces: `FestiveHero({ slides })` — full-width hero carousel. Each slide: `{ id, title, subtitle, titleColor, subtitleColor, isDarkTheme, bgColor, primaryBtn, secondaryBtn, image, campaignId? }`. For campaign slides, renders layered premium backdrop (radial gradient, glow orbs, sparkles), `FestiveBadge`, `CountdownTimer` (light mode), benefit badges, and floating visual. Autoplay 8s, prev/next arrows, dot indicators. **All hardcoded `bg-[#...]` colors replaced with tokens.**

- [ ] **Step 1: Create the slides config and component**

Create `frontend/src/features/festive/HeroSlides.js`:

```js
import { ArrowRight } from 'lucide-react';
import heroHomePageImg from '../../assets/HerohomePage.png';
import heroHomePage2Img from '../../assets/HerohomePage2.png';
import heroHomePage3Img from '../../assets/HerohomePage3.png';
import { activeCampaign, campaigns } from './campaigns';

const camp = campaigns[activeCampaign];

const slides = [
  {
    id: 1,
    image: heroHomePageImg,
    alt: 'Discover, Shop, Save More - BuyZo',
    bgColor: 'brand-800',
    isDarkTheme: true,
    title: (
      <>
        Discover.
        <br />
        Shop. Save More.
      </>
    ),
    subtitle: (
      <>
        Top brands, best prices &amp;
        <br />
        exclusive offers on every purchase.
      </>
    ),
    titleColor: 'text-white',
    subtitleColor: 'text-white/95',
    primaryBtn: { label: 'Shop Now', page: 'electronics', className: 'bg-accent hover:bg-accent-600 text-white font-bold shadow-md' },
    secondaryBtn: { label: 'Explore Offers', page: 'deals', className: 'bg-white/20 hover:bg-white/30 text-white font-bold backdrop-blur-xs' },
  },
  {
    id: 2,
    image: heroHomePage2Img,
    alt: 'Everyday Gear & Accessories - BuyZo',
    bgColor: 'brand-100',
    isDarkTheme: false,
    title: (
      <>
        Everyday Gear.
        <br />
        Smart &amp; Modern.
      </>
    ),
    subtitle: (
      <>
        Premium backpacks, smart audio &amp;
        <br />
        active essentials for your lifestyle.
      </>
    ),
    titleColor: 'text-brand-900',
    subtitleColor: 'text-gray-600',
    primaryBtn: { label: 'Shop Collection', page: 'fashion', className: 'bg-accent hover:bg-accent-600 text-white font-bold shadow-md' },
    secondaryBtn: { label: 'Explore Offers', page: 'deals', className: 'bg-brand-900/10 hover:bg-brand-900/20 text-brand-900 font-bold backdrop-blur-xs' },
  },
  {
    id: 3,
    image: heroHomePage3Img,
    alt: 'Streetwear & Trending Fashion - BuyZo',
    bgColor: 'brand-50',
    isDarkTheme: false,
    title: (
      <>
        Style Redefined.
        <br />
        Fresh &amp; Iconic.
      </>
    ),
    subtitle: (
      <>
        Trending hoodies, signature kicks &amp;
        <br />
        streetwear essentials at unbeatable prices.
      </>
    ),
    titleColor: 'text-brand-900',
    subtitleColor: 'text-gray-600',
    primaryBtn: { label: 'Shop Fashion', page: 'fashion', className: 'bg-accent hover:bg-accent-600 text-white font-bold shadow-md' },
    secondaryBtn: { label: 'Explore Offers', page: 'deals', className: 'bg-brand-900/10 hover:bg-brand-900/20 text-brand-900 font-bold backdrop-blur-xs' },
  },
  {
    id: 4,
    alt: `${camp.label} - ${camp.ornament}`,
    bgColor: camp.palette.bg,
    isDarkTheme: true,
    isCampaign: true,
    campaign: camp,
  },
];

export default slides;
```

Then create `frontend/src/features/festive/components/FestiveHero.jsx`:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../../context/NavigationContext';
import CountdownTimer from './CountdownTimer';
import FestiveBadge from './FestiveBadge';

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

  const camp = slides[currentIndex].campaign;

  return (
    <div
      className={`relative w-full overflow-hidden min-h-[390px] md:min-h-[440px] flex items-center select-none transition-colors duration-500 bg-${slides[currentIndex].bgColor}`}
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          {slide.image ? (
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover object-center select-none" />
          ) : (
            <CampaignBackdrop campaign={camp} />
          )}
        </div>
      ))}

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

      <div className="relative w-full h-full px-8 sm:px-14 md:px-20 py-8 z-10 flex items-center justify-between pointer-events-none">
        {slides.map((slide, idx) => {
          if (slide.isCampaign) {
            return (
              <div
                key={`content-${slide.id}`}
                className={`w-full flex flex-col md:flex-row items-center justify-between gap-6 z-10 transition-all duration-700 ease-in-out pointer-events-auto ${
                  idx === currentIndex ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute pointer-events-none'
                }`}
              >
                <div className="max-w-xs sm:max-w-md md:max-w-xl space-y-4">
                  <FestiveBadge text={camp.ornament} tone={camp.palette.accentText === 'gold' ? 'gold' : 'crimson'} />
                  <h1 className="text-3xl sm:text-5xl md:text-[50px] font-display font-black leading-[1.08] tracking-tight drop-shadow-xs text-white">
                    {camp.headline[0]}
                    <br />
                    {camp.headline[1]}
                    <br />
                    <span className="text-accent">{camp.headline[2]}</span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base font-normal max-w-md leading-relaxed drop-shadow-xs text-white/90">
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
                      className="px-7 py-3 rounded-xl transition-all active:scale-[0.98] text-xs sm:text-sm cursor-pointer bg-accent hover:bg-accent-600 text-white font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2"
                    >
                      <span>{camp.cta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="hidden md:flex flex-col items-center gap-5 shrink-0">
                  <CountdownTimer targetLabel={camp.countdownTo} light />
                  <div className="relative h-[260px] sm:h-[300px] md:h-[320px] max-w-[420px] pointer-events-none select-none group">
                    <div className={`absolute inset-0 rounded-full blur-3xl pointer-events-none transform group-hover:scale-110 transition-transform duration-700 ${camp.palette.glow1 === 'gold' ? 'bg-gold/25' : 'bg-gold/25'}`} />
                    <img
                      src={camp.visual}
                      alt={camp.ornament}
                      className="relative z-10 h-full w-auto max-w-full object-contain object-right drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={`content-${slide.id}`}
              className={`w-full flex items-center justify-between z-10 transition-all duration-700 ease-in-out pointer-events-auto ${
                idx === currentIndex ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 absolute pointer-events-none'
              }`}
            >
              <div className="max-w-xs sm:max-w-md md:max-w-lg space-y-4">
                <h1 className={`text-3xl sm:text-5xl md:text-[52px] font-display font-bold leading-[1.08] tracking-tight drop-shadow-xs ${slide.titleColor}`}>
                  {slide.title}
                </h1>
                <p className={`text-xs sm:text-base md:text-lg font-normal max-w-md leading-relaxed drop-shadow-xs ${slide.subtitleColor}`}>
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

      <div className="absolute bottom-6 sm:bottom-7 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
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

function CampaignBackdrop({ campaign }) {
  const p = campaign.palette;
  return (
    <div className={`w-full h-full bg-${p.bg} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/50 pointer-events-none" />
      <div className={`absolute top-0 right-1/4 w-96 h-96 ${p.glow1 === 'gold' ? 'bg-gold/15' : 'bg-gold/15'} rounded-full blur-3xl pointer-events-none animate-glow`} />
      <div className={`absolute -bottom-10 right-10 w-80 h-80 ${p.glow2 === 'accent' ? 'bg-accent/20' : 'bg-amber-400/20'} rounded-full blur-3xl pointer-events-none animate-glow`} />
      <div className="absolute top-10 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="absolute top-8 left-1/4 text-gold text-sm animate-sparkle pointer-events-none">✦</div>
      <div className="absolute top-20 right-1/3 text-gold-300 text-xs animate-sparkle pointer-events-none">✦</div>
      <div className="absolute bottom-16 left-1/2 text-orange-400 text-xs animate-sparkle pointer-events-none">✦</div>
      <div className="absolute top-12 right-16 text-gold text-lg animate-sparkle pointer-events-none">✦</div>
    </div>
  );
}
```

> **Note:** In `index.css`, `@theme` defines the palette; Tailwind v4 scans source for class names, so dynamic classes like `bg-crimson` / `bg-night` inside the config must be enumerated. Add this to `index.css` (at the end) so the token-based background classes exist:

```css
.bg-crimson { background-color: var(--color-crimson); }
.bg-night { background-color: var(--color-night); }
.bg-brand-100 { background-color: var(--color-brand-100); }
.bg-brand-50 { background-color: var(--color-brand-50); }
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/festive/components/FestiveHero.jsx frontend/src/features/festive/HeroSlides.js frontend/src/index.css
git commit -m "feat: add FestiveHero carousel with campaign-driven Rakhi/Diwali slides"
```

---

### Task 14: `StripBanner` component

**Files:**
- Create: `frontend/src/features/festive/components/StripBanner.jsx`

**Interfaces:**
- Consumes: `campaigns[activeCampaign]`, `useNavigationContext`
- Produces: `StripBanner({ compact = false })` — horizontal gradient strip with campaign label, short headline, offer chips, single CTA. Full-width variant used on category pages.

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigationContext } from '../../../context/NavigationContext';
import { campaigns, activeCampaign } from '../campaigns';
import FestiveBadge from './FestiveBadge';

export default function StripBanner({ compact = false }) {
  const { navigateTo } = useNavigationContext();
  const camp = campaigns[activeCampaign];
  const p = camp.palette;
  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-lift ${compact ? 'px-6 py-5' : 'px-6 sm:px-10 py-8 sm:py-10'} text-white bg-gradient-to-r from-crimson-900 via-crimson to-crimson`}>
      <div className="absolute -top-10 right-10 w-72 h-72 bg-gold/20 rounded-full blur-3xl pointer-events-none animate-glow" />
      <div className="absolute -bottom-12 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-6 right-1/4 text-gold animate-sparkle pointer-events-none">✦</div>
      <div className="absolute bottom-8 right-16 text-gold-300 animate-sparkle pointer-events-none">✦</div>

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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/festive/components/StripBanner.jsx
git commit -m "feat: add festive StripBanner component"
```

---

### Task 15: `CTAPane` component

**Files:**
- Create: `frontend/src/features/festive/components/CTAPane.jsx`

**Interfaces:**
- Consumes: `campaigns[activeCampaign]`, `CountdownTimer`, `useNavigationContext`
- Produces: `CTAPane({ title, description })` — split layout: copy + countdown + CTA on left, product visual on right. Used on Deals/BestSellers pages.

- [ ] **Step 1: Create component**

```jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigationContext } from '../../../context/NavigationContext';
import { campaigns, activeCampaign } from '../campaigns';
import CountdownTimer from './CountdownTimer';

export default function CTAPane({ title, description }) {
  const { navigateTo } = useNavigationContext();
  const camp = campaigns[activeCampaign];
  const p = camp.palette;
  return (
    <div className={`relative overflow-hidden rounded-3xl text-white shadow-lift bg-gradient-to-br from-${p.bg === 'night' ? 'night-800' : 'crimson-900'} via-${p.bg === 'night' ? 'night' : 'crimson-700'} to-${p.bg === 'night' ? 'night' : 'crimson'}`}>
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/festive/components/CTAPane.jsx
git commit -m "feat: add festive CTAPane component"
```

---

## Phase 4 — Layout

### Task 16: `TopAnnouncement` — token + icon cleanup

**Files:**
- Modify: `frontend/src/components/layout/TopAnnouncement.jsx`

**Interfaces:**
- Consumes: `useNavigationContext`
- Produces: token-based announcement strip; emoji portal buttons replaced with lucide icons

- [ ] **Step 1: Replace emoji with lucide icons + token colors**

Replace the whole file body so portal buttons use `Settings2`, `Bike`, `Warehouse` lucide icons and `bg-brand-800` for the strip:

```jsx
import React from 'react';
import { Settings2, Bike, Warehouse, Truck } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';

export default function TopAnnouncement() {
  const { navigateTo } = useNavigationContext();

  const portals = [
    { label: 'Admin', page: 'admin', icon: Settings2, cls: 'text-accent' },
    { label: 'Delivery', page: 'delivery-agent', icon: Bike, cls: 'text-brand-500' },
    { label: 'Warehouse', page: 'warehouse', icon: Warehouse, cls: 'text-gold' },
  ];

  return (
    <div className="bg-brand-800 text-white text-xs py-2 px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2 overflow-hidden">
      <div className="flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 text-center">
        <span className="inline-flex items-center gap-1.5 font-semibold text-white/90">
          <Truck className="w-3.5 h-3.5 text-gold" />
          Free Delivery on orders above ₹499
        </span>
        <span className="text-white/30 hidden md:inline">|</span>
        <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg border border-white/10">
          {portals.map((p, i) => {
            const Icon = p.icon;
            return (
              <span key={p.page} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/40">|</span>}
                <button
                  onClick={() => navigateTo(p.page)}
                  className={`font-extrabold hover:underline px-1.5 py-0.5 rounded cursor-pointer inline-flex items-center gap-1 ${p.cls}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center flex-wrap gap-x-3 text-white/90">
        <a href="#download" className="text-gold hover:underline">Download App</a>
        <span className="text-white/30">|</span>
        <a href="#track" className="text-gold hover:underline">Track Order</a>
        <span className="text-white/30">|</span>
        <a href="#help" className="text-gold hover:underline">Help Center</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/TopAnnouncement.jsx
git commit -m "refactor: tokenize TopAnnouncement, replace emoji icons"
```

---

### Task 17: Header + Navbar token cleanup

**Files:**
- Modify: `frontend/src/components/layout/Header.jsx`
- Modify: `frontend/src/components/layout/Navbar.jsx`

**Interfaces:**
- Consumes: existing behavior unchanged
- Produces: all raw hex replaced with tokens. **Mechanical find/replace**, no layout changes. Use `replaceAll` in the editor.

- [ ] **Step 1: Token replace in Header.jsx**

Replace all occurrences (exact string matches):
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`
- `text-[#ff5100]` → `text-accent`
- `bg-[#f95700]` → `bg-accent-500`
- `text-[#1b4d3e]` → `text-brand-700`
- `hover:bg-emerald-50` → `hover:bg-brand-50`
- `text-[#0d5c46]` → `text-brand-700`
- `focus:border-[#ff5100]` → `focus:border-accent`

- [ ] **Step 2: Token replace in Navbar.jsx**

Replace all occurrences:
- `bg-[#063328]` → `bg-brand-800`
- `bg-[#04241c]` → `bg-brand-900`
- `text-[#ff5100]` → `text-accent`
- `border-[#ff5100]` → `border-accent`
- `hover:bg-emerald-50` → `hover:bg-brand-50`
- `bg-[#0d5c46]` → `bg-brand-700`
- `text-[#0d5c46]` → `text-brand-700`
- `bg-amber-50/40` → `bg-gold/10`

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/Header.jsx frontend/src/components/layout/Navbar.jsx
git commit -m "refactor: tokenize Header and Navbar"
```

---

### Task 18: Footer token cleanup

**Files:**
- Modify: `frontend/src/components/layout/Footer.jsx`

**Interfaces:**
- Consumes: existing structure
- Produces: tokens replacing raw hex (`bg-[#003d32]` → `bg-brand-900`, `text-[#00b894]` → `text-brand-500`)

- [ ] **Step 1: Token replace**

Replace:
- `bg-[#003d32]` → `bg-brand-900`
- `text-[#00b894]` → `text-brand-500`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/Footer.jsx
git commit -m "refactor: tokenize Footer"
```

---

## Phase 5 — Home Page

### Task 19: Rebuild `HomePage.jsx`

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`
- Create: `frontend/src/features/home/HomeSections.jsx` (deals band + brand band + newsletter)

**Interfaces:**
- Consumes: `FestiveHero` + `HeroSlides` (Task 13), `TrustBar` (Task 7), `TopCategories` (existing), `NewArrivalsPage` (existing), `SectionHeader` (Task 4), `PriceBlock` (Task 3), `useCartContext`, `useNavigationContext`
- Produces: premium home page composition with festival-driven hero

- [ ] **Step 1: Create `HomeSections.jsx`**

```jsx
import React from 'react';
import { Zap, ShieldCheck, BadgeCheck, Truck, Star, Sparkles, Mail } from 'lucide-react';
import { useNavigationContext } from '../../context/NavigationContext';
import SectionHeader from '../../components/ui/SectionHeader';
import PriceBlock from '../../components/ui/PriceBlock';
import productImgs from '../../assets/images/deals_hero.jpg';

const deals = [
  { id: 'd1', name: 'boAt Rockerz 450', image: productImgs, price: 1499, originalPrice: 2499, discount: '40% OFF' },
  { id: 'd2', name: 'Noise ColorFit Pro 5', image: productImgs, price: 2999, originalPrice: 4999, discount: '40% OFF' },
  { id: 'd3', name: 'Sony WH-CH510', image: productImgs, price: 2499, originalPrice: 3990, discount: '37% OFF' },
  { id: 'd4', name: 'JBL Flip Essential 2', image: productImgs, price: 4499, originalPrice: 6999, discount: '35% OFF' },
];

export function TrendingDealsBand() {
  return (
    <section className="mx-4 my-10 sm:mx-6 lg:mx-8">
      <SectionHeader
        kicker="Lightning Deals"
        title="Trending Deals"
        description="Grab today's hottest picks before they sell out."
        linkLabel="View All Deals"
        linkPage="deals"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {deals.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-lift transition-all p-4 group cursor-pointer">
            <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-xl mb-3 overflow-hidden">
              <img src={d.image} alt={d.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" />
            </div>
            <h4 className="text-xs font-bold text-ink line-clamp-1">{d.name}</h4>
            <div className="mt-1.5">
              <PriceBlock price={d.price} originalPrice={d.originalPrice} discount={d.discount} size="sm" />
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-crimson bg-crimson/10 px-2 py-0.5 rounded-full">
              <Zap className="w-3 h-3" /> Deal of the Day
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const brandValues = [
  { icon: Truck, title: 'Superfast Delivery', desc: 'Same-day in metros' },
  { icon: ShieldCheck, title: 'Buyer Protection', desc: '100% genuine products' },
  { icon: BadgeCheck, title: 'Top Brands', desc: 'Authorized sellers only' },
  { icon: Star, title: '4.5+ Avg Rating', desc: 'Loved by 2M+ shoppers' },
];

export function BrandValueBand() {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 my-10">
      <div className="bg-brand-900 rounded-3xl px-6 sm:px-10 py-8 sm:py-10 text-white relative overflow-hidden">
        <div className="absolute -top-12 -right-8 w-64 h-64 bg-gold/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {brandValues.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/10 text-gold flex items-center justify-center shrink-0">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">{v.title}</h4>
                  <p className="text-xs text-white/70 font-medium">{v.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function NewsletterBand() {
  return (
    <section className="mx-4 sm:mx-6 lg:mx-8 my-10">
      <div className="bg-gradient-to-r from-accent to-accent-600 rounded-3xl px-6 sm:px-12 py-8 sm:py-10 text-white relative overflow-hidden">
        <div className="absolute top-4 right-10 text-white/30 animate-sparkle pointer-events-none">✦</div>
        <div className="absolute bottom-6 right-24 text-white/20 animate-sparkle pointer-events-none">✦</div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 items-center justify-center shrink-0">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-tight">Get Festival Alerts & Offers</h3>
              <p className="text-sm text-white/85 font-medium">Be first to know about Rakhi, Diwali & mega-sale drops.</p>
            </div>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full md:w-auto gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white text-ink text-sm font-medium outline-none focus:ring-2 focus:ring-white/60"
            />
            <button
              type="submit"
              className="bg-brand-900 hover:bg-brand-800 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace `HomePage.jsx`**

```jsx
import React from 'react';
import FestiveHero from '../features/festive/components/FestiveHero';
import HeroSlides from '../features/festive/HeroSlides';
import TrustBar from '../components/ui/TrustBar';
import TopCategories from '../features/home/TopCategories';
import NewArrivalsPage from './NewArrivalsPage';
import { TrendingDealsBand, BrandValueBand, NewsletterBand } from '../features/home/HomeSections';

export default function HomePage() {
  return (
    <main className="w-full max-w-none mx-0 pb-6">
      <FestiveHero slides={HeroSlides} />
      <TrustBar variant="panel" />
      <div className="space-y-4 pt-8">
        <TopCategories />
        <TrendingDealsBand />
        <div className="pt-2">
          <NewArrivalsPage />
        </div>
        <BrandValueBand />
        <NewsletterBand />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HomePage.jsx frontend/src/features/home/HomeSections.jsx
git commit -m "feat: rebuild home page with festive hero and premium sections"
```

---

### Task 20: Rebuild `TopCategories.jsx` with tokens

**Files:**
- Modify: `frontend/src/features/home/TopCategories.jsx`

**Interfaces:**
- Consumes: existing SVG assets + `useNavigationContext`
- Produces: tokenized category grid, `SectionHeader`, real category targets (not all → electronics)

- [ ] **Step 1: Replace TopCategories.jsx**

```jsx
import React from 'react';
import { useNavigationContext } from '../../context/NavigationContext';
import SectionHeader from '../../components/ui/SectionHeader';
import mobileSvg from '../../assets/category/categoryMobile.svg';
import electronicsSvg from '../../assets/category/categoryElectronics.svg';
import fashionSvg from '../../assets/category/categoryFashion.svg';
import chairsSvg from '../../assets/category/categoryChairs.svg';
import beautySvg from '../../assets/category/categoryBeauty.svg';
import shoesSvg from '../../assets/category/categoryShoes.svg';

const categories = [
  { name: 'Mobiles', svg: mobileSvg, page: 'electronics' },
  { name: 'Electronics', svg: electronicsSvg, page: 'electronics' },
  { name: 'Fashion', svg: fashionSvg, page: 'fashion' },
  { name: 'Home & Furniture', svg: chairsSvg, page: 'home-kitchen' },
  { name: 'Beauty', svg: beautySvg, page: 'beauty' },
  { name: 'Footwear', svg: shoesSvg, page: 'shop' },
];

export default function TopCategories() {
  const { navigateTo } = useNavigationContext();

  return (
    <section className="mx-4 my-8 sm:mx-6 lg:mx-8">
      <SectionHeader
        kicker="Browse by Category"
        title="Top Categories"
        linkLabel="View All"
        linkPage="shop"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            onClick={() => navigateTo(cat.page)}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center hover:shadow-lift cursor-pointer transition-all duration-200 active:scale-95 group shadow-soft"
          >
            <div className="w-20 h-20 bg-brand-50 rounded-2xl mb-3 flex items-center justify-center p-2.5 overflow-hidden border border-brand-100 group-hover:scale-105 transition-transform duration-300">
              <img src={cat.svg} alt={cat.name} className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-ink text-center group-hover:text-brand-700 transition-colors leading-tight">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/home/TopCategories.jsx
git commit -m "refactor: tokenize TopCategories with proper category targets"
```

---

## Phase 6 — Shop & Product Detail

### Task 21: Add hero + tokens to `ShopPage.jsx`

**Files:**
- Modify: `frontend/src/pages/ShopPage.jsx`

**Interfaces:**
- Consumes: `shop_banner_hero.jpg` (dead import — resurrect it), `useNavigationContext`
- Produces: shop page with a real hero banner using the asset, token colors

- [ ] **Step 1: Inspect current imports and top-of-page JSX**

Read `frontend/src/pages/ShopPage.jsx` lines 1–60 to confirm `shopBannerHeroImg` is imported but unused.

- [ ] **Step 2: Add hero section at top of the main content**

Immediately inside the page root `<main>`/container, before the grid layout, insert:

```jsx
<div className="relative overflow-hidden rounded-3xl bg-brand-800 text-white px-6 sm:px-10 py-8 sm:py-12 mb-6">
  <div className="absolute -top-10 right-1/4 w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none animate-glow" />
  <div className="absolute -bottom-12 left-10 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
    <div className="space-y-3">
      <span className="inline-block text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold">
        Explore the Store
      </span>
      <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight">
        Everything You Love,
        <br />
        <span className="text-accent">One Cart Away.</span>
      </h1>
      <p className="text-sm text-white/85 font-medium max-w-md">
        Shop 2,560+ products across mobiles, fashion, home & more — with exclusive offers.
      </p>
    </div>
    <img
      src={shopBannerHeroImg}
      alt="Shop at BuyZo"
      className="hidden md:block max-h-[220px] w-auto object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.45)]"
    />
  </div>
</div>
```

- [ ] **Step 3: Token replace remaining raw hex in ShopPage**

Replace all:
- `bg-[#063328]` → `bg-brand-800`
- `hover:bg-[#084839]` → `hover:bg-brand-700`
- `text-[#ff5100]` → `text-accent`
- `hover:border-[#063328]` → `hover:border-brand-700`
- `bg-[#08493d]` → `bg-brand-700`
- `hover:bg-[#063328]` → `hover:bg-brand-800`

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ShopPage.jsx
git commit -m "feat: add hero banner and tokens to Shop page"
```

---

### Task 22: Product Detail page polish

**Files:**
- Modify: `frontend/src/pages/ProductDetailPage.jsx`

**Interfaces:**
- Consumes: existing logic; add sticky add-to-cart, `PriceBlock`, `TrustBar` (inline)
- Produces: tokenized product detail with sticky CTA bar on mobile scroll

- [ ] **Step 1: Token replace**

Replace:
- `bg-[#0d5c46]` → `bg-brand-700`
- `hover:bg-[#094736]` → `hover:bg-brand-800`
- `text-[#0d5c46]` → `text-brand-700`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`
- `text-[#ff5100]` → `text-accent`
- `bg-amber-50/70` → `bg-gold/10`
- `border-amber-200/90` → `border-gold/30`

- [ ] **Step 2: Add mobile sticky add-to-cart bar**

At the end of the page root, before closing tag, add a fixed bottom bar visible only on small screens (`md:hidden`) that shows price + Add to Cart. Wrap the existing Add to Cart handler in a named handler if not already named (check the file; if the button is inline `onClick`, extract it).

```jsx
<div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
  <div>
    <PriceBlock price={product.price} originalPrice={product.originalPrice} discount={product.discount} size="md" />
  </div>
  <button
    onClick={handleAddToCart}
    className="bg-accent hover:bg-accent-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
  >
    <ShoppingCart className="w-4 h-4" />
    Add to Cart
  </button>
</div>
```

Import `PriceBlock` and `ShoppingCart` as needed. Add `pb-20 md:pb-6` to the page root so the fixed bar never covers content.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/ProductDetailPage.jsx
git commit -m "feat: polish Product Detail page with tokens and sticky add-to-cart"
```

---

## Phase 7 — Cart & Checkout

### Task 23: Cart page polish

**Files:**
- Modify: `frontend/src/pages/CartPage.jsx`

**Interfaces:**
- Consumes: `useCartContext`, `PriceBlock`
- Produces: tokenized cart, festive coupon hint, sticky summary card

- [ ] **Step 1: Inspect current CartPage.jsx**

Read the file; confirm structure (items list + summary).

- [ ] **Step 2: Token replace**

Replace:
- `bg-[#08493d]` → `bg-brand-700`
- `hover:bg-[#063328]` → `hover:bg-brand-800`
- `text-[#ff5100]` → `text-accent`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`

- [ ] **Step 3: Add festive coupon hint to summary**

Inside the summary card, above the totals, insert:

```jsx
<div className="bg-gold/10 border border-gold/30 rounded-xl px-3.5 py-3 flex items-center gap-2.5">
  <Sparkles className="w-4 h-4 text-gold shrink-0" />
  <p className="text-xs font-semibold text-brand-800">
    Rakhi Coupon <span className="font-black text-accent">RAKHI60</span> — up to 60% off at checkout
  </p>
</div>
```

Import `Sparkles` from lucide-react.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/CartPage.jsx
git commit -m "feat: polish Cart page with tokens and festive coupon hint"
```

---

### Task 24: Checkout page polish

**Files:**
- Modify: `frontend/src/pages/CheckoutPage.jsx`

**Interfaces:**
- Consumes: existing logic
- Produces: tokenized checkout, trust signals, sticky summary

- [ ] **Step 1: Token replace**

Replace:
- `bg-[#08493d]` → `bg-brand-700`
- `hover:bg-[#063328]` → `hover:bg-brand-800`
- `text-[#ff5100]` → `text-accent`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`

- [ ] **Step 2: Add trust strip above the Place Order button**

Insert a `TrustBar variant="inline"` (from `../../components/ui/TrustBar`) just above the order summary or confirmation section, and add `pb-16 md:pb-6` to the page root to clear any fixed footer.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/CheckoutPage.jsx
git commit -m "feat: polish Checkout page with tokens and trust signals"
```

---

## Phase 8 — Category & Listing Pages

### Task 25: Category pages — add StripBanner

**Files:**
- Modify: `frontend/src/pages/ElectronicsPage.jsx`
- Modify: `frontend/src/pages/FashionPage.jsx`
- Modify: `frontend/src/pages/BeautyPage.jsx`
- Modify: `frontend/src/pages/HomeKitchenPage.jsx`

**Interfaces:**
- Consumes: `StripBanner` (Task 14)
- Produces: each category page topped with a festive strip banner

- [ ] **Step 1: Inspect one category page**

Read `frontend/src/pages/ElectronicsPage.jsx` (first 60 lines) to find the page root element.

- [ ] **Step 2: Insert StripBanner**

In each of the 4 category pages, at the top of the page root (after `<main>`/container opens), insert:

```jsx
<div className="mb-6">
  <StripBanner compact />
</div>
```

and add import:

```jsx
import StripBanner from '../features/festive/components/StripBanner';
```

- [ ] **Step 3: Token replace across the 4 files**

Replace:
- `bg-[#063328]` → `bg-brand-800`
- `bg-[#08493d]` → `bg-brand-700`
- `hover:bg-[#063328]` → `hover:bg-brand-800`
- `hover:bg-[#084839]` → `hover:bg-brand-700`
- `text-[#ff5100]` → `text-accent`
- `hover:border-[#063328]` → `hover:border-brand-700`

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ElectronicsPage.jsx frontend/src/pages/FashionPage.jsx frontend/src/pages/BeautyPage.jsx frontend/src/pages/HomeKitchenPage.jsx
git commit -m "feat: add festive strip banners to category pages and tokenize"
```

---

### Task 26: Deals / BestSellers / NewArrivals — CTAPane + tokens

**Files:**
- Modify: `frontend/src/pages/DealsPage.jsx`
- Modify: `frontend/src/pages/BestSellersPage.jsx`
- Modify: `frontend/src/pages/NewArrivalsPage.jsx`

**Interfaces:**
- Consumes: `CTAPane` (Task 15), `ProductCard` (Task 8), `Breadcrumb` (Task 6)
- Produces: deals pages with countdown CTA pane and tokenized product grids

- [ ] **Step 1: Insert CTAPane in DealsPage and BestSellersPage**

At the top of each page root, insert:

```jsx
<div className="mb-6">
  <CTAPane />
</div>
```

with import `import CTAPane from '../features/festive/components/CTAPane';`

- [ ] **Step 2: Token replace in the 3 files**

Replace:
- `bg-[#08493d]` → `bg-brand-700`
- `hover:bg-[#063328]` → `hover:bg-brand-800`
- `text-[#08493d]` → `text-brand-700`
- `text-[#ff5100]` → `text-accent`
- `hover:border-[#063328]` → `hover:border-brand-700`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/DealsPage.jsx frontend/src/pages/BestSellersPage.jsx frontend/src/pages/NewArrivalsPage.jsx
git commit -m "feat: add CTAPane to deals pages and tokenize listing pages"
```

---

## Phase 9 — Login, Contact, and Remaining Pages

### Task 27: Login page premium split layout

**Files:**
- Modify: `frontend/src/pages/LoginPage.jsx`

**Interfaces:**
- Consumes: existing auth logic
- Produces: split-screen layout — left brand panel (gradient + festive visual + trust points), right login form; token colors

- [ ] **Step 1: Inspect LoginPage.jsx**

Read the first 80 lines to understand the current form structure and state handlers.

- [ ] **Step 2: Token replace**

Replace:
- `bg-[#063328]` → `bg-brand-800`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`
- `text-[#ff5100]` → `text-accent`
- `bg-[#08493d]` → `bg-brand-700`

- [ ] **Step 3: Add split-screen premium structure**

Wrap the existing form card in a two-column layout: left column (hidden on mobile) `bg-brand-900` panel with the existing `login_shopping_bag.png` asset, a headline, and 3 trust bullets; right column keeps the existing form. Preserve all handlers and state.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/LoginPage.jsx
git commit -m "feat: premium split-screen Login page with brand panel"
```

---

### Task 28: Contact page polish

**Files:**
- Modify: `frontend/src/pages/ContactPage.jsx`

**Interfaces:**
- Consumes: existing structure
- Produces: hero header (using existing `contact_hero.jpg` asset) + tokenized form

- [ ] **Step 1: Token replace**

Replace:
- `bg-[#063328]` → `bg-brand-800`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`
- `text-[#ff5100]` → `text-accent`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/ContactPage.jsx
git commit -m "refactor: tokenize Contact page"
```

---

### Task 29: Wishlist / Orders / OrderConfirmed token cleanup

**Files:**
- Modify: `frontend/src/pages/WishlistPage.jsx`
- Modify: `frontend/src/pages/OrdersPage.jsx`
- Modify: `frontend/src/pages/OrderConfirmedPage.jsx`

**Interfaces:**
- Consumes: existing logic
- Produces: token-consistent pages

- [ ] **Step 1: Token replace in all three files**

Replace:
- `bg-[#08493d]` → `bg-brand-700`
- `hover:bg-[#063328]` → `hover:bg-brand-800`
- `text-[#08493d]` → `text-brand-700`
- `text-[#ff5100]` → `text-accent`
- `bg-[#ff5100]` → `bg-accent`
- `hover:bg-[#e64900]` → `hover:bg-accent-600`
- `hover:border-[#063328]` → `hover:border-brand-700`

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/WishlistPage.jsx frontend/src/pages/OrdersPage.jsx frontend/src/pages/OrderConfirmedPage.jsx
git commit -m "refactor: tokenize Wishlist, Orders, and OrderConfirmed pages"
```

---

## Phase 10 — Final Verification

### Task 30: Full audit pass

**Files:**
- Global: search all of `frontend/src`

**Interfaces:**
- Consumes: everything

- [ ] **Step 1: Grep for remaining raw hex**

Run: `rg -n "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}\b" frontend/src --glob '!assets/**'`
Expected: no remaining raw hex in JSX/CSS (assets and the custom `.bg-*` helpers in `index.css` are fine; token values themselves are in `index.css` `@theme` and are acceptable)

- [ ] **Step 2: Grep for emoji-as-icon leftovers**

Run: `rg -n "🚚|⚙️|🛵|🏢|✦|❖|☰|✔" frontend/src`
Expected: only acceptable if inside the `CampaignBackdrop` decorative sparkles (`✦`) in `FestiveHero.jsx`. Remove any others.

- [ ] **Step 3: Grep for dead animation classes**

Run: `rg -n "animate-fade-in|animate-scale-up|animate-in|zoom-in-95|fade-in" frontend/src`
Expected: no matches (all replaced by real `animate-*` utilities from `@theme`)

- [ ] **Step 4: Final build**

Run: `npm run build`
Expected: success with no errors

- [ ] **Step 5: Manual responsive + accessibility check**

Check at 375px, 768px, 1024px, 1440px via browser: no horizontal scroll; hero, strip banners, product grids reflow; focus rings visible on tab-through; with `prefers-reduced-motion` enabled banners are static.

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "chore: final audit — tokens, icons, dead animations, build"
```

---

## Self-Review Summary

- **Spec coverage:** Task 1–2 = token system + fonts (spec §2.1–2.3); Tasks 3–9 = shared components (spec §4); Tasks 10–15 = festive banner engine (spec §3); Tasks 16–18 = layout (spec §5.10); Task 19–20 = Home (spec §5.1); Task 21–22 = Shop/ProductDetail (spec §5.2–5.3); Task 23–24 = Cart/Checkout (spec §5.4); Task 25–26 = category + deals pages (spec §5.5–5.6); Task 27–29 = Login/Contact/misc (spec §5.7–5.9); Task 30 = cross-cutting audit (spec §6–8).
- **Placeholder scan:** No TBD/TODO; every code step is complete.
- **Type consistency:** `campaigns[activeCampaign]` shape consistent across Tasks 10–15; `PriceBlock`, `SectionHeader`, `TrustBar`, `Toast`, `Breadcrumb`, `ProductCard`, `CategorySidebar`, `CountdownTimer`, `FestiveBadge`, `FestiveHero`, `StripBanner`, `CTAPane` signatures match between define and consume sites.
