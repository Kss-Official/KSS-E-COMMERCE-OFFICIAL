import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardTab from './components/DashboardTab';
import InboundTab from './components/InboundTab';
import InventoryTab from './components/InventoryTab';
import OutboundTab from './components/OutboundTab';
import StockTransfersTab from './components/StockTransfersTab';
import ReturnsTab from './components/ReturnsTab';
import OrdersTab from './components/OrdersTab';
import ShipmentsTab from './components/ShipmentsTab';
import ReportsTab from './components/ReportsTab';
import AlertsTab from './components/AlertsTab';
import SettingsTab from './components/SettingsTab';
import { useNavigationContext } from '../src/context/NavigationContext';

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navContext = useNavigationContext();

  const handleExitPortal = () => {
    if (navContext?.navigateTo) {
      navContext.navigateTo('home');
    } else {
      window.location.hash = '#home';
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inbound':
        return <InboundTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'outbound':
        return <OutboundTab />;
      case 'orders':
        return <OrdersTab />;
      case 'shipments':
        return <ShipmentsTab />;
      case 'transfers':
        return <StockTransfersTab />;
      case 'returns':
        return <ReturnsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'alerts':
        return <AlertsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'dashboard':
      default:
        return <DashboardTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/70 font-sans antialiased text-gray-800">
      {/* Warehouse Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitPortal={handleExitPortal} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar title={activeTab} onExitPortal={handleExitPortal} setActiveTab={setActiveTab} />
        <main className="portal-main p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
