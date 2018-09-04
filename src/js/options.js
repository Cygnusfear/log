'use strict';

Log.options = {

  /**
   * Set accent
   * @param {string} accent
   */
  setAccent (accent) {
    if (accent.length === 0) return;
    user.config.ui.accent = accent;
    Log.options.update.config();
  },

  /**
   * Set background colour
   * @param {string} bg
   */
  setBackgroundColour (bg) {
    if (bg.length === 0) return;
    user.config.ui.bg = bg;
    Log.options.update.config();
  },

  /**
   * Set calendar system
   * @param {string} cal
   */
  setCalendar (cal) {
    if (cal.length === 0) return;
    if (!~['aequirys', 'desamber', 'monocal', 'gregorian'].indexOf(cal)) return;

    c_display = {};
    user.config.system.calendar = cal;
    Log.options.update.config();
  },

  /**
   * Set sector/project colour code
   * @param {string} mode - Sector or project
   * @param {string} key - Name
   * @param {string} colour
   */
  setColourCode (mode, key, colour) {
    if (mode === undefined || key === undefined || colour === undefined) return;
    if (!~['sector', 'sec', 'project', 'pro'].indexOf(mode)) return;
    if (key.length === 0) return;
    if (colour.length === 0) return;

    if (mode === 'sector' || mode === 'sec') {
      user.palette[key] = colour;
      Log.options.update.palette();
    } else {
      user.projectPalette[key] = colour;
      Log.options.update.projectPalette();
    }
  },

  /**
   * Set colour mode
   * @param {string} mode - Sector, project, or none
   */
  setColourMode (mode) {
    if (mode === undefined) return;
    if (mode.length === 0) return;
    if (!~['sector', 'sec', 'project', 'pro', 'none'].indexOf(mode)) return;

    switch (mode) {
      case 'sector': case 'sec': mode = 'sc'; break;
      case 'project': case 'pro': mode = 'pc'; break;
      default: break;
    }

    user.config.ui.colourMode = mode;
    Log.options.update.config();
  },

  /**
   * Set foreground colour (text colour)
   * @param {string} colour
   */
  setForegroundColour (colour) {
    if (colour.length === 0) return;

    user.config.ui.colour = colour;
    Log.options.update.config();
  },

  /**
   * Set stat display format
   * @param {string} format
   */
  setStat (format) {
    if (format.length === 0) return;
    if (!~['decimal', 'human'].indexOf(format)) return;

    user.config.ui.stat = format;
    Log.options.update.config();
  },

  /**
   * Set time system
   * @param {string} format - 24, 12, or decimal
   */
  setTimeFormat (format) {
    if (format.length === 0) return;
    if (!~['24', '12', 'decimal'].indexOf(format)) return;

    user.config.system.timeFormat = format;
    Log.options.update.config();
  },

  /**
   * Set view
   * @param {number} days
   */
  setView (days) {
    if (days === undefined) return;
    if (days < 0) return;

    user.config.ui.view = days;
    Log.options.update.config();
  },

  update: {

    /**
     * Update everything
     */
    all () {
      this.config(false);
      this.palette(false);
      this.projectPalette(false);
      this.log(false);
      this.localStorage();
    },

    /**
     * Update config
     * @param {boolean} [ls] - Update localStorage?
     */
    config (ls = true) {
      dataStore.set('config', user.config);
      Log.config = user.config;
      console.log('Config updated')
      ls && Log.options.update.localStorage();
    },

    /**
     * Update localStorage
     */
    localStorage () {
      localStorage.setItem('user', JSON.stringify(user));
      journalCache = {};
      console.log('localStorage updated')
      Log.refresh();
    },

    /**
     * Update log
     * @param {boolean} [ls] - Update localStorage?
     */
    log (ls = true) {
      if (user.log.length === 0) {
        console.error('Empty log');
        return;
      }

      dataStore.set('log', user.log);
      Log.log = Log.data.parse(user.log);
      console.log('Log updated')
      ls && Log.options.update.localStorage();
    },

    /**
     * Update sector palette
     * @param {boolean} [ls] - Update localStorage?
     */
    palette (ls = true) {
      if (user.palette === {}) {
        console.error('Empty sector palette');
        return;
      }

      dataStore.set('palette', user.palette);
      Log.palette = user.palette;
      console.log('Sector palette updated')
      ls && Log.options.update.localStorage();
    },

    /**
     * Update proejct palette
     * @param {boolean} [ls] - Update localStorage?
     */
    projectPalette (ls = true) {
      if (user.projectPalette === {}) {
        console.error('Empty roject palette');
        return;
      }

      dataStore.set('projectPalette', user.projectPalette);
      Log.projectPalette = user.projectPalette;
      console.log('Project palette updated')
      ls && Log.options.update.localStorage();
    },
  },
};
