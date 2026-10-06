/**
 * ui-manager.js
 * Shared DOM helpers: building elements, status messages, result lists,
 * and switching between views. Elements are built with textContent
 * (never innerHTML) so API data cannot inject markup.
 */

/**
 * Create an element with optional class, text, and children.
 * @param {string} tag - Tag name.
 * @param {object} [options] - Optional settings.
 * @param {string} [options.className] - Class attribute.
 * @param {string} [options.text] - Text content.
 * @param {object} [options.attrs] - Attributes to set, e.g. {src: 'a.png', alt: ''}.
 * @param {Array<Node>} [children] - Child nodes to append.
 * @returns {HTMLElement} The new element.
 */
export function createElement(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([name, value]) => element.setAttribute(name, value));
  }
  children.forEach((child) => element.append(child));
  return element;
}

/**
 * Remove everything inside an element.
 * @param {HTMLElement} element - Element to empty.
 * @returns {void}
 */
export function clearElement(element) {
  element.replaceChildren();
}

/**
 * Show a status or error message.
 * @param {HTMLElement} element - The status paragraph.
 * @param {string} message - Message to show.
 * @param {boolean} [isError] - Style the message as an error.
 * @returns {void}
 */
export function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
  element.classList.toggle('is-loading', !isError && message.endsWith('...'));
}

const MAX_STAGGER_STEPS = 12;

/**
 * Set the position used by CSS to delay an element's entrance animation,
 * so a list of items appears one after another. Capped so long lists
 * do not take forever to finish.
 * @param {HTMLElement} element - The item to animate.
 * @param {number} index - The item's position in the list.
 * @returns {void}
 */
export function setStagger(element, index) {
  element.style.setProperty('--i', String(Math.min(index, MAX_STAGGER_STEPS)));
}

/**
 * Play the CSS "leaving" animation on an element and resolve when it ends.
 * A timeout guarantees this always resolves, even if no animation runs.
 * @param {HTMLElement} element - Element with an .is-leaving animation in CSS.
 * @returns {Promise<void>} Resolves when the animation is done.
 */
export function animateOut(element) {
  return new Promise((resolve) => {
    /** Only react to this element's own animation, not its children's. */
    function handleEnd(event) {
      if (event.target === element) {
        finish();
      }
    }

    function finish() {
      element.removeEventListener('animationend', handleEnd);
      resolve();
    }

    element.addEventListener('animationend', handleEnd);
    element.classList.add('is-leaving');
    setTimeout(finish, 600);
  });
}

/**
 * Fill a list with one button per search result.
 * @param {HTMLElement} listElement - The <ul> to fill.
 * @param {Array<{index: string, name: string}>} items - Search results.
 * @param {Function} onSelect - Called with the chosen item.
 * @returns {void}
 */
export function renderResultList(listElement, items, onSelect) {
  clearElement(listElement);

  items.forEach((item, index) => {
    const button = createElement('button', { className: 'result-button', text: item.name });
    button.type = 'button';
    button.addEventListener('click', () => {
      listElement.querySelectorAll('.result-button').forEach((other) => {
        other.removeAttribute('aria-current');
      });
      button.setAttribute('aria-current', 'true');
      onSelect(item);
    });
    const listItem = createElement('li', {}, [button]);
    setStagger(listItem, index);
    listElement.append(listItem);
  });
}

/**
 * Build a <dl> of label/value facts.
 * @param {Array<[string, string]>} pairs - [label, value] pairs.
 * @param {string} [className] - Class for the list.
 * @returns {HTMLElement} The description list.
 */
export function createFactList(pairs, className = 'facts') {
  const list = createElement('dl', { className });
  pairs.forEach(([label, value]) => {
    list.append(createElement('dt', { text: label }), createElement('dd', { text: value }));
  });
  return list;
}

/**
 * Wire up the nav buttons so each one shows its matching view.
 * @returns {void}
 */
export function initViewSwitcher() {
  const tabs = document.querySelectorAll('.tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((other) => {
        const isActive = other === tab;
        other.setAttribute('aria-pressed', String(isActive));
        document.getElementById(`view-${other.dataset.view}`).hidden = !isActive;
      });
    });
  });
}
