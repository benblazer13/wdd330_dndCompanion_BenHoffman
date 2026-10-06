/**
 * npc.js
 * NPC class. One NPC is saved to localStorage as plain JSON, with the
 * Cloudinary image URL stored alongside its other details.
 */

export class Npc {
  /**
   * @param {object} details - NPC details.
   * @param {string} [details.id] - Unique id (made automatically if missing).
   * @param {string} details.name - NPC name.
   * @param {string} details.role - Role in the story.
   * @param {string} [details.description] - Appearance and background.
   * @param {string[]} [details.traits] - Personality traits.
   * @param {string} [details.imageUrl] - Cloudinary portrait URL.
   * @param {string} [details.createdAt] - ISO date string.
   */
  constructor({
    id = Npc.generateId(),
    name,
    role,
    description = '',
    traits = [],
    imageUrl = '',
    createdAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.description = description;
    this.traits = traits;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }

  /**
   * Make a reasonably unique id.
   * @returns {string} A new id.
   */
  static generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Rebuild an NPC from saved JSON data.
   * @param {object} data - Plain object loaded from localStorage.
   * @returns {Npc} The NPC.
   */
  static fromJSON(data) {
    return new Npc(data);
  }
}