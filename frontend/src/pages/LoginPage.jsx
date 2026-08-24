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
import { loginUser, registerUser } from '../services/api';
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
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.emailOrPhone || !formData.password) {
      setToastMessage('Please fill in all required fields.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsLoading(true);

    if (activeTab === 'login') {
      const res = await loginUser(formData.emailOrPhone, formData.password);
      setIsLoading(false);
      if (res?.status === 'success') {
        const userName = res.data?.user?.profile?.first_name || res.data?.user?.email?.split('@')[0] || 'User';
        setToastMessage(`Welcome back, ${userName}! Logged in successfully.`);
        setTimeout(() => {
          setToastMessage(null);
          navigateTo('home');
        }, 1200);
      } else {
        setToastMessage(res?.message || res?.detail || 'Invalid email or password. Please try again.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } else {
      const names = (formData.fullName || '').trim().split(' ');
      const firstName = names[0] || 'User';
      const lastName = names.slice(1).join(' ') || '';

      const res = await registerUser({
        email: formData.emailOrPhone,
        password: formData.password,
        first_name: firstName,
        last_name: lastName
      });
      setIsLoading(false);
      if (res?.status === 'success') {
        setToastMessage('Account created successfully! Welcome to BuyZo.');
        setTimeout(() => {
          setToastMessage(null);
          navigateTo('home');
        }, 1200);
      } else {
        const errorMsg = res?.errors
          ? (typeof res.errors === 'object' ? Object.values(res.errors).flat().join(', ') : String(res.errors))
          : (res?.detail || res?.message || 'Could not create account. Please try again.');
        setToastMessage(errorMsg);
        setTimeout(() => setToastMessage(null), 3500);
      }
    }
  };

  return (
    <div className="bg-[#f3f7f6] min-h-[calc(100vh-140px)] py-8 px-4 sm:px-6 md:px-8 flex items-center justify-center font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0c7a68] text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center space-x-2 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 my-4">
        {/* Left Side - Dark Teal Column */}
        <div className="bg-[#0c7a68] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Header & Subtitle */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-teal-100 text-sm font-normal mb-8">
              Login to continue shopping
            </p>

            {/* Feature Bullets */}
            <div className="space-y-5 text-sm font-medium text-teal-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-teal-200" />
                </div>
                <span>Track your orders</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-teal-200" />
                </div>
                <span>Faster checkout</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-teal-200" />
                </div>
                <span>Save your favorite items</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-teal-200" />
                </div>
                <span>Exclusive offers for you</span>
              </div>
            </div>
          </div>

          {/* Bottom Illustration Graphic */}
          <div className="mt-8 pt-4 flex justify-center items-end">
            <img
              src={loginShoppingBagImg}
              alt="BuyZo Shopping Bag Illustration"
              className="h-auto w-full max-w-[340px] object-contain"
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
                className={`text-base font-bold pb-2 transition-all cursor-pointer relative ${
                  activeTab === 'login'
                    ? 'text-[#0c7a68] border-b-2 border-[#0c7a68]'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`text-base font-bold pb-2 transition-all cursor-pointer relative ${
                  activeTab === 'signup'
                    ? 'text-[#0c7a68] border-b-2 border-[#0c7a68]'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0c7a68] focus:ring-1 focus:ring-[#0c7a68] outline-none text-sm font-medium transition-all"
                    required
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
                  placeholder="Enter email or mobile number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0c7a68] focus:ring-1 focus:ring-[#0c7a68] outline-none text-sm font-medium transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <span className="text-xs text-[#0c7a68] hover:underline cursor-pointer font-medium">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0c7a68] focus:ring-1 focus:ring-[#0c7a68] outline-none text-sm font-medium transition-all pr-10"
                    required
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0c7a68] hover:bg-[#095f51] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            By continuing, you agree to BuyZo's{' '}
            <span className="text-gray-600 underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
