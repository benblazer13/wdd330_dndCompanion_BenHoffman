/**
 * npc-manager.js
 * NPC creation form and NPC library: validates the form, previews the
 * chosen portrait, uploads it to Cloudinary, saves the NPC to localStorage,
 * and shows every saved NPC (with its portrait) on the page.
 */

import { Npc } from './npc.js';
import { loadData, saveData } from './storage.js';
import { uploadImage, getThumbnailUrl } from './cloudinary-service.js';
import {
  createElement,
  clearElement,
  showStatus,
  setStagger,
  animateOut,
} from './ui-manager.js';

const STORAGE_KEY = 'dnd-companion-npcs';

/**
 * Load all saved NPCs. Ignores anything in storage that is not usable.
 * @returns {Npc[]} Saved NPCs.
 */
function loadNpcs() {
  const saved = loadData(STORAGE_KEY, []);
  if (!Array.isArray(saved)) {
    return [];
  }
  return saved
    .filter((item) => item && typeof item === 'object' && item.name)
    .map((item) => Npc.fromJSON(item));
}

/**
 * Save the NPC list.
 * @param {Npc[]} npcs - NPCs to save.
 * @returns {boolean} True if the save worked.
 */
function saveNpcs(npcs) {
  return saveData(STORAGE_KEY, npcs);
}

/**
 * Turn "gruff, loyal, afraid of cats" into a clean array.
 * @param {string} text - Comma-separated traits.
 * @returns {string[]} Traits with blanks removed.
 */
function parseTraits(text) {
  return text
    .split(',')
    .map((trait) => trait.trim())
    .filter((trait) => trait.length > 0);
}

/**
 * Build the letter shown when an NPC has no image (or it cannot load).
 * @param {Npc} npc - The NPC.
 * @returns {HTMLElement} A placeholder <div>.
 */
function buildPlaceholder(npc) {
  return createElement('div', {
    className: 'npc-portrait npc-portrait-empty',
    text: npc.name.charAt(0).toUpperCase(),
    attrs: { 'aria-hidden': 'true' },
  });
}

/**
 * Build the portrait for a card: the Cloudinary image, or a placeholder.
 * @param {Npc} npc - The NPC.
 * @returns {HTMLElement} An <img> or placeholder <div>.
 */
function buildPortrait(npc) {
  if (!npc.imageUrl) {
    return buildPlaceholder(npc);
  }

  const image = createElement('img', {
    className: 'npc-portrait',
    attrs: {
      src: getThumbnailUrl(npc.imageUrl),
      alt: `Portrait of ${npc.name}`,
      width: '400',
      height: '400',
      loading: 'lazy',
    },
  });

  // Fade the image in once it has loaded (CSS handles the transition).
  image.addEventListener('load', () => image.classList.add('is-loaded'));
  // If the image is gone or the network fails, fall back to the placeholder.
  image.addEventListener('error', () => image.replaceWith(buildPlaceholder(npc)));
  if (image.complete && image.naturalWidth > 0) {
    image.classList.add('is-loaded');
  }
  return image;
}

/**
 * Build one NPC card.
 * @param {Npc} npc - The NPC to show.
 * @param {Function} onDelete - Called with the NPC and its card when Delete is clicked.
 * @returns {HTMLElement} A list item.
 */
function buildNpcCard(npc, onDelete) {
  const deleteButton = createElement('button', { className: 'button-quiet', text: 'Delete' });
  deleteButton.type = 'button';
  deleteButton.setAttribute('aria-label', `Delete ${npc.name}`);

  const body = createElement('div', { className: 'npc-body' }, [
    createElement('h4', { text: npc.name }),
    createElement('p', { className: 'subtitle', text: npc.role }),
  ]);

  if (npc.description) {
    body.append(createElement('p', { text: npc.description }));
  }

  if (npc.traits.length > 0) {
    const traitList = createElement('ul', { className: 'trait-list' });
    npc.traits.forEach((trait) => traitList.append(createElement('li', { text: trait })));
    body.append(traitList);
  }

  body.append(deleteButton);

  const card = createElement('li', { className: 'npc-card' }, [buildPortrait(npc), body]);
  deleteButton.addEventListener('click', () => onDelete(npc, card));
  return card;
}

/**
 * Connect the NPC form and library to the page.
 * @returns {void}
 */
export function initNpcManager() {
  const form = document.getElementById('npc-form');
  const submitButton = document.getElementById('npc-submit');
  const status = document.getElementById('npc-status');
  const library = document.getElementById('npc-library');
  const count = document.getElementById('npc-count');
  const portraitInput = document.getElementById('npc-portrait');
  const preview = document.getElementById('npc-preview');

  let npcs = loadNpcs();
  let previewUrl = '';

  /** Update the "N NPCs saved" line under the library heading. */
  function updateCount() {
    if (npcs.length === 0) {
      count.textContent = 'No NPCs saved yet. Fill in the form to create your first one.';
      return;
    }
    count.textContent = `${npcs.length} NPC${npcs.length === 1 ? '' : 's'} saved in this browser.`;
  }

  /** Add one NPC's card to the library, with an entrance animation. */
  function addCard(npc, { index = 0, prepend = false } = {}) {
    const card = buildNpcCard(npc, handleDelete);
    card.classList.add('is-entering');
    setStagger(card, index);
    if (prepend) {
      library.prepend(card);
    } else {
      library.append(card);
    }
  }

  /** Remove an NPC after the user confirms, fading its card out first. */
  async function handleDelete(npc, card) {
    if (!window.confirm(`Delete ${npc.name}? This cannot be undone.`)) {
      return;
    }
    npcs = npcs.filter((other) => other.id !== npc.id);
    if (!saveNpcs(npcs)) {
      showStatus(status, 'Could not update saved NPCs. Browser storage may be blocked.', true);
    }
    await animateOut(card);
    card.remove();
    updateCount();
  }

  /** Remove the portrait preview and free its temporary URL. */
  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = '';
    }
    clearElement(preview);
    preview.hidden = true;
  }

  // Show a preview as soon as an image is chosen (change event).
  portraitInput.addEventListener('change', () => {
    clearPreview();
    const file = portraitInput.files[0];
    if (file && file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      preview.append(createElement('img', {
        attrs: { src: previewUrl, alt: 'Preview of the portrait you chose' },
      }));
      preview.hidden = false;
    }
  });

  // form.reset() fires this, so the preview clears after each save too.
  form.addEventListener('reset', clearPreview);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const role = String(data.get('role'));
    const portrait = data.get('portrait');

    if (!name) {
      showStatus(status, 'Enter a name for your NPC.', true);
      return;
    }
    if (!role) {
      showStatus(status, 'Choose a role for your NPC.', true);
      return;
    }

    submitButton.disabled = true;

    try {
      let imageUrl = '';
      if (portrait instanceof File && portrait.size > 0) {
        showStatus(status, 'Uploading portrait...');
        imageUrl = await uploadImage(portrait);
      }

      const npc = new Npc({
        name,
        role,
        description: String(data.get('description')).trim(),
        traits: parseTraits(String(data.get('traits'))),
        imageUrl,
      });

      const updated = [npc, ...npcs];
      if (!saveNpcs(updated)) {
        throw new Error('Could not save. Browser storage may be full or blocked.');
      }

      npcs = updated;
      addCard(npc, { prepend: true });
      updateCount();
      form.reset();
      showStatus(status, `${npc.name} was saved to your library.`);
    } catch (error) {
      showStatus(status, error.message, true);
    } finally {
      submitButton.disabled = false;
    }
  });

  npcs.forEach((npc, index) => addCard(npc, { index }));
  updateCount();
}