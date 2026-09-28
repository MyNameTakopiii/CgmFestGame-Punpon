// In-memory cache for local fallback when Cloudinary is not yet configured
const localPhotoStore = new Map<string, string>();

// In-flight upload deduplication cache (prevents duplicate uploads from React StrictMode)
const inFlightUploads = new Map<string, Promise<UploadResult>>();

export interface UploadResult {
  url: string;
  isCloud: boolean;
  error?: string;
}

/**
 * Uploads a photo strip (Base64 data URL) to Cloudinary or falls back to local storage
 */
export async function uploadPhotoStrip(
  base64Data: string,
  customId?: string
): Promise<UploadResult> {
  // Deduplicate identical upload requests (e.g. from React StrictMode mounting twice)
  const cacheKey = customId || `${base64Data.length}_${base64Data.slice(0, 60)}`;
  if (inFlightUploads.has(cacheKey)) {
    return inFlightUploads.get(cacheKey)!;
  }

  const uploadPromise = (async () => {
    const photoId = customId || `strip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Always save in local cache first for instant local access
    try {
      localPhotoStore.set(photoId, base64Data);
      sessionStorage.setItem(`photobooth_${photoId}`, base64Data);
    } catch {
      // Ignore storage quota errors in private browsing
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // 1. If Cloudinary credentials are provided (and not dummy placeholders), attempt Cloud upload
    const isPlaceholder =
      !cloudName || cloudName === 'your_cloud_name_here' || cloudName.includes('your_');
    if (!isPlaceholder && cloudName && uploadPreset) {
      try {
        const formData = new FormData();
        formData.append('file', base64Data);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'punpon_afterparty');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.secure_url) {
            return {
              url: data.secure_url,
              isCloud: true,
            };
          }
        } else {
          console.warn('Cloudinary upload responded with status:', response.status);
        }
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to local URL:', err);
      }
    }

    // 2. Fallback to Local URL pointing to mobile download viewer
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const localUrl = `${origin}/?mode=download&id=${photoId}`;

    return {
      url: localUrl,
      isCloud: false,
    };
  })();

  inFlightUploads.set(cacheKey, uploadPromise);
  return uploadPromise;
}

/**
 * Retrieves a photo strip by ID from memory or session storage
 */
export function getStoredPhotoStrip(id: string): string | null {
  if (localPhotoStore.has(id)) {
    return localPhotoStore.get(id) || null;
  }

  try {
    const saved = sessionStorage.getItem(`photobooth_${id}`);
    if (saved) return saved;

    // Check fallback latest user polaroid key
    const latest = sessionStorage.getItem('after_party_user_polaroid');
    if (latest) return latest;
  } catch {
    // SessionStorage unavailable
  }

  return null;
}
