class Set {

  constructor(entries) {
    this.entries = entries;
  }

  get durations () {
    return this.listDurations();
  }

  get lh () {
    return this.logHours();
  }

  get sectors () {
    return this.listSectors();
  }

  get projects () {
    return this.listProjects();
  }

  get streak () {
    return this.streak();
  }

  get peakHours () {
    return this.peakHours();
  }

  get peakDays () {
    return this.peakDays();
  }

  /**
   * Generate bar chart data
   * @param {Object} [ui] - UI preferences
   * @param {string} ui.colour - Default colour
   * @param {string} ui.colourMode - Colour mode
   * @return {Object[]} Data
   */
  bar ({colour, colourMode} = Log.config.ui) {
    const sort = this.sortEntries();
    const l = sort.length;
    if (l === 0) return;
    let set = [];

    if (colourMode === 'none') {
      for (let i = l - 1; i >= 0; i--) {
        set[i] = [];
        const subset = new Set(sort[i]);
        set[i][set[i].length] = {
          h: `${subset.coverage().toFixed(2)}%`,
          c: colour,
          b: '0'
        };
      }

      return set;
    }

    for (let i = l - 1; i >= 0; i--) {
      set[i] = [];

      for (let o = 0, ol = sort[i].length, lh = 0; o < ol; o++) {
        const h = sort[i][o].width;

        set[i][set[i].length] = {
          c: sort[i][o][colourMode] || colour,
          b: `${lh}%`,
          h: `${h}%`
        };

        lh += h;
      }
    }

    return set;
  }

  /**
   * Calculate coverage
   * @return {number} Coverage
   */
  coverage () {
    const l = this.entries.length;
    if (l === 0) return 0;

    const end = l === 1 ? this.entries[0].e : this.entries.slice(-1)[0].s;
    const dif = (end - this.entries[0].s) / 864E5;
    let n = dif << 0;
    n = n === dif ? n : n + 1;

    return Log.data.sum(this.listDurations()) / (24 * n) * 100;
  }

  /**
   * Calculate average log hours per day
   * @return {number} Average log hours
   */
  dailyAvg () {
    const sortedEntries = this.sortEntries();
    const l = sortedEntries.length;
    return l === 0 ? 0 :
      sortedEntries.reduce((s, c) => s + new Set(c).logHours(), 0) / l;
  }

  /**
   * Get entries by date
   * @param {Object} [date]
   * @return {Object[]} Entries
   */
  entByDate (date = new Date()) {
    const l = this.entries.length;
    if (l === 0) return;
    if (+date > +new Date) return;

    const e = [];
    const matches = a =>
      a.getFullYear() === date.getFullYear() &&
      a.getMonth() === date.getMonth() &&
      a.getDate() === date.getDate()

    for (let i = 0; i < l; i++) {
      if (this.entries[i].e === undefined) continue;
      if (matches(this.entries[i].s)) {
        e[e.length] = this.entries[i];
      }
    }

    return e;
  }

  /**
   * Get entries by day
   * @param {number} day - Day of the week
   * @return {Object[]} Entries
   */
  entByDay (day) {
    if (day === undefined) return;
    if (day < 0 || day > 6) return;
    if (this.entries.length === 0) return;

    return this.entries.filter(({s, e}) =>
      (e !== undefined && s.getDay() === day)
    );
  }

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
      entries = entries.concat(this.entByDate(current));
      current = current.addDays(1);
    }

    return entries;
  }

  /**
   * Get entries by project
   * @param {string} pro - Project
   * @return {Object[]} Entries
   */
  entByPro (pro) {
    if (pro.length === 0) return;
    if (!~Log.cache.pro.indexOf(pro)) return;
    if (this.entries.length === 0) return;

    return this.entries.filter(({e, t}) => e !== undefined && t === pro);
  }

  /**
   * Get entries by sector
   * @param {string} sec - Sector
   * @return {Object[]} Entries
   */
  entBySec (sec) {
    if (sec.length === 0) return;
    if (!~Log.cache.sec.indexOf(sec)) return;
    if (this.entries.length === 0) return;

    return this.entries.filter(({e, c}) => e !== undefined && c === sec);
  }

  /**
   * Get recent entries
   * @param {number} [n] - Number of days
   * @return {Object[]} Entries
   */
  getRecentEntries (n = 1) {
    return n < 1 ? [] : this.entByPeriod(new Date().addDays(-n));
  }

  /**
   * List durations
   * @return {Object[]} List
   */
  listDurations () {
    if (this.entries === undefined) return;
    const l = this.entries.length;
    if (l === 0) return;

    const n = this.entries.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      list[list.length] = this.entries[i].dur;
    }

    return list;
  }

  /**
   * List focus
   * @param {number} mode - Sector (0) or project (1)
   * @param {Object[]} [sort] - Sorted entries
   * @return {Object[]} List
   */
  listFocus (mode) {
    const sort = this.sortEntries();
    if (sort === undefined) return;
    const sl = sort.length;
    if (mode === undefined) return;
    if (mode < 0 || mode > 1) return;
    if (sl === 0) return;

    const f = mode === 0 ? this.listSectors : this.listProjects;
    const l = [];

    for (let i = 0; i < sl; i++) {
      if (sort[i].length === 0) {
        l[l.length] = 0;
        continue;
      }

      const subset = new Set(sort[i]);
      let sublist = mode === 0 ?
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
    const l = this.entries.length;
    if (l === 0) return;

    const n = this.entries.slice(-1)[0].e === undefined ? 2 : 1;
    const list = [];

    for (let i = l - n; i >= 0; i--) {
      if (!!~list.indexOf(this.entries[i].t)) continue;
      list[list.length] = this.entries[i].t;
    }

    return list;
  }

  /**
   * List sectors
   * @return {Object[]} List
   */
  listSectors () {
    if (this.entries === undefined) return [];
    const l = this.entries.length;
    if (l === 0) return;

    const n = this.entries.slice(-1)[0].e === undefined ? 2 : 1;
    let list = [];

    for (let i = l - n; i >= 0; i--) {
      if (!!~list.indexOf(this.entries[i].c)) continue;
      list[list.length] = this.entries[i].c;
    }

    return list;
  }

  /**
   * Calculate logged hours
   * @return {number} Logged hours
   */
  logHours () {
    if (this.entries === undefined) return 0;
    return this.entries.length === 0 ?
      0 : Log.data.sum(this.durations);
  }

  /**
   * Get peak day
   * @return {string} Peak day
   */
  peakDay () {
    const peaks = this.peakDays;
    return peaks.length === 0 ?
      '-' : Log.days[peaks.indexOf(Math.max(...peaks))];
  }

  /**
   * Calculate peak days
   * @return {Object[]} Peaks
   */
  peakDays () {
    const l = this.entries.length;
    if (l === 0) return;

    const n = this.entries.slice(-1)[0].e === undefined ? 2 : 1;
    const days = [0, 0, 0, 0, 0, 0, 0];

    for (let i = l - n; i >= 0; i--) {
      days[this.entries[i].s.getDay()] += this.entries[i].dur;
    }

    return days;
  }

  /**
   * Get peak hour
   * @return {string} Peak hour
   */
  peakHour () {
    const peaks = this.peakHours;
    return peaks.length === 0 ?
      '-' : `${peaks.indexOf(Math.max(...peaks))}:00`;
  }

  /**
   * Calculate peak hours
   * @return {Object[]} Peaks
   */
  peakHours () {
    const l = this.entries.length;
    if (l === 0) return;

    const hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      if (this.entries[i].e === undefined) continue;
      let index = this.entries[i].s.getHours();

      if (this.entries[i].dur < 1) {
        hours[index] += this.entries[i].dur;
        continue;
      }

      const rem = this.entries[i].dur % 1;
      let block = this.entries[i].dur - rem;

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
    const p = this.listProjects();
    if (p === undefined) return 0;
    return p.length === 0 ? 0 : 1 / p.length;
  }

  /**
   * Sort entries
   * @param {Object} [end]
   * @return {Object[]} Sorted entries
   */
  sortEntries (end = new Date()) {
    const el = this.entries.length;
    if (el === 0) return;

    const dates = Log.time.listDates(this.entries[0].s, end);
    const sorted = [];
    const list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      list[list.length] = Log.time.toDate(dates[i]);
      sorted[sorted.length] = [];
    }

    for (let i = 0; i < el; i++) {
      if (this.entries[i] === undefined) continue;
      const x = list.indexOf(Log.time.toDate(this.entries[i].s));
      if (x > -1) sorted[x][sorted[x].length] = this.entries[i];
    }

    return sorted;
  }

  /**
   * Sort entries by day
   * @return {Object[]} Sorted entries
   */
  sortEntriesByDay () {
    const l = this.entries.length;
    if (l === 0) return;
    let sorted = [[],[],[],[],[],[],[]];

    for (let i = l - 1; i >= 0; i--) {
      const day = this.entries[i].s.getDay();
      sorted[day][sorted[day].length] = this.entries[i];
    }

    return sorted;
  }

  /**
   * Sort values
   * @param {number} [mode] - Sector (0) or project (1)
   * @param {number} [hp] - Hour (0) or percentage (1)
   * @return {Object} Sorted values
   */
  sortValues (mode = 0, hp = 0) {
    if (this.entries.length === 0) return;
    if (mode < 0 || mode > 1) return;
    if (hp < 0 || hp > 1) return;

    const lhe = this.lh;
    const sorted = [];
    const temp = [];
    let list = [];

    if (mode === 0) {
      list = this.sectors;
    } else {
      list = this.projects;
    }

    let set = [];
    for (let i = list.length - 1; i >= 0; i--) {
      set = new Set(mode === 0 ?
        this.entBySec(list[i]) : this.entByPro(list[i])
      );

      const lh = set.lh;
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
    const entries = this.sortEntries();
    const l = entries.length;
    if (l === 0) return;
    let data = [];

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];
      for (let o = 0, ol = entries[i].length, lastPos = 0; o < ol; o++) {
        const {width, durPercent} = entries[i][o];

        data[i][data[i].length] = {
          c: entries[i][o][colourMode] || colour,
          m: `${durPercent - lastPos}%`,
          w: `${width}%`
        };

        lastPos = width + durPercent;
      }
    }

    return data;
  }
}
