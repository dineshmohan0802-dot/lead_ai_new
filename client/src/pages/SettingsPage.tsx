import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../lib/api';
import {
  Search, Plus, Trash2, Tag, Building2, UserX,
  Brain, MessageSquare, Shield, Loader2, Check,
} from 'lucide-react';

type TabType = 'keywords' | 'competitors' | 'icp' | 'ai' | 'outreach';

const tabs: { id: TabType; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'keywords',    label: 'Keywords',    icon: Search,       description: 'Monitor social signals' },
  { id: 'competitors', label: 'Competitors', icon: Building2,    description: 'Track competitor mentions' },
  { id: 'icp',        label: 'ICP Filters', icon: Shield,       description: 'Define your ideal customer' },
  { id: 'ai',         label: 'AI Provider', icon: Brain,        description: 'Configure enrichment AI' },
  { id: 'outreach',   label: 'Outreach',    icon: MessageSquare, description: 'Outreach tone & style' },
];

// ─── Rules List ────────────────────────────────────────────────────
function RulesList({
  ruleType,
  rules,
  onAdd,
  onDelete,
  placeholder,
  icon: Icon,
  description,
}: {
  ruleType: string;
  rules: any[];
  onAdd: (value: string) => void;
  onDelete: (id: string) => void;
  placeholder: string;
  icon: React.ElementType;
  description: string;
}) {
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newValue.trim()) {
      onAdd(newValue.trim());
      setNewValue('');
    }
  };

  const filteredRules = rules.filter((r: any) => r.rule_type === ruleType);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>

      {/* Add new */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
          />
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredRules.map((rule: any) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-brand-600" />
              </div>
              <span className="text-sm text-gray-800 font-medium">{rule.value}</span>
            </div>
            <button
              onClick={() => onDelete(rule.id)}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredRules.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No {ruleType}s configured yet
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('keywords');
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const addRuleMutation = useMutation({
    mutationFn: ({ ruleType, value }: { ruleType: string; value: string }) =>
      settingsApi.createRule(ruleType, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deleteRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => settingsApi.update(data),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const rules = data?.rules || [];
  const settings = data?.settings || {};

  const [aiProvider, setAiProvider] = useState(settings.ai_provider || 'gemini');
  const [outreachTone, setOutreachTone] = useState(settings.outreach_tone || 'professional');

  // Sync when data loads
  useState(() => {
    if (settings.ai_provider) setAiProvider(settings.ai_provider);
    if (settings.outreach_tone) setOutreachTone(settings.outreach_tone);
  });

  const activeTabMeta = tabs.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Configure monitoring rules and AI settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tab nav */}
        <div className="lg:w-60 flex-shrink-0">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-left transition-all duration-150
                  ${
                    activeTab === id
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeTab === id ? 'bg-brand-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-4 h-4 ${activeTab === id ? 'text-brand-600' : 'text-gray-500'}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-none mb-0.5 ${activeTab === id ? 'text-brand-700' : 'text-gray-800'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              {activeTabMeta && (
                <>
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <activeTabMeta.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{activeTabMeta.label}</h2>
                    <p className="text-xs text-gray-400">{activeTabMeta.description}</p>
                  </div>
                </>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-xl shimmer" />
                ))}
              </div>
            ) : (
              <>
                {activeTab === 'keywords' && (
                  <RulesList
                    ruleType="keyword"
                    rules={rules}
                    onAdd={(value) => addRuleMutation.mutate({ ruleType: 'keyword', value })}
                    onDelete={(id) => deleteRuleMutation.mutate(id)}
                    placeholder='e.g. "alternative to Apollo"'
                    icon={Search}
                    description="Keywords to monitor across Reddit, Twitter, and LinkedIn. Signals matching these keywords will be ingested and scored."
                  />
                )}

                {activeTab === 'competitors' && (
                  <RulesList
                    ruleType="competitor"
                    rules={rules}
                    onAdd={(value) => addRuleMutation.mutate({ ruleType: 'competitor', value })}
                    onDelete={(id) => deleteRuleMutation.mutate(id)}
                    placeholder="e.g. Apollo, ZoomInfo, Clay"
                    icon={Building2}
                    description="Competitor names to track. Signals mentioning these competitors receive higher intent scores automatically."
                  />
                )}

                {activeTab === 'icp' && (
                  <div className="space-y-8">
                    <RulesList
                      ruleType="icp_title"
                      rules={rules}
                      onAdd={(value) => addRuleMutation.mutate({ ruleType: 'icp_title', value })}
                      onDelete={(id) => deleteRuleMutation.mutate(id)}
                      placeholder="e.g. VP of Sales, Head of Growth"
                      icon={Tag}
                      description="Target job titles for your ICP (Ideal Customer Profile). Leads with these titles score higher."
                    />
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-bold text-gray-800 mb-4">Exclusions</h3>
                      <RulesList
                        ruleType="exclusion"
                        rules={rules}
                        onAdd={(value) => addRuleMutation.mutate({ ruleType: 'exclusion', value })}
                        onDelete={(id) => deleteRuleMutation.mutate(id)}
                        placeholder="e.g. student, intern, job seeker"
                        icon={UserX}
                        description="Signals matching these keywords will be scored lower — useful to filter out irrelevant posts."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Preferred AI Provider
                      </label>
                      <select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        className="w-full max-w-sm text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="openrouter">OpenRouter (Gemma / other free models)</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1.5">
                        The system will automatically fall back to the other provider if the primary fails.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        updateSettingsMutation.mutate({
                          ai_provider: aiProvider,
                          outreach_tone: outreachTone,
                          icp_config: settings.icp_config,
                        })
                      }
                      disabled={updateSettingsMutation.isPending}
                      className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {updateSettingsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <><Check className="w-4 h-4" /> Saved!</>
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                  </div>
                )}

                {activeTab === 'outreach' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Outreach Tone
                      </label>
                      <select
                        value={outreachTone}
                        onChange={(e) => setOutreachTone(e.target.value)}
                        className="w-full max-w-sm text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual / Friendly</option>
                        <option value="founder">Founder-led / Personal</option>
                        <option value="consultative">Consultative / Expert</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Sets the tone for all AI-generated outreach messages.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        updateSettingsMutation.mutate({
                          ai_provider: aiProvider,
                          outreach_tone: outreachTone,
                          icp_config: settings.icp_config,
                        })
                      }
                      disabled={updateSettingsMutation.isPending}
                      className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {updateSettingsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : saved ? (
                        <><Check className="w-4 h-4" /> Saved!</>
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
