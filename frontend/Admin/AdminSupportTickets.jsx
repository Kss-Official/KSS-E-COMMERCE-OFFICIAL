import React, { useState, useEffect } from 'react';
import { Headphones, MessageSquare, Send, CheckCircle2, Clock, Shield, Search } from 'lucide-react';

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchAdminTickets();
  }, [filterStatus]);

  const fetchAdminTickets = async () => {
    const token = localStorage.getItem('buyzo_access_token');
    try {
      const url = filterStatus === 'ALL'
        ? 'http://127.0.0.1:8000/api/support/admin/tickets/'
        : `http://127.0.0.1:8000/api/support/admin/tickets/?status=${filterStatus}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setTickets(data.data || []);
        if (data.data && data.data.length > 0 && !selectedTicket) {
          setSelectedTicket(data.data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load admin support tickets', e);
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
        fetchAdminTickets();
        // Refresh selected ticket detail
        const dRes = await fetch(`http://127.0.0.1:8000/api/support/tickets/${selectedTicket.ticket_id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dData = await dRes.json();
        if (dData && dData.data) setSelectedTicket(dData.data);
      }
    } catch (e) {
      console.warn('Failed admin reply', e);
    }
  };

  const updateTicketStatus = async (newStatus) => {
    if (!selectedTicket) return;
    const token = localStorage.getItem('buyzo_access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/support/admin/tickets/${selectedTicket.ticket_id}/status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data && data.status === 'success') {
        setSelectedTicket(data.data);
        fetchAdminTickets();
      }
    } catch (e) {
      console.warn('Status update failed', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Admin Support Helpdesk</h2>
            <p className="text-xs text-gray-500">Manage, reply and resolve customer support tickets</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Tickets List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-4 h-[600px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-extrabold text-gray-500 uppercase">Incoming Tickets</span>
            <span className="text-xs font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{tickets.length}</span>
          </div>

          {tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-semibold text-gray-600">No tickets matching filter.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.ticket_id === t.ticket_id;
                return (
                  <div
                    key={t.ticket_id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 shadow-2xs'
                        : 'border-gray-100 bg-gray-50/50 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-purple-700 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {t.ticket_id}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 mt-2 truncate">{t.subject}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">From: {t.user_email}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Conversation Thread & Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-soft p-5 h-[600px] flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header Info & Status Override Buttons */}
              <div className="pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-black text-purple-700">{selectedTicket.ticket_id}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-semibold text-gray-600">{selectedTicket.user_email}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mt-0.5">{selectedTicket.subject}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateTicketStatus('IN_PROGRESS')}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTicketStatus('RESOLVED')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                {selectedTicket.messages && selectedTicket.messages.map((m) => {
                  const isStaff = m.is_staff_reply;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs ${
                          isStaff
                            ? 'bg-purple-700 text-white rounded-tr-none'
                            : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-tl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between space-x-4 mb-1 text-[10px] opacity-80 font-bold">
                          <span>{isStaff ? 'Staff Support Agent' : selectedTicket.user_email}</span>
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type staff response to customer..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-purple-600 bg-gray-50"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply Customer</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <Headphones className="w-12 h-12 mb-2 opacity-40 text-purple-700" />
              <p className="text-sm font-bold text-gray-700">Select a ticket to manage conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
