import React from 'react';
import { 
  FolderKanban, 
  Search, 
  Settings, 
  Lock, 
  Menu, 
  X, 
  Terminal
} from 'lucide-react';

export const Navbar = ({ 
  searchTerm, 
  setSearchTerm, 
  onOpenSettings, 
  onOpenSqlGuide,
  onLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel-premium border-b border-white/10 bg-black/80 backdrop-blur-2xl relative">
      
      {/* Bottom Subtle Gradient Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors btn-press"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500/30 rounded-xl blur-md group-hover:blur-lg animate-glow-ring transition-all" />
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-950 border border-white/20 flex items-center justify-center relative shadow-inner group-hover:border-sky-400 transition-colors">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base sm:text-xl tracking-wider text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                NEMO
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Search Input Bar (One single line on all screen sizes) */}
        <div className="flex-1 max-w-md mx-1 sm:mx-2 min-w-0">
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-focus-within:text-sky-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-zinc-900/90 text-zinc-100 placeholder-zinc-500 text-xs rounded-xl sm:rounded-2xl pl-8 sm:pl-10 pr-7 sm:pr-14 py-2 sm:py-2.5 border border-white/10 focus:outline-none focus:border-sky-400/80 focus:ring-2 focus:ring-sky-400/20 transition-all font-sans"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white font-mono bg-zinc-800/80 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center btn-press"
                title="Clear search"
              >
                ×
              </button>
            ) : (
              <span className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Right: Main Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">

          {/* SQL Helper Button */}
          <button
            onClick={onOpenSqlGuide}
            title="Supabase SQL Generator"
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-mono hidden md:flex items-center gap-1.5 transition-all hover:border-purple-500/40 hover:text-purple-300 btn-press"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>SQL</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            title="Settings & Supabase Config"
            className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 transition-colors hover:text-white btn-press"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock App */}
          <button
            onClick={onLogout}
            title="Lock Nemo Storage"
            className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 border border-white/10 transition-colors btn-press"
          >
            <Lock className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
