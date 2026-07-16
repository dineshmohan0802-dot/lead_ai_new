import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { ingestionApi } from '../../lib/api';
import { RefreshCw, Bell, Menu } from 'lucide-react';

export default function Topbar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [isIngesting, setIsIngesting] = useState(false);

  const handleTriggerIngestion = async () => {
    setIsIngesting(true);
    try {
      await ingestionApi.trigger();
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
        bg-white border-b border-gray-100 shadow-sm`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleTriggerIngestion}
            disabled={isIngesting}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm
              ${isIngesting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-md'
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            {isIngesting ? 'Syncing...' : 'Sync Signals'}
          </button>

          <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
