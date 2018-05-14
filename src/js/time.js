const Aequirys = require('aequirys');
const Monocal = require('./utils/monocal.min.js');
const Desamber = require('./utils/desamber.js');

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const toHexCache = {};
const dateCache = {};

Log.time = {

  /**
   * Convert hexadecimal to decimal
   * @param {string} h - Hexadecimal
   * @returns {number} Decimal conversion
   */
  parse(h) {
    return parseInt(h, 16);
  },

  /**
   * Convert to hexadecimal format
   * @param {Object} t - Unix time
   */
  toHex(t) {
    if (t === undefined) return;
    if (typeof t !== 'object') return;

    // return t in toHexCache ?
    //   toHexCache[t] :
    //   toHexCache[t] = (new Date(
    //     t.getFullYear(), t.getMonth(), t.getDate(),
    //     t.getHours(), t.getMinutes(), t.getSeconds(),
    //   ).getTime() / 1E3).toString(16)
    return (new Date(
      t.getFullYear(), t.getMonth(), t.getDate(),
      t.getHours(), t.getMinutes(), t.getSeconds(),
    ).getTime() / 1E3).toString(16);
  },

  /**
   * Convert to Unix time
   * @param {string} h - Hexadecimal time
   * @returns {Object} Date
   */
  convert(h) {
    return new Date(Log.time.parse(h) * 1E3);
  },

  /**
   * Convert datetime into Log format (from Twig)
   * @param {string} d - Datetime
   * @returns {string} Datetime in Log format
   */
  convertDateTime(d) {
    d = d.split(' ');
    return (+new Date(d[0], Number(d[1] - 1), d[2], d[3], d[4], d[5]).getTime() / 1E3).toString(16);
  },

  /**
   * Convert to decimal time
   * @param {Object} d - Date object
   */
  decimal(d) {
    return parseInt((d - new Date(d).setHours(0, 0, 0, 0)) / 864 * 10);
  },

  toDecimal(sec) {
    return parseInt((sec / 864) * 100);
  },

  /**
   * Create a timestamp
   * @param {Object} d - Date
   * @returns {string} Timestamp
   */
  stamp(d) {
    switch (Log.config.system.timeFormat) {
      case '24':
        return `${`0${d.getHours()}`.substr(-2)}:${`0${d.getMinutes()}`.substr(-2)}`;
      case '12':
        return Log.time.twelveHours(d);
      default:
        const t = Log.time.decimal(d).toString();
        return `${t.substr(0, (t.length - 3))}:${t.substr(-3)}`;
    }
  },

  /**
   * Convert to 12-hour time
   * @param {Object} d - Date
   * @returns {string} 12-hour time
   */
  twelveHours(d) {
    const h = d.getHours();
    const x = h >= 12 ? 'PM' : 'AM';
    return `${`0${(h %= 12) ?
      h : 12}`.slice(-2)}:${`0${d.getMinutes()}`.slice(-2)} ${x}`;
  },

  /**
   * Convert hexadecimal timestamp into date
   * @param {string} h - Hexadecimal time
   * @returns {string} Date
   */
  date(h) {
    if (h in dateCache) {
      return dateCache[h];
    } else {
      const d = Log.time.convert(h);
      return dateCache[h] = `${d.getFullYear()}${d.getMonth()}${d.getDate()}`;
    }
  },

  /**
   * Display a date
   * @param {number} d - Date
   * @returns {string} Formatted date
   */
  displayDate(d) {
    switch (Log.config.system.calendar) {
      case 'aequirys':
        return Aequirys.display(Aequirys.convert(d));
      case 'desamber':
        return Desamber.display(Desamber.convert(d));
      case 'monocal':
        return Monocal.short(Monocal.convert(d));
      default:
        return `${`0${d.getDate()}`.slice(-2)} ${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
    }
  },

  /**
   * Calculate elapsed time
   * @param {number} t - Unix time
   * @returns {string} Elapsed time
   */
  timeago(t) {
    const m = Math.abs(~~((new Date() - t) / 1E3 / 60));
    return m === 0 ? 'less than a minute ago' :
      m === 1 ? 'a minute ago' :
      m < 59 ? `${m} minutes ago` :
      m === 60 ? 'an hour ago' :
      m < 1440 ? `${~~(m / 60)} hours ago` :
      m < 2880 ? 'yesterday' :
      m < 86400 ? `${~~(m / 1440)} days ago` :
      m < 1051199 ? `${~~(m / 43200)} months ago` :
      `over ${~~(m / 525960)} years ago`;
  },

  /**
   * List dates
   * @param {Object} s - Start date
   * @param {Object} e - End date
   * @returns {Object[]} List of dates
   */
  listDates(s, e) {
    const list = [];
    let c = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0);

    for (; c <= e;) {
      list[list.length] = new Date(c);
      c = Date.prototype.addDays.call(c, 1);
    }

    return list;
  },

  /**
   * Calculate duration
   * @param {number} s - Start hex time
   * @param {number} e - End hex time
   * @returns {number} Duration
   */
  duration(s, e) {
    return Log.time.durationSeconds(s, e) / 3600;
  },

  /**
   * Calculate duration in seconds
   * @param {number} s - Start hex time
   * @param {number} e - End hex time
   * @returns {number} Duration
   */
  durationSeconds(s, e) {
    return Log.time.parse(e) - Log.time.parse(s);
  },

  /**
   * Returns a timestamp `duration` seconds after `start`
   * @param {string} s - Hexadecimal timestamp
   * @param {number} d - Duration to offset by (seconds)
   * @returns {string} Hexadecimal timestamp
   */
  offset(s, d) {
    return (Log.time.parse(s) + d).toString(16);
  }
};
