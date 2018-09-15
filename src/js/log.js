/**
 * Log
 * A log and time-tracking utility
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';
let user = {};
let Log = {

  path: '',
  modalMode: false,

  lexicon: {},
  clock: {},
  timerEl: {},
  days: [],
  months: [],

  config: {},
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
      false : Log.log.last.e === undefined;
  },

  /**
   * Keep track of session time
   */
  timer () {
    if (!Log.status()) return;
    const l = +Log.log.last.s;

    Log.clock = setInterval(_ => {
      let s = ~~((+new Date - l) / 1E3);
      let m = ~~(s / 60);
      let h = ~~(m / 60);

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

    const entry = user.log[id];
    const s = Log.time.toEpoch(entry.s);
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

    if (entry.e !== undefined) {
      const e = Log.time.toEpoch(entry.e);
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

    const count = (prop, key) => {
      let count = 0;

      user.log.forEach(e => {
        e[prop] === key && count++;
      });

      return count;
    }

    if (mode === 'project') {
      delmsg = `Are you sure you want to delete the ${words[1]} project? ${count('t', key)} entries will be deleted. This can't be undone.`;
    } else if (mode === 'sector') {
      delmsg = `Are you sure you want to delete the ${words[1]} sector? ${count('c', key)} entries will be deleted. This can't be undone.`;
    } else {
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();
      const span = ø('span', {className: 'mr3 o7'});
      const {stamp, toEpoch} = Log.time;

      delmsg = `Are you sure you want to delete the following ${aui.length > 1 ? `${aui.length} entries` : 'entry'}? This can't be undone.`;

      aui.forEach(i => {
        const {s, e, c, t, d} = user.log[+i - 1];
        const ss = stamp(toEpoch(s));
        const se = stamp(toEpoch(e));
        const li = ø('li', {className: 'f6 lhc pb3 mb3'});
        const id = ø(span.cloneNode(), {innerHTML: i});
        const tm = ø(span.cloneNode(), {innerHTML: `${ss} &ndash; ${se}`});
        const sc = ø(span.cloneNode(), {innerHTML: c});
        const pr = ø('span', {className: 'o7', innerHTML: t});
        const dc = ø('p', {className: 'f4 lhc', innerHTML: d});

        li.appendChild(id);
        li.appendChild(tm);
        li.appendChild(sc);
        li.appendChild(pr);
        li.appendChild(dc);
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
    ø(user.log[id], {s, e, c, t, d});

    localStorage.setItem('user', JSON.stringify(user));
    dataStore.set('log', user.log);
    journalCache = {};

    document.getElementById('editModal').close();
    Log.modalMode = false;
    Log.refresh();
  },

  /**
   * View Details
   * @param {number} mode - Sector (0) or project (1)
   * @param {string} key
   */
  viewDetails (mode, key) {
    const d = document.getElementById(mode === 0 ? 'SSC' : 'PSC');
    d.innerHTML = '';
    d.append(Log.ui.details.detail.build(mode, key));
  },

  /**
   * Open tab
   * @param {string} s - ID
   * @param {string} g - Group
   * @param {string} t - Tab group
   * @param {boolean} v - Vertical orientation?
   */
  tab (s, g = 'sect', t = 'tab', v = false) {
    const n = `${v ? `db mb3 ${t}` : `pv1 ${t}`} on bg-cl o5 mr3`;
    const x =  document.getElementsByClassName(g);
    const b =  document.getElementsByClassName(t);
    const cb = document.getElementById(`b-${s}`);
    const ct = document.getElementById(s);

    Log.nav.index = Log.nav.menu.indexOf(s);

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none';
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = n;
    }

    ct.style.display = 'grid';
    cb.className = `${v ? `db mb3 ${t}` : `pv1 ${t}`} on bg-cl of mr3`;
  },

  /**
   * Reset
   */
  reset () {
    clearInterval(Log.clock);
    ui.innerHTML = '';
    console.log('Reset')
  },

  nav: {
    menu: [],
    index: 0,

    /**
     * Move to next tab
     */
    next () {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1;
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
    },

    /**
     * Navigate to Journal entry
     * @param {string} h - Hex
     */
    toJournal (h) {
      Log.tab('JOU');
      Log.journal.translate(h);
    },

    /**
     * Navigate to sector or project detail
     * @param {number} mod - Sector (0) or project (1)
     * @param {string} key
     */
    toDetail (mod, key) {
      if (mod < 0 || mod > 1) return;
      if (key === undefined) return;

      Log.viewDetails(mod, key);
      Log.tab(mod === 0 ? 'SSC' : 'PSC', 'subsect', 'subtab', true);
      Log.tab('DTL');
    }
  },

  /**
   * Generate session cache
   */
  generateSessionCache () {
    if (user.log.length === 0) return;
    const {log} = Log;
    ø(Log.cache, {
      sor: log.sortEntries() || [],
      sec: log.sectors || [],
      pro: log.projects || [],
      pkh: log.peakHours() || [],
      pkd: log.peakDays() || [],
      dur: log.durations || []
    });
  },

  installLexicon () {
    for (let i = 0; i < 7; i++) {
      Log.days[Log.days.length] = Log.lexicon.days[i];
    }

    for (let i = 0; i < 12; i++) {
      Log.months[Log.months.length] = Log.lexicon.months[i];
    }
  },

  load () {
    Log.generateSessionCache();
    Log.installLexicon();

    const ä = o => ø(o, {
      backgroundColor: Log.config.ui.bg,
      color: Log.config.ui.colour
    });

    ä(document.body.style);
    ä(ui.style);

    Log.ui.build();
    Log.ui.util.setTimeLabel();
    Log.ui.util.setDayLabel();

    if (user.log.length === 0) Log.nav.index = 5;
    Log.tab(Log.nav.menu[Log.nav.index]);
  },

  refresh () {
    Log.reset();
    Log.load();
  },

  init () {

    user = {
      config: dataStore.get('config'),
      palette: dataStore.get('palette'),
      projectPalette: dataStore.get('projectPalette'),
      log: dataStore.get('log')
    }

    try {
      Log.config = user.config;
      Log.palette = user.palette;
      Log.projectPalette = user.projectPalette;
      Log.log = Log.data.parse(user.log);
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

      if (e.which >= 65 && e.which <= 90) {
        Log.commander.style.display = 'block';
        Log.commanderInput.focus();
        return;
      }

      if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
        Log.nav.index = e.which - 49;
        Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
        return;
      }

      const l = Log.console.history.length;

      const focus = _ => {
        Log.commander.style.display = 'block';
        Log.commanderInput.focus();
      }

      switch (e.which) {
        case 9: // Tab
          e.preventDefault();
          Log.nav.next();
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
      target === entryModal && entryModal.close()
    });
  }
};
