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
   * Generate bar chart data
   * @param {Object[]} ent
   * @param {Object} [ui] - UI preferences
   * @param {string} ui.colour - Default colour
   * @param {string} ui.colourMode - Colour mode
   * @return {Object[]} Data
   */
  bar (ent, {colour, colourMode} = Log.config.ui) {
    if (ent === undefined) return;

    const l = ent.length;
    if (l === 0) return;
    let set = [];

    if (colourMode === 'none') {
      for (let i = l - 1; i >= 0; i--) {
        set[i] = [];
        set[i][set[i].length] = {
          h: `${Log.data.coverage(ent[i]).toFixed(2)}%`,
          c: colour,
          b: '0'
        };
      }

      return set;
    }

    for (let i = l - 1; i >= 0; i--) {
      set[i] = [];

      for (let o = 0, ol = ent[i].length, lh = 0; o < ol; o++) {
        const h = ent[i][o].width;

        set[i][set[i].length] = {
          c: ent[i][o][colourMode] || colour,
          b: `${lh}%`,
          h: `${h}%`
        };

        lh += h;
      }
    }

    return set;
  },

  /**
   * Calculate coverage
   * @param {Object[]} [ent] - Entries
   * @return {number} Coverage
   */
  coverage (ent = Log.log) {
    const l = ent.length;
    if (l === 0) return 0;

    const end = l === 1 ? ent[0].e : ent.slice(-1)[0].s;
    const dif = (end - ent[0].s) / 864E5;
    let n = dif << 0;
    n = n === dif ? n : n + 1;

    return Log.data.sum(Log.data.listDurations(ent)) / (24 * n) * 100;
  },

  /**
   * Calculate average log hours per day
   * @param {Object[]} [sortedEntries]
   * @return {number} Average log hours
   */
  dailyAvg (sortedEntries = Log.cache.sortEnt) {
    const l = sortedEntries.length;
    return l === 0 ? 0 :
      sortedEntries.reduce((s, c) => s + Log.data.logHours(c), 0) / l;
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
   * Get entries by date
   * @param {Object} [date]
   * @return {Object[]} Entries
   */
  entByDate (date = new Date()) {
    const l = Log.log.length;

    if (l === 0) return;
    if (+date > +new Date) return;

    const e = [];
    const matches = a =>
      a.getFullYear() === date.getFullYear() &&
      a.getMonth() === date.getMonth() &&
      a.getDate() === date.getDate()

    for (let i = 0; i < l; i++) {
      if (Log.log[i].e === undefined) continue;
      if (matches(Log.log[i].s)) {
        e[e.length] = Log.log[i];
      }
    }

    return e;
  },

  /**
   * Get entries by day
   * @param {number} day - Day of the week
   * @param {Object[]} [ent] - Entry superset
   * @return {Object[]} Entries
   */
  entByDay (day, ent = Log.log) {
    if (day === undefined) return;
    if (day < 0 || day > 6) return;
    if (ent.length === 0) return;

    return ent.filter(({s, e}) =>
      (e !== undefined && s.getDay() === day)
    );
  },

  /**
   * Get entries by period
   * @param {Object} start - Start date
   * @param {Object} [end] - End date
   * @return {Object[]} Entries
   */
  entByPeriod (start, end = new Date()) {
    if (start === undefined) return;
    if (+start > +end) return;

    let entries = [];

    for (let current = start; current <= end;) {
      entries = entries.concat(Log.data.entByDate(current));
      current = current.addDays(1);
    }

    return entries;
  },

  /**
   * Get entries by project
   * @param {string} pro - Project
   * @param {Object[]} [ent] - Entry superset
   * @return {Object[]} Entries
   */
  entByPro (pro, ent = Log.log) {
    if (pro.length === 0) return;
    if (!~Log.cache.pro.indexOf(pro)) return;
    if (ent.length === 0) return;

    return ent.filter(({e, t}) => e !== undefined && t === pro);
  },

  /**
   * Get entries by sector
   * @param {string} sec - Sector
   * @param {Object[]} [ent] - Entry superset
   * @return {Object[]} Entries
   */
  entBySec (sec, ent = Log.log) {
    if (sec.length === 0) return;
    if (!~Log.cache.sec.indexOf(sec)) return;
    if (ent.length === 0) return;

    return ent.filter(({e, c}) => e !== undefined && c === sec);
  },

  /**
   * Get recent entries
   * @param {number} [n] - Number of days
   * @return {Object[]} Entries
   */
  getRecentEntries (n = 1) {
    return n < 1 ?
      [] : Log.data.entByPeriod(new Date().addDays(-n));
  },

  /**
   * List durations
   * @param {Object[]} [ent]
   * @return {Object[]} List
   */
  listDurations (ent = Log.log) {
    const l = ent.length;
    if (l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      list[list.length] = ent[i].dur;
    }

    return list;
  },

  /**
   * List focus
   * @param {number} mode - Sector (0) or project (1)
   * @param {Object[]} [sort] - Sorted entries
   * @return {Object[]} List
   */
  listFocus (mode, sort = Log.cache.sortEnt) {
    const sl = sort.length;
    if (mode === undefined) return;
    if (mode < 0 || mode > 1) return;
    if (sl === 0) return;

    const f = mode === 0 ? Log.data.listSectors : Log.data.listProjects;
    const l = [];

    for (let i = 0; i < sl; i++) {
      if (sort[i].length === 0) {
        l[l.length] = 0;
        continue;
      }

      l[l.length] = 1 / f(sort[i]).length;
    }

    return l;
  },

  /**
   * List projects
   * @param {Object[]} [ent]
   * @return {Object[]} List
   */
  listProjects (ent = Log.log) {
    const l = ent.length;
    if (l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      if (!!~list.indexOf(ent[i].t)) continue;
      list[list.length] = ent[i].t;
    }

    return list;
  },

  /**
   * List sectors
   * @param {Object[]} [ent]
   * @return {Object[]} List
   */
  listSectors (ent = Log.log) {
    const l = ent.length;
    if (l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    let list = [];

    for (let i = l - n; i >= 0; i--) {
      if (!!~list.indexOf(ent[i].c)) continue;
      list[list.length] = ent[i].c;
    }

    return list;
  },

  /**
   * Calculate logged hours
   * @param {Object[]} [ent]
   * @return {number} Logged hours
   */
  logHours (ent = Log.log) {
    return typeof ent !== 'object' ?
      0 : ent.length === 0 ?
      0 : Log.data.sum(Log.data.listDurations(ent));
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

    return parsed;
  },

  /**
   * Get peak day
   * @param {Object[]} [peaks]
   * @return {string} Peak day
   */
  peakDay (peaks = Log.cache.pkd) {
    return peaks.length === 0 ?
      '-' : Log.days[peaks.indexOf(Math.max(...peaks))];
  },

  /**
   * Calculate peak days
   * @param {Object[]} [ent]
   * @return {Object[]} Peaks
   */
  peakDays (ent = Log.log) {
    const l = ent.length;
    if (l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const days = [0, 0, 0, 0, 0, 0, 0];

    for (let i = l - n; i >= 0; i--) {
      days[ent[i].s.getDay()] += ent[i].dur;
    }

    return days;
  },

  /**
   * Get peak hour
   * @param {Object[]} [peaks]
   * @return {string} Peak hour
   */
  peakHour (peaks = Log.cache.pkh) {
    return peaks.length === 0 ?
      '-' : `${peaks.indexOf(Math.max(...peaks))}:00`;
  },

  /**
   * Calculate peak hours
   * @param {Object[]} [ent]
   * @return {Object[]} Peaks
   */
  peakHours (ent = Log.log) {
    const l = ent.length;
    if (l === 0) return;

    const hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      if (ent[i].e === undefined) continue;
      let index = ent[i].s.getHours();

      if (ent[i].dur < 1) {
        hours[index] += ent[i].dur;
        continue;
      }

      const rem = ent[i].dur % 1;
      let block = ent[i].dur - rem;

      hours[index]++;
      block--;
      index++;

      while (block > 1) {
        hours[index]++;
        index++;
        block--;
      }

      hours[index] += rem;
    }

    return hours;
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
   * Sort entries
   * @param {Object[]} [ent]
   * @param {Object} [end]
   * @return {Object[]} Sorted entries
   */
  sortEntries (ent = Log.log, end = new Date()) {
    const el = ent.length;
    if (el === 0) return;

    const dates = Log.time.listDates(ent[0].s, end);
    const sorted = [];
    const list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      list[list.length] = Log.time.toDate(dates[i]);
      sorted[sorted.length] = [];
    }

    for (let i = 0; i < el; i++) {
      if (ent[i] === undefined) continue;
      const x = list.indexOf(Log.time.toDate(ent[i].s));
      if (x > -1) sorted[x][sorted[x].length] = ent[i];
    }

    return sorted;
  },

  /**
   * Sort entries by day
   * @param {Object[]} [ent] - Entries
   * @return {Object[]} Sorted entries
   */
  sortEntriesByDay (ent = Log.log) {
    if (ent === undefined) return;
    const l = ent.length;
    if (l === 0) return;
    let sorted = [[],[],[],[],[],[],[]];

    for (let i = l - 1; i >= 0; i--) {
      const day = ent[i].s.getDay();
      sorted[day][sorted[day].length] = ent[i];
    }

    return sorted;
  },

  /**
   * Sort values
   * @param {Object[]} ent
   * @param {number} [mode] - Sector (0) or project (1)
   * @param {number} [hp] - Hour (0) or percentage (1)
   * @return {Object} Sorted values
   */
  sortValues (ent, mode = 0, hp = 0) {
    if (ent === undefined) return;
    if (ent.length === 0) return;
    if (mode < 0 || mode > 1) return;
    if (hp < 0 || hp > 1) return;

    const lhe = Log.data.logHours(ent);
    const sorted = [];
    const temp = [];
    let list = [];
    let func;

    if (mode === 0) {
      list = ent === Log.log ?
        Log.cache.sec : Log.data.listSectors(ent);
      func = Log.data.entBySec;
    } else {
      list = ent === Log.log ?
        Log.cache.pro : Log.data.listProjects(ent);
      func = Log.data.entByPro;
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const lh = Log.data.logHours(func(list[i], ent));
      temp[list[i]] = hp === 0 ? lh : lh / lhe * 100;
    }

    const sor = Object.keys(temp).sort((a, b) => temp[a] - temp[b]);

    for (let i = sor.length - 1; i >= 0; i--) {
      sorted[sorted.length] = {
        n: sor[i],
        v: temp[sor[i]]
      };
    }

    return sorted;
  },

  /**
   * Calculate streak
   * @param {Object[]} [sortEnt]
   * @return {number} Streak
   */
  streak (sortEnt = Log.cache.sortEnt) {
    let streak = 0;

    const l = sortEnt.length;
    if (l === 0) return streak;

    for (let i = 0; i < l; i++) {
      streak = sortEnt[i].length === 0 ?
        0 : streak + 1;
    }

    return streak;
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
  },

  /**
   * Generate visualisation data
   * @param {Object[]} ent
   * @param {Object} [ui] - UI preferences
   * @param {string} [ui.colour] - Default colour
   * @param {string} [ui.colourMode] - Colour mode
   * @return {Object} Data
   */
  visualisation (ent, {colour, colourMode} = Log.config.ui) {
    if (ent === undefined) return;
    const l = ent.length;
    if (l === 0) return;
    let data = [];

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];

      for (let o = 0, ol = ent[i].length, lastPos = 0; o < ol; o++) {
        const {width, durPercent} = ent[i][o];

        data[i][data[i].length] = {
          c: ent[i][o][colourMode] || colour,
          m: `${durPercent - lastPos}%`,
          w: `${width}%`
        };

        lastPos = width + durPercent;
      }
    }

    return data;
  }
};
