const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export const isImageUploadConfigured = Boolean(CLOUD && PRESET);

/** Uploads an image to Cloudinary (unsigned preset) and returns an auto-optimised URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD || !PRESET) throw new Error('Image upload is not configured (VITE_CLOUDINARY_* missing).');
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Image is larger than 10 MB.');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', PRESET);
  form.append('folder', 'products');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
  return String(data.secure_url).replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
}
