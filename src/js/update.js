const Update = {

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
   * @param {boolean=} ls - Update localStorage?
   */
  config (ls = true) {
    dataStore.set('config', Log.config);
    console.log('Config updated');
    if (ls) Update.localStorage();
  },

  /**
   * Update localStorage
   */
  localStorage () {
    // localStorage.setItem('user', JSON.stringify(user));
    console.log('localStorage updated');
    Log.refresh();
  },

  /**
   * Update log
   * @param {boolean=} ls - Update localStorage?
   */
  log (ls = true) {
    if (Log.entries.length === 0) {
      console.error('Empty log');
      return;
    }

    dataStore.set('log', Log.entries);
    Log.log = Log.data.parse(Log.entries);
    console.log('Log updated');
    if (ls) Update.localStorage();
  },

  /**
   * Update sector palette
   * @param {boolean=} ls - Update localStorage?
   */
  palette (ls = true) {
    if (Log.palette === {}) {
      console.error('Empty sector palette');
      return;
    }

    dataStore.set('palette', Log.palette);
    console.log('Sector palette updated');
    if (ls) Update.localStorage();
  },

  /**
   * Update project palette
   * @param {boolean=} ls - Update localStorage?
   */
  projectPalette (ls = true) {
    if (Log.projectPalette === {}) {
      console.error('Empty project palette');
      return;
    }

    dataStore.set('projectPalette', Log.projectPalette);
    console.log('Project palette updated');
    if (ls) Update.localStorage();
  }
}
