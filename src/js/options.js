Log.options = {

  /**
   * Update data and settings
   */
  update: {

    /**
     * Update localStorage
     */
    localStorage() {
      localStorage.setItem('user', JSON.stringify(user));
      Log.refresh();
    },

    /**
     * Update config
     */
    config() {
      dataStore.set('config', user.config);
      Log.config = user.config;
      Log.options.update.localStorage();
    },

    /**
     * Update palette
     */
    palette() {
      dataStore.set('palette', user.palette);
      Log.palette = user.palette;
      Log.options.update.localStorage();
    },

    /**
     * Update project palette
     */
    projectPalette() {
      dataStore.set('projectPalette', user.projectPalette);
      Log.projectPalette = user.projectPalette;
      Log.options.update.localStorage();
    },

    /**
     * Update log
     */
    log() {
      dataStore.set('log', user.log);
      Log.log = Log.data.parse(user.log);
      Log.options.update.localStorage();
    },

    /**
     * Update all
     */
    all() {
      Log.options.update.config();
      Log.options.update.palette();
      Log.options.update.projectPalette();
      Log.options.update.log();
      Log.options.update.localStorage();
    },
  },

  /**
   * Set background colour
   * @param {string} c - Colour
   */
  setBG(c) {
    if (typeof c !== 'string' || c.length === 0) return;
    user.config.ui.bg = c;
    ui.style.backgroundColor = c;
    Log.options.update.config();
  },

  /**
   * Set text colour
   * @param {string} c - Colour
   */
  setColour(c) {
    if (typeof c !== 'string' || c.length === 0) return;
    user.config.ui.colour = c;
    ui.style.color = c;
    Log.options.update.config();
  },

  /**
   * Set accent colour
   * @param {string} c - Colour
   */
  setAccent(c) {
    if (typeof c !== 'string' || c.length === 0) return;
    user.config.ui.accent = c;
    Log.options.update.config();
  },

  /**
   * Set colour mode
   * @param {string} m - Mode
   */
  setColourMode(m) {
    if (m === undefined) return;
    if (typeof m !== 'string' || m.length === 0) return;
    if (['sector', 'project', 'none'].indexOf(m) === -1) return;
    user.config.ui.colourMode = m;
    Log.options.update.config();
  },

  /**
   * Set sector colour code
   * @param {number} m - Sector (0) or project (1)
   * @param {string} s - Sector or project
   * @param {string} c - Colour
   */
  setColourCode(m, s, c) {
    if (m === undefined || s === undefined || c === undefined) return;
    if (typeof m !== 'number' || m < 0 || m > 1) return;
    if (typeof s !== 'string' || s.length === 0) return;
    if (typeof c !== 'string' || c.length === 0) return;

    if (m === 0) {
      user.palette[s] = c;
      Log.options.update.palette();
    } else {
      user.projectPalette[p] = c;
      Log.options.update.projectPalette();
    }
  },

  /**
   * Set overview (days to show)
   * @param {number} n - Number of days
   */
  setView(n) {
    if (n === undefined) return;
    if (typeof n !== 'number' || n < 0) return;
    user.config.ui.view = n;
    Log.options.update.config();
  },

  /**
   * Set calendrical system
   * @param {string} c - Calendrical system
   */
  setCalendar(c) {
    if (c === undefined) return;
    if (typeof c !== 'string' || c.length === 0) return;
    if (['aequirys', 'monocal', 'gregorian'].indexOf(c) === -1) return;
    user.config.system.calendar = c;
    Log.options.update.config();
  },

  /**
   * Set time format
   * @param {string} f - Format
   */
  setTimeFormat(f) {
    if (f === undefined) return;
    if (typeof f !== 'string' || f.length === 0) return;
    if (['24', '12', 'decimal'].indexOf(f) === -1) return;
    user.config.system.timeFormat = f;
    Log.options.update.config();
  },

  setStat(f) {
    if (f === undefined) return;
    if (typeof f !== 'string' || f.length === 0) return;
    if (['decimal', 'human'].indexOf(f) === -1) return;
    user.config.ui.stat = f;
    Log.options.update.config();
  }
};
