import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Headphones,
  ShieldCheck,
  RotateCcw,
  ThumbsUp,
  Check
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import contactHeroImg from '../assets/images/contact_hero.jpg';

export default function ContactPage() {
  const { navigateTo } = useNavigationContext();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submittedToast, setSubmittedToast] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedToast('Thank you! Your message has been sent successfully.');
    setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmittedToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {submittedToast && (
        <div className="fixed bottom-6 right-6 bg-[#0d5c46] text-white px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center space-x-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-300" />
          <span>{submittedToast}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-5">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#0d5c46] transition-colors"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">Contact Us</span>
      </nav>

      {/* Top Hero Banner */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 flex flex-col md:flex-row items-center justify-between shadow-2xs mb-8 overflow-hidden relative">
        {/* Left Content */}
        <div className="max-w-md space-y-2 z-10">
          <span className="text-[11px] font-black text-[#ff5100] tracking-widest uppercase block mb-1">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
            We'd Love to Hear <br />
            From <span className="text-[#ff5100]">You!</span>
          </h1>
          <p className="text-xs text-gray-500 font-normal leading-relaxed pt-2">
            Have a question, feedback, or need help? Our team is <br className="hidden sm:inline" />
            here to assist you. Reach out to us anytime.
          </p>
        </div>

        {/* Right 3D Illustration & Organic Mint Blob Background */}
        <div className="relative w-full md:w-1/2 flex justify-center md:justify-end items-center mt-6 md:mt-0">
          {/* Organic Mint Blob Backdrop */}
          <div className="absolute right-0 w-80 h-64 sm:w-96 sm:h-72 bg-[#e6f4f1] rounded-[60%_40%_70%_30%/50%_60%_40%_50%] -z-0 opacity-80" />

          {/* 3D Illustration Graphic */}
          <img
            src={contactHeroImg}
            alt="Contact Us Graphic"
            className="w-full max-w-md h-auto object-contain relative z-10 mix-blend-multiply"
          />
        </div>
      </div>

      {/* Main Grid: Contact Info (Left) + Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
        {/* Left Column: Contact Information (4 cols) */}
        <div className="lg:col-span-4 bg-[#f8faf9] border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
          <h2 className="text-sm font-extrabold text-gray-900 border-b border-gray-200/80 pb-3">
            Contact Information
          </h2>

          <div className="space-y-6">
            {/* Our Address */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-[#0d5c46] flex items-center justify-center shrink-0">
                <MapPin className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-gray-900">Our Address</h4>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  ShopNest Private Limited <br />
                  123, 4th Cross, Koramangala, <br />
                  Bengaluru, Karnataka - 560034
                </p>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-[#0d5c46] flex items-center justify-center shrink-0">
                <Phone className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-gray-900">Phone Number</h4>
                <p className="text-xs font-bold text-gray-900">+91 80 1234 5678</p>
                <p className="text-[11px] text-gray-400 font-medium">Mon - Sat : 9:00 AM - 7:00 PM</p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-[#0d5c46] flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-gray-900">Email Address</h4>
                <p className="text-xs font-bold text-gray-900">support@shopnest.com</p>
                <p className="text-[11px] text-gray-400 font-medium">We reply within 24 hours</p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-[#0d5c46] flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-gray-900">Working Hours</h4>
                <p className="text-xs font-bold text-gray-900">Monday - Saturday</p>
                <p className="text-[11px] text-gray-400 font-medium">9:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send Us a Message Form (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs">
          <h2 className="text-sm font-extrabold text-gray-900 mb-5 border-b border-gray-100 pb-3">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-[#0d5c46] transition-colors"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-[#0d5c46] transition-colors"
                />
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-[#0d5c46] transition-colors"
                />
              </div>

              {/* Subject Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-[#0d5c46] transition-colors cursor-pointer"
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Order Support">Order Support</option>
                  <option value="Returns & Refund">Returns &amp; Refund</option>
                  <option value="Product Feedback">Product Feedback</option>
                </select>
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                required
                placeholder="Type your message here..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-[#0d5c46] transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                className="py-2.5 px-6 bg-[#0d5c46] hover:bg-[#094736] text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-[0.98] inline-flex items-center space-x-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Value Proposition Banner */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          <div className="flex items-center space-x-3.5 sm:pr-4 py-2 sm:py-0">
            <Headphones className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2.2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">24/7 Support</h4>
              <p className="text-xs text-gray-500 font-medium">We're here to help you</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 sm:px-6 py-2 sm:py-0">
            <ShieldCheck className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2.2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Secure &amp; Reliable</h4>
              <p className="text-xs text-gray-500 font-medium">Your data is safe with us</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 sm:px-6 py-2 sm:py-0">
            <RotateCcw className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2.2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Quick Response</h4>
              <p className="text-xs text-gray-500 font-medium">We reply within 24 hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-3.5 sm:pl-6 py-2 sm:py-0">
            <ThumbsUp className="w-7 h-7 text-[#0d5c46] shrink-0 stroke-[2.2]" />
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Customer First</h4>
              <p className="text-xs text-gray-500 font-medium">Your satisfaction is our priority</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
