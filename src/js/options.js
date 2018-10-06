'use strict';

const calendars = ['aequirys', 'desamber', 'monocal', 'gregorian'];
const secpro = ['sector', 'sec', 'project', 'pro'];
const statformats = ['decimal', 'human'];
const timeformats = ['24', '12', 'decimal'];

Log.options = {

  set: {
    /**
     * Set accent
     * @param {string} a - Accent
     */
    accent (a) {
      if (!a) return;
      Log.config.ui.accent = a;
      Log.options.update.config();
    },

    /**
     * Set background colour
     * @param {string} bg
     */
    bg (bg) {
      if (!bg) return;
      Log.config.ui.bg = bg;
      Log.options.update.config();
    },

    /**
     * Set calendar system
     * @param {string} cal
     */
    calendar (cal) {
      if (!cal) return;
      if (!~calendars.indexOf(cal)) return;
      c_display = {};

      let n = 0;
      switch (cal) {
        case 'aequirys':
        case 'desamber':
          n = 1;
          break;
        case 'monocal':
          n = 2;
          break;
        default:
          break;
      }

      Log.config.system.calendar = n;
      Log.options.update.config();
    },

    /**
     * Set sector/project colour code
     * @param {string} mode - Sector or project
     * @param {string} key - Name
     * @param {string} colour
     */
    colourCode (mode, key, colour) {
      if (!~secpro.indexOf(mode)) return;
      if (!key || !colour) return;

      if (mode === 'sector' || mode === 'sec') {
        Log.palette[key] = colour;
        Log.options.update.palette();
      } else {
        Log.projectPalette[key] = colour;
        Log.options.update.projectPalette();
      }
    },

    /**
     * Set colour mode
     * @param {string} m - Sector, project, or none
     */
    colourMode (m) {
      if (!m) return;
      if (!~secpro.indexOf(m) && m !== 'none') return;

      switch (m) {
        case 'sector':  case 'sec': m = 'sc'; break;
        case 'project': case 'pro': m = 'pc'; break;
        default: break;
      }

      Log.config.ui.cm = m;
      Log.options.update.config();
    },

    /**
     * Set foreground colour (text colour)
     * @param {string} colour
     */
    fg (colour) {
      if (!colour) return;
      Log.config.ui.colour = colour;
      Log.options.update.config();
    },

    /**
     * Set stat display format
     * @param {string} f - Decimal or human
     */
    stat (f) {
      if (!f) return;
      if (!~statformats.indexOf(f)) return;
      Log.config.ui.stat = +!(f === 'decimal');
      Log.options.update.config();
    },

    /**
     * Set time system
     * @param {string} f - 24, 12, or decimal
     */
    time (f) {
      if (!f) return;
      if (!~timeformats.indexOf(f)) return;

      let n = 0;
      switch (f) {
        case '24': n = 1; break;
        case 'decimal': n = 2; break;
        default: break;
      }

      Log.config.system.timeFormat = n;
      Log.options.update.config();
    },

    /**
     * Set view
     * @param {number} n - Number of days
     */
    view (n) {
      if (!n) return;
      if (n < 0) return;
      Log.config.ui.view = n;
      Log.options.update.config();
    }
  },

  update: {

    /**
     * Update everything
     */
    all () {
      this.config(!1);
      this.palette(!1);
      this.projectPalette(!1);
      this.log(!1);
      this.localStorage();
    },

    /**
     * Update config
     * @param {boolean} [ls] - Update localStorage?
     */
    config (ls = !0) {
      dataStore.set('config', Log.config);
      console.log('Config updated');
      ls && Log.options.update.localStorage();
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
     * @param {boolean} [ls] - Update localStorage?
     */
    log (ls = !0) {
      if (!Log.entries.length) {
        console.error('Empty log');
        return;
      }

      dataStore.set('log', Log.entries);
      Log.log = Log.data.parse(Log.entries);
      console.log('Log updated');
      ls && Log.options.update.localStorage();
    },

    /**
     * Update sector palette
     * @param {boolean} [ls] - Update localStorage?
     */
    palette (ls = !0) {
      if (Log.palette === {}) {
        console.error('Empty sector palette');
        return;
      }

      dataStore.set('palette', Log.palette);
      console.log('Sector palette updated');
      ls && Log.options.update.localStorage();
    },

    /**
     * Update proejct palette
     * @param {boolean} [ls] - Update localStorage?
     */
    projectPalette (ls = !0) {
      if (Log.projectPalette === {}) {
        console.error('Empty roject palette');
        return;
      }

      dataStore.set('projectPalette', Log.projectPalette);
      console.log('Project palette updated');
      ls && Log.options.update.localStorage();
    },
  },
};
