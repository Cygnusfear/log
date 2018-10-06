'use strict';

const Aequirys = require('aequirys');
const Monocal = require('./utils/monocal.min.js');

let c_display = {};
let c_stamp = {};
let c_unix = {};

/**
 * Add days to date
 * @param {number} n - Number of days
 * @return {Object} New date
 */
Date.prototype.addDays = function (n) {
  let d = new Date(this.valueOf());
  d.setDate(d.getDate() + n);
  return d;
};

Log.time = {

  /**
   * Calculate time ago
   * @param {number} epoch
   * @return {string} Time ago
   */
  ago (epoch) {
    const m = Math.abs(~~((new Date - epoch) / 1E3 / 60));
    return m === 0     ? 'less than a minute ago' :
           m === 1     ? 'a minute ago' :
           m < 59      ? `${m} minutes ago` :

           m < 120     ? 'an hour ago' :
           m < 1440    ? `${~~(m / 60)} hours ago` :

           m < 2880    ? 'yesterday' :
           m < 86400   ? `${~~(m / 1440)} days ago` :

           m < 1051199 ? `${~~(m / 43200)} months ago` :
                         `over ${~~(m / 525960)} years ago`;
  },

  /**
   * Convert hexadecimal to decimal
   * @param {string} h
   * @return {number} Decimal
   */
  convert (h) {
    return parseInt(h, 16);
  },

  /**
   * Display date
   * @param {Date} [d]
   * @return {string} Formatted date
   */
  displayDate (d = new Date) {
    const x = new Date(d).setHours(0, 0, 0, 0);
    return x in c_display ?
      c_display[x] :
      c_display[x] = Log.time.formatDate(d);
  },

  /**
   * Calculate duration
   * @param {Date} s - Start
   * @param {Date} e - End
   * @return {number} Duration (1 = 1h)
   */
  duration (s, e) {
    return !e ? 0 : ((+e / 1E3) - (+s / 1E3)) / 3600;
  },

  /**
   * Format date
   * @param {Date} d
   * @param {number} [c] - Calendar system
   * @param {Object[]} [m] - Month names
   * @return {string} Formatted date
   */
  formatDate (d, c = Log.config.system.calendar, m = Log.months) {
    switch (c) {
      case 1:
        return Aequirys.display(Aequirys.convert(d));
      case 2:
        return Monocal.short(Monocal.convert(d));
      default:
        const yy = `${d.getFullYear()}`.substr(-2);
        const dd = `0${d.getDate()}`.substr(-2);
        const mm =  m[d.getMonth()];
        return `${dd} ${mm} ${yy}`;
    }
  },

  /**
   * Format time
   * @param {Date} d
   * @param {string} [f] - Time format preference
   * @return {string} Formatted time
   */
  formatTime (d, f = Log.config.system.timeFormat) {
    switch (f) {
      case 0:  return Log.time.to12Hours(d);
      case 1:  return Log.time.to24Hours(d);
      default: return Log.time.toDecimal(d);
    }
  },

  /**
   * List dates
   * @param {Date} s - Start
   * @param {Date} [e] - End
   * @return {Object[]} List
   */
  listDates (s, e = new Date) {
    let l = [];

    s.setHours(0, 0, 0, 0);

    for (; s <= e;) {
      l[l.length] = s;
      s = s.addDays(1);
    }

    return l;
  },

  /**
   * Calculate offset
   * @param {string} hex
   * @param {number} dur - Duration in seconds
   * @return {string} Offset in hexadecimal
   */
  offset (hex, dur) {
    return (Log.time.convert(hex) + dur).toString(16);
  },

  /**
   * Display timestamp
   * @param {Date} d
   * @return {string} Timestamp
   */
  stamp (d) {
    const x = `${d.getHours()}${d.getMinutes()}`;
    return x in c_stamp ?
      c_stamp[x] : c_stamp[x] = Log.time.formatTime(d);
  },

  /**
   * Display 12-h time
   * @param {Date} d
   * @return {string} 12-h time
   */
  to12Hours (d) {
    let h = d.getHours();
    const xm = h >= 12 ? 'PM' : 'AM';
    const hh = `0${(h %= 12) ? h : 12}`.substr(-2);
    const mm = `0${d.getMinutes()}`.substr(-2);
    return `${hh}:${mm} ${xm}`;
  },

  /**
   * Display 24-h time
   * @param {Date} d
   * @return {string} 24-h time
   */
  to24Hours (d) {
    const hh = `0${d.getHours()}`.substr(-2);
    const mm = `0${d.getMinutes()}`.substr(-2);
    return `${hh}:${mm}`;
  },

  /**
   * Convert to date ID
   * @param {Date} d
   * @return {string} YYYYMMDD
   */
  toDate (d) {
    const yy = d.getFullYear();
    const mm = d.getMonth();
    const dd = d.getDate();
    return `${yy}${mm}${dd}`;
  },

  /**
   * Convert to decimal time
   * @param {Date} d
   * @return {string} Decimal beat
   */
  toDecimal (d) {
    const b = new Date(d).setHours(0, 0, 0);
    const v = (d - b) / 8640 / 1E4;
    const t = v.toFixed(6).substr(2,6);
    return t.substr(0, 3);
  },

  /**
   * Convert to epoch time
   * @param {string} h
   * @return {number} Epoch time
   */
  toEpoch (h) {
    return h in c_unix ?
      c_unix[h] : c_unix[h] = new Date(
        Log.time.convert(h) * 1E3
      );
  },

  /**
   * Convert to hexadecimal
   * @param {Date} d
   * @return {string} Hex
   */
  toHex (d) {
    if (!d) return;
    d.setMilliseconds(0);
    return (+d / 1E3).toString(16);
  }
};
