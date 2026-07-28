import React from 'react';
import { 
  HardDrive, 
  Upload, 
  TrendingUp, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Code, 
  Layers, 
  Clock, 
  Eye, 
  Trash2, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { formatBytes, formatDate } from '../utils/formatters';

export const Dashboard = ({ 
  files = [], 
  totalUsedBytes, 
  capacityLimitBytes, 
  onOpenUpload, 
  onViewFile, 
  onDeleteFile,
  onNavigateToFiles,
  isSupabaseActive
}) => {
  const percentage = Math.min(100, Math.round((totalUsedBytes / capacityLimitBytes) * 100));
  const availableBytes = Math.max(0, capacityLimitBytes - totalUsedBytes);

  // Time of day greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const categories = {
    image: { count: 0, size: 0, label: 'Images', icon: ImageIcon, color: 'from-sky-400 via-blue-500 to-indigo-600', text: 'text-sky-400', border: 'bg-sky-400' },
    video: { count: 0, size: 0, label: 'Videos', icon: Video, color: 'from-purple-400 via-indigo-500 to-violet-600', text: 'text-purple-400', border: 'bg-purple-400' },
    audio: { count: 0, size: 0, label: 'Audio Tracks', icon: Music, color: 'from-emerald-400 via-teal-500 to-emerald-600', text: 'text-emerald-400', border: 'bg-emerald-400' },
    document: { count: 0, size: 0, label: 'Documents & PDFs', icon: FileText, color: 'from-amber-400 via-orange-500 to-amber-600', text: 'text-amber-400', border: 'bg-amber-400' },
    code: { count: 0, size: 0, label: 'Code & Datasets', icon: Code, color: 'from-cyan-400 via-blue-500 to-cyan-600', text: 'text-cyan-400', border: 'bg-cyan-400' },
    other: { count: 0, size: 0, label: 'Other Formats', icon: Layers, color: 'from-zinc-400 via-zinc-600 to-zinc-800', text: 'text-zinc-400', border: 'bg-zinc-400' }
  };

  files.forEach(f => {
    const catKey = ['image', 'video', 'audio', 'document', 'pdf', 'code'].includes(f.category)
      ? (f.category === 'pdf' ? 'document' : f.category)
      : 'other';
    if (categories[catKey]) {
      categories[catKey].count += 1;
      categories[catKey].size += f.size || 0;
    }
  });

  const recentFiles = [...files]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Hero Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 animate-fade-in-up stagger-1">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            {getGreeting()}, Explorer
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 flex items-center gap-2">
            <span>Supabase:</span>
            <span className={`inline-flex items-center gap-1 font-bold ${isSupabaseActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              {isSupabaseActive ? 'Online' : 'Offline'}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-mono">{files.length} Active Files</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUpload}
            className="btn-gradient-primary btn-press px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 tracking-wider uppercase shadow-[0_0_25px_-5px_rgba(56,189,248,0.4)]"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New File</span>
          </button>
        </div>
      </div>

      {/* Main Storage Capacity & Dropzone Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-2">
        
        {/* Storage Capacity Gauge Card */}
        <div className="lg:col-span-2 glass-card-premium gradient-border-card rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-1">
                Storage Capacity Gauge
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {formatBytes(totalUsedBytes)} <span className="text-lg text-zinc-500 font-normal font-sans">/ {formatBytes(capacityLimitBytes)}</span>
              </h2>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 shadow-inner">
              <HardDrive className="w-7 h-7 text-sky-400" />
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="mt-8 space-y-3 relative z-10">
            <div className="w-full h-4 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage > 85 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-300 pt-1">
              <span className="text-sky-400">{percentage}% Capacity Occupied</span>
              <span className="text-emerald-400">{formatBytes(availableBytes)} Remaining</span>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/10 relative z-10">
            <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">Total Items</span>
              <span className="text-lg font-extrabold text-white font-mono">{files.length}</span>
            </div>
            <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">Free Space</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">{formatBytes(availableBytes)}</span>
            </div>
            <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-white/5 hover:border-white/15 transition-all">
              <span className="text-[11px] text-zinc-400 uppercase font-semibold block">Storage Layer</span>
              <span className="text-xs font-bold text-sky-400 font-mono truncate block mt-1">
                {isSupabaseActive ? 'Supabase Bucket' : 'Local State'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Dropzone Card */}
        <div 
          onClick={onOpenUpload}
          className="glass-card-premium rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/20 hover:border-sky-400 cursor-pointer group transition-all relative overflow-hidden btn-press"
        >
          <div className="w-16 h-16 rounded-3xl bg-zinc-950 border border-white/15 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-sky-400 transition-all shadow-2xl">
            <Upload className="w-8 h-8 text-sky-400 group-hover:animate-bounce" />
          </div>
          <h3 className="text-lg font-extrabold text-white group-hover:text-sky-400 transition-colors">
            Quick Dropzone
          </h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Drag and drop images, videos, documents, or code directly into Nemo cloud.
          </p>
          <span className="mt-5 px-4 py-2 rounded-xl bg-zinc-900 text-xs font-bold text-sky-400 border border-sky-500/30 group-hover:bg-sky-400 group-hover:text-black transition-colors uppercase tracking-wider">
            Select Files
          </span>
        </div>

      </div>

      {/* Analytics Breakdown Grid */}
      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-sky-400" />
            <span>Storage Analytics</span>
          </h2>
          <button 
            onClick={onNavigateToFiles}
            className="text-xs text-zinc-400 hover:text-sky-400 flex items-center gap-1 font-semibold transition-colors font-mono btn-press"
          >
            <span>Explorer</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categories).map(([key, cat]) => {
            const Icon = cat.icon;
            const catPercentage = totalUsedBytes > 0 
              ? Math.round((cat.size / totalUsedBytes) * 100) 
              : 0;

            return (
              <div 
                key={key} 
                className="glass-card-premium gradient-border-card rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Category colored accent line */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${cat.border}`} />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl bg-zinc-950 border border-white/10 ${cat.text} shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                      <span className="text-xs text-zinc-400 font-mono">{cat.count} Files</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    {formatBytes(cat.size)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                      style={{ width: `${catPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-end text-[10px] text-zinc-400 font-mono font-semibold">
                    <span>{catPercentage}% of total storage</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Files Table */}
      <div className="animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>Recent Upload Activity</span>
          </h2>
        </div>

        {recentFiles.length === 0 ? (
          <div className="glass-card-premium rounded-3xl p-8 text-center text-zinc-500 text-sm">
            No files uploaded yet.
          </div>
        ) : (
          <div className="glass-card-premium rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-zinc-950/80 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-4 px-5">File Name</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Size</th>
                    <th className="py-4 px-5">Uploaded</th>
                    <th className="py-4 px-5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {recentFiles.map((file, idx) => (
                    <tr key={file.id} className={`hover:bg-zinc-900/70 transition-colors group ${idx % 2 === 1 ? 'bg-zinc-950/30' : ''}`}>
                      <td className="py-4 px-5 font-semibold text-white">
                        <span className="truncate max-w-xs block group-hover:text-sky-400 transition-colors flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            file.category === 'image' ? 'bg-sky-400' :
                            file.category === 'video' ? 'bg-purple-400' :
                            file.category === 'audio' ? 'bg-emerald-400' :
                            file.category === 'code' ? 'bg-cyan-400' : 'bg-amber-400'
                          }`} />
                          {file.name}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs font-mono text-zinc-400 uppercase">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 font-bold">
                          {file.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs font-mono text-zinc-300 font-semibold">
                        {formatBytes(file.size)}
                      </td>
                      <td className="py-4 px-5 text-xs text-zinc-400">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewFile(file)}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-sky-500/20 text-zinc-300 hover:text-sky-400 transition-colors border border-white/10 btn-press"
                            title="View File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteFile(file.id)}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 transition-colors border border-white/10 btn-press"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
