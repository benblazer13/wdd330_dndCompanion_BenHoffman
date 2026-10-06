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

  items.forEach((item) => {
    const button = createElement('button', { className: 'result-button', text: item.name });
    button.type = 'button';
    button.addEventListener('click', () => {
      listElement.querySelectorAll('.result-button').forEach((other) => {
        other.removeAttribute('aria-current');
      });
      button.setAttribute('aria-current', 'true');
      onSelect(item);
    });
    listElement.append(createElement('li', {}, [button]));
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
