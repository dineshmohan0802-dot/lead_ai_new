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
        bg-white border-r border-gray-100 shadow-sm`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-base font-bold text-gray-900 tracking-tight animate-fade-in whitespace-nowrap">
                LeadPulse
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={!sidebarOpen ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm ring-1 ring-brand-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm animate-fade-in whitespace-nowrap">{label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          {sidebarOpen && (
            <div className="px-3 py-2 mb-2 animate-fade-in">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm text-gray-700 font-medium truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          )}
          <button
            onClick={signOut}
            title={!sidebarOpen ? 'Sign Out' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
