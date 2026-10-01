/**
 * npc.js
 * NPC class. Week 6 will add the creation form and library.
 */

export class Npc {
  /**
   * @param {object} details - NPC details.
   * @param {string} details.name - NPC name.
   * @param {string} details.role - Role in the story.
   * @param {string} details.description - Appearance and background.
   * @param {string} [details.imageUrl] - Cloudinary portrait URL.
   */
  constructor({ name, role, description, imageUrl = '' }) {
    this.name = name;
    this.role = role;
    this.description = description;
    this.imageUrl = imageUrl;
  }
}
