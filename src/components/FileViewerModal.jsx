import React, { useState, useRef } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  Code, 
  Tag, 
  Calendar, 
  HardDrive
} from 'lucide-react';
import { formatBytes, formatDate } from '../utils/formatters';
import { sanitizeUrl } from '../utils/security';

export const FileViewerModal = ({ file, onClose, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const audioRef = useRef(null);

  if (!file) return null;

  const safeUrl = sanitizeUrl(file.url);

  const handleCopyUrl = () => {
    if (safeUrl) {
      navigator.clipboard.writeText(safeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyContent = () => {
    if (file.content) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (safeUrl) {
      const a = document.createElement('a');
      a.href = safeUrl;
      a.download = file.name;
      a.rel = 'noopener noreferrer';
      a.click();
    }
  };

  const toggleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const getCodeContent = () => {
    return file.content || `// File: ${file.name}\n// Direct download link available in sidebar.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-3xl animate-fade-in selection:bg-sky-500 selection:text-black">
      
      {/* Modal Glass Container */}
      <div className="relative w-full max-w-5xl h-[85vh] glass-modal-premium rounded-3xl overflow-hidden flex flex-col md:flex-row border border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] animate-modal-entrance">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-3 rounded-full bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-all duration-300 hover:scale-110 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Display Panel */}
        <div className="flex-1 bg-black/80 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          
          {/* Image Viewer */}
          {file.category === 'image' && safeUrl && (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-auto p-4 relative bg-checkerboard rounded-2xl border border-white/5">
              <img
                src={safeUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full glass-panel-premium border border-white/15 text-xs text-zinc-300 backdrop-blur-md shadow-2xl">
                <button 
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sky-400 hover:text-white hover:bg-white/10 btn-press font-bold text-lg"
                >
                  -
                </button>
                <span className="font-mono px-2 min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sky-400 hover:text-white hover:bg-white/10 btn-press font-bold text-lg"
                >
                  +
                </button>
                <div className="w-px h-4 bg-white/20 mx-1"></div>
                <button 
                  onClick={() => setZoomLevel(1)}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold hover:bg-white/10 rounded-full transition-colors mr-1"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Video Viewer */}
          {file.category === 'video' && safeUrl && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <video
                src={safeUrl}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/15 bg-black"
              />
            </div>
          )}

          {/* Audio Player Viewer */}
          {file.category === 'audio' && safeUrl && (
            <div className="w-full max-w-md p-8 glass-card-premium rounded-[2rem] border border-white/15 flex flex-col items-center justify-center text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 pointer-events-none"></div>
              
              <div className="flex items-center justify-center gap-1.5 h-16 w-full">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full bg-gradient-to-t from-sky-500 to-emerald-400 transition-all duration-150 ${isPlaying ? 'animate-shimmer' : 'h-2 opacity-30'}`}
                    style={{
                      height: isPlaying ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 w-full">
                <h3 className="text-xl font-extrabold text-white truncate px-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{file.name}</h3>
                <p className="text-xs text-zinc-400 mt-2 font-mono bg-zinc-900/50 inline-block px-3 py-1 rounded-full border border-white/5">{formatBytes(file.size)} • Audio Track</p>
              </div>

              <audio
                ref={audioRef}
                src={safeUrl}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <button
                onClick={toggleAudioPlay}
                className="w-20 h-20 rounded-full btn-gradient-primary btn-press flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.5)] relative z-10"
              >
                {isPlaying ? <Pause className="w-8 h-8 text-black" /> : <Play className="w-8 h-8 ml-1 text-black" />}
              </button>
            </div>
          )}

          {/* PDF Viewer with Secure Sandbox */}
          {file.category === 'pdf' && safeUrl && (
            <div className="w-full h-full p-2">
              <iframe
                src={safeUrl}
                title={file.name}
                sandbox="allow-scripts allow-same-origin allow-forms"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-2xl border border-white/10 bg-white shadow-2xl"
              />
            </div>
          )}

          {/* Code / Text Reader */}
          {(file.category === 'code' || file.content !== undefined) && file.category !== 'pdf' && file.category !== 'image' && file.category !== 'video' && file.category !== 'audio' && (
            <div className="w-full h-full flex flex-col p-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className="text-sm font-mono font-bold text-sky-400 flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  Code & Document Reader
                </span>
                <button
                  onClick={handleCopyContent}
                  className="px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-200 flex items-center gap-2 border border-white/10 font-mono transition-all btn-press shadow-lg"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-hidden bg-zinc-950/80 p-1 rounded-2xl border border-white/10 shadow-inner flex">
                <div className="flex-1 overflow-auto p-4 flex font-mono text-[13px] leading-relaxed">
                  <div className="pr-4 text-zinc-600 select-none text-right border-r border-white/5 mr-4 flex flex-col">
                    {getCodeContent().split('\n').map((_, i) => (
                      <span key={i} className="min-w-[1.5rem]">{i + 1}</span>
                    ))}
                  </div>
                  <div className="text-emerald-400 flex-1 whitespace-pre flex flex-col">
                    {getCodeContent().split('\n').map((line, i) => (
                      <span key={i} className="min-h-[1.5rem]">{line || ' '}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info & Controls */}
        <div className="w-full md:w-[340px] glass-panel-premium border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between space-y-6 z-10">
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            <div className="animate-fade-in stagger-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 inline-block shadow-sm">
                {file.category}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-4 break-words leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {file.name}
              </h2>
            </div>

            <div className="space-y-4 pt-5 border-t border-white/5 text-sm animate-fade-in stagger-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  Size
                </span>
                <span className="font-mono font-bold text-zinc-100">{formatBytes(file.size)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Uploaded
                </span>
                <span className="text-zinc-100 text-xs font-medium">{formatDate(file.uploadedAt)}</span>
              </div>

              {file.tags && file.tags.length > 0 && (
                <div className="pt-3 animate-fade-in stagger-3">
                  <span className="text-zinc-400 flex items-center gap-1.5 mb-3 text-xs font-semibold uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" /> Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {file.tags.map((t, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-xl bg-zinc-900/80 text-[11px] text-sky-400 border border-white/10 font-mono shadow-sm hover:border-sky-500/50 transition-colors">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-5 border-t border-white/10 animate-fade-in stagger-4">
            {safeUrl && (
              <button
                onClick={handleDownload}
                className="w-full btn-gradient-primary btn-press text-black font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)] uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            )}

            {safeUrl && (
              <button
                onClick={handleCopyUrl}
                className="w-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-bold py-3 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 border border-white/10 btn-press"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>
            )}

            <button
              onClick={() => {
                onDelete(file.id);
                onClose();
              }}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-rose-500/30 uppercase tracking-wider btn-press mt-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Move to Trash</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
