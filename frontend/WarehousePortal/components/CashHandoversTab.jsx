import React, { useState, useEffect } from 'react';
import {
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  Building2,
  ShieldCheck,
  XCircle,
  Receipt,
  User,
  Filter,
  Download,
  Printer,
  FileText
} from 'lucide-react';
import {
  fetchWarehouseCashHandoversApi,
  confirmWarehouseCashHandoverApi,
  disputeWarehouseCashHandoverApi
} from '../../src/services/api';

export default function CashHandoversTab() {
  const [data, setData] = useState({ pending_count: 0, handovers: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'CONFIRMED', 'DISPUTED'
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation modal state
  const [confirmModalItem, setConfirmModalItem] = useState(null);
  const [confirmedAmount, setConfirmedAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Dispute modal state
  const [disputeModalItem, setDisputeModalItem] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeConfirmedAmount, setDisputeConfirmedAmount] = useState('');

  const [alert, setAlert] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchWarehouseCashHandoversApi();
    setData(res || { pending_count: 0, handovers: [] });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handovers = data?.handovers || [];
  const pendingCount = data?.pending_count || 0;

  const filteredHandovers = handovers.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = item.handover_id?.toLowerCase().includes(q);
      const matchAgent = item.agent_name?.toLowerCase().includes(q) || item.agent_email?.toLowerCase().includes(q) || item.agent_code?.toLowerCase().includes(q);
      return matchId || matchAgent;
    }
    return true;
  });

  const downloadReceipt = (item) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cash Handover Receipt - ${item.handover_id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
          .receipt-card { max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 900; color: #1d4ed8; letter-spacing: -0.5px; }
          .badge { background: #dcfce7; color: #15803d; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
          .disputed-badge { background: #fef3c7; color: #b45309; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .field { background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #f1f5f9; }
          .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 15px; font-weight: 700; color: #0f172a; }
          .amount-box { background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .amount-label { font-size: 12px; text-transform: uppercase; color: #1d4ed8; font-weight: 800; letter-spacing: 0.5px; }
          .amount-val { font-size: 32px; font-weight: 900; color: #1e40af; margin-top: 4px; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
          .print-btn { display: block; width: 100%; padding: 14px; background: #1d4ed8; color: white; border: none; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; margin-top: 24px; transition: all 0.2s; }
          .print-btn:hover { background: #1e40af; }
          @media print { .print-btn { display: none; } body { padding: 0; background: white; } .receipt-card { border: none; box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="header">
            <div>
              <div class="logo">BUYZO WAREHOUSE</div>
              <div style="font-size:12px; color:#64748b; margin-top:2px;">Official Cash Handover Settlement Receipt</div>
            </div>
            <span class="badge ${item.status === 'DISPUTED' ? 'disputed-badge' : ''}">${item.status || 'CONFIRMED'}</span>
          </div>

          <div class="grid">
            <div class="field">
              <div class="label">Handover Voucher ID</div>
              <div class="value">${item.handover_id}</div>
            </div>
            <div class="field">
              <div class="label">Date &amp; Time</div>
              <div class="value">${item.formatted_created_at || new Date().toLocaleString()}</div>
            </div>
            <div class="field">
              <div class="label">Delivery Agent</div>
              <div class="value">${item.agent_name || 'Amit Kumar'}</div>
              <div style="font-size:11px; color:#64748b;">${item.agent_email || ''}</div>
            </div>
            <div class="field">
              <div class="label">Receiving Hub</div>
              <div class="value">WH01 - Central Warehouse</div>
            </div>
          </div>

          <div class="amount-box">
            <div class="amount-label">Verified Physical Cash Received</div>
            <div class="amount-val">₹${Number(item.confirmed_amount ?? item.requested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style="font-size:12px; color:#475569; margin-top:6px;">Requested Amount: ₹${Number(item.requested_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="field" style="margin-bottom:20px;">
            <div class="label">Audit &amp; Manager Notes</div>
            <div class="value" style="font-size:13px; font-weight:500;">${item.notes || 'Physical cash received and verified by Warehouse Manager.'}</div>
          </div>

          <div class="footer">
            <div>This is an official system-generated EOD cash settlement receipt.</div>
            <div style="margin-top:4px; font-weight:600;">Buyzo E-Commerce Logistics &amp; Warehouse System</div>
          </div>

          <button class="print-btn" onclick="window.print()">🖨️ Download / Print Cash Receipt (PDF)</button>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    receiptWindow.document.write(html);
    receiptWindow.document.close();
  };

  const exportAllCSV = () => {
    if (!filteredHandovers.length) return;
    const headers = ['Handover ID', 'Delivery Agent', 'Email', 'Requested Amount', 'Confirmed Amount', 'Status', 'Date & Time'];
    const rows = filteredHandovers.map((h) => [
      h.handover_id,
      `"${h.agent_name || ''}"`,
      `"${h.agent_email || ''}"`,
      h.requested_amount,
      h.confirmed_amount ?? h.requested_amount,
      h.status,
      `"${h.formatted_created_at || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cash_Handovers_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openConfirmModal = (item) => {
    setConfirmModalItem(item);
    setConfirmedAmount(String(item.requested_amount));
    setNotes('');
    setAlert(null);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!confirmModalItem) return;

    const amount = Number(confirmedAmount);
    if (!amount || amount <= 0) {
      setAlert({ type: 'error', message: 'Please enter a valid confirmed cash amount.' });
      return;
    }

    setSubmitting(true);
    const res = await confirmWarehouseCashHandoverApi(confirmModalItem.handover_id, amount, notes);
    setSubmitting(false);

    if (res?.status === 'success') {
      setConfirmModalItem(null);
      setAlert({ type: 'success', message: res.message || 'Cash handover confirmed successfully!' });
      loadData();
    } else {
      setAlert({ type: 'error', message: res?.message || 'Failed to confirm handover.' });
    }
  };

  const openDisputeModal = (item) => {
    setDisputeModalItem(item);
    setDisputeReason('');
    setDisputeConfirmedAmount(String(item.requested_amount));
    setAlert(null);
  };

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeModalItem) return;

    if (!disputeReason.trim()) {
      setAlert({ type: 'error', message: 'Please specify a reason for flagging this dispute.' });
      return;
    }

    setSubmitting(true);
    const amount = disputeConfirmedAmount ? Number(disputeConfirmedAmount) : null;
    const res = await disputeWarehouseCashHandoverApi(disputeModalItem.handover_id, disputeReason, amount);
    setSubmitting(false);

    if (res?.status === 'success') {
      setDisputeModalItem(null);
      setAlert({ type: 'success', message: res.message || 'Handover request flagged as DISPUTED.' });
      loadData();
    } else {
      setAlert({ type: 'error', message: res?.message || 'Failed to flag dispute.' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirmed / Received
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Disputed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <Clock className="w-3.5 h-3.5 mr-1" /> Pending Staff Action
          </span>
        );
    }
  };

  const totalConfirmedAmount = handovers
    .filter((h) => h.status === 'CONFIRMED')
    .reduce((sum, h) => sum + Number(h.confirmed_amount || h.requested_amount), 0);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayConfirmedAmount = handovers
    .filter((h) => {
      if (h.status !== 'CONFIRMED') return false;
      const createdDate = h.created_at ? new Date(h.created_at).toISOString().split('T')[0] : '';
      const confirmedDate = h.confirmed_at ? new Date(h.confirmed_at).toISOString().split('T')[0] : '';
      return createdDate === todayStr || confirmedDate === todayStr;
    })
    .reduce((sum, h) => sum + Number(h.confirmed_amount || h.requested_amount), 0);

  const disputedCount = handovers.filter((h) => h.status === 'DISPUTED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-extrabold uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>Warehouse Control Desk</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Delivery Agent Cash Handovers</h2>
          <p className="text-sm text-blue-100/90 mt-1 max-w-xl">
            Verify physical cash received from delivery agents, confirm EOD settlements, and record staff audit logs.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xs ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
          <button onClick={() => setAlert(null)} className="text-gray-400 hover:text-gray-600 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`text-left p-5 rounded-2xl border shadow-xs relative overflow-hidden transition-all cursor-pointer ${
            statusFilter === 'PENDING' ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pending Confirmation</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              {pendingCount}
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{pendingCount} Requests</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Awaiting physical cash receipt</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </button>

        {/* TODAY'S CASH COLLECTION */}
        <button
          onClick={() => setStatusFilter('CONFIRMED')}
          className={`text-left p-5 rounded-2xl border shadow-xs relative overflow-hidden transition-all cursor-pointer ${
            statusFilter === 'CONFIRMED' ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Today's Collection</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Banknote className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-700 mt-2">₹{todayConfirmedAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Received &amp; confirmed today</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>
        </button>

        <button
          onClick={() => setStatusFilter('CONFIRMED')}
          className={`text-left p-5 rounded-2xl border shadow-xs relative overflow-hidden transition-all cursor-pointer ${
            statusFilter === 'CONFIRMED' ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Confirmed Cash</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">₹{totalConfirmedAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Physically received &amp; settled</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </button>

        <button
          onClick={() => setStatusFilter('DISPUTED')}
          className={`text-left p-5 rounded-2xl border shadow-xs relative overflow-hidden transition-all cursor-pointer ${
            statusFilter === 'DISPUTED' ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Disputed Handovers</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              {disputedCount}
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{disputedCount} Disputes</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Amount discrepancies flagged</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400"></div>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          {['ALL', 'PENDING', 'CONFIRMED', 'DISPUTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID or Agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Handover Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-[#1D4ED8]" />
            <h3 className="font-extrabold text-gray-900 text-base">Cash Handover Queue</h3>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-gray-500">{filteredHandovers.length} items</span>
            <button
              onClick={exportAllCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {filteredHandovers.length === 0 ? (
          <div className="p-10 text-center text-gray-400 space-y-2">
            <Banknote className="w-10 h-10 mx-auto text-gray-300 stroke-1" />
            <p className="text-sm font-medium">No cash handover requests match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4">Handover ID</th>
                  <th className="py-3.5 px-4">Delivery Agent</th>
                  <th className="py-3.5 px-4">Requested</th>
                  <th className="py-3.5 px-4">Confirmed</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredHandovers.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{item.handover_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">{item.agent_name}</p>
                          <p className="text-[11px] text-gray-400">{item.agent_code} &middot; {item.agent_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-gray-900">₹{Number(item.requested_amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-700">
                      {item.confirmed_amount != null ? `₹${Number(item.confirmed_amount).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">{item.formatted_created_at}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end space-x-2">
                        {item.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => openConfirmModal(item)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                              Confirm Receipt
                            </button>
                            <button
                              onClick={() => openDisputeModal(item)}
                              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Dispute
                            </button>
                          </>
                        ) : null}
                        <button
                          onClick={() => downloadReceipt(item)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                          title="Download Official Cash Settlement Receipt"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Receipt Modal */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="text-lg font-black text-gray-900">Confirm Cash Receipt</h3>
              </div>
              <button
                onClick={() => setConfirmModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-1">
                <p className="text-xs font-bold text-blue-900">Handover Request #{confirmModalItem.handover_id}</p>
                <p className="text-xs text-blue-700">Agent: <span className="font-bold">{confirmModalItem.agent_name}</span> ({confirmModalItem.agent_code})</p>
                <p className="text-xs text-blue-700">Declared Amount: <span className="font-bold text-gray-900">₹{Number(confirmModalItem.requested_amount).toFixed(2)}</span></p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Physically Counted Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={confirmedAmount}
                  onChange={(e) => setConfirmedAmount(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-base font-black text-gray-900"
                />
                {Number(confirmedAmount) !== Number(confirmModalItem.requested_amount) && (
                  <p className="text-xs font-semibold text-amber-600 mt-1 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    Amount differs from declared ₹{Number(confirmModalItem.requested_amount).toFixed(2)}!
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Staff Verification Notes (Optional)</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Verified physical cash bundle at WH01 counter"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModalItem(null)}
                  className="w-1/2 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {submitting ? 'Confirming...' : 'Confirm Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-black text-gray-900">Flag Handover Dispute</h3>
              </div>
              <button
                onClick={() => setDisputeModalItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-1 text-amber-900">
                <p className="text-xs font-bold">Request #{disputeModalItem.handover_id}</p>
                <p className="text-xs">Agent: {disputeModalItem.agent_name} ({disputeModalItem.agent_code})</p>
                <p className="text-xs">Declared: ₹{Number(disputeModalItem.requested_amount).toFixed(2)}</p>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Actual Cash Received (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={disputeConfirmedAmount}
                  onChange={(e) => setDisputeConfirmedAmount(e.target.value)}
                  placeholder="Amount physically received..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Dispute Reason / Details</label>
                <textarea
                  rows="3"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Explain discrepancy (e.g. Agent declared ₹1500 but physically handed over ₹1200)..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 text-xs font-medium"
                ></textarea>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalItem(null)}
                  className="w-1/2 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {submitting ? 'Flagging...' : 'Flag Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
