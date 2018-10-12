/**
 * Log
 * A log and time-tracking utility
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

const Log = {

  path: '',
  modalMode: false,

  lexicon: {},
  clock: {},
  timerEl: {},
  days: [],
  months: [],

  config: {},
  entries: [],
  log: [],
  palette: {},
  projectPalette: {},

  cache: {
    sor: [],
    dur: [],
    pkh: [],
    pkd: [],
    pro: [],
    sec: [],
  },

  commander: {},
  commanderInput: {},
  comIndex: 0,

  /**
   * Get log status
   * @return {boolean} Status
   */
  status () {
    return Log.log.count === 0 ?
      false : !Log.log.last.end;
  },

  /**
   * Display session time
   */
  timer () {
    if (Log.status() === false) return;
    const l = +Log.log.last.start;
    let d = +new Date;
    let h = 0;
    let m = 0;
    let s = 0;

    Log.clock = setInterval(_ => {
      d += 1E3;

      s = ~~((d - l) / 1E3);
      m = ~~(s / 60);
      h = ~~(m / 60);

      h = `0${h %= 24}`.substr(-2);
      m = `0${m %= 60}`.substr(-2);
      s = `0${s %= 60}`.substr(-2);

      Log.timerEl.innerHTML = `${h}:${m}:${s}`;
    }, 1E3);
  },

  /**
   * Play sound
   * @param {string} sound
   */
  playSound (sound) {
    new Audio(`${__dirname}/media/${sound}.mp3`).play();
  },

  /**
   * Summon Edit modal
   * @param {number} id - Entry ID
   */
  edit (id) {
    editStart.value = '';
    editEnd.value = '';

    const entry = Log.entries[id];
    const s = toEpoch(entry.s);
    const sy = s.getFullYear();
    const sm = `0${s.getMonth() + 1}`.substr(-2);
    const sd = `0${s.getDate()}`.substr(-2);
    const sh = `0${s.getHours()}`.substr(-2);
    const sn = `0${s.getMinutes()}`.substr(-2);
    const ss = `0${s.getSeconds()}`.substr(-2);

    editID.innerHTML = id + 1;
    editEntryID.value = id;
    editSector.value = entry.c;
    editProject.value = entry.t;
    editDesc.value = entry.d;
    editStart.value = `${sy}-${sm}-${sd}T${sh}:${sn}:${ss}`;

    if (entry.e !== undefined && typeof entry.e === 'string') {
      const e = toEpoch(entry.e);
      const ey = e.getFullYear();
      const em = `0${e.getMonth() + 1}`.substr(-2);
      const ed = `0${e.getDate()}`.substr(-2);
      const eh = `0${e.getHours()}`.substr(-2);
      const en = `0${e.getMinutes()}`.substr(-2);
      const es = `0${e.getSeconds()}`.substr(-2);

      editEnd.value = `${ey}-${em}-${ed}T${eh}:${en}:${es}`;
    }

    Log.modalMode = true;
    document.getElementById('editModal').showModal();
  },

  /**
   * Summon Delete modal
   * @param {string} i - Command input
   */
  confirmDelete (i) {
    delList.innerHTML = '';

    const words = i.split(' ').slice(1);
    const mode = words[0];
    const key = words[1];
    let delmsg = '';

    function count (prop, key) {
      let count = 0;

      for (let i = 0; i < Log.entries.length; i++) {
        if (Log.entries[i][prop] === key) count++;
      }

      return count;
    }

    if (mode === 'project') {
      delmsg = `Are you sure you want to delete the ${words[1]} project? ${count('t', key)} entries will be deleted. This can't be undone.`;
    } else if (mode === 'sector') {
      delmsg = `Are you sure you want to delete the ${words[1]} sector? ${count('c', key)} entries will be deleted. This can't be undone.`;
    } else {
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();
      const span = ø('span', {className: 'mr3 o7'});
      const {stamp} = Log.time;

      delmsg = `Are you sure you want to delete the following ${aui.length > 1 ? `${aui.length} entries` : 'entry'}? This can't be undone.`;

      aui.forEach(i => {
        const {s, e, c, t, d} = Log.entries[+i - 1];
        const ss = toEpoch(s).stamp();
        const se = toEpoch(e).stamp();
        const li = ø('li', {className: 'f6 lhc pb3 mb3'});
        const id = Ø(span.cloneNode(), {innerHTML: i});
        const tm = Ø(span.cloneNode(), {innerHTML: `${ss} &ndash; ${se}`});
        const sc = Ø(span.cloneNode(), {innerHTML: c});
        const pr = ø('span', {className: 'o7', innerHTML: t});
        const dc = ø('p', {className: 'f4 lhc', innerHTML: d});

        li.append(id);
        li.append(tm);
        li.append(sc);
        li.append(pr);
        li.append(dc);

        delList.append(li);
      });
    }

    delConfirm.setAttribute('onclick', `Log.deleteIt('${i}')`);
    delMessage.innerHTML = delmsg;
    delModal.showModal();
  },

  /**
   * Hacky solution
   */
  deleteIt (i) {
    Log.command.deleteEntry(i);
  },

  /**
   * Update entry
   * @param {number} id - Entry ID
   */
  update (id, {s, e, c, t, d}) {
    Ø(Log.entries[id], {s, e, c, t, d});
    dataStore.set('log', Log.entries);
    editModal.close();
    Log.modalMode = false;
    Log.refresh();
  },

  /**
   * View Details
   * @param {number} mode - Sector (0) or project (1)
   * @param {string} key
   */
  viewDetails (mode, key) {
    const d = document.getElementById(!mode ? 'SSC' : 'PSC');
    d.innerHTML = '';
    d.append(Log.ui.details.detail.build(mode, key));
  },

  /**
   * Open tab
   * @param {string}   s - ID
   * @param {string=}  g - Group
   * @param {string=}  t - Tab group
   * @param {boolean=} v - Vertical?
   */
  tab (s, g = 'sect', t = 'tab', v = false) {
    const o =  v ? 'db mb3' : 'pv1';
    const n = `${o} ${t} on bg-cl o5 mr3`;
    const x =  document.getElementsByClassName(g);
    const b =  document.getElementsByClassName(t);
    const cb = document.getElementById(`b-${s}`);
    const ct = document.getElementById(s);

    Nav.index = Nav.menu.indexOf(s);

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none';
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = n;
    }

    ct.style.display = 'grid';
    cb.className = `${o} ${t} on bg-cl of mr3`;
  },

  reset () {
    clearInterval(Log.clock);
    ui.innerHTML = '';
    console.log('Reset')
  },

  /**
   * Generate session cache
   */
  generateSessionCache () {
    if (Log.entries.length === 0) return;
    Ø(Log.cache, {
      dur: Log.log.listDurations() || [],
      pro: Log.log.listProjects() || [],
      sec: Log.log.listSectors() || [],
      sor: Log.log.sortEntries() || [],
      pkh: Log.log.peakHours() || [],
      pkd: Log.log.peakDays() || []
    });
  },

  installLexicon () {
    const {days, months} = Log.lexicon;

    for (let i = 0; i < 7; i++) {
      Log.days[Log.days.length] = days[i];
    }

    for (let i = 0; i < 12; i++) {
      Log.months[Log.months.length] = months[i];
    }
  },

  load () {
    function ä (o) {
      return Ø(o, {
        backgroundColor: Log.config.bg,
        color: Log.config.fg
      });
    }

    Log.generateSessionCache();
    Log.installLexicon();

    ä(document.body.style);
    ä(ui.style);

    Log.ui.build();
    Log.ui.util.setTimeLabel();
    Log.ui.util.setDayLabel();

    if (Log.entries.length === 0) {
      Nav.index = 5;
    }

    Log.tab(Nav.menu[Nav.index]);
  },

  refresh () {
    Log.reset();
    Log.load();
  },

  init () {

    try {
      Log.config = new Config(dataStore.get('config'));
      Log.palette = dataStore.get('palette');
      Log.projectPalette = dataStore.get('projectPalette');
      Log.entries = dataStore.get('log');
      Log.log = Log.data.parse(Log.entries);
    } catch (e) {
      console.error(e);
      new window.Notification('Something went wrong.');
      return;
    }

    Log.lexicon = Dict.data;

    Log.console.installHistory();

    console.time('Log');
    Log.load();
    console.timeEnd('Log');

    document.onkeydown = e => {
      if (Log.modalMode) return;

      function focus () {
        Log.commander.style.display = 'block';
        Log.commanderInput.focus();
      }

      if (e.which >= 65 && e.which <= 90) {
        focus();
        return;
      }

      if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
        Nav.index = e.which - 49;
        Log.tab(Nav.menu[Nav.index]);
        return;
      }

      const l = Log.console.history.length;

      switch (e.which) {
        case 9: // Tab
          e.preventDefault();
          Nav.next();
          break;
        case 27: // Escape
          Log.commander.style.display = 'none';
          Log.commanderInput.value = '';
          Log.comIndex = 0;
          break;
        case 38: // Up
          focus();
          Log.comIndex++;
          if (Log.comIndex > l) Log.comIndex = l;
          Log.commanderInput.value = Log.console.history[l - Log.comIndex];
          break;
        case 40: // Down
          focus();
          Log.comIndex--;
          if (Log.comIndex < 1) Log.comIndex = 1;
          Log.commanderInput.value = Log.console.history[l - Log.comIndex];
          break;
        default:
          break;
      }
    };

    document.addEventListener('click', ({target}) => {
      if (target === entryModal) entryModal.close();
    });
  }
};
