import React, { useState, useEffect } from 'react';
import { Headphones, MessageSquare, Plus, ArrowLeft, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigationContext } from '../context/NavigationContext';
import { getCurrentUser } from '../services/api';

export default function SupportPage() {
  const { navigateTo } = useNavigationContext();
  const [currentUser] = useState(() => getCurrentUser());
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem('buyzo_access_token');
    if (!token) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/support/tickets/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setTickets(data.data || []);
        if (data.data && data.data.length > 0 && !selectedTicket) {
          setSelectedTicket(data.data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch tickets', e);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const token = localStorage.getItem('buyzo_access_token');
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/support/tickets/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject, category, message, priority: 'MEDIUM' })
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setIsCreateOpen(false);
        setSubject('');
        setMessage('');
        fetchTickets();
        if (data.data) setSelectedTicket(data.data);
      }
    } catch (e) {
      alert('Could not submit ticket.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const token = localStorage.getItem('buyzo_access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/support/tickets/${selectedTicket.ticket_id}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setReplyMessage('');
        // Refresh detail
        const dRes = await fetch(`http://127.0.0.1:8000/api/support/tickets/${selectedTicket.ticket_id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dData = await dRes.json();
        if (dData && dData.data) {
          setSelectedTicket(dData.data);
        }
      }
    } catch (e) {
      console.warn('Failed to reply', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <button
            onClick={() => navigateTo('home')}
            className="text-xs font-bold text-brand-700 hover:text-accent flex items-center space-x-1 mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center space-x-2">
            <Headphones className="w-6 h-6 text-brand-700" />
            <span>24x7 Customer Helpdesk</span>
          </h1>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-brand-800 hover:bg-[#ff5100] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Ticket List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 h-[600px] flex flex-col">
          <h3 className="text-sm font-extrabold text-gray-900 mb-3 uppercase tracking-wider">Your Support Tickets</h3>

          {tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs font-semibold text-gray-600">No support tickets found.</p>
              <p className="text-[11px] text-gray-400 mt-1">Have a question or issue with an order? Create a new ticket!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.ticket_id === t.ticket_id;
                return (
                  <div
                    key={t.ticket_id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-700 bg-brand-50/50 shadow-2xs'
                        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-brand-700 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {t.ticket_id}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 mt-2 truncate">{t.subject}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t.category}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Conversation Thread */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-soft p-5 h-[600px] flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Top Info */}
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-brand-700">{selectedTicket.ticket_id}</span>
                    <span className="text-xs font-semibold text-gray-400">•</span>
                    <span className="text-xs font-bold text-gray-600">{selectedTicket.category}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mt-0.5">{selectedTicket.subject}</h3>
                </div>
                <span className="px-3 py-1 bg-brand-100 text-brand-800 text-xs font-bold rounded-full">
                  Status: {selectedTicket.status}
                </span>
              </div>

              {/* Thread Messages */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                {selectedTicket.messages && selectedTicket.messages.map((m) => {
                  const isStaff = m.is_staff_reply;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs ${
                          isStaff
                            ? 'bg-emerald-50 text-gray-900 border border-emerald-200 rounded-tl-none'
                            : 'bg-brand-800 text-white rounded-tr-none'
                        }`}
                      >
                        <div className="flex items-center justify-between space-x-4 mb-1 text-[10px] opacity-80 font-bold">
                          <span>{isStaff ? 'BuyZo Support Agent' : 'You'}</span>
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-brand-700 bg-gray-50"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-accent hover:bg-accent-600 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <Headphones className="w-12 h-12 mb-2 opacity-40 text-brand-700" />
              <p className="text-sm font-bold text-gray-700">Select a ticket to view conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">Create New Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-gray-50 outline-none font-medium"
                >
                  <option value="Order Issue">Order Issue / Delivery Delay</option>
                  <option value="Return & Refund">Return & Refund Request</option>
                  <option value="Payment & Wallet">Payment & Wallet Inquiry</option>
                  <option value="Product Details">Product Inquiry</option>
                  <option value="Account & Security">Account & Password</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short summary of your issue"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide all relevant order numbers or details..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl outline-none font-medium"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-brand-800 hover:bg-[#ff5100] text-white rounded-xl font-bold shadow-md"
                >
                  {isLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
