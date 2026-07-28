import React, { useState, useRef } from 'react';
import { X, Upload, File, Check, Tag, Sparkles, AlertTriangle } from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { isAllowedFileType, sanitizeFilename, sanitizeTag } from '../utils/security';

export const UploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['Personal']);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndAddFiles = (fileList) => {
    setFileError('');
    const valid = [];
    const rejected = [];

    for (const f of fileList) {
      if (!isAllowedFileType(f.name)) {
        rejected.push(f.name);
      } else {
        valid.push(f);
      }
    }

    if (rejected.length > 0) {
      setFileError(`Prohibited file type(s) blocked for security: ${rejected.join(', ')}`);
    }

    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = sanitizeTag(tagInput);
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate progress updates for smooth feedback
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      await onUploadComplete(selectedFiles, tags);
      setUploadProgress(100);
      setTimeout(() => {
        clearInterval(interval);
        setIsUploading(false);
        setSelectedFiles([]);
        setUploadProgress(0);
        setFileError('');
        onClose();
      }, 400);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-xl glass-modal-premium rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-modal-entrance">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30 flex items-center justify-center shadow-inner">
              <Upload className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span>Upload Files to Nemo</span>
                <Sparkles className="w-4 h-4 text-sky-400 inline" />
              </h2>
              <p className="text-xs text-zinc-400">Select or drop your files below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors btn-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-sky-400 bg-sky-500/15 scale-[1.01] shadow-[0_0_30px_rgba(56,189,248,0.2)]'
              : 'border-white/15 hover:border-sky-500/50 bg-zinc-900/50 hover:bg-zinc-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white block">
              Click to browse or drag and drop files
            </span>
            <span className="text-xs text-zinc-500 mt-1 block">
              Supports Images, Videos, Audio, PDFs, Documents, and Code
            </span>
          </div>
        </div>

        {/* File Security Warning */}
        {fileError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 animate-slide-up">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2 animate-fade-in-up">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Selected Files ({selectedFiles.length})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-between text-xs animate-slide-up">
                  <div className="flex items-center gap-2.5 truncate max-w-xs">
                    <File className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span className="truncate font-medium text-zinc-200">{sanitizeFilename(file.name)}</span>
                  </div>
                  <span className="font-mono text-zinc-400 text-[11px]">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tag Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Add Tags (Optional)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag & press Enter (e.g. Design)"
                className="w-full bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-white/10 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 btn-press"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-800/90 text-xs text-sky-400 border border-white/10 flex items-center gap-1.5 animate-pop-in">
                  #{t}
                  <button onClick={() => removeTag(t)} className="text-zinc-400 hover:text-white transition-colors">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-2 pt-2 animate-fade-in">
            <div className="flex justify-between text-xs font-mono text-zinc-300">
              <span>Uploading to Storage...</span>
              <span className="text-sky-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300 rounded-full progress-striped" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-white/10 btn-press"
          >
            Cancel
          </button>
          <button
            onClick={handleStartUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="btn-gradient-primary btn-press px-5 py-2.5 rounded-xl text-black text-xs font-extrabold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isUploading ? 'Uploading...' : `Start Upload (${selectedFiles.length})`}
          </button>
        </div>

      </div>
    </div>
  );
};
