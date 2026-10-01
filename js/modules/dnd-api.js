/**
 * dnd-api.js
 * Talks to the D&D 5e API (https://www.dnd5eapi.co).
 * Data is fetched on demand and is never stored permanently.
 */

const API_ROOT = 'https://www.dnd5eapi.co/api/2014';

/**
 * Fetch JSON from the API and throw a readable error on failure.
 * @param {string} path - Path after the API root, e.g. "/spells?name=fire".
 * @returns {Promise<object>} Parsed JSON response.
 */
async function fetchJson(path) {
  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`);
  } catch {
    throw new Error('Could not reach the D&D 5e API. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(`The D&D 5e API returned an error (${response.status}).`);
  }
  return response.json();
}

/**
 * Search spells by name.
 * @param {string} name - Full or partial spell name.
 * @returns {Promise<Array<{index: string, name: string, level: number}>>} Matches.
 */
export async function searchSpells(name) {
  const data = await fetchJson(`/spells?name=${encodeURIComponent(name)}`);
  return data.results;
}

/**
 * Get the full details of one spell.
 * @param {string} index - The spell's API index, e.g. "fireball".
 * @returns {Promise<object>} Spell details.
 */
export function getSpell(index) {
  return fetchJson(`/spells/${encodeURIComponent(index)}`);
}

/**
 * Search monsters by name.
 * @param {string} name - Full or partial monster name.
 * @returns {Promise<Array<{index: string, name: string}>>} Matches.
 */
export async function searchMonsters(name) {
  const data = await fetchJson(`/monsters?name=${encodeURIComponent(name)}`);
  return data.results;
}

/**
 * Get the full stat block of one monster.
 * @param {string} index - The monster's API index, e.g. "goblin".
 * @returns {Promise<object>} Monster details.
 */
export function getMonster(index) {
  return fetchJson(`/monsters/${encodeURIComponent(index)}`);
}
