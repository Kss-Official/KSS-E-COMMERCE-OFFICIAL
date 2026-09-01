import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowDownToLine, CheckCircle2, X, RefreshCw, Check, ShieldCheck } from 'lucide-react';
import {
  fetchWarehouseInboundApi,
  createInboundReceiptApi,
  verifyInboundReceiptApi
} from '../../src/services/api';

export default function InboundTab() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ supplier: '', item: '', sku: '', qty: 50 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadInbound = async () => {
    setIsLoading(true);
    const data = await fetchWarehouseInboundApi();
    setItems(Array.isArray(data) ? data : []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadInbound();
  }, []);

  // Writes a real InboundReceipt row; the backend generates the receipt_id.
  const handleAddInbound = async (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.item) return;

    setIsSaving(true);
    const res = await createInboundReceiptApi({
      supplier_name: formData.supplier,
      item_title: formData.item,
      sku: formData.sku,
      quantity: Number(formData.qty) || 50,
      status: 'Pending Verification'
    });
    setIsSaving(false);

    if (res?.status === 'success') {
      setItems((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ supplier: '', item: '', sku: '', qty: 50 });
      notify('Goods receipt logged successfully.');
    } else {
      notify(res?.message || 'Could not save this receipt.');
    }
  };

  // Verifying a receipt pushes the received units into Product.stock_quantity.
  const handleVerify = async (row) => {
    setBusyId(row.id);
    const res = await verifyInboundReceiptApi(row.id);
    setBusyId(null);

    if (res?.status === 'success') {
      setItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...res.data } : r)));
      notify(res.message || `${row.quantity} units added to floor stock.`);
    } else {
      notify(res?.message || 'Could not verify this receipt.');
    }
  };

  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = items.filter((i) => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && i.status !== 'Verified') ||
      (statusFilter === 'VERIFIED' && i.status === 'Verified');

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (i.receipt_id || '').toLowerCase().includes(term) ||
      (i.supplier_name || '').toLowerCase().includes(term) ||
      (i.item_title || '').toLowerCase().includes(term) ||
      (i.sku || '').toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  const pendingCount = items.filter((i) => i.status !== 'Verified').length;
  const unitsReceived = items.reduce((acc, i) => acc + Number(i.quantity || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-blue-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-bold z-50 flex items-center space-x-2">
          <Check className="w-4 h-4 text-blue-300" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inbound Goods Receipts</h2>
          <p className="text-sm text-gray-500 font-medium">Log supplier deliveries, verify stock quality, and update warehouse bin allocations.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#ff5100] hover:bg-[#e64900] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Goods Receipt</span>
          </button>
        </div>
      </div>

      {/* Live interactive counter buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <ArrowDownToLine className="w-4 h-4 text-blue-600" />
            <span>Total Receipts</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{items.length}</p>
        </button>

        <button
          onClick={() => setStatusFilter('VERIFIED')}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'VERIFIED' ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Units Received</span>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-1">{unitsReceived.toLocaleString('en-IN')}</p>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`text-left p-4 rounded-2xl border shadow-xs transition-all cursor-pointer ${
            statusFilter === 'PENDING' ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Awaiting Verification</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt ID, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Receipt ID</th>
                <th className="py-3.5 px-6">Supplier Partner</th>
                <th className="py-3.5 px-6">Item / Category</th>
                <th className="py-3.5 px-6">Qty Received</th>
                <th className="py-3.5 px-6">Log Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading && items.length === 0 && (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="h-4 bg-gray-100 rounded" />
                    </td>
                  </tr>
                ))
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <ArrowDownToLine className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">No inbound receipts</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchTerm ? 'Nothing matched that search.' : 'Log your first supplier delivery to get started.'}
                    </p>
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-gray-900">{item.receipt_id}</td>
                  <td className="py-4 px-6 font-bold text-gray-900 text-xs">{item.supplier_name}</td>
                  <td className="py-4 px-6 text-gray-700 font-semibold text-xs">
                    <span className="line-clamp-1">{item.item_title}</span>
                    {item.sku && (
                      <span className="block text-[11px] font-mono text-gray-400 mt-0.5">{item.sku}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-extrabold text-gray-900">{item.quantity}</td>
                  <td className="py-4 px-6 text-gray-500 text-xs font-medium">{item.formatted_date}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                      item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {item.status === 'Verified' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Stocked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerify(item)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{busyId === item.id ? 'Verifying...' : 'Verify & Stock'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-lg text-gray-900">Create Inbound Goods Receipt</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddInbound} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Supplier / Logistics Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony India Pvt Ltd"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Headphones"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">SKU Code (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. WH-1001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-gray-400 font-medium mt-1">
                  Matching a real SKU lets "Verify &amp; Stock" push these units straight into floor stock.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Quantity Received</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#ff5100] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
