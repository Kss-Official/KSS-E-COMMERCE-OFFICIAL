import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, X, RefreshCw, Ticket, CalendarClock } from 'lucide-react';
import {
  fetchCouponsApi,
  createCouponApi,
  updateCouponApi,
  deleteCouponApi
} from '../../src/services/api';

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

// The API hands back ISO timestamps; the date inputs want YYYY-MM-DD.
const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : '');

const shortDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
    : '—';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '10%',
    type: 'Percentage',
    status: 'Active',
    minOrder: '',
    maxDiscount: '',
    usageLimit: '',
    validTo: ''
  });

  const formatCoupon = (c) => {
    const val = c.discount_value || c.discount || '10';
    const isPerc = (c.discount_type || c.type || '').toUpperCase() === 'PERCENTAGE';
    const numeric = Number(val);
    const displayDiscount = isPerc
      ? `${numeric % 1 === 0 ? numeric : numeric.toFixed(2)}%`
      : money(numeric);
    const expired = c.valid_to ? new Date(c.valid_to) < new Date() : false;

    return {
      id: c.id,
      code: c.code,
      discount: displayDiscount,
      discountValue: numeric,
      type: isPerc ? 'Percentage' : 'Fixed',
      minOrder: Number(c.min_order_value || 0),
      maxDiscount: c.max_discount_amount ? Number(c.max_discount_amount) : null,
      usageLimit: c.total_usage_limit,
      usedCount: Number(c.total_used_count || 0),
      perUserLimit: Number(c.per_user_limit || 1),
      validFrom: c.valid_from,
      validTo: c.valid_to,
      expired,
      status: c.is_active !== false ? 'Active' : 'Inactive'
    };
  };

  const loadCoupons = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchCouponsApi();
      if (Array.isArray(data)) {
        setCoupons(data.map(formatCoupon));
      }
    } catch (err) {
      console.warn('[CouponsTab] Error fetching coupons:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
    const interval = setInterval(() => {
      loadCoupons(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadCoupons]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount) return;
    try {
      await createCouponApi({
        ...formData,
        // A bare date means "valid through end of that day".
        validTo: formData.validTo ? `${formData.validTo}T23:59:59` : undefined
      });
      setIsModalOpen(false);
      setFormData({
        code: '',
        discount: '10%',
        type: 'Percentage',
        status: 'Active',
        minOrder: '',
        maxDiscount: '',
        usageLimit: '',
        validTo: ''
      });
      loadCoupons();
    } catch (err) {
      alert('Failed to create coupon: ' + err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    try {
      await updateCouponApi(editingCoupon.id, {
        code: editingCoupon.code,
        discount_value: editingCoupon.discountValue,
        type: editingCoupon.type,
        status: editingCoupon.status,
        min_order_value: editingCoupon.minOrder || 0,
        max_discount_amount: editingCoupon.maxDiscount || undefined,
        total_usage_limit: editingCoupon.usageLimit || undefined,
        valid_to: editingCoupon.validToInput ? `${editingCoupon.validToInput}T23:59:59` : undefined
      });
      setEditingCoupon(null);
      loadCoupons();
    } catch (err) {
      alert('Failed to update coupon: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon code from database?')) return;
    try {
      await deleteCouponApi(id);
      loadCoupons();
    } catch (err) {
      alert('Failed to delete coupon: ' + err.message);
    }
  };

  const openEdit = (c) => setEditingCoupon({ ...c, validToInput: toDateInput(c.validTo) });

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const activeCount = coupons.filter(c => c.status === 'Active' && !c.expired).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Coupons</h2>
            {isRefreshing && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1.5 border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                <span>Live Syncing</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Create promotional discount codes in database and manage active deals.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadCoupons()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
            title="Refresh Coupons"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Coupon</span>
          </button>
        </div>
      </div>

      {/* Live coupon summary straight off the list payload */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Total Coupons</p>
            <p className="text-xl font-black text-gray-900">{isLoading ? '—' : coupons.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Live Right Now</p>
            <p className="text-xl font-black text-gray-900">{isLoading ? '—' : activeCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center space-x-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Total Redemptions</p>
            <p className="text-xl font-black text-gray-900">{isLoading ? '—' : totalRedemptions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-medium flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading coupons from database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Code</th>
                  <th className="py-3.5 px-6">Discount</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Min Order</th>
                  <th className="py-3.5 px-6">Validity</th>
                  <th className="py-3.5 px-6">Used</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg font-mono border border-gray-200">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      {c.discount}
                      {c.maxDiscount && (
                        <div className="text-[11px] text-gray-400 font-semibold">max {money(c.maxDiscount)}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-semibold">{c.type}</td>
                    <td className="py-4 px-6 text-gray-600 font-semibold">
                      {c.minOrder > 0 ? money(c.minOrder) : 'None'}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-semibold whitespace-nowrap">
                      {shortDate(c.validFrom)} – {shortDate(c.validTo)}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-semibold">
                      {c.usedCount}
                      {c.usageLimit ? <span className="text-gray-400"> / {c.usageLimit}</span> : ''}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                          c.expired
                            ? 'bg-gray-100 text-gray-600'
                            : c.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.expired ? 'Expired' : c.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400 font-medium">
                      No coupons found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUYZO20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Amount</label>
                  <input
                    type="text"
                    required
                    placeholder="20% or ₹100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional cap"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Leave "Valid Until" blank and the coupon runs for the next 90 days.
              </p>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl cursor-pointer">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCoupon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-fade-in">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Edit Coupon {editingCoupon.code}</h3>
              <button onClick={() => setEditingCoupon(null)} className="text-emerald-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={editingCoupon.code}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingCoupon.discountValue}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountValue: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                  <select
                    value={editingCoupon.type}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, type: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCoupon.minOrder}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minOrder: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="No cap"
                    value={editingCoupon.maxDiscount || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={editingCoupon.validToInput}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, validToInput: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={editingCoupon.usageLimit || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={editingCoupon.status}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                Redeemed {editingCoupon.usedCount} time{editingCoupon.usedCount === 1 ? '' : 's'} so far · limit {editingCoupon.perUserLimit} per customer.
              </p>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditingCoupon(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#093529] text-white hover:bg-[#0c4737] rounded-xl cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
