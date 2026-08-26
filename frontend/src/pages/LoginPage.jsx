import React, { useEffect, useMemo, useState } from 'react';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { loginUser, registerUser, logoutUser } from '../services/api';
import { PORTALS, homePageForRole, normalizeRole, portalByKey, portalForRole } from '../utils/roles';
import PortalSwitcher, { PORTAL_ICONS } from '../features/auth/PortalSwitcher';
import loginShoppingBagImg from '../assets/loginPage/loginPageBag.png';

const EMPTY_FORM = {
  emailOrPhone: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phone: '',
  staffCode: ''
};

const looksLikeEmail = (value) => /\S+@\S+\.\S+/.test(String(value || '').trim());

export default function LoginPage() {
  const { navigateTo, selectedSubCategory } = useNavigationContext();

  // `selectedSubCategory` doubles as the deep-link hint: 'signup', or a portal
  // key such as 'admin' / 'warehouse' / 'delivery' from the footer links.
  const hint = String(selectedSubCategory || '');
  const [activePortalKey, setActivePortalKey] = useState(
    () => (PORTALS.some((p) => p.key === hint) ? hint : 'customer')
  );
  const [activeTab, setActiveTab] = useState(hint === 'signup' ? 'signup' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message }
  const [isLoading, setIsLoading] = useState(false);

  const portal = useMemo(() => portalByKey(activePortalKey), [activePortalKey]);
  const theme = portal.theme;
  const PortalIcon = PORTAL_ICONS[portal.key];
  const isStaffPortal = portal.requiresStaffCode;

  const notify = (type, message, ms = 3500) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), ms);
  };

  // Switching portal or mode should never carry a half-typed staff code over.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '', staffCode: '' }));
    setShowPassword(false);
  }, [activePortalKey, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const goToPortalHome = (user, message) => {
    const role = normalizeRole(user?.role);
    const target = homePageForRole(role);

    // Signed in successfully, but through the wrong tab. Keep the session (the
    // credentials were valid) and route them where they actually belong.
    if (role !== portal.role) {
      const actual = portalForRole(role);
      notify('success', `Signed in as ${actual.label}. Taking you to the ${actual.label} portal...`);
    } else {
      notify('success', message);
    }

    window.setTimeout(() => {
      setToast(null);
      navigateTo(target);
    }, 1100);
  };

  const handleLogin = async () => {
    const res = await loginUser(formData.emailOrPhone.trim(), formData.password);
    setIsLoading(false);

    if (res?.status !== 'success') {
      notify(
        'error',
        res?.message ||
          res?.detail ||
          'Invalid email or password. If you don’t have an account, use Sign Up.',
        4500
      );
      return;
    }

    const user = res.data?.user;
    const role = normalizeRole(user?.role);

    // A customer must not slip into a staff dashboard just by picking that tab.
    if (isStaffPortal && role === 'CUSTOMER') {
      logoutUser();
      notify(
        'error',
        `This account is not authorised for the ${portal.label} portal. Sign in from the Customer tab.`,
        5000
      );
      return;
    }

    const name = user?.profile?.first_name || user?.email?.split('@')[0] || 'there';
    goToPortalHome(user, `Welcome back, ${name}! Redirecting...`);
  };

  const handleSignup = async () => {
    const names = formData.fullName.trim().split(/\s+/);
    const payload = {
      password: formData.password,
      password_confirm: formData.confirmPassword || formData.password,
      first_name: names[0] || 'User',
      last_name: names.slice(1).join(' '),
      role: portal.role,
      staff_code: formData.staffCode.trim()
    };

    // The single identity field accepts either an email or a mobile number.
    if (looksLikeEmail(formData.emailOrPhone)) {
      payload.email = formData.emailOrPhone.trim();
      payload.phone = formData.phone.trim();
    } else {
      payload.phone = formData.emailOrPhone.trim();
    }

    const res = await registerUser(payload);
    setIsLoading(false);

    if (res?.status !== 'success') {
      const errors = res?.errors;
      const message = errors
        ? typeof errors === 'object'
          ? Object.values(errors).flat().join(' ')
          : String(errors)
        : res?.detail || res?.message || 'Could not create the account. Please try again.';
      notify('error', message, 5000);
      return;
    }

    goToPortalHome(res.data?.user, `${portal.label} account created. Redirecting...`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!formData.emailOrPhone.trim() || !formData.password) {
      notify('error', 'Please fill in all required fields.');
      return;
    }
    if (activeTab === 'signup') {
      if (!formData.fullName.trim()) {
        notify('error', 'Please enter your full name.');
        return;
      }
      if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
        notify('error', 'The two passwords do not match.');
        return;
      }
      if (isStaffPortal && !formData.staffCode.trim()) {
        notify('error', `A ${portal.label} access code is required to register.`);
        return;
      }
    }

    setIsLoading(true);
    if (activeTab === 'login') {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  const headline = activeTab === 'signup' ? portal.signupHeadline : portal.headline;
  const subhead = activeTab === 'signup' ? portal.signupSubhead : portal.subhead;

  return (
    <div className="bg-cream min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 md:px-8 flex items-center justify-center font-sans text-ink">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 sm:top-8 sm:right-8 max-w-sm px-5 py-3 rounded-2xl shadow-lift text-sm font-semibold flex items-start space-x-2.5 z-50 border transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-crimson-700 text-white border-white/20'
              : 'bg-brand-800 text-white border-brand-500/30'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-px">
            {toast.type === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 text-white" />
            ) : (
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            )}
          </div>
          <span className="leading-snug">{toast.message}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-lift border border-gray-100 overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 my-4">

        {/* Left Side - Brand Panel (re-skins per portal) */}
        <div className={`${theme.panel} p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-300`}>
          <div className={`absolute -top-12 -right-8 w-64 h-64 ${theme.glowA} rounded-full blur-3xl pointer-events-none`} />
          <div className={`absolute -bottom-16 left-1/3 w-72 h-72 ${theme.glowB} rounded-full blur-3xl pointer-events-none`} />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 mb-4 text-[11px] font-bold uppercase tracking-[0.16em]">
              <PortalIcon className={`w-3.5 h-3.5 ${theme.iconTint}`} />
              <span>{portal.label} Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2 tracking-tight">
              {headline}
            </h1>
            <p className="text-white/70 text-sm font-medium mb-8">{subhead}</p>

            {/* Feature Bullets */}
            <div className="space-y-5 text-sm font-medium text-white/90">
              {portal.features.map((feature) => (
                <div key={feature} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Check className={`w-4 h-4 ${theme.iconTint} stroke-[3]`} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Illustration Graphic */}
          <div className="mt-8 pt-4 flex justify-center items-end relative z-10">
            <img
              src={loginShoppingBagImg}
              alt="BuyZo Shopping Bag Illustration"
              className="h-auto w-full max-w-[320px] object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        {/* Right Side - Form Column */}
        <div className="p-6 sm:p-8 md:p-10 bg-white flex flex-col justify-between">
          <div>
            {/* Portal Switcher */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Choose your portal
              </p>
              <PortalSwitcher
                activeKey={activePortalKey}
                onChange={setActivePortalKey}
                disabled={isLoading}
              />
            </div>

            {/* Login / Sign Up Tabs */}
            <div className="flex items-center border-b border-gray-200 pb-3 mb-6 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 text-center py-2 text-base font-bold transition-all relative cursor-pointer ${
                  activeTab === 'login'
                    ? `${theme.underline} border-b-2`
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 text-center py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? theme.tabActive
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Container Card */}
            <form onSubmit={handleSubmit} className="border border-gray-100 rounded-2xl p-5 sm:p-6 space-y-4 shadow-soft">
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none focus:ring-1 transition-all ${theme.focus}`}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  placeholder={isStaffPortal ? 'Your work email' : 'Enter your email or mobile number'}
                  autoComplete="username"
                  className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none focus:ring-1 transition-all ${theme.focus}`}
                />
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-gray-400 normal-case font-medium">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none focus:ring-1 transition-all ${theme.focus}`}
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <span
                      onClick={() => notify('success', 'Password reset link sent to your registered email.')}
                      className={`text-xs font-semibold ${theme.link} hover:underline cursor-pointer`}
                    >
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                    className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink placeholder-gray-400 outline-none focus:ring-1 transition-all ${theme.focus}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className={`w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none focus:ring-1 transition-all ${theme.focus}`}
                  />
                </div>
              )}

              {activeTab === 'signup' && isStaffPortal && (
                <div className={`rounded-xl ${theme.chip} p-3.5`}>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    {portal.label} Access Code
                  </label>
                  <input
                    type="text"
                    name="staffCode"
                    value={formData.staffCode}
                    onChange={handleInputChange}
                    placeholder="e.g. BUYZO-XXX-2026"
                    autoComplete="off"
                    className="w-full border border-black/10 bg-white rounded-lg px-3.5 py-2.5 text-sm font-semibold tracking-wide text-ink placeholder-gray-400 outline-none focus:ring-1 focus:ring-black/20 transition-all"
                  />
                  <p className="mt-1.5 text-[11px] font-medium leading-snug opacity-80">
                    Issued by the BuyZo operations team. Without a valid code this
                    account cannot be created.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${theme.button} text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-soft active:scale-[0.99] mt-2 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading
                  ? 'Processing...'
                  : activeTab === 'login'
                    ? `Login to ${portal.label} Portal`
                    : `Create ${portal.label} Account`}
              </button>

              {/* Customer-only social sign-in (staff use work credentials) */}
              {!isStaffPortal ? (
                <>
                  <div className="relative flex py-2 items-center justify-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="shrink-0 mx-3 text-xs text-gray-400 font-medium">
                      or continue with
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Google */}
                    <button
                      type="button"
                      onClick={() => notify('success', 'Logging in with Google...')}
                      className="flex items-center justify-center space-x-1.5 border border-gray-200 rounded-xl py-2 px-2 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Google</span>
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      onClick={() => notify('success', 'Logging in with Facebook...')}
                      className="flex items-center justify-center space-x-1.5 border border-gray-200 rounded-xl py-2 px-2 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Facebook</span>
                    </button>

                    {/* Apple */}
                    <button
                      type="button"
                      onClick={() => notify('success', 'Logging in with Apple...')}
                      className="flex items-center justify-center space-x-1.5 border border-gray-200 rounded-xl py-2 px-2 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.37-.58.68-.99 1.74-.85 2.77 1.01.08 2.05-.54 2.57-1.29z" />
                      </svg>
                      <span>Apple</span>
                    </button>
                  </div>
                </>
              ) : (
                <p className="flex items-start gap-2 pt-1 text-[11px] font-medium leading-snug text-gray-500">
                  <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  Staff sessions are audited. Use the credentials issued to you by
                  BuyZo operations — never a personal shopping account.
                </p>
              )}
            </form>
          </div>

          {/* Footer Text */}
          <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-gray-500 font-normal">
            {activeTab === 'login' ? (
              <p>
                {isStaffPortal ? `New ${portal.label.toLowerCase()} staff?` : 'New to BuyZo?'}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`${theme.link} font-bold hover:underline cursor-pointer`}
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`${theme.link} font-bold hover:underline cursor-pointer`}
                >
                  Login
                </button>
              </p>
            )}
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-1 font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
