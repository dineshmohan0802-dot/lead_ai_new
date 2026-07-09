import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { ingestionApi } from '../../lib/api';
import { Search, RefreshCw, Bell, Menu } from 'lucide-react';

export default function Topbar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isIngesting, setIsIngesting] = useState(false);

  const handleTriggerIngestion = async () => {
    setIsIngesting(true);
    try {
      await ingestionApi.trigger();
      // Trigger a page refresh of data
      window.dispatchEvent(new Event('ingestion-complete'));
    } catch (error) {
      console.error('Ingestion failed:', error);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 transition-all duration-300
        ${sidebarOpen ? 'left-64' : 'left-20'}
        bg-surface-900/60 backdrop-blur-xl border-b border-surface-700/50`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Mobile menu + search */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-800 text-surface-400"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search leads, signals..."
              className="input pl-10 py-2 w-72 text-sm bg-surface-800/50"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerIngestion}
            disabled={isIngesting}
            className="btn-primary btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            {isIngesting ? 'Ingesting...' : 'Sync Signals'}
          </button>

          <button className="relative p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
