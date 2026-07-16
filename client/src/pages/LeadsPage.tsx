import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../lib/api';
import {
  Search, ExternalLink,
  MessageSquare, X, Copy, Check,
  Loader2, Users, TrendingUp, ArrowUpDown,
} from 'lucide-react';
import { IntentBadge, SourceBadge, StatusBadge } from '../components/ui/Badge';

// ─── Outreach Modal ───────────────────────────────────────────────
function OutreachModal({
  lead,
  onClose,
}: {
  lead: any;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const outreachMutation = useMutation({
    mutationFn: () => leadsApi.generateOutreach(lead.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const enrichment = lead.signals?.signal_enrichments?.[0];
  const hasOutreach = enrichment?.outreach_message;

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Outreach for {lead.display_name}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {lead.company_name || 'Unknown company'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Signal context */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Signal Context
            </p>
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
              {enrichment?.summary || lead.signals?.text?.substring(0, 200) || 'No signal text'}
            </p>
            {enrichment?.reasoning && (
              <p className="text-xs text-gray-400 mt-2 italic">
                Intent reason: {enrichment.reasoning}
              </p>
            )}
          </div>

          {hasOutreach ? (
            <>
              {/* Opener */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Opener / Subject Line</p>
                  <button
                    onClick={() => copyToClipboard(enrichment.outreach_opening, 'opener')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    {copied === 'opener' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                  <p className="text-sm text-gray-800">{enrichment.outreach_opening}</p>
                </div>
              </div>

              {/* Full message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Outreach Message</p>
                  <button
                    onClick={() => copyToClipboard(enrichment.outreach_message, 'message')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    {copied === 'message' ? (
                      <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {enrichment.outreach_message}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No outreach draft yet</p>
              <button
                onClick={() => outreachMutation.mutate()}
                disabled={outreachMutation.isPending}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
              >
                {outreachMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><MessageSquare className="w-4 h-4" /> Generate Outreach</>
                )}
              </button>
            </div>
          )}

          {hasOutreach && (
            <button
              onClick={() => outreachMutation.mutate()}
              disabled={outreachMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 transition-all disabled:opacity-50"
            >
              {outreachMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
              ) : (
                'Regenerate Outreach'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Lead Feed Card ───────────────────────────────────────────────
function LeadCard({
  lead,
  onOutreach,
  onStatusChange,
}: {
  lead: any;
  onOutreach: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const signal = lead.signals;
  const enrichment = signal?.signal_enrichments?.[0];

  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-4">
        {/* Lead identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {(lead.display_name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{lead.display_name || 'Unknown'}</p>
            {lead.company_name && (
              <p className="text-xs text-gray-400 truncate">{lead.company_name}</p>
            )}
          </div>
        </div>

        {/* Score chip */}
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5 flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-sm font-black text-gray-900">{lead.score}</span>
          <span className="text-xs text-gray-400">pts</span>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {signal?.source_name && <SourceBadge source={signal.source_name} />}
        {enrichment?.intent_label && <IntentBadge label={enrichment.intent_label} />}
        <StatusBadge status={lead.status} />
      </div>

      {/* Signal snippet */}
      {(enrichment?.summary || signal?.text) && (
        <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed">
          {enrichment?.summary || signal?.text?.substring(0, 160)}
        </p>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-medium">Status:</label>
          <select
            value={lead.status}
            onChange={(e) => onStatusChange(lead.id, e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOutreach}
            className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
          >
            <MessageSquare className="w-3 h-3" />
            Outreach
          </button>
          {signal?.url && (
            <a
              href={signal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', search, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      leadsApi.list({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    refetchInterval: 30000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const leads = data?.leads || [];

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1 text-sm">Scored leads from social signals</p>
        </div>
        {leads.length > 0 && (
          <span className="text-sm font-semibold text-gray-400">
            {leads.length} leads
          </span>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="dismissed">Dismissed</option>
        </select>

        {/* Sort */}
        <button
          onClick={() => toggleSort('score')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort by score
        </button>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl h-48 shimmer" />
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((lead: any) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onOutreach={() => setSelectedLead(lead)}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-16 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">No leads found</p>
          <p className="text-gray-400 text-sm mt-1">Sync signals to generate leads</p>
        </div>
      )}

      {/* Outreach Modal */}
      {selectedLead && (
        <OutreachModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
