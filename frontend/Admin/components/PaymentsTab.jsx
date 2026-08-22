import React, { useState } from 'react';
import { Search, CreditCard, ArrowUpRight, DollarSign, AlertCircle } from 'lucide-react';

const initialTransactions = [
  { txnId: 'TXN1001', orderId: '#ORD1042', amount: '₹1,299', method: 'UPI', status: 'Success', date: 'May 29' },
  { txnId: 'TXN1002', orderId: '#ORD1041', amount: '₹2,499', method: 'Card', status: 'Success', date: 'May 28' },
  { txnId: 'TXN1003', orderId: '#ORD1040', amount: '₹799', method: 'UPI', status: 'Success', date: 'May 27' },
  { txnId: 'TXN1004', orderId: '#ORD1039', amount: '₹1,999', method: 'Wallet', status: 'Failed', date: 'May 26' },
];

export default function PaymentsTab() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = initialTransactions.filter(t => 
    t.txnId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payments</h2>
          <p className="text-sm text-gray-500 font-medium">Monitor revenue settlements, gateways, and transaction logs.</p>
        </div>
        <button className="flex items-center justify-center space-x-2 bg-[#ff5100] hover:bg-[#e64900] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer shrink-0">
          <span>View Transactions</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-2xl">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Collected</span>
          <h3 className="text-2xl font-black text-emerald-950 mt-1">₹12,45,230</h3>
        </div>
        <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending</span>
          <h3 className="text-2xl font-black text-amber-950 mt-1">₹1,20,450</h3>
        </div>
        <div className="bg-rose-50/60 border border-rose-100 p-5 rounded-2xl">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Failed</span>
          <h3 className="text-2xl font-black text-rose-950 mt-1">₹12,320</h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Txn ID</th>
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Method</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((t) => (
              <tr key={t.txnId} className="hover:bg-emerald-50/30 transition-colors">
                <td className="py-4 px-6 font-bold text-gray-900">{t.txnId}</td>
                <td className="py-4 px-6 font-medium text-gray-600">{t.orderId}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{t.amount}</td>
                <td className="py-4 px-6 text-gray-600 font-semibold">{t.method}</td>
                <td className="py-4 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                      t.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-500 text-xs font-medium">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
