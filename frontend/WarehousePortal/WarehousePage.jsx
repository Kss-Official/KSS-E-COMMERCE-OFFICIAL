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
import { LayoutDashboard, ArrowDownToLine, Boxes, ShoppingBag, Menu } from 'lucide-react';
import { useNavigationContext } from '../src/context/NavigationContext';
import { getCurrentUser, autoAuthenticateRole, logoutUser } from '../src/services/api';

export default function WarehousePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    <div className="flex h-screen overflow-hidden bg-gray-50/70 font-sans antialiased text-gray-800 pb-16 md:pb-0 relative">
      {/* Desktop Standing Sidebar */}
      <div className="hidden md:block h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitPortal={handleExitPortal} />
      </div>

      {/* Mobile Slide-Over Sidebar Drawer (< 768px) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          />
          <div className="relative w-[280px] bg-[#1D4ED8] h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onExitPortal={handleExitPortal}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar
          title={activeTab}
          onExitPortal={handleExitPortal}
          setActiveTab={setActiveTab}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="portal-main p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#173eb2] text-white border-t border-[#3B82F6]/40 flex items-center justify-around py-2 z-40 shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'dashboard' ? 'text-blue-200 font-bold' : 'text-blue-100/70'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('inbound')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'inbound' ? 'text-blue-200 font-bold' : 'text-blue-100/70'}`}
        >
          <ArrowDownToLine className="w-5 h-5" />
          <span className="text-[10px]">Inbound</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'inventory' ? 'text-blue-200 font-bold' : 'text-blue-100/70'}`}
        >
          <Boxes className="w-5 h-5" />
          <span className="text-[10px]">Inventory</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'orders' ? 'text-blue-200 font-bold' : 'text-blue-100/70'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer text-blue-100/70 hover:text-white"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </div>
  );
}
