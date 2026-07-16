import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { signalsApi } from '../lib/api';
import {
  Search, ExternalLink, Radio,
  TrendingUp, Calendar,
} from 'lucide-react';
import { IntentBadge, SourceBadge } from '../components/ui/Badge';

// ─── Sentiment Indicator ─────────────────────────────────────────
function SentimentIndicator({ score, label }: { score?: number; label?: string }) {
  if (score === undefined) return null;
  const isPositive = (score || 0) > 0.2;
  const isNegative = (score || 0) < -0.2;
  const dotColor = isPositive ? 'bg-emerald-500' : isNegative ? 'bg-red-500' : 'bg-gray-400';
  const textColor = isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>{label || 'neutral'}</span>
    </div>
  );
}

// ─── Signal Card ─────────────────────────────────────────────────
function SignalCard({ signal }: { signal: any }) {
  const enrichment = signal.signal_enrichments?.[0];
  const keywords = signal.matched_keywords || [];
  const competitors = signal.matched_competitors || [];

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={signal.source_name} />
          {enrichment?.intent_label && <IntentBadge label={enrichment.intent_label} />}
          <SentimentIndicator
            score={enrichment?.sentiment_score}
            label={enrichment?.sentiment_label}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {enrichment?.intent_score != null && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-100">
              <TrendingUp className="w-3 h-3 text-brand-500" />
              <span className="text-xs font-black text-brand-700">{enrichment.intent_score}</span>
            </div>
          )}
          {signal.url && (
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Title */}
      {signal.title && (
        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
          {signal.title}
        </h3>
      )}

      {/* Summary */}
      <p className="text-sm text-gray-500 line-clamp-3 mb-3 leading-relaxed">
        {enrichment?.summary || signal.text?.substring(0, 300)}
      </p>

      {/* Reasoning box */}
      {enrichment?.reasoning && (
        <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 mb-3">
          <p className="text-xs text-brand-700 leading-relaxed">
            <span className="font-semibold">Intent signal: </span>
            {enrichment.reasoning}
          </p>
        </div>
      )}

      {/* Keyword / Competitor chips */}
      {(keywords.length > 0 || competitors.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {keywords.map((kw: string) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 ring-1 ring-brand-200 font-medium"
            >
              {kw}
            </span>
          ))}
          {competitors.map((comp: string) => (
            <span
              key={comp}
              className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 ring-1 ring-red-200 font-medium"
            >
              vs {comp}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <span className="font-medium">{signal.author_handle || signal.author_name || 'anonymous'}</span>
          {signal.metadata?.subreddit && (
            <span className="text-gray-300">r/{signal.metadata.subreddit}</span>
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

// ─── Main Page ────────────────────────────────────────────────────
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Signals</h1>
          <p className="text-gray-500 mt-1 text-sm">Raw + enriched social signals feed</p>
        </div>
        {data?.total != null && (
          <span className="text-sm font-semibold text-gray-400">{data.total} signals</span>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search signals..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
          />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
        >
          <option value="all">All Sources</option>
          <option value="reddit">Reddit</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
        </select>

        <select
          value={intentFilter}
          onChange={(e) => setIntentFilter(e.target.value)}
          className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
        >
          <option value="all">All Intent</option>
          <option value="hot">🔥 Hot</option>
          <option value="high">⬆️ High</option>
          <option value="medium">➡️ Medium</option>
          <option value="low">⬇️ Low</option>
        </select>
      </div>

      {/* Signal Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl h-52 shimmer" />
          ))}
        </div>
      ) : signals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {signals.map((signal: any) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-16 text-center">
          <Radio className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold text-lg">No signals found</p>
          <p className="text-gray-400 text-sm mt-1">
            Configure keywords in Settings and click &quot;Sync Signals&quot; to start monitoring
          </p>
        </div>
      )}
    </div>
  );
}
