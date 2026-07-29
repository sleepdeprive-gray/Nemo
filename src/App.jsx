import React, { useState, useEffect } from 'react';
import { LoginGate } from './components/LoginGate';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FileList } from './components/FileList';
import { FileViewerModal } from './components/FileViewerModal';
import { TrashBin } from './components/TrashBin';
import { UploadModal } from './components/UploadModal';
import { SettingsModal } from './components/SettingsModal';
import { SqlGuideModal } from './components/SqlGuideModal';
import { 
  loadLocalState, 
  saveLocalFiles, 
  saveLocalTrash, 
  getCapacityLimit, 
  uploadFileService,
  fetchSupabaseFiles,
  fetchSupabaseTrash,
  moveToTrashService,
  restoreFromTrashService,
  deleteSupabaseFileService
} from './services/storageService';
import { isSupabaseConfigured } from './services/supabaseClient';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [trash, setTrash] = useState([]);
  const [capacityLimit, setCapacityLimitState] = useState(getCapacityLimit());
  
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard, files, favorites, trash
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [selectedFileForView, setSelectedFileForView] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSqlGuideOpen, setIsSqlGuideOpen] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(isSupabaseConfigured());
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);

  // Check initial authentication
  useEffect(() => {
    const authSession = sessionStorage.getItem('nemo_authenticated');
    if (authSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load files & trash data
  const refreshFilesData = async () => {
    const { files: localFiles, trash: localTrash } = loadLocalState();
    setCapacityLimitState(getCapacityLimit());
    const supabaseActive = isSupabaseConfigured();
    setIsSupabaseActive(supabaseActive);

    if (supabaseActive) {
      setIsLoadingSupabase(true);
      const [remoteFiles, remoteTrash] = await Promise.all([
        fetchSupabaseFiles(),
        fetchSupabaseTrash()
      ]);

      // If remoteTrash table exists and returns data (or empty array), use it.
      // If remoteTrash is null (nemo_trash table not created in Supabase), preserve localTrash!
      const effectiveTrash = (remoteTrash !== null && Array.isArray(remoteTrash)) 
        ? remoteTrash 
        : localTrash;
      setTrash(effectiveTrash);
      saveLocalTrash(effectiveTrash);

      let effectiveFiles = (remoteFiles !== null && Array.isArray(remoteFiles)) 
        ? remoteFiles 
        : localFiles;

      // Filter active files against Trash items so trashed items NEVER show on Dashboard or Files
      if (effectiveTrash.length > 0) {
        effectiveFiles = effectiveFiles.filter(file => 
          !effectiveTrash.some(t => 
            (t.id && t.id === file.id) || 
            (t.url && file.url && t.url === file.url) || 
            (t.name && file.name && t.name === file.name) ||
            (t.storagePath && file.storagePath && t.storagePath === file.storagePath)
          )
        );
      }

      setFiles(effectiveFiles);
      saveLocalFiles(effectiveFiles);
      setIsLoadingSupabase(false);
    } else {
      const filteredFiles = localFiles.filter(file => 
        !localTrash.some(t => 
          (t.id && t.id === file.id) || 
          (t.url && file.url && t.url === file.url) || 
          (t.name && file.name && t.name === file.name) ||
          (t.storagePath && file.storagePath && t.storagePath === file.storagePath)
        )
      );
      setFiles(filteredFiles);
      setTrash(localTrash);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshFilesData();
    }
  }, [isAuthenticated]);

  // Handle Search Input -> switch to files view automatically if typing
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term && currentTab !== 'files' && currentTab !== 'favorites') {
      setCurrentTab('files');
    }
  };

  // Upload handler
  const handleUploadComplete = async (fileList, tags) => {
    const newFiles = [];
    for (const f of fileList) {
      const uploaded = await uploadFileService(f, tags);
      newFiles.push(uploaded);
    }
    const updatedFiles = [...newFiles, ...files];
    setFiles(updatedFiles);
    saveLocalFiles(updatedFiles);
  };

  // Delete to Trash handler (moves to nemo_trash DB table if Supabase is active)
  const handleMoveToTrash = async (fileId) => {
    const targetFile = files.find(f => f.id === fileId);
    if (!targetFile) return;

    const remainingFiles = files.filter(f => f.id !== fileId);
    const trashItem = {
      ...targetFile,
      deletedAt: new Date().toISOString()
    };

    const updatedTrash = [trashItem, ...trash.filter(t => t.id !== trashItem.id)];
    
    // Commit UI changes & localStorage immediately
    setFiles(remainingFiles);
    setTrash(updatedTrash);
    saveLocalFiles(remainingFiles);
    saveLocalTrash(updatedTrash);

    // Call Supabase service asynchronously
    if (isSupabaseConfigured()) {
      await moveToTrashService(targetFile);
    }
  };

  // Restore from Trash handler (moves back to nemo_files DB table if Supabase is active)
  const handleRestoreFromTrash = async (trashId) => {
    const targetTrash = trash.find(t => t.id === trashId);
    if (!targetTrash) return;

    const remainingTrash = trash.filter(t => t.id !== trashId);
    const { deletedAt, ...restoredFile } = targetTrash;

    const updatedFiles = [restoredFile, ...files.filter(f => f.id !== restoredFile.id)];

    // Commit UI changes & localStorage immediately
    setFiles(updatedFiles);
    setTrash(remainingTrash);
    saveLocalFiles(updatedFiles);
    saveLocalTrash(remainingTrash);

    // Call Supabase service asynchronously
    if (isSupabaseConfigured()) {
      await restoreFromTrashService(targetTrash);
    }
  };

  // Permanent Delete (deletes from Supabase storage bucket & DB tables)
  const handlePermanentDelete = async (trashId) => {
    const targetTrash = trash.find(t => t.id === trashId);

    const updatedTrash = trash.filter(t => t.id !== trashId);
    const updatedFiles = files.filter(f => f.id !== trashId);

    // Commit UI changes & localStorage immediately
    setTrash(updatedTrash);
    setFiles(updatedFiles);
    saveLocalFiles(updatedFiles);
    saveLocalTrash(updatedTrash);

    if (targetTrash && isSupabaseConfigured()) {
      await deleteSupabaseFileService(targetTrash);
    }
  };

  // Empty Trash (deletes all trash items from Supabase & local state)
  const handleEmptyTrash = async () => {
    if (window.confirm('Are you sure you want to permanently delete all items in trash?')) {
      const trashCopy = [...trash];
      setTrash([]);
      saveLocalTrash([]);

      if (isSupabaseConfigured()) {
        for (const item of trashCopy) {
          await deleteSupabaseFileService(item);
        }
      }
    }
  };

  // Toggle Favorite Star
  const handleToggleFavorite = (fileId) => {
    const updatedFiles = files.map(f => f.id === fileId ? { ...f, isFavorite: !f.isFavorite } : f);
    setFiles(updatedFiles);
    saveLocalFiles(updatedFiles);
  };

  // Logout / Lock
  const handleLogout = () => {
    sessionStorage.removeItem('nemo_authenticated');
    setIsAuthenticated(false);
  };

  const handleSettingsUpdated = () => {
    setCapacityLimitState(getCapacityLimit());
    refreshFilesData();
  };

  // Compute Total Bytes Used
  const totalUsedBytes = files.reduce((acc, file) => acc + (file.size || 0), 0);

  if (!isAuthenticated) {
    return <LoginGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-sky-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSqlGuide={() => setIsSqlGuideOpen(true)}
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start">
        
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          trashCount={trash.length}
          filesCount={files.length}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <Dashboard
              files={files}
              totalUsedBytes={totalUsedBytes}
              capacityLimitBytes={capacityLimit}
              onOpenUpload={() => setIsUploadOpen(true)}
              onViewFile={(file) => setSelectedFileForView(file)}
              onDeleteFile={handleMoveToTrash}
              onNavigateToFiles={() => setCurrentTab('files')}
              isSupabaseActive={isSupabaseActive}
            />
          )}

          {currentTab === 'files' && (
            <FileList
              files={files}
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onViewFile={(file) => setSelectedFileForView(file)}
              onDeleteFile={handleMoveToTrash}
              onToggleFavorite={handleToggleFavorite}
              onOpenUpload={() => setIsUploadOpen(true)}
              isFavoritesOnly={false}
            />
          )}

          {currentTab === 'favorites' && (
            <FileList
              files={files}
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              onViewFile={(file) => setSelectedFileForView(file)}
              onDeleteFile={handleMoveToTrash}
              onToggleFavorite={handleToggleFavorite}
              onOpenUpload={() => setIsUploadOpen(true)}
              isFavoritesOnly={true}
            />
          )}

          {currentTab === 'trash' && (
            <TrashBin
              trashFiles={trash}
              onRestore={handleRestoreFromTrash}
              onPermanentDelete={handlePermanentDelete}
              onEmptyTrash={handleEmptyTrash}
            />
          )}
        </main>

      </div>

      {/* Viewing Modal */}
      {selectedFileForView && (
        <FileViewerModal
          file={selectedFileForView}
          onClose={() => setSelectedFileForView(null)}
          onDelete={handleMoveToTrash}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={handleSettingsUpdated}
        onOpenSqlGuide={() => {
          setIsSettingsOpen(false);
          setIsSqlGuideOpen(true);
        }}
      />

      {/* SQL Schema Helper Modal */}
      <SqlGuideModal
        isOpen={isSqlGuideOpen}
        onClose={() => setIsSqlGuideOpen(false)}
      />

    </div>
  );
}
