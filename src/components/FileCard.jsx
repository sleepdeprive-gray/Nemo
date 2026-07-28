import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Code, 
  Archive, 
  File, 
  Eye, 
  Download, 
  Trash2, 
  Star, 
  Share2,
  Check
} from 'lucide-react';
import { formatBytes, formatDate } from '../utils/formatters';

export const FileCard = ({ 
  file, 
  viewMode = 'grid', 
  onView, 
  onDelete, 
  onToggleFavorite 
}) => {
  const [copied, setCopied] = useState(false);

  const getIcon = () => {
    switch (file.category) {
      case 'image': return <ImageIcon className="w-7 h-7 text-sky-400" />;
      case 'video': return <Video className="w-7 h-7 text-purple-400" />;
      case 'audio': return <Music className="w-7 h-7 text-emerald-400" />;
      case 'pdf':
      case 'document': return <FileText className="w-7 h-7 text-amber-400" />;
      case 'code': return <Code className="w-7 h-7 text-cyan-400" />;
      case 'archive': return <Archive className="w-7 h-7 text-rose-400" />;
      default: return <File className="w-7 h-7 text-zinc-400" />;
    }
  };

  const getCategoryColor = () => {
    switch (file.category) {
      case 'image': return 'bg-sky-400';
      case 'video': return 'bg-purple-400';
      case 'audio': return 'bg-emerald-400';
      case 'pdf':
      case 'document': return 'bg-amber-400';
      case 'code': return 'bg-cyan-400';
      case 'archive': return 'bg-rose-400';
      default: return 'bg-zinc-400';
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      a.click();
    }
  };

  if (viewMode === 'list') {
    return (
      <tr className="hover:bg-zinc-900/80 transition-all duration-300 group border-b border-white/5">
        <td className="py-3.5 px-5 flex items-center gap-3.5">
          <button 
            onClick={() => onToggleFavorite(file.id)}
            className="text-zinc-600 hover:text-amber-400 transition-colors btn-press"
          >
            <Star className={`w-4 h-4 transition-transform duration-300 ${file.isFavorite ? 'fill-amber-400 text-amber-400 scale-110' : ''}`} />
          </button>
          
          <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-sky-400/40 transition-colors">
            {file.category === 'image' && file.url ? (
              <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              getIcon()
            )}
          </div>

          <div className="truncate max-w-xs">
            <span 
              onClick={() => onView(file)}
              className="font-bold text-white hover:text-sky-400 cursor-pointer transition-colors truncate block text-sm"
            >
              {file.name}
            </span>
          </div>
        </td>

        <td className="py-3.5 px-5 text-xs font-mono text-zinc-400 uppercase">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 flex items-center gap-1.5 w-fit">
            <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor()}`} />
            {file.category}
          </span>
        </td>

        <td className="py-3.5 px-5 text-xs font-mono text-zinc-200 font-semibold">
          {formatBytes(file.size)}
        </td>

        <td className="py-3.5 px-5 text-xs text-zinc-400">
          {formatDate(file.uploadedAt)}
        </td>

        <td className="py-3.5 px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onView(file)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-sky-500/20 text-zinc-300 hover:text-sky-400 transition-colors border border-white/10 btn-press"
              title="View File"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-emerald-500/20 text-zinc-300 hover:text-emerald-400 transition-colors border border-white/10 btn-press"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(file.id)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 transition-colors border border-white/10 btn-press"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div 
      onClick={() => onView(file)}
      className="glass-card-premium gradient-border-card hover-tilt rounded-3xl p-4 flex flex-col justify-between space-y-4 cursor-pointer group relative overflow-hidden card-toolbar-parent"
    >
      {/* Thumbnail Container */}
      <div className="w-full h-36 rounded-2xl bg-zinc-950/90 border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-sky-500/40 transition-all shadow-inner">
        {file.category === 'image' && file.url ? (
          <img 
            src={file.url} 
            alt={file.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-xl">
            {getIcon()}
          </div>
        )}

        {/* Favorite Star Pill */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(file.id);
          }}
          className="absolute top-3 left-3 p-2 rounded-xl bg-black/70 backdrop-blur-md text-zinc-400 hover:text-amber-400 border border-white/10 transition-colors btn-press z-10"
        >
          <Star className={`w-3.5 h-3.5 transition-transform duration-300 ${file.isFavorite ? 'fill-amber-400 text-amber-400 scale-110' : ''}`} />
        </button>

        {/* Hover View Action */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(file);
            }}
            className="btn-gradient-primary btn-press px-4 py-2 rounded-2xl text-black text-xs font-extrabold flex items-center gap-1.5 shadow-[0_0_20px_rgba(56,189,248,0.5)] uppercase tracking-wider"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
        </div>
      </div>

      {/* File Info */}
      <div className="space-y-1.5">
        <h4 className="font-extrabold text-sm text-white truncate group-hover:text-sky-400 transition-colors">
          {file.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span className="font-semibold text-zinc-300">{formatBytes(file.size)}</span>
          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-sky-400 border border-white/10 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor()}`} />
            {file.category}
          </span>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{formatDate(file.uploadedAt)}</span>
        
        <div className="flex items-center gap-1 card-toolbar">
          {file.url && (
            <button
              onClick={handleCopyLink}
              title="Copy share link"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors btn-press"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={handleDownload}
            title="Download"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors btn-press"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
            title="Move to Trash"
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors btn-press"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
