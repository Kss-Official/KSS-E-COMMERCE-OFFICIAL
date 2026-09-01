import React, { useState, useEffect } from 'react';
import { Warehouse, Bell, Calendar, Store, AlertTriangle, X } from 'lucide-react';
import { fetchWarehouseSummaryApi, fetchWarehouseAlertsApi } from '../../src/services/api';
import ProfileDropdown from '../../src/components/ui/ProfileDropdown';

export default function Topbar({ title, onExitPortal, onLogout, setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const loadData = async () => {
    const [summaryData, alertData] = await Promise.all([
      fetchWarehouseSummaryApi(),
      fetchWarehouseAlertsApi()
    ]);
    if (summaryData) setSummary(summaryData);
    if (Array.isArray(alertData?.alerts)) setAlerts(alertData.alerts);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000); // 4-second live poll for new customer purchases
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (alert) => {
    setShowAlerts(false);
    if (!setActiveTab) return;
    if (alert.type === 'New Customer Order') {
      setActiveTab('shipments');
    } else if (alert.type === 'Unverified Receipt') {
      setActiveTab('inbound');
    } else if (alert.type === 'Out of Stock' || alert.type === 'Low Stock') {
      setActiveTab('inventory');
    }
  };

  const operatorName = summary?.operator_name || 'Warehouse Operator';

  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-6 flex items-center justify-between shadow-xs sticky top-0 z-10">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-[#dbeafe] text-[#1D4ED8]">
          <Warehouse className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 capitalize">
          Warehouse Portal
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Date */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700">
          <Calendar className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Return to Store */}
        {onExitPortal && (
          <button
            onClick={onExitPortal}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#1D4ED8] bg-[#dbeafe] hover:bg-[#bfdbfe] px-3 py-1.5 rounded-xl border border-[#3B82F6]/30 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store View</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts((v) => !v)}
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center border-2 border-white shadow-xs">
                {alerts.length > 9 ? '9+' : alerts.length}
              </span>
            )}
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">Warehouse Alerts</h4>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {alerts.length === 0 && (
                  <p className="px-4 py-6 text-center text-xs font-semibold text-gray-400">
                    No alerts. Stock levels are healthy.
                  </p>
                )}
                {alerts.slice(0, 10).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => handleNotificationClick(alert)}
                    className="px-4 py-3 flex items-start space-x-2.5 hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <AlertTriangle
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        alert.severity === 'critical'
                          ? 'text-rose-600'
                          : alert.severity === 'warning'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1">
                        {alert.type}: {alert.title}
                      </p>
                      <p className="text-[11px] text-gray-500 font-medium line-clamp-2">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Warehouse Manager Profile Dropdown */}
        <div className="pl-3 border-l border-gray-200">
          <ProfileDropdown
            user={{
              name: operatorName,
              designation: `Warehouse Manager (${summary?.warehouse_code || 'WH01'})`,
              avatar: summary?.avatar
            }}
            setActiveTab={setActiveTab}
            onLogout={onLogout}
            portalType="warehouse"
          />
        </div>
      </div>
    </header>
  );
}
