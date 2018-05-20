'use strict';

Log.options = {

  update: {
    all() {
      Log.options.update.config();
      Log.options.update.palette();
      Log.options.update.projectPalette();
      Log.options.update.log();
      Log.options.update.localStorage();
    },

    config() {
      dataStore.set('config', user.config);
      Log.config = user.config;
      console.log('Config updated')
      Log.options.update.localStorage();
    },

    localStorage() {
      localStorage.setItem('user', JSON.stringify(user));
      secDetailCache = {};
      proDetailCache = {};
      journalCache = {};
      console.log('localStorage updated')
      Log.refresh();
    },

    log() {
      if (user.log.length === 0) {
        console.error('User log is empty');
        return;
      }

      dataStore.set('log', user.log);
      Log.log = Log.data.parse(user.log);
      console.log('Log updated')
      Log.options.update.localStorage();
    },

    palette() {
      if (user.palette === {}) {
        console.error('Sector palette is empty');
        return;
      }

      dataStore.set('palette', user.palette);
      Log.palette = user.palette;
      console.log('Sector palette updated')
      Log.options.update.localStorage();
    },

    projectPalette() {
      if (user.projectPalette === {}) {
        console.error('Project palette is empty');
        return;
      }

      dataStore.set('projectPalette', user.projectPalette);
      Log.projectPalette = user.projectPalette;
      console.log('Project palette updated')
      Log.options.update.localStorage();
    },
  },

  setAccent(colour) {
    if (typeof colour !== 'string' || colour.length === 0) return;

    user.config.ui.accent = colour;
    Log.options.update.config();
  },

  setBackgroundColour(colour) {
    if (typeof colour !== 'string' || colour.length === 0) return;

    user.config.ui.bg = colour;
    Log.options.update.config();
  },

  setCalendar(calendar) {
    if (calendar === undefined) return;
    if (typeof calendar !== 'string' || calendar.length === 0) return;
    if (['aequirys', 'monocal', 'gregorian'].indexOf(calendar) === -1) return;

    user.config.system.calendar = calendar;
    Log.options.update.config();
  },

  setColourCode(mode, key, colour) {
    if (mode === undefined || key === undefined || colour === undefined) return;
    if (typeof mode !== 'string') return;
    if (['sector', 'sec', 'project', 'pro'].indexOf(mode) === -1)
    if (typeof key !== 'string' || key.length === 0) return;
    if (typeof colour !== 'string' || colour.length === 0) return;

    if (mode === 'sector' || mode === 'sec') {
      user.palette[key] = colour;
      Log.options.update.palette();
    } else {
      user.projectPalette[key] = colour;
      Log.options.update.projectPalette();
    }
  },

  setColourMode(mode) {
    if (mode === undefined) return;
    if (typeof mode !== 'string' || mode.length === 0) return;
    if (['sector', 'project', 'none'].indexOf(mode) === -1) return;

    user.config.ui.colourMode = mode;
    Log.options.update.config();
  },

  setForegroundColour(colour) {
    if (typeof colour !== 'string' || colour.length === 0) return;

    user.config.ui.colour = colour;
    Log.options.update.config();
  },

  setStat(format) {
    if (format === undefined) return;
    if (typeof format !== 'string' || format.length === 0) return;
    if (['decimal', 'human'].indexOf(format) === -1) return;

    user.config.ui.stat = format;
    Log.options.update.config();
  },

  setTimeFormat(format) {
    if (format === undefined) return;
    if (typeof format !== 'string' || format.length === 0) return;
    if (['24', '12', 'decimal'].indexOf(format) === -1) return;

    user.config.system.timeFormat = format;
    Log.options.update.config();
  },

  setView(days) {
    if (days === undefined) return;
    if (typeof days !== 'number' || days < 0) return;

    user.config.ui.view = days;
    Log.options.update.config();
  },
};
