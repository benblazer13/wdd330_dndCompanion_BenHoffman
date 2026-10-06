/**
 * app.js
 * Entry point. Starts each feature once the page is ready.
 * (Modules load deferred, so the DOM is already parsed here.)
 */

import { initViewSwitcher } from './modules/ui-manager.js';
import { initSpellSearch } from './modules/spell-search.js';
import { initMonsterSearch } from './modules/monster-search.js';
import { initNpcManager } from './modules/npc-manager.js';

initViewSwitcher();
initSpellSearch();
initMonsterSearch();
initNpcManager();
