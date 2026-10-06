/**
 * cloudinary-service.js
 * Uploads NPC portraits to Cloudinary straight from the browser using an
 * unsigned upload preset (no API secret is needed or used).
 * Settings live in ../config.js.
 */

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config.js';

const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Check whether the placeholder values in config.js were replaced.
 * @returns {boolean} True when both settings look filled in.
 */
export function isConfigured() {
  return !CLOUDINARY_CLOUD_NAME.startsWith('PLACEHOLDER')
    && !CLOUDINARY_UPLOAD_PRESET.startsWith('PLACEHOLDER');
}

/**
 * Upload an image to Cloudinary.
 * @param {File} file - Image chosen in the file input.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
export async function uploadImage(file) {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not set up yet. Add your cloud name and upload preset in js/config.js.');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, GIF, or WebP).');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('That image is larger than 5 MB. Choose a smaller one.');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  let response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body },
    );
  } catch {
    throw new Error('Could not reach Cloudinary. Check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data.error?.message ?? `status ${response.status}`;
    throw new Error(`Cloudinary upload failed: ${reason}`);
  }
  return data.secure_url;
}

/**
 * Ask Cloudinary for a smaller, square, optimized version of an image.
 * Falls back to the original URL if it is not a Cloudinary URL.
 * @param {string} url - The stored secure_url.
 * @param {number} [size] - Width and height in pixels.
 * @returns {string} URL to use in an <img>.
 */
export function getThumbnailUrl(url, size = 400) {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  return url.replace('/upload/', `/upload/c_fill,w_${size},h_${size},g_auto,q_auto,f_auto/`);
}
