/**
 * storage.js
 * Save and load data from localStorage. All access is wrapped in try/catch
 * because storage can be full or blocked by the browser.
 */

/**
 * Save a value as JSON.
 * @param {string} key - Storage key.
 * @param {*} value - Any JSON-safe value.
 * @returns {boolean} True if the save worked.
 */
export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Load a value saved with saveData.
 * @param {string} key - Storage key.
 * @param {*} [fallback] - Returned when nothing is saved or the data is unreadable.
 * @returns {*} The saved value or the fallback.
 */
export function loadData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
