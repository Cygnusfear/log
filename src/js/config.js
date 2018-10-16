'use strict';

const calendars = ['aequirys', 'desamber', 'monocal', 'gregorian'];
const secpro = ['sector', 'sec', 'project', 'pro'];
const timeformats = ['24', '12', 'decimal'];
const statformats = ['decimal', 'human'];

class Config {

  /**
   * Construct config
   * @param {Object} attr
   * @param {string} attr.bg - Background colour
   * @param {string} attr.fg - Foreground colour
   * @param {string} attr.ac - Accent colour
   * @param {string} attr.cm - Colour mode
   * @param {number} attr.vw - View
   * @param {number} attr.st - Stat format
   * @param {number} attr.ca - Calendar
   * @param {number} attr.tm - Time format
   */
  constructor (attr) {
    this.bg = attr.bg;
    this.fg = attr.fg;
    this.ac = attr.ac;
    this.cm = attr.cm;
    this.vw = attr.vw;
    this.st = attr.st;
    this.ca = attr.ca;
    this.tm = attr.tm;
  }

  /**
   * Set accent
   * @param {string} a - Accent
   */
  setAccent (a) {
    if (a === undefined) return;
    this.ac = a;
    Update.config();
  }

  /**
   * Set background colour
   * @param {string} c
   */
  setBackgroundColour (c) {
    if (c === undefined) return;
    this.bg = c;
    Update.config();
  }

  /**
   * Set calendar system
   * @param {string} cal
   */
  setCalendar (c) {
    if (c === undefined) return;
    if (calendars.indexOf(c) < 0) return;
    c_display = {};

    let n = 0;
    switch (c) {
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

    this.ca = n;
    Update.config();
  }

  /**
   * Set colour mode
   * @param {string} m - Sector, project, or none
   */
  setColourMode (m) {
    if (
      m === undefined ||
      (secpro.indexOf(m) < 0 && m !== 'none')
    ) return;

    switch (m) {
      case 'sector':  case 'sec': m = 'sc'; break;
      case 'project': case 'pro': m = 'pc'; break;
      default: break;
    }

    this.cm = m;
    Update.config();
  }

  /**
   * Set foreground colour (text colour)
   * @param {string} c
   */
  setForegroundColour (c) {
    if (c === undefined) return;
    this.fg = c;
    Update.config();
  }

  /**
   * Set stat display format
   * @param {string} f - Decimal or human
   */
  setStatFormat (f) {
    if (
      f === undefined ||
      statformats.indexOf(f) < 0
    ) return;
    this.st = +!(f === 'decimal');
    Update.config();
  }

  /**
   * Set time system
   * @param {string} f - 24, 12, or decimal
   */
  setTimeFormat (f) {
    if (
      f === undefined ||
      timeformats.indexOf(f) < 0
    ) return;

    let n = 0;
    switch (f) {
      case '24':      n = 1; break;
      case 'decimal': n = 2; break;
      default: break;
    }

    this.tm = n;
    Update.config();
  }

  /**
   * Set view
   * @param {number} n - Number of days
   */
  setView (n) {
    if (n === undefined || n < 0) return;
    this.vw = n;
    Update.config();
  }
}

module.exports = Config;
