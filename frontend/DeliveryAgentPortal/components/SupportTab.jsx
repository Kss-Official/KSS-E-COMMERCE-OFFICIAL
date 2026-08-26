import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  PhoneCall,
  AlertTriangle,
  Send,
  CheckCircle,
  RefreshCw,
  Ticket,
  ChevronDown
} from 'lucide-react';
import { fetchDeliverySupportApi, createDeliveryTicketApi } from '../../src/services/api';

export default function SupportTab() {
  const [ticket, setTicket] = useState({ subject: '', issue: '' });
  const [support, setSupport] = useState({ contacts: [], faqs: [], tickets: [], open_tickets: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const loadSupport = async () => {
    setIsLoading(true);
    const data = await fetchDeliverySupportApi();
    setSupport(data || { contacts: [], faqs: [], tickets: [], open_tickets: 0 });
    setIsLoading(false);
  };

  useEffect(() => {
    loadSupport();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!ticket.subject || !ticket.issue) {
      setError('Pick a topic and describe what happened.');
      return;
    }

    setBusy(true);
    const res = await createDeliveryTicketApi({ subject: ticket.subject, message: ticket.issue });
    setBusy(false);

    if (res?.status === 'success') {
      setNotice(
        `Ticket ${res.data?.ticket_number} raised. The rider support manager will call you shortly.`
      );
      setTicket({ subject: '', issue: '' });
      loadSupport();
      setTimeout(() => setNotice(null), 6000);
    } else {
      setError(res?.message || 'Could not submit the ticket. Please try again.');
    }
  };

  // The emergency contact comes from the backend contact list.
  const sos = support.contacts.find((c) => /emergency|accident|safety/i.test(c.label)) || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Delivery Support &amp; Helpline</h2>
          <p className="text-sm text-gray-500 font-medium">24/7 agent emergency response, accident support, and issue tickets.</p>
        </div>
        <button
          type="button"
          onClick={loadSupport}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* SOS Emergency Box */}
      <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-red-900">
          <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
          <div>
            <h3 className="font-extrabold text-base">Emergency SOS Support</h3>
            <p className="text-xs text-red-700 font-medium">
              {sos ? `${sos.name} — available ${sos.availability}` : 'Need immediate roadside assistance or reported an accident?'}
            </p>
          </div>
        </div>
        <a
          href={`tel:${(sos?.phone || '112').replace(/\s+/g, '')}`}
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md flex items-center space-x-2 shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Call SOS Hotline ({sos?.phone || '112'})</span>
        </a>
      </div>

      {/* Real support desks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading && support.contacts.length === 0 &&
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-24 animate-pulse" />
          ))}
        {support.contacts.map((contact) => (
          <div key={contact.label} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">{contact.label}</span>
            <h4 className="font-bold text-sm text-gray-900 mt-0.5">{contact.name}</h4>
            <a
              href={`tel:${(contact.phone || '').replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#1b4d3e] mt-1.5 hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              {contact.phone}
            </a>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">{contact.availability}</p>
          </div>
        ))}
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{notice}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{error}</span>
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
              disabled={busy}
              className="flex items-center space-x-2 bg-[#1b4d3e] hover:bg-[#0f382c] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{busy ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* My tickets */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Ticket className="w-4 h-4 text-[#1b4d3e]" />
            <h3 className="font-bold text-base text-gray-900">My Tickets</h3>
          </div>
          {support.open_tickets > 0 && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              {support.open_tickets} open
            </span>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {!isLoading && support.tickets.length === 0 && (
            <p className="px-5 py-8 text-center text-xs font-semibold text-gray-400">
              You have not raised any tickets yet.
            </p>
          )}
          {support.tickets.map((t) => (
            <div key={t.id} className="px-5 py-3.5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{t.subject}</p>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-0.5">{t.message}</p>
                <p className="text-[11px] font-semibold text-gray-400 mt-1">
                  <span className="font-mono">{t.ticket_number}</span> &middot; {t.formatted_date}
                </p>
              </div>
              <span
                className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                  t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rider FAQs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center space-x-2.5">
          <HelpCircle className="w-4 h-4 text-[#1b4d3e]" />
          <h3 className="font-bold text-base text-gray-900">Rider FAQs</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {support.faqs.map((faq, idx) => (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-emerald-50/20 cursor-pointer"
              >
                <span className="text-sm font-bold text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === idx && (
                <p className="px-5 pb-4 text-xs text-gray-600 font-medium leading-relaxed">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
