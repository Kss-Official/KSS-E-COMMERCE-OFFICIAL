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
import { useNavigationContext } from '../src/context/NavigationContext';

export default function DeliveryAgentPage() {
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
    <div className="flex min-h-screen bg-gray-50/70 font-sans antialiased text-gray-800">
      {/* Delivery Agent Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onExitPortal={handleExitPortal} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={activeTab} onExitPortal={handleExitPortal} setActiveTab={setActiveTab} />
        <main className="portal-main p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
