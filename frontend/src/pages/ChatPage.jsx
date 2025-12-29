import { useState } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { useVehicle } from '../contexts/VehicleContext';
import { VehicleManager } from '../components/vehicle/VehicleManager';

/**
 * ChatPage - Main chat page with sidebar layout
 */
export const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showVehicleManager, setShowVehicleManager] = useState(false);
  const { activeVehicle, selectVehicle, vehicles } = useVehicle();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    // Reset conversation - could also trigger sidebar refresh
    console.log('New chat started');
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarOpen ? 'w-[260px]' : 'w-0'
          }`}
        >
          <Sidebar
            activeVehicle={activeVehicle}
            vehicles={vehicles}
            onSelectVehicle={selectVehicle}
            onManageVehicles={() => setShowVehicleManager(true)}
            isOpen={sidebarOpen}
          />
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatInterface
            vehicleContext={activeVehicle}
            onNewChat={handleNewChat}
          />
        </main>
      </div>

      {/* Vehicle Manager Modal */}
      <VehicleManager
        isOpen={showVehicleManager}
        onClose={() => setShowVehicleManager(false)}
      />
    </div>
  );
};

export default ChatPage;
