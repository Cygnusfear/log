'use strict';

const Update = {

  // Update everything
  all () {
    this.config(false);
    this.secPalette(false);
    this.proPalette(false);
    this.log(false);
    Log.refresh();
  },

  /**
   * Update config
   * @param {boolean=} r - Refresh?
   */
  config (r = true) {
    data.set('config', Log.config);
    if (r) Log.refresh();
  },

  /**
   * Update log
   * @param {boolean=} r - Refresh?
   */
  log (r = true) {
    if (Log.entries.length === 0) {
      console.error('Empty log');
      return;
    }

    data.set('log', Log.entries);
    Session = parse(Log.entries);
    if (r) Log.refresh();
  },

  /**
   * Update sector palette
   * @param {boolean=} r - Refresh?
   */
  secPalette (r = true) {
    if (Palette.sp === {}) {
      console.error('Empty sector palette');
      return;
    }

    data.set('sp', Palette.sp);
    if (r) Log.refresh();
  },

  /**
   * Update project palette
   * @param {boolean=} r - Refresh?
   */
  proPalette (r = true) {
    if (Palette.pp === {}) {
      console.error('Empty project palette');
      return;
    }

    data.set('pp', Palette.pp);
    if (r) Log.refresh();
  }
}

module.exports = Update;
