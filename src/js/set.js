class Set {

  /**
   * Construct set
   * @param {Array=} ent
   */
  constructor(ent = []) {
    this.logs = ent;
    this.count = ent.length;
  }

  get last ()      { return this.logs.slice(-1)[0]; }
  // get durations () { return this.listDurations(); }
  get lh ()        { return this.logHours(); }
  // get sectors ()   { return this.listSectors(); }
  // get projects ()  { return this.listProjects(); }

  /**
   * Generate bar chart data
   * @param {Object=} config
   * @param {string=} config.cm - Colour mode
   * @param {string=} config.fg - Foreground colour
   * @return {Array} Data
   */
  bar ({cm, fg} = Log.config) {
    const sorted = this.sortEntries();
    const l = sorted.length;
    let data = [];
    if (l === 0) return data;

    if (cm === 'none') {
      const c = fg;

      for (let i = l - 1; i >= 0; i--) {
        const h = `${new Set(sorted[i]).coverage()}%`;
        data[i] = [{c, h}];
      }

      return data;
    }

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];

      for (let o = 0, ol = sorted[i].length, lh = 0; o < ol; o++) {
        const x = sorted[i][o].wh;
        const c = sorted[i][o][cm] || fg;
        const b = `${lh}%`;
        const h = `${x}%`;

        data[i][o] = {c, b, h};
        lh += x;
      }
    }

    return data;
  }

  /**
   * Get logs by date
   * @param {Date=} d
   * @return {Array} Entries
   */
  byDate (d = new Date) {
    const l = this.count;
    const logs = [];

    if (l === 0 || +d > +new Date) return logs;

    const match = a =>
      a.getFullYear() === d.getFullYear() &&
      a.getMonth() === d.getMonth() &&
      a.getDate() === d.getDate();

    for (let i = 0; i < l; i++) {
      const {start, end} = this.logs[i];
      if (end === undefined) continue;
      if (match(start)) {
        logs[logs.length] = this.logs[i];
      }
    }

    return logs;
  }

  /**
   * Get logs by day
   * @param {number} d - Day of the week
   * @return {Array} Entries
   */
  byDay (d) {
    if (d < 0 || d > 6 || this.count === 0) return [];
    return this.logs.filter(({start, end}) =>
      end !== undefined && start.getDay() === d
    );
  }

  /**
   * Get logs by period
   * @param {Date}  start
   * @param {Date=} end
   * @return {Array} Entries
   */
  byPeriod (start, end = new Date) {
    let logs = [];
    if (start === undefined) return logs;
    if (start > end) return logs;

    for (let now = start; now <= end;) {
      logs = logs.concat(this.byDate(now));
      now = now.addDays(1);
    }

    return logs;
  }

  /**
   * Get logs by project
   * @param {string} term - Project
   * @param {Array=} list - Projects
   * @return {Array} Entries
   */
  byProject (term, list = Log.cache.pro) {
    if (term === undefined || this.count === 0) return [];
    if (list.indexOf(term) < 0) return [];
    return this.logs.filter(({end, project}) =>
      end !== undefined && project === term
    );
  }

  /**
   * Get logs by sector
   * @param {string} term - Sector
   * @param {Array=} list - Sectors
   * @return {Array} Entries
   */
  bySector (term, list = Log.cache.sec) {
    if (term === undefined || this.count === 0) return [];
    if (list.indexOf(term) < 0) return [];
    return this.logs.filter(({end, sector}) =>
      end !== undefined && sector === term
    );
  }

  /**
   * Calculate coverage
   * @return {number} Coverage
   */
  coverage () {
    const l = this.count;
    if (l === 0) return 0;

    const {e, s} = this.logs[0];
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
    const sorted = this.sortEntries();
    const l = sorted.length;
    return l === 0 ? 0 : sorted.reduce((s, c) => {
      return s + new Set(c).lh;
    }, 0) / l;
  }

  /**
   * List durations
   * @return {Array} List
   */
  listDurations () {
    const d = [];
    const l = this.count;
    if (l === 0) return d;

    const n = this.last.end === undefined ? 2 : 1;

    for (let i = l - n; i >= 0; i--) {
      d[d.length] = this.logs[i].dur;
    }

    return d;
  }

  /**
   * List focus
   * @param {number=} mode - Sector (0) or project (1)
   * @return {Array} List
   */
  listFocus (mode = 0) {
    const l = [];
    if (mode < 0 || mode > 1) return l;
    const sort = this.sortEntries();
    const sl = sort.length;
    if (sl === 0) return l;

    for (let i = 0; i < sl; i++) {
      if (sort[i].length === 0) continue;
      l[l.length] = 1 / new Set(sort[i])[
        `list${mode === 0 ? 'Sectors' : 'Projects'}`
      ]().length;
    }

    return l;
  }

  /**
   * List projects
   * @return {Array} List
   */
  listProjects () {
    const list = [];
    const l = this.count;
    if (l === 0) return list;

    let i = l - (this.last.end === undefined ? 2 : 1);

    for (; i >= 0; i--) {
      const {project} = this.logs[i];
      if (list.indexOf(project) < 0) {
        list[list.length] = project;
      }
    }

    return list;
  }

  /**
   * List sectors
   * @return {Array} List
   */
  listSectors () {
    let list = [];
    const l = this.count;
    if (l === 0) return list;

    let i = l - (this.last.end === undefined ? 2 : 1);

    for (; i >= 0; i--) {
      const {sector} = this.logs[i];
      if (list.indexOf(sector) < 0) {
        list[list.length] = sector;
      }
    }

    return list;
  }

  /**
   * Calculate logged hours
   * @return {number} Logged hours
   */
  logHours () {
    return this.count === 0 ? 0 : sum(this.listDurations());
  }

  /**
   * Get peak day
   * @return {string} Peak day
   */
  peakDay () {
    const p = this.peakDays();
    return p.length === 0 ?
      '-' : Log.days[p.indexOf(Math.max(...p))];
  }

  /**
   * Calculate peak days
   * @return {Array} Peaks
   */
  peakDays () {
    const l = this.count;
    if (l === 0) return [];

    let i = l - (this.last.end === undefined ? 2 : 1);
    const days = [0, 0, 0, 0, 0, 0, 0];

    for (; i >= 0; i--) {
      const {start, dur} = this.logs[i];
      days[start.getDay()] += dur;
    }

    return days;
  }

  /**
   * Get peak hour
   * @return {string} Peak hour
   */
  peakHour () {
    const p = this.peakHours();
    return p.length === 0 ?
      '-' : `${p.indexOf(Math.max(...p))}:00`;
  }

  /**
   * Calculate peak hours
   * @return {Array} Peaks
   */
  peakHours () {
    const l = this.count;
    if (l === 0) return [];

    const hours = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    for (let i = l - 1; i >= 0; i--) {
      const {start, end, dur} = this.logs[i];
      if (end === undefined) continue;
      let index = start.getHours();

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
    const l = this.listProjects().length;
    return l === 0 ? 0 : 1 / l;
  }

  /**
   * Get recent entries
   * @param {number} [n] - Number of days
   * @return {Array} Entries
   */
  recent (n = 1) {
    return n < 1 ? [] : this.byPeriod((new Date).addDays(-n));
  }

  /**
   * Sort entries by day
   * @return {Array} Sorted entries
   */
  sortByDay () {
    const l = this.count;
    if (l === 0) return [];
    let s = [[],[],[],[],[],[],[]];

    for (let i = l - 1; i >= 0; i--) {
      const d = this.logs[i].start.getDay();
      s[d][s[d].length] = this.logs[i];
    }

    return s;
  }

  /**
   * Sort entries
   * @param {Date=} end
   * @return {Array} Sorted entries
   */
  sortEntries (end = new Date) {
    const sort = [];
    const el = this.count;
    if (el === 0) return sort;

    const dates = listDates(this.logs[0].start, end);
    const list = [];

    for (let i = 0, l = dates.length; i < l; i++) {
      list[list.length] = dates[i].toDate();
      sort[sort.length] = [];
    }

    for (let i = 0; i < el; i++) {
      if (this.logs[i] === undefined) continue;
      const x = list.indexOf(this.logs[i].start.toDate());
      if (x > -1) sort[x][sort[x].length] = this.logs[i];
    }

    return sort;
  }

  /**
   * TODO
   * Sort values
   * @param {number=} mode - Sector (0) or project (1)
   * @param {number=} hp   - Hour (0) or percentage (1)
   * @return {Array} Sorted values
   */
  sortValues (mode = 0, hp = 0) {
    const sor = [];
    if (
      this.count === 0 ||
      mode < 0 || mode > 1 ||
      hp < 0 || hp > 1
    ) return sor;

    const lhe = this.lh;
    const tmp = [];
    let list = [];
    let func = '';
    let keys = {};

    if (mode === 0) {
      list = this.listSectors();
      func = 'bySector';
    } else {
      list = this.listProjects();
      func = 'byProject';
    }

    for (let i = list.length - 1; i >= 0; i--) {
      const lh = new Set(this[func](list[i])).lh;
      tmp[list[i]] = hp === 0 ? lh : lh / lhe * 100;
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
    const sorted = this.sortEntries();
    const l = sorted.length;
    let s = 0;
    if (l === 0) return s;

    for (let i = 0; i < l; i++) {
      s = sorted[i].length === 0 ? 0 : s + 1;
    }

    return s;
  }

  /**
   * Generate visualisation data
   * @param {Object=} config
   * @param {string=} config.cm - Colour mode
   * @param {string=} config.fg - Foreground colour
   * @return {Object} Data
   */
  visualisation ({cm, fg} = Log.config) {
    const sorted = this.sortEntries();
    const l = sorted.length;
    const data = [];
    if (l === 0) return data;

    for (let i = l - 1; i >= 0; i--) {
      data[i] = [];
      for (let o = 0, ol = sorted[i].length, pos = 0; o < ol; o++) {
        const {wh, mg} = sorted[i][o];
        const c = sorted[i][o][cm] || fg;
        const m = `${mg - pos}%`;
        const w = `${wh}%`;

        data[i][o] = {c, m, w};
        pos = wh + mg;
      }
    }

    return data;
  }
}
