'use strict';

/**
 * Calculate average
 * @param {Array=} v - Values
 * @return {number} Average
 */
function avg (v = []) {
  const l = v.length;
  return l === 0 ? 0 : sum(v) / l;
}

/**
 * Calculate maximum value
 * @param {Array=} v - Values
 * @return {number} Maximum
 */
function max (v = []) {
  return v.length === 0 ? 0 : Math.max(...v);
}

/**
 * Calculate minimum value
 * @param {Array=} v - Values
 * @return {number} Minimum
 */
function min (v = []) {
  return v.length === 0 ? 0 : Math.min(...v);
}

/**
 * Add leading zeroes
 * @return {string}
 */
Number.prototype.pad = function () {
  return `0${this}`.substr(-2);
}

/**
 * Parse logs
 * @param {Array=} logs
 * @return {LogSet}
 */
function parse (logs = Log.entries) {
  const l = logs.length;
  if (l === 0) return new LogSet(logs);
  const parsed = [];

  function diffDay (s, e) {
    return s.toDate() !== e.toDate();
  }

  for (let i = 0; i < l; i++) {
    const {s, e, c, t, d} = logs[i];
    const a = toEpoch(s);
    const b = e === undefined ? undefined : toEpoch(e);

    if (e !== undefined && diffDay(a, b)) {
      const x = new Date(a);
      const y = new Date(b);

      x.setHours(23, 59, 59);
      y.setHours(0, 0, 0);

      parsed[parsed.length] = new Entry({
        id: i, s: a, e: x, c, t, d
      });

      parsed[parsed.length] = new Entry({
        id: i, s: y, e: b, c, t, d
      });

      continue;
    }

    parsed[parsed.length] = new Entry({
      id: i, s: a, e: b, c, t, d
    });
  }

  return new LogSet(parsed);
}

/**
 * Calculate range
 * @param {Array=} v - Values
 * @return {number} Range
 */
function range (v = []) {
  return v.length === 0 ? 0 : max(v) - min(v);
}

/**
 * Calculate standard deviation
 * @param {Array=} v - Values
 * @return {number} Standard deviation
 */
function sd (v = []) {
  const x = avg(v);
  const l = v.length;
  if (l === 0) return 0;
  let y = 0;

  for (let i = 0; i < l; i++) {
    y += (v[i] - x) ** 2;
  }

  return Math.sqrt(y / (l - 1));
}

/**
 * Display as stat
 * @param {number=} format - Stat format
 * @return {string} Stat
 */
Number.prototype.toStat = function (format = Log.config.st) {
  switch (format) {
    case 0:
      return this.toFixed(2);
    case 1:
      const min = this % 1;
      const tail = +(min * 60).toFixed(0);
      return `${this - min}:${tail.pad()}`;
    default:
      return this;
  }
}

/**
 * Calculate sum
 * @param {Array=} v - Values
 * @return {number} Sum
 */
function sum (v = []) {
  return v.reduce((t, n) => t + n, 0);
}

/**
 * Calculate trend
 * @param {number} a
 * @param {number} b
 * @return {number} Trend
 */
function trend (a, b) {
  const t = (a - b) / b * 100;
  return `${t < 0 ? '' : '+'}${t.toFixed(2)}%`;
}

/**
 * Calculate z-score
 */
function zScore (value, mean, sd) {
  return (value - mean) / sd;
}
