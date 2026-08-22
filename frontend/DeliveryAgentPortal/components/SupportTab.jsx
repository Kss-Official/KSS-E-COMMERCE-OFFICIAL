import React, { useState } from 'react';
import { HelpCircle, PhoneCall, AlertTriangle, Send, CheckCircle } from 'lucide-react';

export default function SupportTab() {
  const [ticket, setTicket] = useState({ subject: '', issue: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ticket.subject || !ticket.issue) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicket({ subject: '', issue: '' });
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Support & Helpline</h2>
        <p className="text-sm text-gray-500 font-medium">24/7 Agent emergency response, accident support, and issue tickets.</p>
      </div>

      {/* SOS Emergency Box */}
      <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-red-900">
          <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base">Emergency SOS Support</h3>
            <p className="text-xs text-red-700 font-medium">Need immediate roadside assistance or reported an accident?</p>
          </div>
        </div>
        <a
          href="tel:18001232899"
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md flex items-center space-x-2 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call SOS Hotline (1800-123-BUYZO)</span>
        </a>
      </div>

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Support ticket submitted! Agent support manager will contact you in 15 mins.</span>
        </div>
      )}

      {/* Support Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900">Submit Support Ticket</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Issue Topic</label>
            <select
              value={ticket.subject}
              onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Select Topic...</option>
              <option value="Customer Unreachable">Customer Unreachable at Address</option>
              <option value="Payment Discrepancy">COD Cash / UPI Payment Issue</option>
              <option value="Package Damaged">Damaged Package at Pickup</option>
              <option value="App Bug">App / GPS Route Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Detailed Description</label>
            <textarea
              rows="4"
              required
              placeholder="Describe what happened..."
              value={ticket.issue}
              onChange={(e) => setTicket({ ...ticket, issue: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-[#1b4d3e] hover:bg-[#0f382c] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
