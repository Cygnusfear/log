class Set {

  constructor(entries) {
    this.entries = entries;
    this.count = entries.length;
  }

  get last ()      { return this.entries.slice(-1)[0]; }
  get durations () { return this.listDurations(); }
  get lh ()        { return this.logHours(); }
  get sectors ()   { return this.listSectors(); }
  get projects ()  { return this.listProjects(); }

  /**
   * Generate bar chart data
   * @param {string} [dc] - Default colour
   * @param {string} [cm] - Colour mode
   * @return {Object[]} Data
   */
  bar (dc = Log.config.ui.colour, cm = Log.config.ui.cm) {
    const se = this.sortEntries();
    const l = se.length;
    if (!l) return;
    let set = [];

    if (cm === 'none') {
      const c = dc;

      for (let i = l - 1; i >= 0; i--) {
        const h = `${new Set(se[i]).coverage()}%`;
        set[i] = [{c, h}];
      }

      return set;
    }

    for (let i = l - 1; i >= 0; i--) {
      set[i] = [];

      for (let o = 0, ol = se[i].length, lh = 0; o < ol; o++) {
        const x = se[i][o].wh;
        const c = se[i][o][cm] || dc;
        const b = `${lh}%`;
        const h = `${x}%`;

        set[i][o] = {c, b, h};
        lh += x;
      }
    }

    return set;
  }

  /**
   * Get entries by date
   * @param {Date} [d]
   * @return {Object[]} Entries
   */
  byDate (d = new Date) {
    const l = this.count;
    if (!l) return;
    if (+d > +new Date) return;

    let ent = [];
    const match = a =>
      a.getFullYear() === d.getFullYear() &&
      a.getMonth() === d.getMonth() &&
      a.getDate() === d.getDate();

    for (let i = 0; i < l; i++) {
      const {s, e} = this.entries[i];
      if (!e) continue;
      match(s) && (ent[ent.length] = this.entries[i]);
    }

    return ent;
  }

  /**
   * Get entries by day
   * @param {number} d - Day of the week
   * @return {Object[]} Entries
   */
  byDay (d) {
    if (d < 0 || d > 6) return;
    if (!this.count) return;
    return this.entries.filter(({s, e}) =>
      !!e && s.getDay() === d
    );
  }

  /**
   * Get entries by period
   * @param {Date} start
   * @param {Date} [end]
   * @return {Object[]} Entries
   */
  byPeriod (start, end = new Date) {
    if (!start) return;
    if (+start > +end) return;

    let ent = [];

    for (let now = start; now <= end;) {
      ent = ent.concat(this.byDate(now));
      now = now.addDays(1);
    }

    return ent;
  }

  /**
   * Get entries by project
   * @param {string} p - Project
   * @param {Object[]} [l] - List of projects
   * @return {Object[]} Entries
   */
  byProject (p, l = Log.cache.pro) {
    if (!p) return;
    if (!this.count) return;
    if (!~l.indexOf(p)) return;
    return this.entries.filter(({e, t}) =>
      !!e && t === p
    );
  }

  /**
   * Get entries by sector
   * @param {string} s - Sector
   * @param {Object[]} [l] - List of sectors
   * @return {Object[]} Entries
   */
  bySector (s, l = Log.cache.sec) {
    if (!s) return;
    if (!this.count) return;
    if (!~l.indexOf(s)) return;
    return this.entries.filter(({e, c}) =>
      !!e && c === s
    );
  }

  /**
   * Calculate coverage
   * @return {number} Coverage
   */
  coverage () {
    const l = this.count;
    if (!l) return 0;

    const {e, s} = this.entries[0];
    const end = l === 1 ? e : this.last.s;
    const dif = (end - s) / 864E5;
    let n = dif << 0;
    n = n === dif ? n : n + 1;

    return this.logHours() / (24 * n) * 100;
  }

  /**
   * Calculate average log hours per day
   * @return {number} Average log hours
   */
  dailyAvg () {
    const se = this.sortEntries();
    const l = se.length;
    return !l ? 0 : se.reduce((s, c) => {
      return s + new Set(c).lh;
    }, 0) / l;
  }

  /**
   * List durations
   * @return {Object[]} List
   */
  listDurations () {
    if (!this.entries) return [];
    const l = this.count;
    if (!l) return;

    const n = !this.last.e ? 2 : 1;
    const d = [];

    for (let i = l - n; i >= 0; i--) {
      d[d.length] = this.entries[i].dur;
    }

    return d;
  }

  /**
   * List focus
   * @param {number} [mode] - Sector (0) or project (1)
   * @return {Object[]} List
   */
  listFocus (mode = 0) {
    const sort = this.sortEntries();
    if (!sort) return;
    const sl = sort.length;
    if (mode < 0 || mode > 1) return;
    if (!sl) return;

    const l = [];

    for (let i = 0; i < sl; i++) {
      if (!sort[i].length) continue;
      l[l.length] = 1 / new Set(sort[i])[
        mode === 0 ? 'sectors' : 'projects'
      ].length;
    }

    return l;
  }

  /**
   * List projects
   * @return {Object[]} List
   */
  listProjects () {
    if (!this.entries) return [];
    const l = this.count;
    if (!l) return;

    const n = !this.last.e ? 2 : 1;
    let p = [];

    for (let i = l - n; i >= 0; i--) {
      const {t} = this.entries[i];
      if (!~p.indexOf(t)) p[p.length] = t;
    }

    return p;
  }

  /**
   * List sectors
   * @return {Object[]} List
   */
  listSectors () {
    if (!this.entries) return [];
    const l = this.count;
    if (!l) return;

    const n = !this.last.e ? 2 : 1;
    let s = [];

    for (let i = l - n; i >= 0; i--) {
      const {c} = this.entries[i];
      if (!~s.indexOf(c)) s[s.length] = c;
    }

    return s;
  }

  /**
   * Calculate logged hours
   * @return {number} Logged hours
   */
  logHours () {
    if (!this.entries) return 0;
    return !this.count ?
      0 : Log.data.sum(this.durations);
  }

  /**
   * Get peak day
   * @return {string} Peak day
   */
  peakDay () {
    const p = this.peakDays();
    return !p.length ?
      '-' : Log.days[p.indexOf(Math.max(...p))];
  }

  /**
   * Calculate peak days
   * @return {Object[]} Peaks
   */
  peakDays () {
    const l = this.count;
    if (!l) return;

    const n = !this.last.e ? 2 : 1;
    let days = [0, 0, 0, 0, 0, 0, 0];

    for (let i = l - n; i >= 0; i--) {
      const {s, dur} = this.entries[i];
      days[s.getDay()] += dur;
    }

    return days;
  }

  /**
   * Get peak hour
   * @return {string} Peak hour
   */
  peakHour () {
    const p = this.peakHours();
    return !p.length ?
      '-' : `${p.indexOf(Math.max(...p))}:00`;
  }

  /**
   * Calculate peak hours
   * @return {Object[]} Peaks
   */
  peakHours () {
    const l = this.count;
    if (!l) return;

    let hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      const {s, e, dur} = this.entries[i];
      if (!e) continue;
      let index = s.getHours();

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
  }

  /**
   * Calculate project focus
   * @return {number} Focus
   */
  projectFocus () {
    const p = this.projects;
    if (!p) return 0;
    const l = p.length;
    return !l ? 0 : 1 / l;
  }

  /**
   * Get recent entries
   * @param {number} [n] - Number of days
   * @return {Object[]} Entries
   */
  recent (n = 1) {
    return n < 1 ? [] : this.byPeriod((new Date).addDays(-n));
  }

  /**
   * Sort entries by day
   * @return {Object[]} Sorted entries
   */
  sortByDay () {
    const l = this.count;
    if (!l) return;
    let s = [[],[],[],[],[],[],[]];

    for (let i = l - 1; i >= 0; i--) {
      const d = this.entries[i].s.getDay();
      s[d][s[d].length] = this.entries[i];
    }

    return s;
  }

  /**
   * Sort entries
   * @param {Date} [end]
   * @return {Object[]} Sorted entries
   */
  sortEntries (end = new Date) {
    const el = this.count;
    if (!el) return;

    const {toDate, listDates} = Log.time;
    const dates = listDates(this.entries[0].s, end);
    let sort = [];
    let list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      list[list.length] = toDate(dates[i]);
      sort[sort.length] = [];
    }

    for (let i = 0; i < el; i++) {
      if (!this.entries[i]) continue;
      const x = list.indexOf(toDate(this.entries[i].s));
      if (x > -1) sort[x][sort[x].length] = this.entries[i];
    }

    return sort;
  }

  /**
   * TODO 
   * Sort values
   * @param {number} [mode] - Sector (0) or project (1)
   * @param {number} [hp] - Hour (0) or percentage (1)
   * @return {Object} Sorted values
   */
  sortValues (mode = 0, hp = 0) {
    if (!this.count) return;
    if (mode < 0 || mode > 1) return;
    if (hp < 0 || hp > 1) return;

    const lhe = this.lh;
    const sor = [];
    const tmp = [];
    let list = [];
    let func = '';
    let keys = {};

    if (!mode) {
      list = this.sectors;
      func = 'bySector';
    } else {
      list = this.projects;
      func = 'byProject';
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const lh = new Set(this[func](list[i])).lh;
      tmp[list[i]] = !hp ? lh : lh / lhe * 100;
    }

    keys = Object.keys(tmp).sort((a, b) => tmp[a] - tmp[b]);

    for (let i = keys.length - 1; i >= 0; i--) {
      sor[sor.length] = {v: tmp[keys[i]], n: keys[i]};
    }

    return sor;
  }

  /**
   * Calculate streak
   * @return {number} Streak
   */
  streak () {
    if (!this.entries) return 0;
    const se = this.sortEntries();
    if (!se) return 0;
    const l = se.length;
    if (!l) return 0;
    let s = 0;

    for (let i = 0; i < l; i++) {
      s = !se[i].length ? 0 : s + 1;
    }

    return s;
  }

  /**
   * Generate visualisation data
   * @param {string} [dc] - Default colour
   * @param {string} [cm] - Colour mode
   * @return {Object} Data
   */
  visualisation (dc = Log.config.ui.colour, cm = Log.config.ui.cm) {
    const se = this.sortEntries();
    const l = se.length;
    if (!l) return;
    const data = [];

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];
      for (let o = 0, ol = se[i].length, pos = 0; o < ol; o++) {
        const {wh, mg} = se[i][o];
        const c = se[i][o][cm] || dc;
        const m = `${mg - pos}%`;
        const w = `${wh}%`;

        data[i][o] = {c, m, w};
        pos = wh + mg;
      }
    }

    return data;
  }
}
