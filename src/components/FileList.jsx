import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Plus, 
  Files as FilesIcon,
  Star,
  FolderOpen,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Code,
  Layers
} from 'lucide-react';
import { FileCard } from './FileCard';

export const FileList = ({ 
  files = [], 
  searchTerm = '', 
  categoryFilter = 'all', 
  setCategoryFilter, 
  onViewFile, 
  onDeleteFile, 
  onToggleFavorite,
  onOpenUpload,
  isFavoritesOnly = false
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date-desc');

  // Filter logic
  let filteredFiles = files.filter(file => {
    if (isFavoritesOnly && !file.isFavorite) return false;
    
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'document' && file.category !== 'document' && file.category !== 'pdf') return false;
      if (categoryFilter !== 'document' && file.category !== categoryFilter) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchTag = file.tags?.some(t => t.toLowerCase().includes(q));
      const matchCategory = file.category.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchCategory) return false;
    }

    return true;
  });

  // Sort logic
  filteredFiles.sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    if (sortBy === 'date-asc') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'size-desc') return b.size - a.size;
    return 0;
  });

  const categories = [
    { id: 'all', label: 'All Files', icon: Layers },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'code', label: 'Code', icon: Code },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 animate-fade-in-up stagger-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {isFavoritesOnly ? (
              <>
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                <span>Starred Files</span>
              </>
            ) : (
              <>
                <FilesIcon className="w-8 h-8 text-sky-400" />
                <span>Files Explorer</span>
              </>
            )}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Showing {filteredFiles.length} of {files.length} items
          </p>
        </div>

        {/* View Mode & Sort Actions */}
        <div className="flex items-center gap-3">
          
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-950 border border-white/10 shadow-inner relative">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all relative z-10 btn-press ${
                viewMode === 'grid' ? 'bg-sky-400 text-black shadow-md font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs font-semibold transition-all relative z-10 btn-press ${
                viewMode === 'list' ? 'bg-sky-400 text-black shadow-md font-bold' : 'text-zinc-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-950 text-zinc-200 text-xs font-bold rounded-2xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-sky-400 cursor-pointer appearance-none pr-9 font-sans hover:border-white/20 transition-colors"
            >
              <option value="date-desc">Latest Upload</option>
              <option value="date-asc">Oldest Upload</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="size-desc">Largest Size</option>
            </select>
            <ArrowUpDown className="w-4 h-4 text-sky-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="btn-gradient-primary btn-press px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)] tracking-wider uppercase"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      {!isFavoritesOnly && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 animate-fade-in-up stagger-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 btn-press ${
                  categoryFilter === cat.id
                    ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.4)]'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Files Display */}
      {filteredFiles.length === 0 ? (
        <div className="glass-card-premium rounded-3xl p-14 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in-up stagger-3">
          <div className="w-20 h-20 rounded-3xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-sky-500/10 rounded-3xl blur-xl animate-glow-ring" />
            <FolderOpen className="w-10 h-10 text-zinc-600 relative z-10" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">No files found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              {searchTerm 
                ? `No files match "${searchTerm}".`
                : 'No files uploaded under this category filter.'}
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="btn-gradient-primary btn-press px-5 py-2.5 text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg"
          >
            Upload File Now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-fade-in-up stagger-3">
          {filteredFiles.map(file => (
            <FileCard
              key={file.id}
              file={file}
              viewMode="grid"
              onView={onViewFile}
              onDelete={onDeleteFile}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card-premium rounded-3xl overflow-hidden border border-white/10 animate-fade-in-up stagger-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-md text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-5">File Name</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Size</th>
                  <th className="py-4 px-5">Uploaded</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredFiles.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    viewMode="list"
                    onView={onViewFile}
                    onDelete={onDeleteFile}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
