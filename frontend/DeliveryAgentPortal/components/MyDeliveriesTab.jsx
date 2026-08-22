import React, { useState } from 'react';
import { Search, MapPin, Phone, CheckCircle2, Clock, Navigation, Filter } from 'lucide-react';

const allDeliveries = [
  { id: '#ORD-10245', customer: 'Rahul Sharma', address: '12, Green Park, Delhi - 110016', status: 'Out for Delivery', amount: '₹1,299', type: 'COD', distance: '2.4 km away', phone: '+91 98765 43210' },
  { id: '#ORD-10246', customer: 'Sneha Verma', address: '45, Sector 7, Noida - 201301', status: 'Pending', amount: '₹899', type: 'COD', distance: '4.1 km away', phone: '+91 98765 88990' },
  { id: '#ORD-10247', customer: 'Vikram Singh', address: '88, MG Road, Gurgaon - 122001', status: 'Pending', amount: '₹1,499', type: 'Prepaid', distance: '5.8 km away', phone: '+91 98765 77665' },
  { id: '#ORD-10248', customer: 'Anjali Mehta', address: '23, Lake View, Bangalore - 560001', status: 'Delivered', amount: '₹650', type: 'COD', distance: '6.2 km away', phone: '+91 98765 11223' },
  { id: '#ORD-10249', customer: 'Rohit Das', address: '9, Salt Lake, Kolkata - 700091', status: 'Delivered', amount: '₹1,199', type: 'Prepaid', distance: '3.0 km away', phone: '+91 98765 33445' },
];

export default function MyDeliveriesTab() {
  const [deliveries, setDeliveries] = useState(allDeliveries);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const handleUpdateStatus = (id, newStatus) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const filtered = deliveries.filter(d => {
    const matchSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) || d.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = selectedFilter === 'All' || d.status === selectedFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Deliveries</h2>
        <p className="text-sm text-gray-500 font-medium">Manage assigned packages, pickup locations, and completion status.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Out for Delivery', 'Pending', 'Delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedFilter === status
                  ? 'bg-[#1b4d3e] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-black text-gray-900 text-base">{item.id}</span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                item.status === 'Out for Delivery' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Delivered' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-gray-900 text-sm">{item.customer}</h4>
              <p className="text-xs text-gray-500 font-medium flex items-start space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>{item.address}</span>
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 font-semibold block">COD / Prepaid</span>
                <span className="font-extrabold text-gray-900">{item.amount} ({item.type})</span>
              </div>
              <a href={`tel:${item.phone}`} className="p-2 bg-emerald-50 text-emerald-800 rounded-xl hover:bg-emerald-100">
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {item.status !== 'Delivered' && (
              <div className="pt-2 flex space-x-2">
                {item.status === 'Pending' ? (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Out for Delivery')}
                    className="w-full bg-[#1b4d3e] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#0f382c]"
                  >
                    Start Delivery
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Delivered')}
                    className="w-full bg-[#ff5100] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#e64900]"
                  >
                    Complete Delivery
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
