import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import {
  Radio, Users, Flame, TrendingUp,
  ArrowUpRight, ExternalLink,
} from 'lucide-react';

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
  const colorClasses: Record<string, string> = {
    brand: 'from-brand-500/20 to-brand-600/5 border-brand-500/30 text-brand-400',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${colorClasses[color]} animate-slide-up`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-surface-100">{value}</p>
          {change && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-surface-800/50 ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function IntentBadge({ label }: { label: string }) {
  const classes: Record<string, string> = {
    hot: 'badge-hot',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
  };
  return <span className={`badge ${classes[label] || 'badge-low'}`}>{label}</span>;
}

function SourceBadge({ source }: { source: string }) {
  const classes: Record<string, string> = {
    reddit: 'badge-reddit',
    twitter: 'badge-twitter',
    linkedin: 'badge-linkedin',
  };
  return <span className={`badge ${classes[source] || 'badge-low'}`}>{source}</span>;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 h-32 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Dashboard</h1>
        <p className="text-surface-400 mt-1">Your lead intelligence overview</p>
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

      {/* Leads by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-100 mb-4">Signals by Source</h2>
          <div className="space-y-3">
            {Object.entries(stats?.leads_by_source || {}).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SourceBadge source={source} />
                </div>
                <span className="text-surface-200 font-medium">{count as number}</span>
              </div>
            ))}
            {Object.keys(stats?.leads_by_source || {}).length === 0 && (
              <p className="text-surface-500 text-sm">No signals yet. Click "Sync Signals" to start.</p>
            )}
          </div>
        </div>

        {/* Top Leads */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-surface-100 mb-4">Top Intent Leads</h2>
          <div className="space-y-3">
            {(stats?.top_leads || []).slice(0, 5).map((lead: any) => {
              const enrichment = lead.signals?.signal_enrichments?.[0];
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-800/30 hover:bg-surface-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500/30 to-purple-500/30 flex items-center justify-center text-sm font-medium text-brand-300 flex-shrink-0">
                      {(lead.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-200 truncate">
                        {lead.display_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-surface-500 truncate">
                        {lead.company_name || lead.signals?.source_name || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-surface-200">{lead.score}</span>
                      <span className="text-xs text-surface-500 ml-1">pts</span>
                    </div>
                    <IntentBadge label={enrichment?.intent_label || 'low'} />
                  </div>
                </div>
              );
            })}
            {(!stats?.top_leads || stats.top_leads.length === 0) && (
              <p className="text-surface-500 text-sm">No leads yet. Sync signals to get started.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-surface-100 mb-4">Recent Signals</h2>
        <div className="space-y-3">
          {(stats?.recent_signals || []).slice(0, 6).map((signal: any) => {
            const enrichment = signal.signal_enrichments?.[0];
            return (
              <div
                key={signal.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-surface-800/30 hover:bg-surface-800/50 transition-colors group"
              >
                <SourceBadge source={signal.source_name} />
                <div className="flex-1 min-w-0">
                  {signal.title && (
                    <p className="text-sm font-medium text-surface-200 mb-1 truncate">
                      {signal.title}
                    </p>
                  )}
                  <p className="text-sm text-surface-400 line-clamp-2">
                    {enrichment?.summary || signal.text?.substring(0, 200)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-surface-500">
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
                        className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
            <p className="text-surface-500 text-sm text-center py-8">
              No signals yet. Configure keywords in Settings, then click "Sync Signals" in the top bar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
