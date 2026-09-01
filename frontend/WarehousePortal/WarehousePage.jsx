import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardTab from './components/DashboardTab';
import InboundTab from './components/InboundTab';
import InventoryTab from './components/InventoryTab';
import OutboundTab from './components/OutboundTab';
import CashHandoversTab from './components/CashHandoversTab';
import StockTransfersTab from './components/StockTransfersTab';
import ReturnsTab from './components/ReturnsTab';
import OrdersTab from './components/OrdersTab';
import ShipmentsTab from './components/ShipmentsTab';
import ReportsTab from './components/ReportsTab';
import AlertsTab from './components/AlertsTab';
import SettingsTab from './components/SettingsTab';
import { useNavigationContext } from '../src/context/NavigationContext';
import { getCurrentUser, autoAuthenticateRole, logoutUser } from '../src/services/api';

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navContext = useNavigationContext();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'WAREHOUSE') {
      autoAuthenticateRole('warehouse');
    }
  }, []);

  const handleExitPortal = () => {
    if (navContext?.navigateTo) {
      navContext.navigateTo('home');
    } else {
      window.location.hash = '#home';
    }
  };

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem('buyzo_access_token');
    localStorage.removeItem('buyzo_current_user');
    localStorage.setItem('buyzo_current_page', 'login');
    if (navContext?.navigateTo) {
      navContext.navigateTo('login');
    } else {
      window.location.hash = '#login';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inbound':
        return <InboundTab setActiveTab={setActiveTab} />;
      case 'inventory':
        return <InventoryTab setActiveTab={setActiveTab} />;
      case 'outbound':
        return <OutboundTab setActiveTab={setActiveTab} />;
      case 'cash-handovers':
        return <CashHandoversTab setActiveTab={setActiveTab} />;
      case 'orders':
        return <OrdersTab setActiveTab={setActiveTab} />;
      case 'shipments':
        return <ShipmentsTab setActiveTab={setActiveTab} />;
      case 'transfers':
        return <StockTransfersTab setActiveTab={setActiveTab} />;
      case 'returns':
        return <ReturnsTab setActiveTab={setActiveTab} />;
      case 'reports':
        return <ReportsTab setActiveTab={setActiveTab} />;
      case 'alerts':
        return <AlertsTab setActiveTab={setActiveTab} />;
      case 'settings':
        return <SettingsTab setActiveTab={setActiveTab} />;
      case 'dashboard':
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/70 font-sans antialiased text-gray-800">
      {/* Warehouse Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitPortal={handleExitPortal} onLogout={handleLogout} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar title={activeTab} onExitPortal={handleExitPortal} onLogout={handleLogout} setActiveTab={setActiveTab} />
        <main className="portal-main p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
