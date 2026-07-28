import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  Trash2, 
  Star, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Code, 
  Layers
} from 'lucide-react';

export const Sidebar = ({ 
  currentTab, 
  setCurrentTab, 
  categoryFilter, 
  setCategoryFilter, 
  trashCount,
  filesCount,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'files', label: 'All Explorer', icon: Files, badge: filesCount },
    { id: 'favorites', label: 'Starred Files', icon: Star },
    { id: 'trash', label: 'Trash Bin', icon: Trash2, badge: trashCount, isTrash: true },
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: Layers, badgeColor: 'bg-zinc-400' },
    { id: 'image', label: 'Images', icon: Image, color: 'text-sky-400', badgeColor: 'bg-sky-400' },
    { id: 'video', label: 'Videos', icon: Video, color: 'text-purple-400', badgeColor: 'bg-purple-400' },
    { id: 'audio', label: 'Audio Tracks', icon: Music, color: 'text-emerald-400', badgeColor: 'bg-emerald-400' },
    { id: 'document', label: 'Documents & PDFs', icon: FileText, color: 'text-amber-400', badgeColor: 'bg-amber-400' },
    { id: 'code', label: 'Code & Data', icon: Code, color: 'text-cyan-400', badgeColor: 'bg-cyan-400' },
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'files') setCategoryFilter('all');
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = (catId) => {
    setCurrentTab('files');
    setCategoryFilter(catId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-md md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      <aside className={`fixed md:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-black/90 md:bg-black/50 backdrop-blur-2xl border-r border-white/10 p-4 flex flex-col justify-between transition-all duration-300 ease-out-expo ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div className="space-y-6 overflow-y-auto pr-1">
          
          {/* Main Navigation Group */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-3">
              <div className="w-1 h-3 bg-zinc-700 rounded-full" />
              <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                Navigation
              </p>
            </div>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 relative group overflow-hidden ${
                      isActive
                        ? 'bg-white/5 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-white backdrop-blur-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-cyan-400 rounded-r-full transition-all duration-300 ease-spring ${
                        isActive ? 'h-[60%] opacity-100' : 'h-0 opacity-0 group-hover:h-[40%] group-hover:opacity-50'
                      }`}
                    />
                    
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold transition-colors ${
                        item.isTrash 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-zinc-800 text-zinc-300 border border-white/10'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Category Filter Group */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-3">
              <div className="w-1 h-3 bg-zinc-700 rounded-full" />
              <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                Categories
              </p>
            </div>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = currentTab === 'files' && categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 relative group overflow-hidden ${
                      isActive
                        ? 'bg-white/5 border border-white/5 shadow-sm text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-cyan-400 rounded-r-full transition-all duration-300 ease-spring ${
                        isActive ? 'h-[60%] opacity-100' : 'h-0 opacity-0 group-hover:h-[40%] group-hover:opacity-50'
                      }`}
                    />
                    
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${cat.color || 'text-zinc-400'}`} />
                    <div className="flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${cat.badgeColor || 'bg-zinc-400'} shadow-[0_0_5px_currentColor]`} />
                      <span>{cat.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

        </div>

      </aside>
    </>
  );
};
