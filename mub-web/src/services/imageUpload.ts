const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isImageUploadConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const MAX_DIMENSION = 1600;

/** Shrinks large phone photos before upload so they upload fast and load fast. */
async function resizeImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_500_000) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.88));
    return blob || file;
  } catch {
    return file;
  }
}

/**
 * Uploads an image to Cloudinary (unsigned preset) and returns an optimised URL
 * that serves WebP/AVIF at automatic quality.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!isImageUploadConfigured) {
    throw new Error('Photo upload is not set up yet (see SETUP.md, step 6). You can paste an image link instead.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG or WebP).');
  }

  const form = new FormData();
  form.append('file', await resizeImage(file));
  form.append('upload_preset', UPLOAD_PRESET!);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.secure_url) {
    throw new Error(json?.error?.message || 'Photo upload failed. Please try again.');
  }
  return String(json.secure_url).replace('/upload/', '/upload/f_auto,q_auto/');
}
