/**
 * monster-search.js
 * Monster search logic and stat block display.
 */

import { searchMonsters, getMonster } from './dnd-api.js';
import {
  createElement,
  createFactList,
  clearElement,
  showStatus,
  renderResultList,
} from './ui-manager.js';

const ABILITIES = [
  ['STR', 'strength'],
  ['DEX', 'dexterity'],
  ['CON', 'constitution'],
  ['INT', 'intelligence'],
  ['WIS', 'wisdom'],
  ['CHA', 'charisma'],
];

/**
 * Format a speed object such as {walk: "30 ft.", swim: "40 ft."}.
 * @param {object} speed - Speed from the API.
 * @returns {string} Readable speed text.
 */
function formatSpeed(speed) {
  return Object.entries(speed)
    .map(([mode, value]) => (mode === 'walk' ? value : `${mode} ${value}`))
    .join(', ');
}

/**
 * Add a heading and a list of named abilities (actions, traits) to a card.
 * @param {HTMLElement} card - Card to add to.
 * @param {string} heading - Section heading.
 * @param {Array<{name: string, desc: string}>} entries - Abilities.
 * @returns {void}
 */
function addAbilitySection(card, heading, entries) {
  if (!entries || entries.length === 0) {
    return;
  }
  card.append(createElement('h4', { text: heading }));
  entries.forEach((entry) => {
    const name = createElement('strong', { text: `${entry.name}. ` });
    card.append(createElement('p', {}, [name, document.createTextNode(entry.desc)]));
  });
}

/**
 * Build the stat block card shown to the DM.
 * @param {object} monster - Monster from the API.
 * @returns {HTMLElement} The card element.
 */
function buildMonsterCard(monster) {
  const armor = monster.armor_class[0];
  const armorText = armor.type ? `${armor.value} (${armor.type})` : String(armor.value);

  const facts = [
    ['Armor class', armorText],
    ['Hit points', `${monster.hit_points} (${monster.hit_dice})`],
    ['Speed', formatSpeed(monster.speed)],
    ['Challenge', String(monster.challenge_rating)],
  ];
  if (monster.damage_resistances.length > 0) {
    facts.push(['Resistances', monster.damage_resistances.join(', ')]);
  }

  const scores = createElement('dl', { className: 'ability-scores' });
  ABILITIES.forEach(([label, key]) => {
    scores.append(createElement('div', {}, [
      createElement('dt', { text: label }),
      createElement('dd', { text: String(monster[key]) }),
    ]));
  });

  const card = createElement('article', { className: 'card' }, [
    createElement('h3', { text: monster.name }),
    createElement('p', {
      className: 'subtitle',
      text: `${monster.size} ${monster.type}, ${monster.alignment}`,
    }),
    createFactList(facts),
    scores,
  ]);

  addAbilitySection(card, 'Traits', monster.special_abilities);
  addAbilitySection(card, 'Actions', monster.actions);
  return card;
}

/**
 * Connect the monster search form to the API and the page.
 * @returns {void}
 */
export function initMonsterSearch() {
  const form = document.getElementById('monster-form');
  const input = document.getElementById('monster-input');
  const status = document.getElementById('monster-status');
  const resultList = document.getElementById('monster-results');
  const detail = document.getElementById('monster-detail');

  /** Load one monster and show its stat block. */
  async function showMonster(item) {
    showStatus(status, `Loading ${item.name}...`);
    try {
      const monster = await getMonster(item.index);
      clearElement(detail);
      detail.append(buildMonsterCard(monster));
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
      const matches = await searchMonsters(query);
      if (matches.length === 0) {
        showStatus(status, `No monsters found for "${query}". Try a shorter name.`);
        return;
      }
      showStatus(status, `${matches.length} monster${matches.length === 1 ? '' : 's'} found. Choose one to view it.`);
      renderResultList(resultList, matches, showMonster);
    } catch (error) {
      showStatus(status, error.message, true);
    }
  });
}
