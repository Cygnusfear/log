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
  const d = new Date(this.valueOf());
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
   * @param {string} hex
   * @return {number} Decimal
   */
  convert (hex) {
    return parseInt(hex, 16);
  },

  /**
   * Display date
   * @param {Date} [date]
   * @return {string} Formatted date
   */
  displayDate (date = new Date) {
    const d = new Date(date).setHours(0, 0, 0, 0);
    return d in c_display ?
      c_display[d] :
      c_display[d] = Log.time.formatDate(date);
  },

  /**
   * Calculate duration
   * @param {Date} start
   * @param {Date} end
   * @return {number} Duration (1 = 1h)
   */
  duration (start, end) {
    if (end === undefined) return 0;
    return ((+end / 1E3) - (+start / 1E3)) / 3600;
  },

  /**
   * Format date
   * @param {Date} date
   * @param {string} [cal] - Calendar system preference
   * @param {Object[]} [months] - Month names
   * @return {string} Formatted date
   */
  formatDate (date, cal = Log.config.system.calendar, months = Log.months) {
    switch (cal) {
      case 'aequirys':
      case 'desamber':
        return Aequirys.display(Aequirys.convert(date));
      case 'monocal':
        return Monocal.short(Monocal.convert(date));
      default:
        const y = `${date.getFullYear()}`.substr(-2);
        const d = `0${date.getDate()}`.substr(-2);
        const m = months[date.getMonth()];
        return `${d} ${m} ${y}`;
    }
  },

  /**
   * Format time
   * @param {Date} date
   * @param {string} [format] - Time format preference
   * @return {string} Formatted time
   */
  formatTime (date, format = Log.config.system.timeFormat) {
    switch (format) {
      case '24': return Log.time.to24Hours(date);
      case '12': return Log.time.to12Hours(date);
      default:   return Log.time.toDecimal(date);
    }
  },

  /**
   * List dates
   * @param {Date} start
   * @param {Date} [end]
   * @return {Object[]} List
   */
  listDates (start, end = new Date) {
    let list = [];

    start.setHours(0, 0, 0);

    for (; start <= end;) {
      list[list.length] = start;
      start = start.addDays(1);
    }

    return list;
  },

  /**
   * Calculate offset
   * @param {string} hex
   * @param {number} duration - Duration in seconds
   * @return {string} Offset in hexadecimal
   */
  offset (hex, duration) {
    return (Log.time.convert(hex) + duration).toString(16);
  },

  /**
   * Display timestamp
   * @param {Date} date
   * @return {string} Timestamp
   */
  stamp (date) {
    const x = `${date.getHours()}${date.getMinutes()}`;
    return x in c_stamp ?
      c_stamp[x] :
      c_stamp[x] = Log.time.formatTime(date);
  },

  /**
   * Display 12-h time
   * @param {Date} date
   * @return {string} 12-h time
   */
  to12Hours (date) {
    let h = date.getHours();
    const xm = h >= 12 ? 'PM' : 'AM';
    const hh = `0${(h %= 12) ? h : 12}`.substr(-2);
    const mm = `0${date.getMinutes()}`.substr(-2);
    return `${hh}:${mm} ${xm}`;
  },

  /**
   * Display 24-h time
   * @param {Date} date
   * @return {string} 24-h time
   */
  to24Hours (date) {
    const hh = `0${date.getHours()}`.substr(-2);
    const mm = `0${date.getMinutes()}`.substr(-2);
    return `${hh}:${mm}`;
  },

  /**
   * Convert to date ID
   * @param {Date} date
   * @return {string} YYYYMMDD
   */
  toDate (date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();
    return `${y}${m}${d}`;
  },

  /**
   * Convert to decimal time
   * @param {Date} date
   * @return {string} Decimal beat
   */
  toDecimal (date) {
    const b = new Date(date).setHours(0, 0, 0);
    const v = (date - b) / 8640 / 1E4;
    const t = v.toFixed(6).substr(2,6);
    return t.substr(0, 3);
  },

  /**
   * Convert to epoch time
   * @param {string} hex
   * @return {number} Epoch time
   */
  toEpoch (hex) {
    return hex in c_unix ?
      c_unix[hex] :
      c_unix[hex] = new Date(Log.time.convert(hex) * 1E3);
  },

  /**
   * Convert to hexadecimal
   * @param {Date} date
   * @return {string} Hex
   */
  toHex (date) {
    if (date === undefined) return;
    date.setMilliseconds(0);
    return (+date / 1E3).toString(16);
  },

  // Twig
  convertDateTime (d) {
    const s = d.split(' ');
    return (
      +new Date(s[0], +(s[1] - 1), s[2], s[3], s[4], s[5]) / 1E3
    ).toString(16);
  }
};
