import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardTab from './components/DashboardTab';
import MyDeliveriesTab from './components/MyDeliveriesTab';
import ActiveDeliveryTab from './components/ActiveDeliveryTab';
import HistoryTab from './components/HistoryTab';
import EarningsTab from './components/EarningsTab';
import NotificationsTab from './components/NotificationsTab';
import ProfileTab from './components/ProfileTab';
import SupportTab from './components/SupportTab';
import { LayoutDashboard, Truck, Wallet, User, Headphones } from 'lucide-react';
import { useNavigationContext } from '../src/context/NavigationContext';

export default function DeliveryAgentPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
      case 'my-deliveries':
        return <MyDeliveriesTab />;
      case 'active-delivery':
        return <ActiveDeliveryTab />;
      case 'history':
        return <HistoryTab />;
      case 'earnings':
        return <EarningsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'profile':
        return <ProfileTab />;
      case 'support':
        return <SupportTab />;
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
          <div className="relative w-[280px] bg-[#0B5E3C] h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cyan-950 text-white border-t border-cyan-800 flex items-center justify-around py-2 z-50 shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'dashboard' ? 'text-cyan-300 font-bold' : 'text-cyan-100/70'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('my-deliveries')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'my-deliveries' || activeTab === 'active-delivery' ? 'text-cyan-300 font-bold' : 'text-cyan-100/70'}`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px]">Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'earnings' ? 'text-cyan-300 font-bold' : 'text-cyan-100/70'}`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Earnings</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 cursor-pointer ${activeTab === 'profile' ? 'text-cyan-300 font-bold' : 'text-cyan-100/70'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
}

