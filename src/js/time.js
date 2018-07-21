'use strict';

const Aequirys = require('aequirys');
const Monocal = require('./utils/monocal.min.js');

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

let convertCache = {};
let toHexCache = {};
let dateCache = {};
let toEpochCache = {};
let displayDateCache = {};
let timestampCache = {};
let durationCache = {};

Log.time = {

  convert (h) {
    return h in convertCache ?
      convertCache[h] : convertCache[h] = parseInt(h, 16);
  },

  formatDate (d) {
    switch (Log.config.system.calendar) {
      case 'aequirys':
      case 'desamber':
        return Aequirys.display(Aequirys.convert(d));
      case 'monocal':
        return Monocal.short(Monocal.convert(d));
      default:
        const dd = `0${d.getDate()}`.slice(-2);
        const mm = months[d.getMonth()];
        const yy = d.getFullYear().toString().substr(-2);
        return `${dd} ${mm} ${yy}`;
    }
  },

  formatTime (d) {
    switch (Log.config.system.timeFormat) {
      case '24':
        const h = `0${d.getHours()}`.substr(-2);
        const m = `0${d.getMinutes()}`.substr(-2);
        return `${h}:${m}`;
      case '12':
        return Log.time.to12Hours(d);
      default:
        return Log.time.toDecimal(d);
    }
  },

  displayDate (d) {
    const date = new Date(d).setHours(0, 0, 0, 0);
    return date in displayDateCache ?
      displayDateCache[date] :
      displayDateCache[date] = Log.time.formatDate(d);
  },

  duration (s, e) {
    const h = s + e;
    return h in durationCache ?
      durationCache[h] :
      durationCache[h] = Log.time.durationSeconds(s, e) / 3600;
  },

  durationSeconds (sh, eh) {
    return Log.time.convert(eh) - Log.time.convert(sh);
  },

  listDates (s, e) {
    let c = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0);
    let l = [];

    for (; c <= e;) {
      l[l.length] = new Date(c);
      c = c.addDays(1);
    }

    return l;
  },

  offset (hex, durationSeconds) {
    return (Log.time.convert(hex) + durationSeconds).toString(16);
  },

  stamp (d) {
    const hm = `${d.getHours()}${d.getMinutes()}`;
    return hm in timestampCache ?
      timestampCache[hm] :
      timestampCache[hm] = Log.time.formatTime(d);
  },

  timeago (epoch) {
    const m = Math.abs(~~((new Date() - epoch) / 1E3 / 60));
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

  to12Hours (d) {
    let h = d.getHours();
    const xm = h >= 12 ? 'PM' : 'AM';
    const hh = `0${(h %= 12) ? h : 12}`.slice(-2);
    const mm = `0${d.getMinutes()}`.slice(-2);
    return `${hh}:${mm} ${xm}`;
  },

  toDate (h) {
    if (h in dateCache) {
      return dateCache[h];
    } else {
      const d = Log.time.toEpoch(h);
      return dateCache[h] = `${d.getFullYear()}${d.getMonth()}${d.getDate()}`;
    }
  },

  toDecimal (d) {
    const b = new Date(
      d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0
    );
    const val = (d - b) / 8640 / 10000;
    const t = val.toFixed(6).substr(2,6);
    return `${t.substr(0, 3)}:${t.substr(-3)}`;
  },

  toEpoch (h) {
    return h in toEpochCache ?
      toEpochCache[h] :
      toEpochCache[h] = new Date(Log.time.convert(h) * 1E3);
  },

  toHex (d) {
    if (d === undefined) return;
    if (typeof d !== 'object') return;

    return d in toHexCache ?
      toHexCache[d] :
      toHexCache[d] = (new Date(
        d.getFullYear(), d.getMonth(), d.getDate(),
        d.getHours(), d.getMinutes(), d.getSeconds(),
      ).getTime() / 1E3).toString(16);
  },

  // Twig
  convertDateTime (d) {
    const s = d.split(' ');
    return (
      +new Date(s[0], Number(s[1] - 1), s[2], s[3], s[4], s[5]).getTime() / 1E3
    ).toString(16);
  }
};
