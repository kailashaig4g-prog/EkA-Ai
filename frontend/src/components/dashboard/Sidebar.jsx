import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NavItem = ({ to, icon, label, isActive }) => (
  <NavLink
    to={to}
    className={({ isActive: active }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? 'font-medium'
          : 'hover:bg-[var(--bg-hover)]'
      }`
    }
    style={({ isActive: active }) => ({
      backgroundColor: active ? 'rgba(87, 6, 131, 0.1)' : 'transparent',
      color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
    })}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </NavLink>
);

/**
 * Sidebar - Navigation with conversation history and vehicle selector
 */
export const Sidebar = ({ activeVehicle, vehicles = [], onSelectVehicle, onManageVehicles, isOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <aside
      className="h-full flex flex-col border-r"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
        width: '260px',
      }}
      data-testid="sidebar"
    >
      {/* New Chat Button */}
      <div className="p-4">
        <NavLink
          to="/chat"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:opacity-90"
          style={{
            backgroundColor: 'var(--brand-primary)',
            color: 'white',
          }}
          data-testid="new-chat-sidebar-btn"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <NavItem
          to="/dashboard"
          label="Dashboard"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          }
        />
        <NavItem
          to="/chat"
          label="AI Chat"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <NavItem
          to="/vehicles"
          label="My Vehicles"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 14h14M5 14a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" />
            </svg>
          }
        />
      </nav>

      {/* Active Vehicle Card */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          Active Vehicle
        </p>
        {vehicles.length > 0 ? (
          <select
            value={activeVehicle?._id || ''}
            onChange={(e) => {
              const vehicle = vehicles.find((v) => v._id === e.target.value);
              onSelectVehicle?.(vehicle);
            }}
            className="w-full px-3 py-2 rounded-xl text-sm transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            data-testid="vehicle-selector"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </option>
            ))}
          </select>
        ) : (
          <button
            onClick={onManageVehicles}
            className="w-full px-3 py-2 rounded-xl text-sm transition-colors text-left flex items-center gap-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add a vehicle
          </button>
        )}
      </div>

      {/* User Profile Section */}
      <div
        className="p-4 border-t flex items-center gap-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {user?.name || 'User'}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
            {user?.email || ''}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          title="Logout"
          data-testid="logout-btn"
        >
          <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
