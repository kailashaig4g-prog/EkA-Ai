import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

/**
 * Dashboard - Layout wrapper with header and sidebar
 */
export const Dashboard = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-[260px]' : 'w-0'
          } overflow-hidden`}
        >
          <Sidebar isOpen={sidebarOpen} />
        </div>
        <main className="flex-1 p-6 min-h-[calc(100vh-60px)]">{children}</main>
      </div>
    </div>
  );
};

export default Dashboard;
