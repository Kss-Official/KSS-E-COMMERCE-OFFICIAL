import React, { useState } from 'react';
import { Search, Edit, Trash2, Eye, Calendar, Filter, X, CheckCircle, Clock, Truck, ShoppingBag } from 'lucide-react';

const initialOrders = [
  { 
    id: '#ORD1042', 
    customer: 'Rahul Sharma', 
    email: 'rahul@gmail.com',
    phone: '+91 98765 43210',
    address: '42, Park Street, Connaught Place, New Delhi - 110001',
    amount: '₹1,299', 
    paymentMethod: 'UPI',
    status: 'Pending', 
    date: 'May 29',
    items: [
      { name: 'Wireless Headphones', qty: 1, price: '₹1,299' }
    ]
  },
  { 
    id: '#ORD1041', 
    customer: 'Priya Nair', 
    email: 'priya@gmail.com',
    phone: '+91 98765 12345',
    address: '15, Marine Drive, Churchgate, Mumbai - 400020',
    amount: '₹2,499', 
    paymentMethod: 'Credit Card',
    status: 'Shipped', 
    date: 'May 28',
    items: [
      { name: 'Smart Watch', qty: 1, price: '₹2,499' }
    ]
  },
  { 
    id: '#ORD1040', 
    customer: 'Amit Verma', 
    email: 'amit@gmail.com',
    phone: '+91 98765 67890',
    address: '88, MG Road, Indiranagar, Bengaluru - 560038',
    amount: '₹799', 
    paymentMethod: 'Net Banking',
    status: 'Delivered', 
    date: 'May 27',
    items: [
      { name: 'Cotton T-Shirt', qty: 1, price: '₹799' }
    ]
  },
  { 
    id: '#ORD1039', 
    customer: 'Sneha Iyer', 
    email: 'sneha@gmail.com',
    phone: '+91 98765 99887',
    address: '12, Anna Salai, T. Nagar, Chennai - 600017',
    amount: '₹1,999', 
    paymentMethod: 'Paytm Wallet',
    status: 'Pending', 
    date: 'May 26',
    items: [
      { name: 'Running Shoes', qty: 1, price: '₹1,799' },
      { name: 'Socks Pack', qty: 1, price: '₹200' }
    ]
  },
  { 
    id: '#ORD1038', 
    customer: 'Vikram Rao', 
    email: 'vikram@gmail.com',
    phone: '+91 98765 11223',
    address: '5, Jubilee Hills, Hyderabad - 500033',
    amount: '₹1,499', 
    paymentMethod: 'COD',
    status: 'Delivered', 
    date: 'May 25',
    items: [
      { name: 'Backpack', qty: 1, price: '₹1,499' }
    ]
  },
];

export default function OrdersTab() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState(null);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to cancel order ${id}?`)) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'All' || o.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Orders</h2>
          <p className="text-sm text-gray-500 font-medium">Track customer orders, delivery stages, and invoicing.</p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>

          <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>May 2024</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6">Order ID</th>
              <th className="py-3.5 px-6">Customer</th>
              <th className="py-3.5 px-6">Amount</th>
              <th className="py-3.5 px-6">Status Toggle</th>
              <th className="py-3.5 px-6">Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((ord) => (
              <tr key={ord.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="py-4 px-6 font-black text-gray-900">{ord.id}</td>
                <td className="py-4 px-6 text-gray-700 font-semibold">{ord.customer}</td>
                <td className="py-4 px-6 font-bold text-gray-900">{ord.amount}</td>
                <td className="py-4 px-6">
                  {/* Status Dropdown selector directly in row */}
                  <select
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : ord.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-orange-100 text-orange-800 border-orange-300'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td className="py-4 px-6 text-gray-500 text-xs font-medium">{ord.date}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setViewingOrder(ord)}
                      className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ord.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-[#093529] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Order Details: {viewingOrder.id}</h3>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-xl text-xs">
                <div>
                  <span className="text-gray-400 font-semibold block">Customer Name</span>
                  <span className="font-bold text-gray-900 text-sm">{viewingOrder.customer}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Payment Method</span>
                  <span className="font-bold text-emerald-700 text-sm">{viewingOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Contact Email</span>
                  <span className="font-medium text-gray-800">{viewingOrder.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block">Phone</span>
                  <span className="font-medium text-gray-800">{viewingOrder.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Shipping Address</span>
                <p className="text-xs text-gray-700 font-medium bg-gray-50 p-3 rounded-xl border border-gray-200">{viewingOrder.address}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Order Items</span>
                <div className="space-y-2">
                  {viewingOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      <span className="font-bold text-gray-800">{it.name} (x{it.qty})</span>
                      <span className="font-black text-gray-900">{it.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Total Payable</span>
                  <div className="text-xl font-black text-gray-900">{viewingOrder.amount}</div>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2 text-sm font-bold bg-[#ff5100] text-white rounded-xl shadow-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
