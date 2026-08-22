import React, { useState } from 'react';
import { Download, Calendar, BarChart3, CheckCircle } from 'lucide-react';

export default function ReportsTab() {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const csvRows = [
      ['Metric', 'Count'],
      ['Total Stock Units', '12560'],
      ['Active SKUs', '1245'],
      ['Inbound Shipments', '248'],
      ['Outbound Shipments', '312'],
      ['Bin Utilization Rate', '72%']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Warehouse_WH01_Stock_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Warehouse Reports & Audits</h2>
          <p className="text-sm text-gray-500 font-medium">Download stock audit CSV logs, bin space reports, and throughput analytics.</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download Audit CSV</span>
        </button>
      </div>

      {downloaded && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">Stock Audit CSV Report downloaded successfully!</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900">Monthly Throughput Audit</h3>
        <p className="text-xs text-gray-500">Summary of total units processed in May 2025 across all 320 bin locations.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase block">Inbound Volume</span>
            <span className="text-2xl font-black text-emerald-700">14,200 Units</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase block">Outbound Volume</span>
            <span className="text-2xl font-black text-blue-700">12,850 Units</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-400 font-bold uppercase block">Restocked Returns</span>
            <span className="text-2xl font-black text-purple-700">410 Units</span>
          </div>
        </div>
      </div>
    </div>
  );
}
