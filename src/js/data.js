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

  avgLogHours (ent = Log.cache.sortEnt) {
    const l = ent.length;
    return typeof ent !== 'object' ?
      0 : l === 0 ?
      0 : ent.reduce((s, c) => s + Log.data.logHours(c), 0) / l;
  },

  bar (ent) {
    if (ent === undefined) return;

    const l = ent.length;

    if (typeof ent !== 'object' || l === 0) return;

    const {colour, colourMode} = Log.config.ui;
    const avg = Log.calcWidth(Log.data.avgLogHours(ent));
    const cm = colourMode;
    let set = [];

    if (cm === 'none') {
      for (let i = l - 1; i >= 0; i--) {
        set[i] = [];

        set[i][set[i].length] = {
          h: `${Log.data.coverage(ent[i]).toFixed(2)}%`,
          c: colour,
          b: '0'
        };
      }

      return {set, avg};
    }

    const c = cm === 'sector' ? 'sc' : cm === 'project' ? 'pc' : colour;

    for (let i = l - 1; i >= 0; i--) {
      set[i] = [];

      for (let o = 0, ol = ent[i].length, lh = 0; o < ol; o++) {
        const {dur} = ent[i][o];
        const h = Log.calcWidth(dur);

        set[i][set[i].length] = {
          c: ent[i][o][c] || colour,
          b: `${lh}%`,
          h: `${h}%`
        };

        lh += h;
      }
    }

    return {set, avg};
  },

  calcAvg (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : Log.data.calcSum(set) / set.length;
  },

  calcMax (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : Math.max(...set);
  },

  calcMin (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : Math.min(...set);
  },

  calcSum (set) {
    return typeof set !== 'object' || set === undefined ?
      0 : set.length === 0 ? 0 : set.reduce((t, n) => t + n, 0);
  },

  coverage (ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || ent.length === 0) return 0;

    const end = l === 1 ?
      Log.time.toEpoch(ent[0].e) : Log.time.toEpoch(ent.slice(-1)[0].s);

    const diff = (end - Log.time.toEpoch(ent[0].s)) / 864E5;

    let n = diff << 0;
    n = n === diff ? n : n + 1;

    return Log.data.calcSum(Log.data.listDurations(ent)) / (24 * n) * 100;
  },

  getEntriesByDate (d = new Date()) {
    const l = Log.log.length;

    if (l === 0) return;
    if (typeof d !== 'object' || d.getTime() > new Date().getTime()) return;

    const e = [];

    for (let i = 0; i < l; i++) {
      if (Log.log[i].e === undefined) continue;
      const a = Log.time.toEpoch(Log.log[i].s);

      if (
        a.getFullYear() === d.getFullYear() &&
        a.getMonth() === d.getMonth() &&
        a.getDate() === d.getDate()
      ) {
        e[e.length] = Log.log[i];
      }
    }

    return e;
  },

  getEntriesByDay (day, ent = Log.log) {
    if (day === undefined) return;
    if (typeof day !== 'number' || day < 0 || day > 6) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof ent[0] !== 'object') return;

    return ent.filter(({s, e}) =>
      (e !== undefined && Log.time.toEpoch(s).getDay() === day)
    );
  },

  getEntriesByPeriod (start, end = new Date()) {
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

  getEntriesByProject (pro, ent = Log.log) {
    if (pro === undefined) return;
    if (typeof pro !== 'string' || pro.length === 0) return;
    if (Log.cache.pro.indexOf(pro) < 0) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    return ent.filter(({e, t}) => e !== undefined && t === pro);
  },

  getEntriesBySector (sec, ent = Log.log) {
    if (sec === undefined) return;
    if (typeof sec !== 'string' || sec.length === 0) return;
    if (Log.cache.sec.indexOf(sec) < 0) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    return ent.filter(({e, c}) => e !== undefined && c === sec);
  },

  getRecentEntries (n = 1) {
    return typeof n !== 'number' || n < 1 ?
      [] : Log.data.getEntriesByPeriod(new Date().addDays(-n));
  },

  listDurations (e = Log.log) {
    const el = e.length;

    if (typeof e !== 'object' || el === 0) return;

    const n = e.slice(-1)[0].e === undefined ? 2 : 1;
    const l = [];

    for (let i = el - n; i >= 0; i--) {
      l[l.length] = e[i].dur;
    }

    return l;
  },

  listFocus (mode, sort = Log.cache.sortEnt) {
    const sl = sort.length;
    if (mode === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof sort !== 'object' || sl === 0) return;

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

  listProjects (e = Log.log) {
    const l = e.length;

    if (typeof e !== 'object' || l === 0) return;

    const n = e.slice(-1)[0].e === undefined ? 2 : 1;
    let p = [];

    for (let i = l - n; i >= 0; i--) {
      const {t} = e[i];
      if (p.indexOf(t) > -1) continue;
      p[p.length] = t;
    }

    return p;
  },

  listSectors (e = Log.log) {
    const el = e.length;

    if (typeof e !== 'object' || el === 0) return;

    const n = e.slice(-1)[0].e === undefined ? 2 : 1;
    let l = [];

    for (let i = el - n; i >= 0; i--) {
      if (l.indexOf(e[i].c) > -1) continue;
      l[l.length] = e[i].c;
    }

    return l;
  },

  logHours (e = Log.log) {
    return typeof e !== 'object' ?
      0 : e.length === 0 ? 0 : Log.data.calcSum(Log.data.listDurations(e));
  },

  parse (ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;
    if (typeof ent[0] !== 'object') return;

    const {colour} = Log.config.ui;
    let p = [];

    for (let i = 0; i < l; i++) {
      const {s, e, c, t, d} = ent[i];
      const sc = user.palette[c] || colour;
      const pc = user.projectPalette[t] || colour;

      if (Log.time.toDate(s) !== Log.time.toDate(e) && e !== undefined) {
        const a = Log.time.toEpoch(s);
        const b = Log.time.toEpoch(e);
        const eh = Log.time.toHex(
          new Date(a.getFullYear(), a.getMonth(), a.getDate(), 23, 59, 59)
        );
        const sh = Log.time.toHex(
          new Date(b.getFullYear(), b.getMonth(), b.getDate(), 0, 0, 0)
        );

        p[p.length] = {
          s, c, t, d, sc, pc, id: i, e: eh,
          dur: Log.time.duration(s, eh)
        };

        p[p.length] = {
          e, c, t, d, sc, pc, id: i, s: sh,
          dur: Log.time.duration(sh, e)
        };

        continue;
      }

      p[p.length] = {
        s, e, c, t, d, sc, pc, id: i,
        dur: Log.time.duration(s, e)
      };
    }

    return p;
  },

  peakDay (p = Log.cache.pkd) {
    return p.length === 0 ? '-' : days[p.indexOf(Math.max(...p))];
  },

  peakDays (ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const n = ent.slice(-1)[0].e === undefined ? 2 : 1;
    const w = [0, 0, 0, 0, 0, 0, 0];

    for (let i = l - n; i >= 0; i--) {
      const {s, dur} = ent[i];
      w[Log.time.toEpoch(s).getDay()] += dur;
    }

    return w;
  },

  peakHour (p = Log.cache.pkh) {
    return p.length === 0 ? '-' : `${p.indexOf(Math.max(...p))}:00`;
  },

  peakHours (ent = Log.log) {
    const l = ent.length;
    if (typeof ent !== 'object' || l === 0) return;

    const hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      if (ent[i].e === undefined) continue;
      const {s, dur} = ent[i];
      let index = Log.time.toEpoch(s).getHours();

      if (dur < 1) {
        hours[index] += dur;
        continue;
      }

      const rem = dur % 1;
      let block = dur - rem;

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

  projectFocus (p = Log.cache.pro) {
    return typeof p !== 'object' || p.length === 0 ? 0 : 1 / p.length;
  },

  sortEntries (ent = Log.log, end = new Date()) {
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

  sortEntriesByDay (e = Log.log) {
    if (e === undefined) return;
    const l = e.length;

    if (typeof e !== 'object' || l === 0) return;
    if (typeof e[0] !== 'object') return;

    let sorted = [[], [], [], [], [], [], []];

    for (let i = l - 1; i >= 0; i--) {
      const day = Log.time.toEpoch(e[i].s).getDay();
      sorted[day][sorted[day].length] = e[i];
    }

    return sorted;
  },

  sortValues (ent, mode, hp) {
    if (ent === undefined || mode === undefined || hp === undefined) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof hp !== 'number' || hp < 0 || hp > 1) return;

    const lhe = Log.data.logHours(ent);
    let sorted = [];
    let temp = [];
    let list = [];
    let f;

    if (mode === 0) {
      list = ent === Log.log ? Log.cache.sec : Log.data.listSectors(ent);
      f = Log.data.getEntriesBySector;
    } else {
      list = ent === Log.log ? Log.cache.pro : Log.data.listProjects(ent);
      f = Log.data.getEntriesByProject;
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const lh = Log.data.logHours(f(list[i], ent));
      temp[list[i]] = hp === 0 ? lh : lh / lhe * 100;
    }

    const sor = Object.keys(temp).sort((a, b) => temp[a] - temp[b]).reverse();

    for (let key in sor) {
      sorted[sorted.length] = [sor[key], temp[sor[key]]];
    }

    return sorted;
  },

  streak (e = Log.cache.sortEnt) {
    if (typeof e !== 'object') return;
    let streak = 0;
    const l = e.length;
    if (l === 0) return streak;
    for (let i = 0; i < l; i++) {
      streak = e[i].length === 0 ? 0 : streak + 1;
    }
    return streak;
  },

  trend (a, b) {
    const t = (a - b) / b * 100;
    return t < 0 ? `${t.toFixed(2)}%` : `+${t.toFixed(2)}%`;
  },

  visualisation (ent) {
    if (ent === undefined) return;

    const l = ent.length;

    if (typeof ent !== 'object' || l === 0) return;

    let data = [];
    const {colour, colourMode} = Log.config.ui;
    const col = colourMode === 'sector' ? 'sc' :
      colourMode === 'project' ? 'pc' : colour;

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];

      for (let o = 0, ol = ent[i].length, lastPos = 0; o < ol; o++) {
        const {dur, id, s} = ent[i][o];
        const width = Log.calcWidth(dur);
        const dp = Log.calcDurPercent(s);

        data[i][data[i].length] = {
          id,
          c: ent[i][o][col] || colour,
          m: `${dp - lastPos}%`,
          w: `${width}%`
        };

        lastPos = width + dp;
      }
    }

    return data;
  }
};
