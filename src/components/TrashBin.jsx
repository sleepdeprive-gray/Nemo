import React from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Code, 
  File
} from 'lucide-react';
import { formatBytes, formatDate, getDaysRemaining } from '../utils/formatters';

export const TrashBin = ({ 
  trashFiles = [], 
  onRestore, 
  onPermanentDelete, 
  onEmptyTrash 
}) => {

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'image': return <ImageIcon className="w-5 h-5 text-sky-400" />;
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'audio': return <Music className="w-5 h-5 text-emerald-400" />;
      case 'pdf':
      case 'document': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'code': return <Code className="w-5 h-5 text-cyan-400" />;
      default: return <File className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 animate-fade-in-up stagger-1">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Trash2 className="w-8 h-8 text-rose-500" />
            <span>Trash Bin</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Items in Trash are automatically purged permanently after 30 days unless restored.
          </p>
        </div>

        {trashFiles.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 font-extrabold px-4 py-2.5 rounded-2xl text-xs border border-rose-500/40 flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.2)] btn-press"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash ({trashFiles.length})</span>
          </button>
        )}
      </div>

      {/* 30-Day Auto Purge Warning Box */}
      <div className="p-4.5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-xs text-amber-200 shadow-xl relative overflow-hidden animate-fade-in-up stagger-2">
        <div className="w-1 absolute top-0 left-0 bottom-0 bg-amber-400" />
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-300 block mb-0.5 text-sm">30-Day Purge Lifecycle Active</span>
          Deleted files display a live countdown timer. You can restore any file to your active explorer anytime before the countdown reaches zero.
        </div>
      </div>

      {/* Trash Items List */}
      {trashFiles.length === 0 ? (
        <div className="glass-card-premium rounded-3xl p-14 text-center flex flex-col items-center justify-center space-y-4 animate-fade-in-up stagger-3">
          <div className="w-20 h-20 rounded-3xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-rose-500/10 rounded-3xl blur-xl" />
            <Trash2 className="w-10 h-10 text-zinc-600 relative z-10" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Trash Bin is Empty</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm">
              Any files you remove will stay here for 30 days before permanent deletion.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card-premium rounded-3xl overflow-hidden border border-white/10 animate-fade-in-up stagger-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-950/90 text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Trashed File</th>
                  <th className="py-4 px-5">Size</th>
                  <th className="py-4 px-5">Date Deleted</th>
                  <th className="py-4 px-5">30-Day Expiration</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {trashFiles.map((file) => {
                  const daysLeft = getDaysRemaining(file.deletedAt, 30);
                  const isUrgent = daysLeft <= 5;

                  return (
                    <tr key={file.id} className="hover:bg-zinc-900/70 transition-colors group">
                      
                      <td className="py-4 px-5 font-semibold text-white flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:border-rose-500/40 transition-colors">
                          {getCategoryIcon(file.category)}
                        </div>
                        <div className="truncate max-w-xs">
                          <span className="block truncate font-bold text-white group-hover:text-rose-300 transition-colors">{file.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">{file.category}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-xs font-mono text-zinc-300 font-semibold">
                        {formatBytes(file.size)}
                      </td>

                      <td className="py-4 px-5 text-xs text-zinc-400">
                        {formatDate(file.deletedAt)}
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                          isUrgent
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 countdown-urgent'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{daysLeft} days left</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRestore(file.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 uppercase btn-press"
                            title="Restore File"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>
                          
                          <button
                            onClick={() => onPermanentDelete(file.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 uppercase btn-press"
                            title="Delete Forever"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
