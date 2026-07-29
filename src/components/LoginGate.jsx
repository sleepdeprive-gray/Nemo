import React, { useState } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  FolderKanban, 
  Cpu, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';
import { verifyPasscode } from '../utils/security';

export const LoginGate = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(false);

    try {
      const isValid = await verifyPasscode(password);
      
      if (isValid) {
        sessionStorage.setItem('nemo_authenticated', 'true');
        setIsLoading(false);
        onAuthenticated();
      } else {
        setIsLoading(false);
        setError(true);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setIsLoading(false);
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030305] bg-grid-pattern p-4 sm:p-6 selection:bg-sky-500 selection:text-black overflow-hidden">
      
      {/* Background Animated Ambient Light Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-sky-500/15 rounded-full blur-[160px] animate-glow-ring"
          style={{ animation: 'orbFloat1 18s ease-in-out infinite' }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-purple-500/15 rounded-full blur-[160px] animate-glow-ring"
          style={{ animation: 'orbFloat2 22s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px]" 
        />
      </div>

      {/* Main Centered Sleek Glass Modal */}
      <div className="relative w-full max-w-md mx-auto animate-modal-entrance z-10">
        <div className="glass-modal-premium rounded-3xl p-8 sm:p-9 border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden scan-line text-center">
          
          {/* Subtle Ambient Shimmer Overlay */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />

          {/* Top Metallic Brand Badge & Heading */}
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <div className="relative mb-5 group animate-fade-in-up stagger-1">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="w-20 h-20 rounded-3xl bg-zinc-950/90 border border-white/20 flex items-center justify-center relative shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <FolderKanban className="w-10 h-10 text-sky-400 animate-float" />
              </div>
            </div>

            <div className="animate-fade-in-up stagger-2 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-sky-400" /> Obsidian Vault v1.0
              </span>
              <h1 className="text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                NEMO <span className="gradient-text-cyan">CLOUD</span>
              </h1>
            </div>
          </div>

          {/* Form with Centered Layout */}
          <form onSubmit={handleLogin} className="space-y-6 relative z-10 animate-fade-in-up stagger-3 text-center">
            <div className="space-y-2">

              {/* Password Input Field (Centered Input & Text) */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4 text-sky-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter passcode to unlock"
                  className={`w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-600 rounded-2xl pl-11 pr-11 py-4 text-sm text-center border focus:outline-none transition-all font-mono tracking-widest ${
                    error
                      ? 'border-rose-500/80 focus:ring-2 focus:ring-rose-500/30 bg-rose-500/10'
                      : 'border-white/10 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors btn-press"
                  title={showPassword ? 'Hide Passcode' : 'Show Passcode'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error Message Alert (Centered) */}
              {error && (
                <p className="mt-2 text-xs text-rose-400 font-medium flex items-center justify-center gap-2 animate-slide-up bg-rose-500/10 p-3 rounded-xl border border-rose-500/30 text-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
                  <span>Invalid access passcode. Please check and try again.</span>
                </p>
              )}
            </div>

            {/* Authenticate Submit Button (Centered) */}
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full btn-gradient-primary btn-press py-4 px-4 rounded-2xl text-black font-extrabold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm tracking-wider uppercase shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Access Cloud Storage</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Metadata (Centered) */}
          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-center gap-6 text-xs text-zinc-500 relative z-10 animate-fade-in-up stagger-5">
            <span className="flex items-center gap-1.5 font-medium text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Supabase Storage
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-white/5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" /> SHA-256 Auth
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
