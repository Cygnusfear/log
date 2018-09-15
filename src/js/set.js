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
   * @param {Object} [ui] - UI preferences
   * @param {string} [ui.colour] - Default colour
   * @param {string} [ui.colourMode] - Colour mode
   * @return {Object[]} Data
   */
  bar ({colour, colourMode} = Log.config.ui) {
    const sort = this.sortEntries();
    const l = sort.length;
    if (l === 0) return;
    let set = [];

    if (colourMode === 'none') {
      const b = '0';
      const c = colour;

      for (let i = l - 1; i >= 0; i--) {
        const h = `${new Set(sort[i]).coverage().toFixed(2)}%`;
        set[i] = [];
        set[i][set[i].length] = {b, c, h};
      }

      return set;
    }

    for (let i = l - 1; i >= 0; i--) {
      set[i] = [];

      for (let o = 0, ol = sort[i].length, lh = 0; o < ol; o++) {
        const x = sort[i][o].width;
        const c = sort[i][o][colourMode] || colour;
        const b = `${lh}%`;
        const h = `${x}%`;

        set[i][set[i].length] = {b, c, h};
        lh += x;
      }
    }

    return set;
  }

  /**
   * Get entries by date
   * @param {Date} [date]
   * @return {Object[]} Entries
   */
  byDate (date = new Date) {
    const l = this.count;
    if (l === 0) return;
    if (+date > +new Date) return;

    let ent = [];
    const match = a =>
      a.getFullYear() === date.getFullYear() &&
      a.getMonth() === date.getMonth() &&
      a.getDate() === date.getDate();

    for (let i = 0; i < l; i++) {
      const {s, e} = this.entries[i];
      if (e === undefined) continue;
      match(s) && (ent[ent.length] = this.entries[i]);
    }

    return ent;
  }

  /**
   * Get entries by day
   * @param {number} day - Day of the week
   * @return {Object[]} Entries
   */
  byDay (day) {
    if (day < 0 || day > 6) return;
    if (this.count === 0) return;
    return this.entries.filter(({s, e}) => {
      return e !== undefined && s.getDay() === day;
    });
  }

  /**
   * Get entries by period
   * @param {Date} start - Start date
   * @param {Date} [end] - End date
   * @return {Object[]} Entries
   */
  byPeriod (start, end = new Date) {
    if (start === undefined) return;
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
   * @param {Object[]} - List of projects
   * @return {Object[]} Entries
   */
  byProject (p, list = Log.cache.pro) {
    if (p === undefined) return;
    if (this.count === 0) return;
    if (!~list.indexOf(p)) return;
    return this.entries.filter(({e, t}) => {
      return e !== undefined && t === p;
    });
  }

  /**
   * Get entries by sector
   * @param {string} s - Sector
   * @param {Object[]} - List of sectors
   * @return {Object[]} Entries
   */
  bySector (s, list = Log.cache.sec) {
    if (s === undefined) return;
    if (this.count === 0) return;
    if (!~list.indexOf(s)) return;
    return this.entries.filter(({e, c}) => {
      return e !== undefined && c === s;
    });
  }

  /**
   * Calculate coverage
   * @return {number} Coverage
   */
  coverage () {
    const l = this.count;
    if (l === 0) return 0;

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
    return l === 0 ? 0 :
      se.reduce((s, c) => {
        return s + new Set(c).lh;
      }, 0) / l;
  }

  /**
   * List durations
   * @return {Object[]} List
   */
  listDurations () {
    if (this.entries === undefined) return [];
    const l = this.count;
    if (l === 0) return;

    const n = this.last.e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      list[list.length] = this.entries[i].dur;
    }

    return list;
  }

  /**
   * List focus
   * @param {number} mode - Sector (0) or project (1)
   * @return {Object[]} List
   */
  listFocus (mode) {
    const sort = this.sortEntries();
    if (sort === undefined) return;
    const sl = sort.length;
    if (mode === undefined) return;
    if (mode < 0 || mode > 1) return;
    if (sl === 0) return;

    const l = [];

    for (let i = 0; i < sl; i++) {
      if (sort[i].length === 0) {
        l[l.length] = 0;
        continue;
      }

      const subset = new Set(sort[i]);
      const sublist = mode === 0 ?
        subset.sectors : subset.projects;

      l[l.length] = 1 / sublist.length;
    }

    return l;
  }

  /**
   * List projects
   * @return {Object[]} List
   */
  listProjects () {
    if (this.entries === undefined) return [];
    const l = this.count;
    if (l === 0) return;

    const n = this.last.e === undefined ? 2 : 1;
    let list = [];

    for (let i = l - n; i >= 0; i--) {
      const {t} = this.entries[i];
      if (!~list.indexOf(t)) {
        list[list.length] = t;
      }
    }

    return list;
  }

  /**
   * List sectors
   * @return {Object[]} List
   */
  listSectors () {
    if (this.entries === undefined) return [];
    const l = this.count;
    if (l === 0) return;

    const n = this.last.e === undefined ? 2 : 1;
    let list = [];

    for (let i = l - n; i >= 0; i--) {
      const {c} = this.entries[i];
      if (!~list.indexOf(c)) {
        list[list.length] = c;
      }
    }

    return list;
  }

  /**
   * Calculate logged hours
   * @return {number} Logged hours
   */
  logHours () {
    if (this.entries === undefined) return 0;
    return this.count === 0 ?
      0 : Log.data.sum(this.durations);
  }

  /**
   * Get peak day
   * @return {string} Peak day
   */
  peakDay () {
    const p = this.peakDays;
    return p.length === 0 ?
      '-' : Log.days[p.indexOf(Math.max(...p))];
  }

  /**
   * Calculate peak days
   * @return {Object[]} Peaks
   */
  peakDays () {
    const l = this.count;
    if (l === 0) return;

    const n = this.last.e === undefined ? 2 : 1;
    const days = [0, 0, 0, 0, 0, 0, 0];

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
    const p = this.peakHours;
    return p.length === 0 ?
      '-' : `${p.indexOf(Math.max(...p))}:00`;
  }

  /**
   * Calculate peak hours
   * @return {Object[]} Peaks
   */
  peakHours () {
    const l = this.count;
    if (l === 0) return;

    const hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      const {s, e, dur} = this.entries[i];
      if (e === undefined) continue;
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
    if (p === undefined) return 0;
    const l = p.length;
    return l === 0 ? 0 : 1 / l;
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
    if (l === 0) return;
    let sort = [[],[],[],[],[],[],[]];

    for (let i = l - 1; i >= 0; i--) {
      const day = this.entries[i].s.getDay();
      sort[day][sort[day].length] = this.entries[i];
    }

    return sort;
  }

  /**
   * Sort entries
   * @param {Date} [end]
   * @return {Object[]} Sorted entries
   */
  sortEntries (end = new Date) {
    const el = this.count;
    if (el === 0) return;

    const dates = Log.time.listDates(this.entries[0].s, end);
    let sort = [];
    let list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      list[list.length] = Log.time.toDate(dates[i]);
      sort[sort.length] = [];
    }

    for (let i = 0; i < el; i++) {
      if (this.entries[i] === undefined) continue;
      const x = list.indexOf(Log.time.toDate(this.entries[i].s));
      if (x > -1) sort[x][sort[x].length] = this.entries[i];
    }

    return sort;
  }

  /**
   * Sort values
   * @param {number} [mode] - Sector (0) or project (1)
   * @param {number} [hp] - Hour (0) or percentage (1)
   * @return {Object} Sorted values
   */
  sortValues (mode = 0, hp = 0) {
    if (this.count === 0) return;
    if (mode < 0 || mode > 1) return;
    if (hp < 0 || hp > 1) return;

    const lhe = this.lh;
    const sort = [];
    const temp = [];
    const list = mode === 0 ?
      this.sectors : this.projects;

    let set = [];
    for (let i = list.length - 1; i >= 0; i--) {
      set = new Set(mode === 0 ?
        this.bySector(list[i]) : this.byProject(list[i])
      );

      temp[list[i]] = hp === 0 ? set.lh : set.lh / lhe * 100;
    }

    const sor = Object.keys(temp).sort((a, b) => temp[a] - temp[b]);

    for (let i = sor.length - 1; i >= 0; i--) {
      const v = temp[sor[i]];
      const n = sor[i];
      sort[sort.length] = {v, n};
    }

    return sort;
  }

  /**
   * Calculate streak
   * @return {number} Streak
   */
  streak () {
    if (this.entries === undefined) return 0;
    const sort = this.sortEntries();
    let streak = 0;

    if (sort === undefined) return 0;

    const l = sort.length;
    if (l === 0) return streak;

    for (let i = 0; i < l; i++) {
      streak = sort[i].length === 0 ?
        0 : streak + 1;
    }

    return streak;
  }

  /**
   * Generate visualisation data
   * @param {Object} [ui] - UI preferences
   * @param {string} [ui.colour] - Default colour
   * @param {string} [ui.colourMode] - Colour mode
   * @return {Object} Data
   */
  visualisation ({colour, colourMode} = Log.config.ui) {
    const sort = this.sortEntries();
    const l = sort.length;
    if (l === 0) return;
    let data = [];

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];
      for (let o = 0, ol = sort[i].length, lastPos = 0; o < ol; o++) {
        const {width, margin} = sort[i][o];
        const c = sort[i][o][colourMode] || colour;
        const m = `${margin - lastPos}%`;
        const w = `${width}%`;

        data[i][data[i].length] = {c, m, w};
        lastPos = width + margin;
      }
    }

    return data;
  }
}
