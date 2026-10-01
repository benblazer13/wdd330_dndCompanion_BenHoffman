/**
 * campaign.js
 * Campaign class. Week 6+ will add the dashboard and save/load methods.
 */

export class Campaign {
  /**
   * @param {string} name - Campaign name.
   * @param {string} setting - World or setting.
   * @param {string} description - Short summary.
   */
  constructor(name, setting, description) {
    this.name = name;
    this.setting = setting;
    this.description = description;
  }
}
