import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import {
  Radio, Users, Flame, TrendingUp,
  ArrowUpRight, ExternalLink,
} from 'lucide-react';
import { IntentBadge, SourceBadge } from '../components/ui/Badge';

// ─── Stat Card ────────────────────────────────────────────────────
const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  brand:  { bg: 'bg-brand-50',   icon: 'text-brand-600',   ring: 'ring-brand-100' },
  green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
  red:    { bg: 'bg-red-50',     icon: 'text-red-500',     ring: 'ring-red-100' },
  purple: { bg: 'bg-violet-50',  icon: 'text-violet-600',  ring: 'ring-violet-100' },
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  change,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
}) {
  const c = colorMap[color] ?? colorMap.brand;
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
          {change && (
            <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg} ring-1 ${c.ring}`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 bg-gray-100 rounded-xl shimmer mb-2" />
          <div className="h-4 w-56 bg-gray-100 rounded-lg shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl h-32 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Your lead intelligence overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Signals"
          value={stats?.total_signals || 0}
          icon={Radio}
          color="brand"
          change={stats?.new_leads_today ? `${stats.new_leads_today} new today` : undefined}
        />
        <StatCard
          label="Total Leads"
          value={stats?.total_leads || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Hot Leads"
          value={stats?.hot_leads || 0}
          icon={Flame}
          color="red"
        />
        <StatCard
          label="Conversion Rate"
          value={
            stats?.total_leads
              ? `${Math.round((stats.hot_leads / stats.total_leads) * 100)}%`
              : '0%'
          }
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source breakdown */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Signals by Source</h2>
          <div className="space-y-3">
            {Object.entries(stats?.leads_by_source || {}).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between py-1">
                <SourceBadge source={source} />
                <span className="text-sm font-bold text-gray-700">{count as number}</span>
              </div>
            ))}
            {Object.keys(stats?.leads_by_source || {}).length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">
                No signals yet. Click &quot;Sync Signals&quot; to start.
              </p>
            )}
          </div>
        </div>

        {/* Top Leads */}
        <div className="lg:col-span-2 bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Top Intent Leads</h2>
          <div className="space-y-2">
            {(stats?.top_leads || []).slice(0, 5).map((lead: any) => {
              const enrichment = lead.signals?.signal_enrichments?.[0];
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {(lead.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {lead.display_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {lead.company_name || lead.signals?.source_name || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900">{lead.score}</span>
                      <span className="text-xs text-gray-400 ml-0.5">pts</span>
                    </div>
                    <IntentBadge label={enrichment?.intent_label || 'low'} />
                  </div>
                </div>
              );
            })}
            {(!stats?.top_leads || stats.top_leads.length === 0) && (
              <p className="text-gray-400 text-sm text-center py-6">
                No leads yet. Sync signals to get started.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-5">Recent Signals</h2>
        <div className="space-y-2">
          {(stats?.recent_signals || []).slice(0, 6).map((signal: any) => {
            const enrichment = signal.signal_enrichments?.[0];
            return (
              <div
                key={signal.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <SourceBadge source={signal.source_name} />
                </div>
                <div className="flex-1 min-w-0">
                  {signal.title && (
                    <p className="text-sm font-semibold text-gray-800 mb-0.5 truncate">
                      {signal.title}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {enrichment?.summary || signal.text?.substring(0, 200)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      {signal.author_handle || signal.author_name || 'anonymous'}
                    </span>
                    {enrichment?.intent_label && (
                      <IntentBadge label={enrichment.intent_label} />
                    )}
                    {signal.url && (
                      <a
                        href={signal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {(!stats?.recent_signals || stats.recent_signals.length === 0) && (
            <p className="text-gray-400 text-sm text-center py-10">
              No signals yet. Configure keywords in Settings, then click &quot;Sync Signals&quot;.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
