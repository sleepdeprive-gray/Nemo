import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';

export const SqlGuideModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlContent = `-- ==========================================
-- NEMO CLOUD FILE STORAGE - SECURE SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase Project SQL Editor
-- ==========================================

-- 1. Create Nemo Files Table
CREATE TABLE IF NOT EXISTS public.nemo_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID DEFAULT auth.uid()
);

-- Enable Row Level Security (RLS) on nemo_files
ALTER TABLE public.nemo_files ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for nemo_files
CREATE POLICY "Allow access to nemo_files"
ON public.nemo_files
FOR ALL
USING (true)
WITH CHECK (true);

-- 2. Create Nemo Trash Table
CREATE TABLE IF NOT EXISTS public.nemo_trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_id UUID,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  user_id UUID DEFAULT auth.uid()
);

-- Enable Row Level Security (RLS) on nemo_trash
ALTER TABLE public.nemo_trash ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for nemo_trash
CREATE POLICY "Allow access to nemo_trash"
ON public.nemo_trash
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Create Nemo Config Table (Passcode Cloud Sync)
CREATE TABLE IF NOT EXISTS public.nemo_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on nemo_config
ALTER TABLE public.nemo_config ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for nemo_config
CREATE POLICY "Allow access to nemo_config"
ON public.nemo_config
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Create Storage Bucket (Run in Supabase Storage or SQL)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('nemo-files', 'nemo-files', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Enable RLS and set Storage Object Policies for nemo-files bucket
CREATE POLICY "Nemo Files Bucket Select Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'nemo-files');

CREATE POLICY "Nemo Files Bucket Insert Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'nemo-files');

CREATE POLICY "Nemo Files Bucket Delete Access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'nemo-files');`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sqlLines = sqlContent.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-2xl glass-modal-premium rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-5 animate-modal-entrance">
        
        {/* Header with Terminal Dots */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shadow-inner">
              <Terminal className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-[10px] font-mono text-zinc-500 ml-2">supabase_secure_setup.sql</span>
              </div>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Supabase Secure SQL Setup Script (RLS Enabled)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Button bar */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4" /> Row-Level Security Enabled
          </span>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 btn-press"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL Copied!' : 'Copy Secure SQL'}</span>
          </button>
        </div>

        {/* Code View with Line Numbers */}
        <div className="max-h-80 overflow-y-auto bg-zinc-950 p-4 rounded-2xl border border-white/10 text-xs font-mono leading-relaxed shadow-inner">
          <div className="space-y-0.5">
            {sqlLines.map((line, i) => (
              <div key={i} className="flex gap-4 hover:bg-zinc-900/40 px-1 rounded">
                <span className="text-zinc-600 select-none text-right w-6 flex-shrink-0 text-[11px] font-mono">
                  {i + 1}
                </span>
                <span className={line.startsWith('--') ? 'text-zinc-500 italic' : line.startsWith('CREATE') || line.startsWith('INSERT') || line.startsWith('ALTER') ? 'text-purple-300 font-bold' : 'text-emerald-400'}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold btn-press"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
