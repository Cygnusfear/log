'use strict';

Log.data = {

  /**
   * Calculate average
   * @param {Object[]} [v] - Values
   * @return {number} Average
   */
  avg (v = []) {
    const l = v.length;
    return l === 0 ? 0 : Log.data.sum(v) / l;
  },

  /**
   * Calculate maximum value
   * @param {Object[]} [v] - Values
   * @return {number} Maximum
   */
  max (v = []) {
    return v.length === 0 ? 0 : Math.max(...v);
  },

  /**
   * Calculate minimum value
   * @param {Object[]} [v] - Values
   * @return {number} Minimum
   */
  min (v = []) {
    return v.length === 0 ? 0 : Math.min(...v);
  },

  /**
   * Parse logs
   * @param {Object[]} [ent] - Entries
   * @param {string} [colour] - Default colour
   * @return {Object[]} Entries
   */
  parse (ent = user.log, colour = Log.config.ui.colour) {
    const l = ent.length;
    if (l === 0) return;

    const parsed = [];
    const {toEpoch, toDate} = Log.time;
    const sameDay = (s, e) => toDate(s) === toDate(e);

    for (let i = 0; i < l; i++) {
      const {s, e, c, t, d} = ent[i];
      const a = toEpoch(s);
      const b = e === undefined ? undefined : toEpoch(e);

      if (e !== undefined && !sameDay(a, b)) {
        const x = new Date(a);
        const y = new Date(b);

        x.setHours(23, 59, 59);
        y.setHours( 0,  0,  0);

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

    return new Set(parsed);
  },

  /**
   * Display stat
   * @param {number} value
   * @param {string} [stat] - Stat format
   * @return {string} Stat
   */
  stat (value, stat = Log.config.ui.stat) {
    switch (stat) {
      case 'decimal':
        return value.toFixed(2);
      case 'human':
        const v = value.toString().split('.');
        if (v.length === 1) v[1] = '0';
        const m = `0${(+`0.${v[1]}` * 60).toFixed(0)}`.substr(-2);
        return `${v[0]}:${m}`;
      default:
        return value;
    }
  },

  /**
   * Calculate sum
   * @param {Object[]} [v] - Values
   * @return {number} Sum
   */
  sum (v = []) {
    return v.length === 0 ?
      0 : v.reduce((t, n) => t + n, 0);
  },

  /**
   * Calculate trend
   * @param {number} a
   * @param {number} b
   * @return {number} Trend
   */
  trend (a, b) {
    const t = (a - b) / b * 100;
    return `${t < 0 ? '' : '+'}${t.toFixed(2)}%`;
  }
};
