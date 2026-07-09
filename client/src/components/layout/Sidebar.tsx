import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAppStore } from '../../stores/appStore';
import {
  LayoutDashboard,
  Users,
  Radio,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/dashboard/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard/signals', icon: Radio, label: 'Signals' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-surface-900/80 backdrop-blur-xl border-r border-surface-700/50`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-surface-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold gradient-text animate-fade-in">
                LeadPulse
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 shadow-sm'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium animate-fade-in">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-surface-700/50">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2 animate-fade-in">
              <p className="text-xs text-surface-500">Signed in as</p>
              <p className="text-sm text-surface-300 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
              text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
