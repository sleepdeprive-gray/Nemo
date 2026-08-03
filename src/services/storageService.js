import { INITIAL_FILES, INITIAL_TRASH, STORAGE_LIMIT_BYTES } from '../utils/mockData';
import { getFileCategory, getDaysRemaining } from '../utils/formatters';
import { getSupabase, isSupabaseConfigured, getStoredCredentials } from './supabaseClient';
import { sanitizeFilename } from '../utils/security';
import { isImgBbEnabled, uploadToImgBB } from './imgbbService';

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
 * Upload a new file (Supports ImgBB image CDN, Supabase bucket, and local fallback)
 */
export const uploadFileService = async (fileObj, customTags = []) => {
  const isSupabase = isSupabaseConfigured();
  const safeName = sanitizeFilename(fileObj.name);
  const category = getFileCategory(fileObj.type, safeName);
  const isImage = fileObj.type.startsWith('image/');
  const isImgBbReady = isImage && isImgBbEnabled();

<<<<<<< Updated upstream
=======
  // Read text content locally if text/code file
  let textContent = '';
  if (fileObj.type.startsWith('text/') || safeName.endsWith('.json') || safeName.endsWith('.js') || safeName.endsWith('.sql') || safeName.endsWith('.md') || safeName.endsWith('.html') || safeName.endsWith('.css') || safeName.endsWith('.txt')) {
    try {
      textContent = await fileObj.text();
    } catch (err) {
      textContent = '';
    }
  }

  // 1. Check if ImgBB handles this image upload
  let imgbbData = null;
  if (isImgBbReady) {
    try {
      imgbbData = await uploadToImgBB(fileObj);
    } catch (imgbbErr) {
      console.warn('ImgBB upload failed, falling back to main storage:', imgbbErr);
    }
  }

  const tags = customTags.length ? customTags : (imgbbData ? ['ImgBB', 'Uploaded'] : ['Uploaded']);

>>>>>>> Stashed changes
  if (isSupabase) {
    const supabase = getSupabase();
    const { bucketName } = getStoredCredentials();
    let publicUrl = '';
    let storagePath = '';
    let storageProvider = 'supabase';

<<<<<<< Updated upstream
    // 1. Upload to Supabase Storage Bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileObj);

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to blob URL:', uploadError);
    }

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl || URL.createObjectURL(fileObj);
=======
    if (imgbbData) {
      publicUrl = imgbbData.displayUrl || imgbbData.url;
      storagePath = `imgbb_${imgbbData.id}`;
      storageProvider = 'imgbb';
    } else {
      const filePath = `${Date.now()}_${safeName.replace(/\s+/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileObj, { upsert: true });

      if (uploadError) {
        console.warn('Supabase storage upload notification:', uploadError);
      }

      storagePath = uploadData?.path || filePath;
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(storagePath);

      publicUrl = publicUrlData?.publicUrl || (isImage || fileObj.type.startsWith('video/') || fileObj.type.startsWith('audio/') || fileObj.type === 'application/pdf' ? URL.createObjectURL(fileObj) : '');
    }

    // 3. Store in DB if nemo_files table exists
    const dbRecord = {
      name: safeName,
      size: Number(fileObj.size) || 0,
      type: fileObj.type || 'application/octet-stream',
      category,
      url: publicUrl,
      uploaded_at: new Date().toISOString(),
      is_favorite: false,
      metadata: {
        storage_path: storagePath,
        storage_provider: storageProvider,
        imgbb_id: imgbbData?.id || null,
        delete_url: imgbbData?.deleteUrl || null,
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
>>>>>>> Stashed changes

    const newRecord = {
      id: uploadData?.path || `f-${Date.now()}`,
      name: safeName,
      size: fileObj.size,
      type: fileObj.type || 'application/octet-stream',
      category,
      uploadedAt: new Date().toISOString(),
      url: publicUrl,
<<<<<<< Updated upstream
      tags: customTags.length ? customTags : ['Uploaded'],
      isFavorite: false
=======
      content: textContent,
      tags,
      isFavorite: false,
      storagePath,
      storageProvider
>>>>>>> Stashed changes
    };

    // Store in DB if available
    await supabase.from('nemo_files').insert([newRecord]).catch(() => {});

    return newRecord;
  } else {
    // Local state fallback (with ImgBB or Blob URL)
    const fileUrl = imgbbData ? (imgbbData.displayUrl || imgbbData.url) : (isImage || fileObj.type.startsWith('video/') || fileObj.type.startsWith('audio/') || fileObj.type === 'application/pdf' ? URL.createObjectURL(fileObj) : '');

    let textContent = '';
    if (fileObj.type.startsWith('text/') || safeName.endsWith('.json') || safeName.endsWith('.js') || safeName.endsWith('.sql') || safeName.endsWith('.md')) {
      try {
        textContent = await fileObj.text();
      } catch (err) {
        textContent = '';
      }
    }

    return {
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: safeName,
      size: fileObj.size,
      type: fileObj.type || 'application/octet-stream',
      category,
      uploadedAt: new Date().toISOString(),
      url: fileUrl,
      content: textContent,
      tags: customTags.length ? customTags : (imgbbData ? ['ImgBB', 'Personal'] : ['Personal']),
      isFavorite: false,
      storageProvider: imgbbData ? 'imgbb' : 'local'
    };
  }
};
