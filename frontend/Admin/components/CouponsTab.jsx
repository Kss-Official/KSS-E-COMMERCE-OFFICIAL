import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Ticket, X } from 'lucide-react';

const initialCoupons = [
  { id: 1, code: 'SAVE10', discount: '10%', type: 'Percentage', status: 'Active' },
  { id: 2, code: 'WELCOME', discount: '₹100', type: 'Fixed', status: 'Active' },
  { id: 3, code: 'FESTIVE20', discount: '20%', type: 'Percentage', status: 'Inactive' },
  { id: 4, code: 'NEWUSER', discount: '15%', type: 'Percentage', status: 'Active' },
  { id: 5, code: 'DEAL50', discount: '₹50', type: 'Fixed', status: 'Expired' },
];

export default function CouponsTab() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount: '', type: 'Percentage', status: 'Active' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discount) return;
    setCoupons([{ id: Date.now(), ...formData }, ...coupons]);
    setIsModalOpen(false);
    setFormData({ code: '', discount: '', type: 'Percentage', status: 'Active' });
  };

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Coupons</h2>
          <p className="text-sm text-gray-500 font-medium">Create promotional discount codes and manage active deals.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Coupon</span>
        </button>
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Code</th>
              <th className="py-3.5 px-6">Discount</th>
              <th className="py-3.5 px-6">Type</th>
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
                <td className="py-4 px-6 font-bold text-gray-900">{c.discount}</td>
                <td className="py-4 px-6 text-gray-600 font-semibold">{c.type}</td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                      c.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'Inactive'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCoupons(coupons.filter(x => x.id !== c.id))} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
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
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white hover:bg-[#e64900] rounded-xl">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
