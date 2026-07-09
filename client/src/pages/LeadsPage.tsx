import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../lib/api';
import {
  Search, Filter, ChevronDown, ExternalLink,
  MessageSquare, X, Copy, Check, ArrowUpDown,
  Loader2, Users,
} from 'lucide-react';

function IntentBadge({ label }: { label: string }) {
  const classes: Record<string, string> = {
    hot: 'badge-hot', high: 'badge-high',
    medium: 'badge-medium', low: 'badge-low',
  };
  return <span className={`badge ${classes[label] || 'badge-low'}`}>{label}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    qualified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    converted: 'bg-green-500/20 text-green-400 border-green-500/30',
    dismissed: 'bg-surface-600/20 text-surface-400 border-surface-600/30',
  };
  return (
    <span className={`badge border ${classes[status] || classes.new}`}>
      {status}
    </span>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-surface-700/50">
          <div>
            <h3 className="text-lg font-semibold text-surface-100">Outreach for {lead.display_name}</h3>
            <p className="text-sm text-surface-400 mt-0.5">{lead.company_name || 'Unknown company'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-700 text-surface-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Signal context */}
          <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700/30">
            <p className="text-xs font-medium text-surface-500 uppercase mb-2">Signal Context</p>
            <p className="text-sm text-surface-300 line-clamp-3">
              {enrichment?.summary || lead.signals?.text?.substring(0, 200) || 'No signal text'}
            </p>
            {enrichment?.reasoning && (
              <p className="text-xs text-surface-500 mt-2 italic">
                Intent reason: {enrichment.reasoning}
              </p>
            )}
          </div>

          {hasOutreach ? (
            <>
              {/* Opener */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-surface-300">Opener / Subject Line</p>
                  <button
                    onClick={() => copyToClipboard(enrichment.outreach_opening, 'opener')}
                    className="btn-ghost btn-sm"
                  >
                    {copied === 'opener' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'opener' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-brand-600/10 border border-brand-500/20">
                  <p className="text-sm text-surface-200">{enrichment.outreach_opening}</p>
                </div>
              </div>

              {/* Full message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-surface-300">Outreach Message</p>
                  <button
                    onClick={() => copyToClipboard(enrichment.outreach_message, 'message')}
                    className="btn-ghost btn-sm"
                  >
                    {copied === 'message' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'message' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-4 rounded-lg bg-surface-800/50 border border-surface-700/30">
                  <p className="text-sm text-surface-200 whitespace-pre-wrap">{enrichment.outreach_message}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-surface-400 mb-4">No outreach draft yet</p>
              <button
                onClick={() => outreachMutation.mutate()}
                disabled={outreachMutation.isPending}
                className="btn-primary"
              >
                {outreachMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><MessageSquare className="w-4 h-4" /> Generate Outreach</>
                )}
              </button>
            </div>
          )}

          {/* Regenerate */}
          {hasOutreach && (
            <button
              onClick={() => outreachMutation.mutate()}
              disabled={outreachMutation.isPending}
              className="btn-secondary w-full"
            >
              {outreachMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</>
              ) : (
                <>Regenerate Outreach</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Leads</h1>
        <p className="text-surface-400 mt-1">Scored leads from social signals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="input pl-10 py-2 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="table-header">Lead</th>
                <th className="table-header">Source</th>
                <th
                  className="table-header cursor-pointer hover:text-surface-200"
                  onClick={() => toggleSort('score')}
                >
                  <div className="flex items-center gap-1">
                    Score <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="table-header">Intent</th>
                <th className="table-header">Signal Snippet</th>
                <th className="table-header">Status</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/30">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="table-cell">
                        <div className="h-10 shimmer rounded" />
                      </td>
                    </tr>
                  ))
                : leads.map((lead: any) => {
                    const signal = lead.signals;
                    const enrichment = signal?.signal_enrichments?.[0];
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-surface-800/30 transition-colors"
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/30 to-purple-500/30 flex items-center justify-center text-xs font-medium text-brand-300">
                              {(lead.display_name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-surface-200">
                                {lead.display_name || 'Unknown'}
                              </p>
                              <p className="text-xs text-surface-500">
                                {lead.company_name || ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge badge-${signal?.source_name || 'low'}`}>
                            {signal?.source_name || '-'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="text-lg font-bold text-surface-200">
                            {lead.score}
                          </span>
                        </td>
                        <td className="table-cell">
                          <IntentBadge label={enrichment?.intent_label || 'low'} />
                        </td>
                        <td className="table-cell max-w-xs">
                          <p className="text-sm text-surface-400 truncate">
                            {enrichment?.summary || signal?.text?.substring(0, 80) || '-'}
                          </p>
                        </td>
                        <td className="table-cell">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              statusMutation.mutate({ id: lead.id, status: e.target.value })
                            }
                            className="text-xs bg-transparent border border-surface-700 rounded-lg px-2 py-1 text-surface-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="converted">Converted</option>
                            <option value="dismissed">Dismissed</option>
                          </select>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="btn-primary btn-sm"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Outreach
                            </button>
                            {signal?.url && (
                              <a
                                href={signal.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost btn-sm"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
          {!isLoading && leads.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400">No leads found</p>
              <p className="text-surface-500 text-sm mt-1">Sync signals to generate leads</p>
            </div>
          )}
        </div>
      </div>

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
