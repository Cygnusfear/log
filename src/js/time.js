'use strict';

const Aequirys = require('aequirys');
const Monocal = require('./utils/monocal.min.js');

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const convertCache = {};
const toHexCache = {};
const dateCache = {};

Log.time = {

  convert(hex) {
    return parseInt(hex, 16);
  },

  displayDate(d) {
    switch (Log.config.system.calendar) {
      case 'aequirys':
      case 'desamber':
        return Aequirys.display(Aequirys.convert(d));
      case 'monocal':
        return Monocal.short(Monocal.convert(d));
      default:
        return `${`0${d.getDate()}`.slice(-2)} ${months[d.getMonth()]} ${d.getFullYear().toString().substr(-2)}`;
    }
  },

  duration(startHex, endHex) {
    return Log.time.durationSeconds(startHex, endHex) / 3600;
  },

  durationSeconds(startHex, endHex) {
    return Log.time.convert(endHex) - Log.time.convert(startHex);
  },

  listDates(start, end) {
    const list = [];
    let current = new Date(
      start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0
    );

    for (; current <= end;) {
      list[list.length] = new Date(current);
      current = current.addDays(1);
    }

    return list;
  },

  offset(hex, durationSeconds) {
    return (Log.time.convert(hex) + durationSeconds).toString(16);
  },

  stamp(d) {
    switch (Log.config.system.timeFormat) {
      case '24':
        return `${`0${d.getHours()}`.substr(-2)}:${`0${d.getMinutes()}`.substr(-2)}`;
      case '12':
        return Log.time.to12Hours(d);
      default:
        const t = Log.time.toDecimal(d).toString();
        return `${t.substr(0, (t.length - 3))}:${t.substr(-3)}`;
    }
  },

  timeago(epoch) {
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

  to12Hours(date) {
    const h = date.getHours();
    const x = h >= 12 ? 'PM' : 'AM';
    return `${`0${(h %= 12) ?
      h : 12}`.slice(-2)}:${`0${date.getMinutes()}`.slice(-2)} ${x}`;
  },

  toDate(hex) {
    if (hex in dateCache) {
      return dateCache[hex];
    } else {
      const d = Log.time.toEpoch(hex);
      return dateCache[hex] = `${d.getFullYear()}${d.getMonth()}${d.getDate()}`;
    }
  },

  toDecimal(date) {
    return parseInt((date - new Date(date).setHours(0, 0, 0, 0)) / 864 * 10);
  },

  toEpoch(hex) {
    return new Date(Log.time.convert(hex) * 1E3);
  },

  toHex(date) {
    if (date === undefined) return;
    if (typeof date !== 'object') return;

    return date in toHexCache ?
      toHexCache[date] :
      toHexCache[date] = (new Date(
        date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(),
      ).getTime() / 1E3).toString(16);
  },

  // Twig
  convertDateTime(d) {
    const s = d.split(' ');
    return (
      +new Date(s[0], Number(s[1] - 1), s[2], s[3], s[4], s[5]).getTime() / 1E3
    ).toString(16);
  }
};
