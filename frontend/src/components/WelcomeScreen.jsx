import React, { useEffect, useState } from 'react';
import {
  ShoppingBag, Truck, ShieldCheck, RotateCcw, Tag, Sparkles, ArrowRight,
} from 'lucide-react';

const STORAGE_KEY = 'buyzo_welcome_seen';

const HIGHLIGHTS = [
  {
    icon: Truck,
    title: 'Free delivery over ₹499',
    copy: 'Same-day dispatch from our Bhiwandi hub, tracked to your door.',
  },
  {
    icon: ShieldCheck,
    title: 'BuyZo Assured',
    copy: 'Every listing quality-checked, with a GST invoice and brand warranty.',
  },
  {
    icon: RotateCcw,
    title: '7-day easy returns',
    copy: 'Changed your mind? Pickup is free and refunds land in 48 hours.',
  },
  {
    icon: Tag,
    title: 'Prices that hold up',
    copy: 'Live deals across 300+ products from the brands you already trust.',
  },
];

export function hasSeenWelcome() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // Private browsing or blocked storage: never block the storefront.
    return true;
  }
}

export function markWelcomeSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    /* non-fatal */
  }
}

/**
 * Full-screen branded intro shown once per browser, ahead of the landing page.
 * Dismissing it (either button) writes the localStorage flag and hands control
 * back to the normal app shell.
 */
export default function WelcomeScreen({ onDismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    markWelcomeSeen();
    // Let the fade-out play before the landing page mounts.
    window.setTimeout(() => onDismiss?.(), 260);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to BuyZo"
      className={`fixed inset-0 z-[100] overflow-y-auto bg-brand-900 transition-opacity duration-250 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Ambient brand glow, matching the landing hero treatment. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl animate-glow" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl animate-glow" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center px-6 py-14 text-center">
        <span className="animate-scale-in inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          <Sparkles size={13} />
          Welcome to BuyZo
        </span>

        <div className="animate-fade-in-up mt-7 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
            <ShoppingBag size={26} className="text-white" />
          </span>
          <span className="text-4xl font-extrabold tracking-tight text-cream sm:text-5xl">
            Buy<span className="text-gold">Zo</span>
          </span>
        </div>

        <h1 className="animate-fade-in-up mt-6 max-w-3xl text-3xl font-extrabold leading-tight text-cream sm:text-5xl">
          India&rsquo;s everyday marketplace,
          <span className="block text-gold">without the everyday markup.</span>
        </h1>

        <p className="animate-fade-in-up mt-5 max-w-2xl text-base leading-relaxed text-brand-100/85 sm:text-lg">
          Electronics, fashion, home, beauty and more &mdash; 300+ hand-picked products
          from the brands you already trust, at prices worth switching for.
        </p>

        <div className="animate-fade-in-up mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {HIGHLIGHTS.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-2xl border border-brand-100/12 bg-brand-800/60 p-4 text-left backdrop-blur-sm transition-colors hover:border-gold/35"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-gold">
                <Icon size={17} />
              </span>
              <div>
                <p className="text-sm font-bold text-cream">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand-100/70">{copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="animate-fade-in-up mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => dismiss()}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-600 hover:shadow-xl active:scale-[0.98] sm:w-auto"
          >
            Start Shopping
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => dismiss()}
            className="w-full rounded-full border border-brand-100/25 px-8 py-3.5 text-sm font-semibold text-brand-100 transition-colors hover:border-gold/50 hover:text-gold sm:w-auto"
          >
            Skip for now
          </button>
        </div>

        <p className="animate-fade-in-up mt-7 text-xs text-brand-100/55">
          You&rsquo;ll only see this once. Create an account any time to save your
          cart, wishlist and addresses.
        </p>
      </div>
    </div>
  );
}
