import React from 'react';
import { Bell, Package, Wallet, Clock, CheckCircle } from 'lucide-react';

export default function NotificationsTab() {
  const notifications = [
    { title: 'New delivery assigned', text: 'Order #ORD-10250 assigned to you for Green Park', time: '2 min ago', icon: Package, color: 'bg-emerald-100 text-emerald-800' },
    { title: 'Customer not available', text: 'Delivery failed for Order #ORD-10231', time: '1 hr ago', icon: Clock, color: 'bg-amber-100 text-amber-800' },
    { title: 'Incentive earned!', text: 'You earned ₹150 peak-hour incentive today', time: '2 hr ago', icon: Wallet, color: 'bg-purple-100 text-purple-800' },
    { title: 'Payout Processed', text: 'Bank transfer of ₹4,200 completed for last week', time: '1 day ago', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h2>
        <p className="text-sm text-gray-500 font-medium">Real-time alerts, package assignments, and incentive updates.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
        {notifications.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 flex items-start space-x-4 hover:bg-emerald-50/20 transition-colors">
              <div className={`p-3 rounded-xl ${item.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <span className="text-xs text-gray-400 font-medium">{item.time}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-1">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
