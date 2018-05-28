'use strict';

Date.prototype.addDays = function(n) {
  const d = new Date(this.valueOf());
  d.setDate(d.getDate() + n);
  return d;
};

const days = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

Log.data = {

  avgLogHours(e = Log.cache.sortEnt) {
    const l = e.length;
    return typeof e !== 'object' ? 0 :
      l === 0 ? 0 : e.reduce((s, c) => s + Log.data.logHours(c), 0) / l;
  },

  bar(ent) {
    if (ent === undefined) return;
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const avg = Log.calcWidth(Log.data.avgLogHours(ent));
    const cm = Log.config.ui.colourMode;
    let set = [];

    if (cm === 'none') {
      for (let i = l - 1; i >= 0; i--) {
        set[i] = [];

        set[i][set[i].length] = {
          wh: `${Log.data.coverage(ent[i]).toFixed(2)}%`,
          col: Log.config.ui.colour,
          pos: '0'
        };
      }

      return {set, avg};
    }

    const colour = cm === 'sector' ? 'sc' : cm === 'project' ? 'pc' : colour;

    for (let i = l - 1; i >= 0; i--) {
      set[i] = [];

      for (let o = 0, ol = ent[i].length, lastHeight = 0; o < ol; o++) {
        const height = Number(Log.calcWidth(ent[i][o].dur).toFixed(2));

        set[i][set[i].length] = {
          col: ent[i][o][colour] || Log.config.ui.colour,
          pos: `${lastHeight}%`,
          wh: `${height}%`
        };

        lastHeight += height;
      }
    }

    return {set, avg};
  },

  calcAvg(val) {
    return typeof val !== 'object' || val === undefined ?
      0 : val.length === 0 ? 0 : Log.data.calcSum(val) / val.length;
  },

  calcMax(val) {
    return typeof val !== 'object' || val === undefined ?
    0 : val.length === 0 ? 0 : Math.max(...val);
  },

  calcMin(val) {
    return typeof val !== 'object' || val === undefined ?
    0 : val.length === 0 ? 0 : Math.min(...val);
  },

  calcSum(val) {
    return typeof val !== 'object' || val === undefined ?
      0 : val.length === 0 ? 0 : val.reduce((t, n) => t + n, 0);
  },

  coverage(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || ent.length === 0) return 0;

    const start = Log.time.toEpoch(ent[0].s);
    const end = l === 1 ?
      Log.time.toEpoch(ent[0].e) :
      Log.time.toEpoch(ent.slice(-1)[0].s);

    const diff = (end - start) / 864E5;

    let n = diff << 0;
    n = n === diff ? n : n + 1;

    return Log.data.calcSum(Log.data.listDurations(ent)) / (24 * n) * 100;
  },

  getEntriesByDate(d = new Date()) {
    const l = Log.log.length;
    if (l === 0) return;
    if (typeof d !== 'object' || d.getTime() > new Date().getTime()) return;

    const ent = [];

    for (let i = 0; i < l; i++) {
      if (Log.log[i].e === undefined) continue;
      const a = Log.time.toEpoch(Log.log[i].s);

      if (
        a.getFullYear() === d.getFullYear() &&
        a.getMonth() === d.getMonth() &&
        a.getDate() === d.getDate()
      ) {
        ent[ent.length] = Log.log[i];
      }
    }

    return ent;
  },

  getEntriesByDay(day, ent = Log.log) {
    if (day === undefined) return;
    if (typeof day !== 'number' || day < 0 || day > 6) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof ent[0] !== 'object') return;

    return ent.filter(({s, e}) =>
      (e !== undefined && Log.time.toEpoch(s).getDay() === day)
    );
  },

  getEntriesByPeriod(start, end = new Date()) {
    if (start === undefined) return;
    if (typeof start !== 'object') return;
    if (typeof end !== 'object') return;
    if (start.getTime() > end.getTime()) return;

    let ent = [];

    for (let current = start; current <= end;) {
      ent = ent.concat(Log.data.getEntriesByDate(current));
      current = current.addDays(1);
    }

    return ent;
  },

  getEntriesByProject(pro, ent = Log.log) {
    if (pro === undefined) return;
    if (typeof pro !== 'string' || pro.length === 0) return;
    if (Log.cache.pro.indexOf(pro) === -1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    return ent.filter(({e, t}) => e !== undefined && t === pro);
  },

  getEntriesBySector(sec, ent = Log.log) {
    if (sec === undefined) return;
    if (typeof sec !== 'string' || sec.length === 0) return;
    if (Log.cache.sec.indexOf(sec) === -1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    return ent.filter(({e, c}) => e !== undefined && c === sec);
  },

  getRecentEntries(n = 1) {
    return typeof n !== 'number' || n < 1 ?
      [] : Log.data.getEntriesByPeriod(new Date().addDays(-n));
  },

  listDurations(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      list[list.length] = ent[i].dur;
    }

    return list;
  },

  listFocus(mode, sort = Log.cache.sortEnt) {
    const l = sort.length;
    if (mode === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof sort !== 'object' || l === 0) return;

    const func = mode === 0 ? Log.data.listSectors : Log.data.listProjects;
    const list = [];

    for (let i = 0; i < l; i++) {
      if (sort[i].length === 0) {
        list[list.length] = 0;
        continue;
      }

      list[list.length] = 1 / func(sort[i]).length;
    }

    return list;
  },

  listProjects(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      if (list.indexOf(ent[i].t) > -1) continue;
      list[list.length] = ent[i].t;
    }

    return list;
  },

  listSectors(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      if (list.indexOf(ent[i].c) > -1) continue;
      list[list.length] = ent[i].c;
    }

    return list;
  },

  logHours(ent = Log.log) {
    return typeof ent !== 'object' ?
      0 : ent.length === 0 ? 0 : Log.data.calcSum(Log.data.listDurations(ent));
  },

  parse(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;
    if (typeof ent[0] !== 'object') return;

    const parsed = [];

    for (let i = 0; i < l; i++) {
      const sc = user.palette[ent[i].c] || Log.config.ui.colour;
      const pc = user.projectPalette[ent[i].t] || Log.config.ui.colour;

      if (
        Log.time.toDate(ent[i].s) !== Log.time.toDate(ent[i].e) &&
        ent[i].e !== undefined
      ) {
        const a = Log.time.toEpoch(ent[i].s);
        const b = Log.time.toEpoch(ent[i].e);

        const e = Log.time.toHex(
          new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)
        );

        const s = Log.time.toHex(
          new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0)
        );

        parsed[parsed.length] = {
          e, sc, pc,
          id: i,
          s: ent[i].s,
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d,
          dur: Log.time.duration(ent[i].s, e)
        };

        parsed[parsed.length] = {
          s, sc, pc,
          id: i,
          e: ent[i].e,
          c: ent[i].c,
          t: ent[i].t,
          d: ent[i].d,
          dur: Log.time.duration(s, ent[i].e)
        };

        continue;
      }

      parsed[parsed.length] = {
        sc, pc,
        id: i,
        s: ent[i].s,
        e: ent[i].e,
        c: ent[i].c,
        t: ent[i].t,
        d: ent[i].d,
        dur: Log.time.duration(ent[i].s, ent[i].e)
      };
    }

    return parsed;
  },

  peakDay(peaks = Log.cache.pkd) {
    return peaks.length === 0 ? '-' : days[peaks.indexOf(Math.max(...peaks))];
  },

  peakDays(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const week = [0, 0, 0, 0, 0, 0, 0];

    for (let i = l - n; i >= 0; i--) {
      week[Log.time.toEpoch(ent[i].s).getDay()] += ent[i].dur;
    }

    return week;
  },

  peakHour(peaks = Log.cache.pkh) {
    return peaks.length === 0 ? '-' : `${peaks.indexOf(Math.max(...peaks))}:00`;
  },

  peakHours(ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      const e = ent[i];
      if (e.e === undefined) continue;
      let index = Log.time.toEpoch(e.s).getHours();

      if (e.dur < 1) {
        hours[index] += e.dur;
        continue;
      }

      const rem = e.dur % 1;
      let block = e.dur - rem;

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

  projectFocus(pro = Log.cache.pro) {
    return typeof pro !== 'object' || pro.length === 0 ? 0 : 1 / pro.length;
  },

  sectorPercentage(sec, ent = Log.log) {
    if (sec === undefined) return;
    if (typeof sec !== 'string' || sec.length === 0) return;
    if (typeof ent !== 'object') return;

    return ent.length === 0 ?
      0 : Log.data.logHours(Log.data.getEntriesBySector(sec, ent)) / Log.data.logHours(ent) * 100;
  },

  sortEntries(ent = Log.log, end = new Date()) {
    const el = ent.length;

    if (typeof ent !== 'object' || el === 0) return;
    if (typeof ent[0] !== 'object') return;
    if (typeof end !== 'object') return;

    const dates = Log.time.listDates(Log.time.toEpoch(ent[0].s), end);
    let sorted = [];
    let list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      const a = dates[i];
      list[list.length] = `${a.getFullYear()}${a.getMonth()}${a.getDate()}`;
      sorted[sorted.length] = [];
    }

    for (let i = 0; i < el; i++) {
      if (ent[i] === undefined) continue;
      const x = list.indexOf(Log.time.toDate(ent[i].s));
      if (x > -1) sorted[x][sorted[x].length] = ent[i];
    }

    return sorted;
  },

  sortEntriesByDay(ent = Log.log) {
    const l = ent.length;

    if (typeof ent !== 'object' || l === 0) return;

    const sorted = [[], [], [], [], [], [], []];

    for (let i = l - 1; i >= 0; i--) {
      const day = Log.time.toEpoch(ent[i].s).getDay();
      sorted[day][sorted[day].length] = ent[i];
    }

    return sorted;
  },

  sortValues(ent, mode, hp) {
    if (ent === undefined || mode === undefined || hp === undefined) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof hp !== 'number' || hp < 0 || hp > 1) return;

    let list = [];
    let func;

    if (mode === 0) {
      list = ent === Log.log ? Log.cache.sec : Log.data.listSectors(ent);
      func = Log.data.getEntriesBySector;
    } else {
      list = ent === Log.log ? Log.cache.pro : Log.data.listProjects(ent);
      func = Log.data.getEntriesByProject;
    }

    const lhe = Log.data.logHours(ent);
    const sorted = [];
    const temp = [];

    for (let i = list.length - 1; i >= 0; i--) {
      const lh = Log.data.logHours(func(list[i], ent));
      temp[list[i]] = hp === 0 ? lh : lh / lhe * 100;
    }

    const sor = Object.keys(temp).sort((a, b) => temp[a] - temp[b]).reverse();

    for (let key in sor) {
      sorted[sorted.length] = [sor[key], temp[sor[key]]];
    }

    return sorted;
  },

  streak(ent = Log.cache.sortEnt) {
    if (typeof ent !== 'object') return;
    let streak = 0;
    const l = ent.length;
    if (l === 0) return streak;
    for (let i = 0; i < l; i++) {
      streak = ent[i].length === 0 ? 0 : streak + 1;
    }
    return streak;
  },

  trend(a, b) {
    const t = (a - b) / b * 100;
    return t < 0 ? `${t.toFixed(2)}%` : `+${t.toFixed(2)}%`;
  },

  visualisation(ent) {
    if (ent === undefined) return;
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    let data = [];

    const cm = Log.config.ui.colourMode;
    const colour = cm === 'sector' ? 'sc' :
      cm === 'project' ? 'pc' : Log.config.ui.colour;

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];

      for (let o = 0, ol = ent[i].length, lastPosition = 0; o < ol; o++) {
        const width = Log.calcWidth(ent[i][o].dur);
        const dp = Log.calcDurPercent(ent[i][o].s);

        data[i][data[i].length] = {
          id: ent[i][o].id,
          col: ent[i][o][colour] || Log.config.ui.colour,
          mg: `${dp - lastPosition}%`,
          wd: `${width}%`
        };

        lastPosition = width + dp;
      }
    }

    return data;
  }
};
