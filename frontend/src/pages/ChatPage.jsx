import { useState } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';

/**
 * ChatPage - Main chat page with sidebar layout
 */
export const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState(null);

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
            onSelectVehicle={setActiveVehicle}
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
    </div>
  );
};

export default ChatPage;
