import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../lib/api';
import {
  Search, Plus, Trash2, Tag, Building2, UserX,
  Brain, MessageSquare, Shield, Loader2, Check,
} from 'lucide-react';

type TabType = 'keywords' | 'competitors' | 'icp' | 'ai' | 'outreach';

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'keywords', label: 'Keywords', icon: Search },
  { id: 'competitors', label: 'Competitors', icon: Building2 },
  { id: 'icp', label: 'ICP Filters', icon: Shield },
  { id: 'ai', label: 'AI Provider', icon: Brain },
  { id: 'outreach', label: 'Outreach', icon: MessageSquare },
];

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
      <p className="text-sm text-surface-400">{description}</p>

      {/* Add new */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            className="input pl-10 py-2 text-sm"
          />
        </div>
        <button onClick={handleAdd} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredRules.map((rule: any) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-3 rounded-lg bg-surface-800/30 border border-surface-700/30 group"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-surface-500" />
              <span className="text-sm text-surface-200">{rule.value}</span>
            </div>
            <button
              onClick={() => onDelete(rule.id)}
              className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredRules.length === 0 && (
          <p className="text-sm text-surface-500 text-center py-6">No {ruleType}s configured yet</p>
        )}
      </div>
    </div>
  );
}

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
  const [icpTitles, setIcpTitles] = useState('');
  const [icpCompanies, setIcpCompanies] = useState('');
  const [exclusions, setExclusions] = useState('');

  // Sync state when data loads
  useState(() => {
    if (settings.ai_provider) setAiProvider(settings.ai_provider);
    if (settings.outreach_tone) setOutreachTone(settings.outreach_tone);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Settings</h1>
        <p className="text-surface-400 mt-1">Configure monitoring rules and AI settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="glass-card p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    activeTab === id
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="glass-card p-6">
            {activeTab === 'keywords' && (
              <div>
                <h2 className="text-lg font-semibold text-surface-100 mb-4">Monitored Keywords</h2>
                <RulesList
                  ruleType="keyword"
                  rules={rules}
                  onAdd={(value) => addRuleMutation.mutate({ ruleType: 'keyword', value })}
                  onDelete={(id) => deleteRuleMutation.mutate(id)}
                  placeholder='e.g. "alternative to Apollo"'
                  icon={Search}
                  description="Keywords to monitor across Reddit, Twitter, and LinkedIn. Signals matching these keywords will be ingested and scored."
                />
              </div>
            )}

            {activeTab === 'competitors' && (
              <div>
                <h2 className="text-lg font-semibold text-surface-100 mb-4">Competitors</h2>
                <RulesList
                  ruleType="competitor"
                  rules={rules}
                  onAdd={(value) => addRuleMutation.mutate({ ruleType: 'competitor', value })}
                  onDelete={(id) => deleteRuleMutation.mutate(id)}
                  placeholder="e.g. Apollo, ZoomInfo, Clay"
                  icon={Building2}
                  description="Competitor names to track. Signals mentioning these competitors get higher intent scores."
                />
              </div>
            )}

            {activeTab === 'icp' && (
              <div>
                <h2 className="text-lg font-semibold text-surface-100 mb-4">ICP Filters</h2>
                <div className="space-y-6">
                  <RulesList
                    ruleType="icp_title"
                    rules={rules}
                    onAdd={(value) => addRuleMutation.mutate({ ruleType: 'icp_title', value })}
                    onDelete={(id) => deleteRuleMutation.mutate(id)}
                    placeholder="e.g. VP of Sales, Head of Growth"
                    icon={Tag}
                    description="Target job titles for your ICP (Ideal Customer Profile)."
                  />
                  <hr className="border-surface-700/50" />
                  <RulesList
                    ruleType="exclusion"
                    rules={rules}
                    onAdd={(value) => addRuleMutation.mutate({ ruleType: 'exclusion', value })}
                    onDelete={(id) => deleteRuleMutation.mutate(id)}
                    placeholder="e.g. student, intern, job seeker"
                    icon={UserX}
                    description="Exclusion keywords — signals matching these will be scored lower."
                  />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div>
                <h2 className="text-lg font-semibold text-surface-100 mb-4">AI Provider Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">
                      Preferred AI Provider
                    </label>
                    <select
                      value={aiProvider}
                      onChange={(e) => setAiProvider(e.target.value)}
                      className="input w-auto"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openrouter">OpenRouter (Gemma / other free models)</option>
                    </select>
                    <p className="text-xs text-surface-500 mt-1.5">
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
                    className="btn-primary"
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
              </div>
            )}

            {activeTab === 'outreach' && (
              <div>
                <h2 className="text-lg font-semibold text-surface-100 mb-4">Outreach Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-300 mb-1.5">
                      Outreach Tone
                    </label>
                    <select
                      value={outreachTone}
                      onChange={(e) => setOutreachTone(e.target.value)}
                      className="input w-auto"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual / Friendly</option>
                      <option value="founder">Founder-led / Personal</option>
                      <option value="consultative">Consultative / Expert</option>
                    </select>
                    <p className="text-xs text-surface-500 mt-1.5">
                      Sets the tone for AI-generated outreach messages.
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
                    className="btn-primary"
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
