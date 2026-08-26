import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Check,
  AlertCircle,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { submitContactMessage, fetchFaqs, getCurrentUser } from '../services/api';
import contact3dHeadset from '../assets/images/contact_3d_headset.png';

export default function ContactPage() {
  const { navigateTo } = useNavigationContext();
  const currentUser = getCurrentUser();

  const [formData, setFormData] = useState({
    fullName: currentUser
      ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ')
      : '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    subject: '',
    message: ''
  });
  const [submittedToast, setSubmittedToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [isSending, setIsSending] = useState(false);

  // FAQs are content-managed in the DB (support.FAQ).
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows = await fetchFaqs();
      if (!cancelled) setFaqs(rows);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const notify = (type, message) => {
    setToastType(type);
    setSubmittedToast(message);
    setTimeout(() => setSubmittedToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
    const res = await submitContactMessage({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || 'General Inquiry',
      message: formData.message
    });
    setIsSending(false);

    if (res?.status === 'success') {
      notify('success', res.message || 'Thank you! Your message has been sent successfully.');
      setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } else {
      notify('error', res?.message || 'Could not send your message. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-6 font-sans text-gray-800 relative">
      {/* Toast Notification */}
      {submittedToast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm z-50 flex items-center space-x-3 animate-bounce text-white ${
            toastType === 'error' ? 'bg-crimson-700' : 'bg-[#08493d]'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Check className="w-5 h-5 text-emerald-300" />
          )}
          <span>{submittedToast}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-5">
        <button
          onClick={() => navigateTo('home')}
          className="hover:text-[#08493d] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span className="text-gray-400 font-bold">&gt;</span>
        <span className="text-gray-900 font-bold">Contact Us</span>
      </nav>

      {/* Main Container: 2 Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

        {/* LEFT MAIN CARD: Dark Teal Banner with Info Cards */}
        <div className="bg-[#094d40] rounded-3xl p-5 sm:p-6 lg:p-7 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-6 items-start h-full">

            {/* Left Content + 3D Illustration (6 cols on sm+) */}
            <div className="sm:col-span-6 lg:col-span-6 flex flex-col justify-between h-full space-y-4">
              <div>
                <span className="text-[11px] font-bold text-[#f1592a] tracking-wider uppercase block mb-1.5">
                  — WE'RE HERE FOR YOU
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white leading-tight">
                  Let's Start a <br />
                  <span className="text-[#f1592a]">Conversation</span>
                </h1>
                <p className="text-xs text-emerald-100/90 font-medium leading-relaxed pt-2 max-w-xs">
                  Have a question, feedback, or need help? Our team is ready to assist you.
                </p>
              </div>

              {/* 3D Headset Illustration Graphic */}
              <div className="pt-1 flex items-center justify-start">
                <img
                  src={contact3dHeadset}
                  alt="Support Graphic"
                  className="w-full max-w-[350px] sm:max-w-[400px] lg:max-w-[430px]  "
                />
              </div>
            </div>

            {/* Right Stacked White Cards (6 cols on sm+) */}
            <div className="sm:col-span-6 lg:col-span-6 space-y-2.5 sm:space-y-3">

              {/* Card 1: Our Address */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 text-gray-900 shadow-sm flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#063328] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">Our Address</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight">
                    123, Silicon Palace,
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-tight">
                    Bengaluru, Karnataka - 560034
                  </p>
                </div>
              </div>

              {/* Card 2: Phone Number */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 text-gray-900 shadow-sm flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#063328] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">Phone Number</h3>
                  <p className="text-xs sm:text-xs font-bold text-gray-900 leading-tight">+91 80 1234 5678</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">Mon - Sat : 9:00 AM - 7:00 PM</p>
                </div>
              </div>

              {/* Card 3: Email Address */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 text-gray-900 shadow-sm flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#063328] text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">Email Address</h3>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-800 leading-tight">support@buyzo.com</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">We reply within 24 hours</p>
                </div>
              </div>

              {/* Card 4: Working Hours */}
              <div className="bg-white rounded-2xl p-3 sm:p-3.5 text-gray-900 shadow-sm flex items-start space-x-3">
                <div className="w-9 h-9 rounded-full bg-[#063328] text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">Working Hours</h3>
                  <p className="text-[11px] sm:text-xs font-medium text-gray-800 leading-tight">Monday - Saturday</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium">8:00 AM - 7:00 PM</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT MAIN CARD: Form Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            {/* Form Title Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#08493d] flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Send Us a Message</h2>
            </div>

            {/* Form Controls */}
            <form id="contact-form" onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#08493d] transition-colors"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#08493d] transition-colors"
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#08493d] transition-colors"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 outline-none focus:bg-white focus:border-[#08493d] transition-colors cursor-pointer"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Order Support">Order Support</option>
                    <option value="Returns & Refund">Returns &amp; Refund</option>
                    <option value="Product Feedback">Product Feedback</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="relative pt-0.5">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={500}
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-[#08493d] transition-colors resize-none"
                />
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-medium">
                  {formData.message.length}/500
                </span>
              </div>
            </form>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              form="contact-form"
              disabled={isSending}
              className="py-2.5 px-5 bg-[#08493d] hover:bg-[#063328] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] inline-flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
              <span>{isSending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Frequently Asked Questions — served from support.FAQ */}
      {faqs.length > 0 && (
        <div className="mt-5 bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#08493d] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-xs font-medium text-gray-500">
                Quick answers to the {faqs.length} things shoppers ask us most.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50/60 overflow-hidden transition-colors hover:border-[#08493d]/40"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-[#08493d] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="border-t border-gray-200 bg-white px-4 py-3 text-xs font-medium leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
