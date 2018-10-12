'use strict';

const Monocal = require('./utils/monocal.min.js');
const Aequirys = require('aequirys');

let c_display = {};
let c_stamp = {};
let c_unix = {};

/**
 * Add days to date
 * @param {number=} i - Increment
 * @return {Date}
 */
Date.prototype.addDays = function (i = 1) {
  const d = new Date(this.valueOf());
  d.setDate(d.getDate() + i);
  return d;
};

/**
 * Calculate time ago
 * @return {string} Time ago
 */
Date.prototype.ago = function () {
  const m = Math.abs(~~((new Date - this.valueOf()) / 1E3 / 60));
  return m === 0     ? 'less than a minute ago' :
         m === 1     ? 'a minute ago' :
         m < 59      ? `${m} minutes ago` :
         m < 120     ? 'an hour ago':
         m < 1440    ? `${~~(m / 60)} hours ago` :
         m < 2880    ? 'yesterday' :
         m < 86400   ? `${~~(m / 1440)} days ago` :
         m < 1051199 ? `${~~(m / 43200)} months ago` :
                       `over ${~~(m / 525960)} years ago`;
}

/**
 * Display date
 * @return {string} Formatted date
 */
Date.prototype.display = function () {
  const x = new Date(this).setHours(0, 0, 0, 0);
  return x in c_display ?
    c_display[x] :
    c_display[x] = this.formatDate();
}

/**
 * Format date
 * @return {string} Formatted date
 */
Date.prototype.formatDate = function () {
  switch (Log.config.system.calendar) {
    case 1: return Aequirys.display(Aequirys.convert(this));
    case 2: return Monocal.short(Monocal.convert(this));
    default:
      const y = `${this.getFullYear()}`.substr(-2);
      const d = `0${this.getDate()}`.substr(-2);
      const m =  Log.months[this.getMonth()];
      return `${d} ${m} ${y}`;
  }
}

/**
 * Format time
 * @return {string} Formatted time
 */
Date.prototype.formatTime = function () {
  switch (Log.config.system.timeFormat) {
    case 0:  return this.to12H();
    case 1:  return this.to24H();
    default: return this.toDec();
  }
}

/**
 * Display timestamp
 * @return {string} Timestamp
 */
Date.prototype.stamp = function () {
  const x = `${this.getHours()}${this.getMinutes()}`;
  return x in c_stamp ?
    c_stamp[x] : c_stamp[x] = this.formatTime();
}

/**
 * Display 12h time
 * @return {string} 12h time
 */
Date.prototype.to12H = function () {
  let h = this.getHours();
  const X = h >= 12 ? 'PM' : 'AM';
  const H = `0${(h %= 12) ? h : 12}`.substr(-2);
  const M = `0${this.getMinutes()}`.substr(-2);
  return `${H}:${M} ${X}`;
}

/**
 * Display 24h time
 * @return {string} 24h time
 */
Date.prototype.to24H = function () {
  const h = `0${this.getHours()}`.substr(-2);
  const m = `0${this.getMinutes()}`.substr(-2);
  return `${h}:${m}`;
}

/**
 * Convert to date ID
 * @return {string} YYYYMMDD
 */
Date.prototype.toDate = function () {
  const y = this.getFullYear();
  const m = this.getMonth();
  const d = this.getDate();
  return `${y}${m}${d}`;
}

/**
 * Convert to decimal time
 * @param {Date} d
 * @return {string} Decimal beat
 */
Date.prototype.toDec = function () {
  const d = new Date(this.valueOf());
  const b = new Date(d).setHours(0, 0, 0);
  const v = (d - b) / 8640 / 1E4;
  const t = v.toFixed(6).substr(2,6);
  return t.substr(0, 3);
}

/**
 * Convert to hexadecimal
 * @return {string} Hex
 */
Date.prototype.toHex = function () {
  const d = new Date(this.valueOf());
  d.setMilliseconds(0);
  return (+d / 1E3).toString(16);
}

/**
 * Convert hexadecimal to decimal
 * @param {string} h
 * @return {number} Decimal
 */
function convertHex (h) {
   return parseInt(h, 16);
}

/**
 * Calculate duration
 * @param {Date} s - Start
 * @param {Date} e - End
 * @return {number} Duration (1 = 1h)
 */
function duration (s, e) {
  return e === undefined ?
    0 : ((+e / 1E3) - (+s / 1E3)) / 3600;
}

/**
 * List dates
 * @param {Date}  start
 * @param {Date=} end
 * @return {Array} List
 */
function listDates (start, end = new Date) {
  const list = [];
  let now = new Date(start);
  now.setHours(0, 0, 0, 0);

  for (; now <= end;) {
    list[list.length] = now;
    now = now.addDays(1);
  }

  return list;
}

/**
 * Calculate offset
 * @param {string} hex
 * @param {number} dur - Duration in seconds
 * @return {string} Offset in hexadecimal
 */
function offset (hex, dur) {
  return (convertHex(hex) + dur).toString(16);
}

/**
 * Convert hex time to epoch time
 * @param {string} hex
 * @return {number} Epoch time
 */
function toEpoch (hex) {
  return hex in c_unix ?
    c_unix[hex] : c_unix[hex] = new Date(
      convertHex(hex) * 1E3
    );
}
