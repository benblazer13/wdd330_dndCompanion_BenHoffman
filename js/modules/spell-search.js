/**
 * spell-search.js
 * Spell search logic and display.
 */

import { searchSpells, getSpell } from './dnd-api.js';
import {
  createElement,
  createFactList,
  clearElement,
  showStatus,
  renderResultList,
} from './ui-manager.js';

/**
 * Turn a spell's level number into a readable label.
 * @param {object} spell - Spell from the API.
 * @returns {string} e.g. "3rd-level Evocation" or "Evocation cantrip".
 */
function describeLevel(spell) {
  if (spell.level === 0) {
    return `${spell.school.name} cantrip`;
  }
  return `Level ${spell.level} ${spell.school.name}`;
}

/**
 * Build the spell card shown to the DM.
 * @param {object} spell - Spell from the API.
 * @returns {HTMLElement} The card element.
 */
function buildSpellCard(spell) {
  const components = spell.material
    ? `${spell.components.join(', ')} (${spell.material})`
    : spell.components.join(', ');

  const duration = spell.concentration ? `${spell.duration}, concentration` : spell.duration;

  const card = createElement('article', { className: 'card' }, [
    createElement('h3', { text: spell.name }),
    createElement('p', { className: 'subtitle', text: describeLevel(spell) }),
    createFactList([
      ['Casting time', spell.casting_time],
      ['Range', spell.range],
      ['Components', components],
      ['Duration', duration],
      ['Classes', spell.classes.map((cls) => cls.name).join(', ') || 'None listed'],
    ]),
  ]);

  spell.desc.forEach((paragraph) => card.append(createElement('p', { text: paragraph })));

  if (spell.higher_level && spell.higher_level.length > 0) {
    card.append(createElement('h4', { text: 'At higher levels' }));
    spell.higher_level.forEach((paragraph) => {
      card.append(createElement('p', { text: paragraph }));
    });
  }
  return card;
}

/**
 * Connect the spell search form to the API and the page.
 * @returns {void}
 */
export function initSpellSearch() {
  const form = document.getElementById('spell-form');
  const input = document.getElementById('spell-input');
  const status = document.getElementById('spell-status');
  const resultList = document.getElementById('spell-results');
  const detail = document.getElementById('spell-detail');

  /** Load one spell and show its card. */
  async function showSpell(item) {
    showStatus(status, `Loading ${item.name}...`);
    try {
      const spell = await getSpell(item.index);
      clearElement(detail);
      detail.append(buildSpellCard(spell));
      showStatus(status, '');
    } catch (error) {
      showStatus(status, error.message, true);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) {
      return;
    }

    clearElement(resultList);
    clearElement(detail);
    showStatus(status, 'Searching...');

    try {
      const matches = await searchSpells(query);
      if (matches.length === 0) {
        showStatus(status, `No spells found for "${query}". Try a shorter name.`);
        return;
      }
      showStatus(status, `${matches.length} spell${matches.length === 1 ? '' : 's'} found. Choose one to view it.`);
      renderResultList(resultList, matches, showSpell);
    } catch (error) {
      showStatus(status, error.message, true);
    }
  });
}
