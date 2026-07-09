import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { signalsApi } from '../lib/api';
import {
  Search, Filter, ExternalLink, Radio,
  TrendingUp, MessageCircle, Calendar,
} from 'lucide-react';

function IntentBadge({ label }: { label: string }) {
  const classes: Record<string, string> = {
    hot: 'badge-hot', high: 'badge-high',
    medium: 'badge-medium', low: 'badge-low',
  };
  return <span className={`badge ${classes[label] || 'badge-low'}`}>{label}</span>;
}

function SourceBadge({ source }: { source: string }) {
  const classes: Record<string, string> = {
    reddit: 'badge-reddit', twitter: 'badge-twitter', linkedin: 'badge-linkedin',
  };
  return <span className={`badge ${classes[source] || 'badge-low'}`}>{source}</span>;
}

function SentimentIndicator({ score, label }: { score?: number; label?: string }) {
  if (score === undefined) return null;
  const colors: Record<string, string> = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-surface-400',
    mixed: 'text-yellow-400',
  };
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${
          (score || 0) > 0.2
            ? 'bg-emerald-400'
            : (score || 0) < -0.2
            ? 'bg-red-400'
            : 'bg-surface-400'
        }`}
      />
      <span className={`text-xs ${colors[label || 'neutral'] || 'text-surface-400'}`}>
        {label || 'neutral'}
      </span>
    </div>
  );
}

function SignalCard({ signal }: { signal: any }) {
  const enrichment = signal.signal_enrichments?.[0];
  const keywords = signal.matched_keywords || [];
  const competitors = signal.matched_competitors || [];

  return (
    <div className="glass-card p-5 hover:border-surface-600/50 transition-all duration-200 animate-slide-up group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <SourceBadge source={signal.source_name} />
          {enrichment?.intent_label && <IntentBadge label={enrichment.intent_label} />}
          <SentimentIndicator
            score={enrichment?.sentiment_score}
            label={enrichment?.sentiment_label}
          />
        </div>
        <div className="flex items-center gap-2">
          {enrichment?.intent_score != null && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-800/50">
              <TrendingUp className="w-3 h-3 text-surface-400" />
              <span className="text-xs font-bold text-surface-300">{enrichment.intent_score}</span>
            </div>
          )}
          {signal.url && (
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-500 hover:text-surface-300 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      {signal.title && (
        <h3 className="text-sm font-semibold text-surface-200 mb-2 line-clamp-1">
          {signal.title}
        </h3>
      )}

      {/* Summary or text */}
      <p className="text-sm text-surface-400 line-clamp-3 mb-3">
        {enrichment?.summary || signal.text?.substring(0, 300)}
      </p>

      {/* Enrichment reasoning */}
      {enrichment?.reasoning && (
        <div className="p-3 rounded-lg bg-brand-600/5 border border-brand-500/10 mb-3">
          <p className="text-xs text-brand-300">
            <span className="font-medium">Intent signal:</span> {enrichment.reasoning}
          </p>
        </div>
      )}

      {/* Keywords & Competitors */}
      {(keywords.length > 0 || competitors.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {keywords.map((kw: string) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded text-xs bg-brand-600/10 text-brand-400 border border-brand-500/20"
            >
              {kw}
            </span>
          ))}
          {competitors.map((comp: string) => (
            <span
              key={comp}
              className="px-2 py-0.5 rounded text-xs bg-red-600/10 text-red-400 border border-red-500/20"
            >
              vs {comp}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-surface-500">
        <div className="flex items-center gap-3">
          <span>{signal.author_handle || signal.author_name || 'anonymous'}</span>
          {signal.metadata?.subreddit && (
            <span className="text-surface-600">r/{signal.metadata.subreddit}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {signal.created_at_source
            ? new Date(signal.created_at_source).toLocaleDateString()
            : 'recent'}
        </div>
      </div>
    </div>
  );
}

export default function SignalsPage() {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [intentFilter, setIntentFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['signals', search, sourceFilter, intentFilter],
    queryFn: () =>
      signalsApi.list({
        search: search || undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        intent_label: intentFilter !== 'all' ? intentFilter : undefined,
      }),
    refetchInterval: 30000,
  });

  const signals = data?.signals || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Signals</h1>
        <p className="text-surface-400 mt-1">Raw + enriched social signals feed</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signals..."
            className="input pl-10 py-2 text-sm"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="input w-auto py-2 text-sm"
        >
          <option value="all">All Sources</option>
          <option value="reddit">Reddit</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <select
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value)}
          className="input w-auto py-2 text-sm"
        >
          <option value="all">All Intent</option>
          <option value="hot">🔥 Hot</option>
          <option value="high">⬆️ High</option>
          <option value="medium">➡️ Medium</option>
          <option value="low">⬇️ Low</option>
        </select>
        <div className="text-sm text-surface-500">
          {data?.total || 0} signals
        </div>
      </div>

      {/* Signal Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-48 shimmer" />
          ))}
        </div>
      ) : signals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {signals.map((signal: any) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <Radio className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 text-lg">No signals found</p>
          <p className="text-surface-500 text-sm mt-1">
            Configure keywords in Settings and click "Sync Signals" to start monitoring
          </p>
        </div>
      )}
    </div>
  );
}
