import { INITIAL_FILES, INITIAL_TRASH, STORAGE_LIMIT_BYTES } from '../utils/mockData';
import { getFileCategory, getDaysRemaining } from '../utils/formatters';
import { getSupabase, isSupabaseConfigured, getStoredCredentials } from './supabaseClient';
import { sanitizeFilename } from '../utils/security';

const FILES_STORAGE_KEY = 'nemo_local_files_v1';
const TRASH_STORAGE_KEY = 'nemo_local_trash_v1';
const CAPACITY_STORAGE_KEY = 'nemo_capacity_limit';

export const getCapacityLimit = () => {
  const saved = localStorage.getItem(CAPACITY_STORAGE_KEY);
  const maxBytes = 5 * 1024 * 1024 * 1024;
  return saved ? Math.min(parseInt(saved, 10), maxBytes) : STORAGE_LIMIT_BYTES;
};

export const setCapacityLimit = (bytes) => {
  const maxBytes = 5 * 1024 * 1024 * 1024;
  const safeBytes = Math.min(bytes, maxBytes);
  localStorage.setItem(CAPACITY_STORAGE_KEY, safeBytes.toString());
};

// Initialize Local State if not existing
export const loadLocalState = () => {
  let files = [];
  let trash = [];

  const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
  if (storedFiles) {
    try {
      files = JSON.parse(storedFiles);
    } catch (e) {
      files = INITIAL_FILES;
    }
  } else {
    files = INITIAL_FILES;
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  }

  const storedTrash = localStorage.getItem(TRASH_STORAGE_KEY);
  if (storedTrash) {
    try {
      trash = JSON.parse(storedTrash);
    } catch (e) {
      trash = INITIAL_TRASH;
    }
  } else {
    trash = INITIAL_TRASH;
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
  }

  // Auto purge items older than 30 days
  const validTrash = trash.filter(item => getDaysRemaining(item.deletedAt, 30) > 0);
  if (validTrash.length !== trash.length) {
    trash = validTrash;
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
  }

  return { files, trash };
};

export const saveLocalFiles = (files) => {
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
};

export const saveLocalTrash = (trash) => {
  localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(trash));
};

/**
 * Upload a new file (Supports local mock & Supabase bucket upload)
 */
export const uploadFileService = async (fileObj, customTags = []) => {
  const isSupabase = isSupabaseConfigured();
  const safeName = sanitizeFilename(fileObj.name);
  const category = getFileCategory(fileObj.type, safeName);

  // Read text content locally if text/code file
  let textContent = '';
  if (fileObj.type.startsWith('text/') || safeName.endsWith('.json') || safeName.endsWith('.js') || safeName.endsWith('.sql') || safeName.endsWith('.md') || safeName.endsWith('.html') || safeName.endsWith('.css') || safeName.endsWith('.txt')) {
    try {
      textContent = await fileObj.text();
    } catch (err) {
      textContent = '';
    }
  }

  if (isSupabase) {
    const supabase = getSupabase();
    const { bucketName } = getStoredCredentials();
    const filePath = `${Date.now()}_${safeName.replace(/\s+/g, '_')}`;

    // 1. Upload to Supabase Storage Bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileObj, { upsert: true });

    if (uploadError) {
      console.warn('Supabase storage upload notification:', uploadError);
    }

    // 2. Get Public URL
    const storagePath = uploadData?.path || filePath;
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || (fileObj.type.startsWith('image/') || fileObj.type.startsWith('video/') || fileObj.type.startsWith('audio/') || fileObj.type === 'application/pdf' ? URL.createObjectURL(fileObj) : '');
    const tags = customTags.length ? customTags : ['Uploaded'];

    // 3. Store in DB if nemo_files table exists
    const dbRecord = {
      name: safeName,
      size: fileObj.size,
      type: fileObj.type || 'application/octet-stream',
      category,
      url: publicUrl,
      uploaded_at: new Date().toISOString(),
      is_favorite: false,
      metadata: {
        storage_path: storagePath,
        tags
      }
    };

    let insertedId = `f-${Date.now()}`;
    if (supabase) {
      try {
        const { data: dbInsertData } = await supabase.from('nemo_files').insert([dbRecord]).select();
        if (dbInsertData && dbInsertData[0]) {
          insertedId = dbInsertData[0].id;
        }
      } catch (err) {
        console.warn('Database table nemo_files insert fallback:', err);
      }
    }

    const newRecord = {
      id: insertedId,
      name: safeName,
      size: fileObj.size,
      type: fileObj.type || 'application/octet-stream',
      category,
      uploadedAt: new Date().toISOString(),
      url: publicUrl,
      content: textContent,
      tags,
      isFavorite: false,
      storagePath
    };

    return newRecord;
  } else {
    // Local state fallback
    const fileUrl = fileObj.type.startsWith('image/') || fileObj.type.startsWith('video/') || fileObj.type.startsWith('audio/') || fileObj.type === 'application/pdf'
      ? URL.createObjectURL(fileObj)
      : '';

    return {
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: safeName,
      size: fileObj.size,
      type: fileObj.type || 'application/octet-stream',
      category,
      uploadedAt: new Date().toISOString(),
      url: fileUrl,
      content: textContent,
      tags: customTags.length ? customTags : ['Personal'],
      isFavorite: false
    };
  }
};

/**
 * Helper to check if a string is a valid PostgreSQL UUID
 */
const isValidUuid = (id) => {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Helper to extract Storage path from file object or public URL
 */
const extractStoragePath = (file) => {
  if (!file) return '';
  if (file.storagePath && !file.storagePath.startsWith('http')) {
    return file.storagePath;
  }
  if (file.url && file.url.includes('/nemo-files/')) {
    const parts = file.url.split('/nemo-files/');
    if (parts[1]) return decodeURIComponent(parts[1].split('?')[0]);
  }
  return file.name || '';
};

/**
 * Fetch files from Supabase (DB table or Storage Bucket listing)
 */
export const fetchSupabaseFiles = async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  const { bucketName } = getStoredCredentials();
  if (!supabase) return null;

  try {
    // 1. Query DB table nemo_files
    const { data: dbFiles, error: dbError } = await supabase
      .from('nemo_files')
      .select('*')
      .order('uploaded_at', { ascending: false });

    // If query succeeded (no error), DB table is authoritative!
    if (!dbError && dbFiles !== null) {
      return dbFiles.map(row => ({
        id: row.id,
        name: row.name,
        size: Number(row.size),
        type: row.type,
        category: row.category || getFileCategory(row.type, row.name),
        url: row.url,
        uploadedAt: row.uploaded_at || new Date().toISOString(),
        isFavorite: row.is_favorite || false,
        tags: row.metadata?.tags || ['Uploaded'],
        storagePath: row.metadata?.storage_path || row.name
      }));
    }

    // 2. Fallback ONLY if DB table nemo_files does not exist
    const { data: storageObjects, error: storageError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (!storageError && storageObjects && storageObjects.length > 0) {
      return storageObjects.map(obj => {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(obj.name);

        const safeName = obj.name.includes('_') ? obj.name.split('_').slice(1).join('_') : obj.name;
        const category = getFileCategory(obj.metadata?.mimetype || '', safeName);

        return {
          id: obj.id || obj.name,
          name: safeName,
          size: obj.metadata?.size || 0,
          type: obj.metadata?.mimetype || 'application/octet-stream',
          category,
          url: publicUrlData?.publicUrl || '',
          uploadedAt: obj.created_at || new Date().toISOString(),
          isFavorite: false,
          tags: ['Supabase Storage'],
          storagePath: obj.name
        };
      });
    }
    return [];
  } catch (err) {
    console.error('Error fetching Supabase files:', err);
  }
  return null;
};

/**
 * Fetch Trash items from Supabase nemo_trash DB table
 */
export const fetchSupabaseTrash = async () => {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: trashRows, error } = await supabase
      .from('nemo_trash')
      .select('*')
      .order('deleted_at', { ascending: false });

    if (!error && trashRows !== null) {
      return trashRows.map(row => ({
        id: row.id,
        originalFileId: row.original_file_id || row.id,
        name: row.name,
        size: Number(row.size),
        type: row.type,
        category: row.category || getFileCategory(row.type, row.name),
        url: row.url,
        deletedAt: row.deleted_at || new Date().toISOString(),
        isFavorite: false,
        tags: ['Trash'],
        storagePath: row.name
      }));
    }
  } catch (err) {
    console.warn('Error fetching Supabase trash:', err);
  }
  return null;
};

/**
 * Move file to Trash in Supabase (deletes from nemo_files, inserts into nemo_trash)
 */
export const moveToTrashService = async (file) => {
  if (!isSupabaseConfigured() || !file) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // 1. Delete row from nemo_files DB table
    if (isValidUuid(file.id)) {
      try { await supabase.from('nemo_files').delete().eq('id', file.id); } catch (e) {}
    }
    if (file.url) {
      try { await supabase.from('nemo_files').delete().eq('url', file.url); } catch (e) {}
    }
    if (file.name) {
      try { await supabase.from('nemo_files').delete().eq('name', file.name); } catch (e) {}
    }

    // 2. Insert row into nemo_trash DB table
    const trashRecord = {
      original_file_id: isValidUuid(file.id) ? file.id : null,
      name: file.name || 'Untitled',
      size: file.size || 0,
      type: file.type || 'application/octet-stream',
      category: file.category || 'other',
      url: file.url || 'https://nemo.local/file',
      deleted_at: new Date().toISOString()
    };
    if (isValidUuid(file.id)) {
      trashRecord.id = file.id;
    }

    try {
      const { error: insertErr } = await supabase.from('nemo_trash').insert([trashRecord]);
      if (insertErr) {
        console.warn('nemo_trash insert info:', insertErr.message);
      }
    } catch (err) {
      console.warn('nemo_trash insert error:', err);
    }

    return true;
  } catch (err) {
    console.error('Error moving file to trash in Supabase:', err);
    return false;
  }
};

/**
 * Restore file from Trash in Supabase (deletes from nemo_trash, re-inserts into nemo_files)
 */
export const restoreFromTrashService = async (trashItem) => {
  if (!isSupabaseConfigured() || !trashItem) return false;
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // 1. Delete from nemo_trash DB table
    if (isValidUuid(trashItem.id)) {
      try { await supabase.from('nemo_trash').delete().eq('id', trashItem.id); } catch (e) {}
    }
    if (trashItem.url) {
      try { await supabase.from('nemo_trash').delete().eq('url', trashItem.url); } catch (e) {}
    }

    // 2. Re-insert into nemo_files DB table
    const fileRecord = {
      name: trashItem.name,
      size: trashItem.size,
      type: trashItem.type || 'application/octet-stream',
      category: trashItem.category || 'other',
      url: trashItem.url || '',
      uploaded_at: trashItem.uploadedAt || new Date().toISOString(),
      is_favorite: false,
      metadata: {
        storage_path: trashItem.storagePath || trashItem.name,
        tags: trashItem.tags || ['Restored']
      }
    };
    if (isValidUuid(trashItem.id)) {
      fileRecord.id = trashItem.id;
    }

    try {
      await supabase.from('nemo_files').insert([fileRecord]);
    } catch (err) {
      console.warn('nemo_files re-insert error:', err);
    }

    return true;
  } catch (err) {
    console.error('Error restoring file from trash in Supabase:', err);
    return false;
  }
};

/**
 * Permanently Delete file directly from Supabase Storage Bucket & Database (both nemo_files and nemo_trash)
 */
export const deleteSupabaseFileService = async (file) => {
  if (!isSupabaseConfigured() || !file) return false;
  const supabase = getSupabase();
  const { bucketName } = getStoredCredentials();
  if (!supabase) return false;

  try {
    const storagePath = extractStoragePath(file);

    // 1. Delete from Supabase Storage Bucket
    if (storagePath) {
      try {
        await supabase.storage
          .from(bucketName)
          .remove([storagePath]);
      } catch (e) {}
      
      // Also try with original name if different
      if (file.name && file.name !== storagePath) {
        try { await supabase.storage.from(bucketName).remove([file.name]); } catch (e) {}
      }
    }

    // 2. Delete from Supabase DB nemo_files and nemo_trash tables
    if (isValidUuid(file.id)) {
      try { await supabase.from('nemo_files').delete().eq('id', file.id); } catch (e) {}
      try { await supabase.from('nemo_trash').delete().eq('id', file.id); } catch (e) {}
    }
    if (file.url) {
      try { await supabase.from('nemo_files').delete().eq('url', file.url); } catch (e) {}
      try { await supabase.from('nemo_trash').delete().eq('url', file.url); } catch (e) {}
    }
    if (file.name) {
      try { await supabase.from('nemo_files').delete().eq('name', file.name); } catch (e) {}
      try { await supabase.from('nemo_trash').delete().eq('name', file.name); } catch (e) {}
    }

    return true;
  } catch (err) {
    console.error('Error permanently deleting file from Supabase:', err);
    return false;
  }
};

/**
 * Helper to fetch text content of a remote file on demand for view/code inspection
 */
export const fetchFileTextContent = async (url) => {
  if (!url) return '';
  try {
    const res = await fetch(url);
    if (res.ok) {
      return await res.text();
    }
  } catch (e) {
    console.warn('Failed to fetch file text content:', e);
  }
  return '';
};


