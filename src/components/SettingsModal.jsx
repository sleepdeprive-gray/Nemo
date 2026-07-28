import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  KeyRound, 
  HardDrive, 
  Check, 
  Terminal, 
  Lock,
  Sparkles
} from 'lucide-react';
import { getStoredCredentials, saveCredentials, isSupabaseConfigured } from '../services/supabaseClient';
import { getCapacityLimit, setCapacityLimit } from '../services/storageService';
import { updatePasscode } from '../utils/security';

export const SettingsModal = ({ isOpen, onClose, onSettingsUpdated, onOpenSqlGuide }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [capacityGb, setCapacityGb] = useState(5);
  const [newPassword, setNewPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('supabase'); // 'supabase', 'capacity', 'security'

  useEffect(() => {
    if (isOpen) {
      const { url, key } = getStoredCredentials();
      setSupabaseUrl(url);
      setSupabaseKey(key);
      const capBytes = getCapacityLimit();
      const loadedGb = Math.round(capBytes / (1024 * 1024 * 1024));
      setCapacityGb(loadedGb > 5 ? 5 : loadedGb);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Save Supabase config
    saveCredentials(supabaseUrl, supabaseKey);

    // Save Capacity Limit (max 5 GB as per Supabase quota)
    const effectiveCapacityGb = capacityGb > 5 ? 5 : capacityGb;
    setCapacityLimit(effectiveCapacityGb * 1024 * 1024 * 1024);

    // Save Security passcode if set
    if (newPassword.trim()) {
      await updatePasscode(newPassword.trim());
      setNewPassword('');
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSettingsUpdated();
      onClose();
    }, 600);
  };

  const handleClearCredentials = () => {
    saveCredentials('', '');
    setSupabaseUrl('');
    setSupabaseKey('');
    onSettingsUpdated();
  };

  const tabList = [
    { id: 'supabase', label: 'Supabase Connection', icon: Database },
    { id: 'capacity', label: 'Storage Quota', icon: HardDrive },
    { id: 'security', label: 'Passcode Security', icon: KeyRound },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-xl glass-modal-premium rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-modal-entrance">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span>Nemo System Settings</span>
                <Sparkles className="w-4 h-4 text-purple-400 inline" />
              </h2>
              <p className="text-xs text-zinc-400">Configure Supabase storage & capacity settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 bg-zinc-950/60 p-1.5 rounded-2xl border border-white/5">
          {tabList.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 btn-press ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-black font-extrabold shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Supabase Configuration */}
        {activeTab === 'supabase' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-start gap-3 text-xs text-zinc-300 relative overflow-hidden gradient-border-card">
              <div className="w-1 absolute top-0 left-0 bottom-0 bg-emerald-400" />
              <Database className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Supabase Backend Integration</span>
                Enter your Supabase Project URL and Anon API key to connect live bucket storage. If left empty, Nemo runs in local state mode.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span>Supabase Project URL</span>
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Supabase Anon Key</span>
                </label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  placeholder="eyJhYmdj... (your supabase public anon key)"
                  className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onOpenSqlGuide}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono hover:underline btn-press"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>View Database SQL Setup Guide</span>
                </button>

                {isSupabaseConfigured() && (
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    className="text-xs text-rose-400 hover:text-rose-300 btn-press font-semibold"
                  >
                    Disconnect Supabase
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Storage Quota */}
        {activeTab === 'capacity' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-3 text-xs text-zinc-300 relative overflow-hidden gradient-border-card">
              <div className="w-1 absolute top-0 left-0 bottom-0 bg-sky-400" />
              <HardDrive className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5">Supabase Storage Limit</span>
                Storage limit is capped at the maximum Supabase free quota (5 GB).
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Storage Limit (GB):</span>
                  <span className="text-sky-400 font-mono font-bold text-sm">{capacityGb} GB</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={capacityGb}
                  onChange={(e) => setCapacityGb(parseInt(e.target.value, 10))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-1.5">
                  <span>1 GB</span>
                  <span>2.5 GB</span>
                  <span>5 GB (Max Supabase Quota)</span>
                </div>
              </div>

              {/* Visual preview bar */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-zinc-400 block">Quota Preview</span>
                <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${(capacityGb / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === 'security' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center gap-3 text-xs text-zinc-300 relative overflow-hidden gradient-border-card">
              <div className="w-1 absolute top-0 left-0 bottom-0 bg-amber-400" />
              <KeyRound className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5">Master Access Passcode</span>
                Update the password required to unlock Nemo. Saved securely using SHA-256 encryption.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>New Passcode</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new access passcode"
                className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-600 text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-sky-500 font-mono transition-all"
              />
            </div>
          </div>
        )}

        {/* Footer Save Button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {savedSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
                <Check className="w-4 h-4" /> Settings Saved!
              </span>
            ) : (
              'Changes take effect immediately'
            )}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 btn-press"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-gradient-primary btn-press px-5 py-2 rounded-xl text-black text-xs font-extrabold shadow-lg uppercase tracking-wider"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
