'use strict';

Log.data = {

  /**
   * Calculate average value
   * @param {Object[]} set
   * @return {number} Average
   */
  avg (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : Log.data.sum(set) / set.length;
  },

  /**
   * Display stat
   * @param {number} val
   * @param {string} [stat] - Display preference
   * @return {string} Stat
   */
  displayStat (val, stat = Log.config.ui.stat) {
    if (stat === 'decimal') {
      return val.toFixed(2);
    } else if (stat === 'human') {
      const v = val.toString().split('.');
      if (v.length === 1) v[1] = '0';
      const mm = `0${(+`0.${v[1]}` * 60).toFixed(0)}`.substr(-2);
      return `${v[0]}:${mm}`;
    } else return val;
  },

  /**
   * Calculate maximum value
   * @param {Object[]} set
   * @return {number} Maximum
   */
  max (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : Math.max(...set);
  },

  /**
   * Calculate minimum value
   * @param {Object[]} set
   * @return {number} Minimum
   */
  min (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : Math.min(...set);
  },

  /**
   * Parse logs
   * @param {Object[]} [ent] - Entries
   * @param {string} [colour] - Default colour
   * @return {Object[]} Entries
   */
  parse (ent = Log.log, colour = Log.config.ui.colour) {
    const l = ent.length;
    if (l === 0) return;

    const parsed = [];
    const {toEpoch, toDate} = Log.time;
    const isSameDay = (s, e) => toDate(s) === toDate(e);

    for (let i = 0; i < l; i++) {
      const {s, e, c, t, d} = ent[i];
      const a = toEpoch(s);
      const b = e === undefined ? undefined : toEpoch(e);

      if (e !== undefined && !isSameDay(a, b)) {
        const x = new Date(a);
        const y = new Date(b);

        x.setHours(23, 59, 59);
        y.setHours( 0,  0,  0);

        parsed[parsed.length] = new Entry({id: i, s: a, e: x, c, t, d});
        parsed[parsed.length] = new Entry({id: i, s: y, e: b, c, t, d});

        continue;
      }

      parsed[parsed.length] = new Entry({id: i, s: a, e: b, c, t, d});
    }

    return new Set(parsed);
  },

  /**
   * Calculate project focus
   * @param {Object[]} [p] - List of projects
   * @return {number} Focus
   */
  projectFocus (p = Log.cache.pro) {
    return p.length === 0 ? 0 : 1 / p.length;
  },

  /**
   * Calculate sum
   * @param {Object[]} set
   * @return {number} Sum
   */
  sum (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : set.reduce((t, n) => t + n, 0);
  },

  /**
   * Calculate trend
   * @param {number} a
   * @param {number} b
   * @return {number} Trend
   */
  trend (a, b) {
    const t = (a - b) / b * 100;
    return t < 0 ? `${t.toFixed(2)}%` : `+${t.toFixed(2)}%`;
  }
};
