// Single source of truth for user roles and their portal landing pages.
//
// The backend defines these role strings in `apps/accounts/models.py`
// (`User.ROLE_CHOICES`). Keep this file in sync with that list — a mismatch
// silently prevents staff from ever reaching their portal.

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  WAREHOUSE: 'WAREHOUSE',
  DELIVERY_AGENT: 'DELIVERY_AGENT'
};

// `currentPage` keys understood by NavigationContext.
export const ROLE_HOME_PAGE = {
  [ROLES.CUSTOMER]: 'home',
  [ROLES.ADMIN]: 'admin',
  [ROLES.WAREHOUSE]: 'warehouse',
  [ROLES.DELIVERY_AGENT]: 'delivery-agent'
};

// Portals offered by the login screen, in tab order.
//
// `theme` holds literal Tailwind class strings (never interpolated) so the
// compiler can see them, giving each portal the accent identity its dashboard
// already uses: brand green, violet, cyan and amber.
export const PORTALS = [
  {
    key: 'customer',
    role: ROLES.CUSTOMER,
    label: 'Customer',
    tagline: 'Shop lakhs of products with fast delivery',
    headline: 'Welcome Back!',
    subhead: 'Login to continue your premium shopping experience',
    signupHeadline: 'Join BuyZo Today',
    signupSubhead: 'Create your free account in under a minute',
    features: [
      'Track your orders seamlessly',
      '1-Click lightning fast checkout',
      'Save & manage your wishlist',
      'Exclusive festive offers & coupons'
    ],
    requiresStaffCode: false,
    theme: {
      panel: 'bg-brand-900',
      glowA: 'bg-gold/15',
      glowB: 'bg-accent/10',
      iconTint: 'text-gold',
      chip: 'bg-brand-100 text-brand-800',
      tabActive: 'bg-brand-800 text-white shadow-soft',
      underline: 'border-brand-800 text-brand-800',
      focus: 'focus:border-brand-700 focus:ring-brand-700',
      button: 'bg-accent hover:bg-accent-600',
      link: 'text-accent'
    }
  },
  {
    key: 'admin',
    role: ROLES.ADMIN,
    label: 'Admin',
    tagline: 'Manage catalogue, orders, users and revenue',
    headline: 'Admin Console',
    subhead: 'Sign in to run the BuyZo marketplace',
    signupHeadline: 'Register an Admin',
    signupSubhead: 'An admin access code is required to continue',
    features: [
      'Live revenue, orders & customer metrics',
      'Full catalogue and inventory control',
      'Approve refunds, returns and payouts',
      'Manage staff accounts and coupons'
    ],
    requiresStaffCode: true,
    theme: {
      panel: 'bg-night',
      glowA: 'bg-violet-500/20',
      glowB: 'bg-fuchsia-500/10',
      iconTint: 'text-violet-300',
      chip: 'bg-violet-100 text-violet-800',
      tabActive: 'bg-night text-white shadow-soft',
      underline: 'border-night text-night',
      focus: 'focus:border-violet-500 focus:ring-violet-500',
      button: 'bg-violet-600 hover:bg-violet-700',
      link: 'text-violet-600'
    }
  },
  {
    key: 'delivery',
    role: ROLES.DELIVERY_AGENT,
    label: 'Delivery',
    tagline: 'Pick up, track and complete your deliveries',
    headline: 'Rider Sign In',
    subhead: 'Start your shift and see today’s route',
    signupHeadline: 'Join as a Rider',
    signupSubhead: 'A delivery access code is required to continue',
    features: [
      'Today’s tasks, sorted by pickup slot',
      'Live stage updates and OTP handover',
      'COD collection tracked automatically',
      'Daily earnings and incentive summary'
    ],
    requiresStaffCode: true,
    theme: {
      panel: 'bg-cyan-950',
      glowA: 'bg-cyan-400/20',
      glowB: 'bg-teal-400/10',
      iconTint: 'text-cyan-300',
      chip: 'bg-cyan-100 text-cyan-800',
      tabActive: 'bg-cyan-800 text-white shadow-soft',
      underline: 'border-cyan-800 text-cyan-800',
      focus: 'focus:border-cyan-600 focus:ring-cyan-600',
      button: 'bg-cyan-600 hover:bg-cyan-700',
      link: 'text-cyan-700'
    }
  },
  {
    key: 'warehouse',
    role: ROLES.WAREHOUSE,
    label: 'Warehouse',
    tagline: 'Control inbound, outbound and stock levels',
    headline: 'Warehouse Login',
    subhead: 'Manage receipts, dispatch and bin stock',
    signupHeadline: 'Register Warehouse Staff',
    signupSubhead: 'A warehouse access code is required to continue',
    features: [
      'Inbound receipts and put-away verification',
      'Pack and dispatch outbound shipments',
      'Bin-level stock with low-stock alerts',
      'Transfers, returns and cycle counts'
    ],
    requiresStaffCode: true,
    theme: {
      panel: 'bg-amber-950',
      glowA: 'bg-amber-400/20',
      glowB: 'bg-orange-500/10',
      iconTint: 'text-amber-300',
      chip: 'bg-amber-100 text-amber-900',
      tabActive: 'bg-amber-800 text-white shadow-soft',
      underline: 'border-amber-800 text-amber-800',
      focus: 'focus:border-amber-600 focus:ring-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
      link: 'text-amber-700'
    }
  }
];

/** Normalises whatever the API returned into a canonical role string. */
export function normalizeRole(role) {
  const value = String(role || '').trim().toUpperCase();
  // Tolerate historical aliases that appeared in earlier frontend builds.
  if (value === 'WAREHOUSE_STAFF') return ROLES.WAREHOUSE;
  if (value === 'DELIVERY' || value === 'AGENT') return ROLES.DELIVERY_AGENT;
  if (value === 'SUPERADMIN' || value === 'STAFF') return ROLES.ADMIN;
  return ROLES[value] || ROLES.CUSTOMER;
}

/** The page a user should land on immediately after signing in. */
export function homePageForRole(role) {
  return ROLE_HOME_PAGE[normalizeRole(role)] || 'home';
}

/** True when the role belongs to one of the three internal staff portals. */
export function isStaffRole(role) {
  return normalizeRole(role) !== ROLES.CUSTOMER;
}

export function portalByKey(key) {
  return PORTALS.find((p) => p.key === key) || PORTALS[0];
}

export function portalForRole(role) {
  const normalized = normalizeRole(role);
  return PORTALS.find((p) => p.role === normalized) || PORTALS[0];
}
