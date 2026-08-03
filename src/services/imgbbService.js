const STORAGE_KEY_IMGBB = 'nemo_imgbb_api_key';
const STORAGE_KEY_IMGBB_ENABLED = 'nemo_imgbb_enabled';

export const getImgBbApiKey = () => {
  return localStorage.getItem(STORAGE_KEY_IMGBB) || import.meta.env.VITE_IMGBB_API_KEY || '';
};

export const saveImgBbApiKey = (apiKey) => {
  if (apiKey) {
    localStorage.setItem(STORAGE_KEY_IMGBB, apiKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_IMGBB);
  }
};

export const isImgBbConfigured = () => {
  const key = getImgBbApiKey();
  return Boolean(key && key.trim().length > 5);
};

export const isImgBbEnabled = () => {
  const configured = isImgBbConfigured();
  if (!configured) return false;
  const val = localStorage.getItem(STORAGE_KEY_IMGBB_ENABLED);
  return val === null ? true : val === 'true';
};

export const setImgBbEnabled = (enabled) => {
  localStorage.setItem(STORAGE_KEY_IMGBB_ENABLED, Boolean(enabled).toString());
};

/**
 * Upload an image file to ImgBB API
 * @param {File} fileObj - Image file object to upload
 * @returns {Promise<{ url: string, displayUrl: string, thumbUrl: string, deleteUrl: string, id: string }>}
 */
export const uploadToImgBB = async (fileObj) => {
  const apiKey = getImgBbApiKey();
  if (!apiKey) {
    throw new Error('ImgBB API key is not configured.');
  }

  const formData = new FormData();
  formData.append('image', fileObj);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || json.status_txt || 'Failed to upload image to ImgBB';
    throw new Error(errorMsg);
  }

  const data = json.data;
  return {
    id: data.id,
    url: data.url || data.display_url,
    displayUrl: data.display_url || data.url,
    thumbUrl: data.thumb?.url || data.display_url,
    deleteUrl: data.delete_url || '',
    viewerUrl: data.url_viewer || '',
    width: data.width,
    height: data.height,
  };
};
