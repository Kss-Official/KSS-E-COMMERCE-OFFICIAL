import React from 'react';
import { Bell, AlertTriangle, Boxes, CheckCircle2 } from 'lucide-react';

export default function AlertsTab() {
  const alerts = [
    { title: 'Critical Low Stock: Wireless Earbuds', desc: 'WE-1001 down to 8 units in Bin A-102 (Reorder threshold: 20)', time: '10 min ago', severity: 'high' },
    { title: 'Bin Capacity Nearing 90%', desc: 'Bin Section B-300 to B-320 utilization is at 88%', time: '1 hr ago', severity: 'medium' },
    { title: 'Inbound Verification Pending', desc: 'PO #RCPT-250522-003 from BoAt Lifestyle pending verification', time: '2 hr ago', severity: 'medium' },
    { title: 'Temperature Alert: Bin Storage C-10', desc: 'Cooling system operating normally at 22°C', time: '4 hr ago', severity: 'low' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Alerts & System Notifications</h2>
        <p className="text-sm text-gray-500 font-medium">Critical low stock alerts, bin capacity warnings, and pending PO receipts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
        {alerts.map((item, idx) => (
          <div key={idx} className="p-5 flex items-start space-x-4 hover:bg-blue-50/20 transition-colors">
            <div className={`p-3 rounded-xl shrink-0 ${
              item.severity === 'high' ? 'bg-rose-100 text-rose-800' : item.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                <span className="text-xs text-gray-400 font-medium">{item.time}</span>
              </div>
              <p className="text-xs text-gray-600 font-medium mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
