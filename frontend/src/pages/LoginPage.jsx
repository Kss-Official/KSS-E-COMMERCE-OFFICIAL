import React, { useState } from 'react';
import {
  RotateCcw,
  ClipboardCheck,
  Heart,
  Briefcase,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import loginShoppingBagImg from '../assets/loginPage/loginPageBag.png';

export default function LoginPage() {
  const { navigateTo } = useNavigationContext();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    fullName: ''
  });
  const [toastMessage, setToastMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.emailOrPhone || !formData.password) {
      setToastMessage('Please fill in all required fields.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    if (activeTab === 'login') {
      setToastMessage('Logged in successfully!');
    } else {
      setToastMessage('Account created successfully!');
    }

    setTimeout(() => {
      setToastMessage(null);
      navigateTo('home');
    }, 1500);
  };

  return (
    <div className="bg-cream min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 md:px-8 flex items-center justify-center font-sans text-ink">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 sm:top-8 sm:right-8 bg-brand-800 text-white px-5 py-3 rounded-2xl shadow-lift text-sm font-semibold flex items-center space-x-2.5 z-50 border border-brand-500/30 transition-all duration-300">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-lift border border-gray-100 overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 my-4">

        {/* Left Side - Brand Panel */}
        <div className="bg-brand-900 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-8 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Subtitle */}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-2 tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-brand-100 text-sm font-medium mb-8">
              Login to continue your premium shopping experience
            </p>

            {/* Feature Bullets */}
            <div className="space-y-5 text-sm font-medium text-brand-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-gold" />
                </div>
                <span>Track your orders seamlessly</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-gold" />
                </div>
                <span>1-Click lightning fast checkout</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-gold" />
                </div>
                <span>Save &amp; manage your wishlist</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-gold" />
                </div>
                <span>Exclusive festive offers &amp; coupons</span>
              </div>
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
            {/* Top Tabs Switcher */}
            <div className="flex items-center border-b border-gray-200 pb-3 mb-6 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 text-center py-2 text-base font-bold transition-all relative cursor-pointer ${activeTab === 'login'
                  ? 'text-brand-800 border-b-2 border-brand-800'
                  : 'text-gray-500 hover:text-gray-800'
                  }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 text-center py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'signup'
                  ? 'bg-brand-800 text-white shadow-soft'
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
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all"
                  />
                </div>
              )}

              {/* Email / Mobile Field */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your email or mobile number"
                  className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder-gray-400 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <span
                      onClick={() => setToastMessage('Password reset link sent!')}
                      className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink placeholder-gray-400 outline-none focus:border-brand-700 focus:ring-1 focus:ring-brand-700 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-600 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm shadow-soft active:scale-[0.99] mt-2"
              >
                {activeTab === 'login' ? 'Login' : 'Create Account'}
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center justify-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="shrink-0 mx-3 text-xs text-gray-400 font-medium">
                  or continue with
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => setToastMessage('Logging in with Google...')}
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
                  onClick={() => setToastMessage('Logging in with Facebook...')}
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
                  onClick={() => setToastMessage('Logging in with Apple...')}
                  className="flex items-center justify-center space-x-1.5 border border-gray-200 rounded-xl py-2 px-2 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  <svg className="w-4 h-4 text-ink" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.37-.58.68-.99 1.74-.85 2.77 1.01.08 2.05-.54 2.57-1.29z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </form>
          </div>

          {/* Footer Text */}
          <div className="mt-6 text-center text-xs text-gray-500 font-normal">
            {activeTab === 'login' ? (
              <p>
                New to BuyZo?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-accent font-bold hover:underline cursor-pointer"
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
                  className="text-accent font-bold hover:underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

