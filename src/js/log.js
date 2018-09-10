/**
 * Log
 * A log and time-tracking utility
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

let user = {};
let durPercentCache = {};
let widthCache = {};

let Log = {

  lexicon: {},

  path: '',
  modalMode: false,

  config: {},
  log: [],
  palette: {},
  projectPalette: {},

  clock: {},

  days: [],
  months: [],

  cache: {
    entByDay: [],
    sortEnt: [],
    proFoc: [],
    dur: [],
    pkh: [],
    pkd: [],
    pro: [],
    sec: [],
  },

  commander: {},
  commanderInput: {},
  commanderIndex: 0,

  timerEl: {},

  status () {
    if (Log.log.entries.length === 0) return;
    return Log.log.entries.slice(-1)[0].e === undefined;
  },

  timer () {
    if (!Log.status()) return;
    const l = +Log.log.entries.slice(-1)[0].s;

    Log.clock = setInterval(_ => {
      let s = ~~((+new Date() - l) / 1E3);
      let m = ~~(s / 60);
      let h = ~~(m / 60);

      h = `0${h %= 24}`.substr(-2);
      m = `0${m %= 60}`.substr(-2);
      s = `0${s %= 60}`.substr(-2);

      Log.timerEl.innerHTML = `${h}:${m}:${s}`;
    }, 1E3);
  },

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
    let delmsg = '';
    let count = 0;

    if (words[0] === 'project') {
      user.log.forEach((e, id) => {if (e.t === words[1]) count++;});
      delmsg = `Are you sure you want to delete the ${words[1]} project? ${count} entries will be deleted. This can't be undone.`;
    } else if (words[0] === 'sector') {
      user.log.forEach((e, id) => {if (e.c === words[1]) count++;});
      delmsg = `Are you sure you want to delete the ${words[1]} sector? ${count} entries will be deleted. This can't be undone.`;
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

    delMessage.innerHTML = delmsg;

    delConfirm.setAttribute('onclick', `Log.deleteIt('${i}')`);
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
  update (id) {
    const s = new Date(editStart.value);
    const e = editEnd.value === '' ? '' : new Date(editEnd.value);
    const sh = Log.time.toHex(s);
    const eh = e === '' ? undefined : Log.time.toHex(e);

    ø(user.log[id], {
      s: sh,
      e: eh,
      c: editSector.value,
      t: editProject.value,
      d: editDesc.value
    });

    localStorage.setItem('user', JSON.stringify(user));
    dataStore.set('log', user.log);
    journalCache = {};

    document.getElementById('editModal').close();
    Log.modalMode = false;
    Log.refresh();
  },

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
    const x = document.getElementsByClassName(g);
    const b = document.getElementsByClassName(t);
    const n = `${v ? `db mb3 ${t}` : `pv1 ${t}`} on bg-cl o5 mr3`;
    const cTab = document.getElementById(s);
    const cBtn = document.getElementById(`b-${s}`);

    Log.nav.index = Log.nav.menu.indexOf(s);

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none';
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = n;
    }

    cTab.style.display = 'grid';
    cBtn.className = `${v ? `db mb3 ${t}` : `pv1 ${t}`} on bg-cl of mr3`;
  },

  reset () {
    clearInterval(Log.clock);
    ui.innerHTML = '';
    console.log('Reset')
  },

  nav: {
    menu: [],
    index: 0,

    horizontal () {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1;
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
    },

    toJournal (h) {
      Log.tab('JOU');
      Log.journal.translate(h);
    },

    toDetail (mod, key) {
      if (mod < 0 || mod > 1) return;
      if (key.length === 0) return;

      Log.tab('DTL');
      Log.tab(mod === 0 ? 'SSC' : 'PSC', 'subsect', 'subtab', true);
      Log.viewDetails(mod, key);
    }
  },

  generateSessionCache () {
    if (user.log.length === 0) return;
    const {data} = Log;
    ø(Log.cache, {
      sortEnt: Log.log.sortEntries(),
      sec: Log.log.sectors || [],
      pro: Log.log.projects || [],
      proFoc: Log.log.listFocus(1) || [],
      pkh: Log.log.peakHours() || [],
      pkd: Log.log.peakDays() || [],
      dur: Log.log.durations || []
    });
  },

  load () {
    Log.generateSessionCache();

    const ä = o => ø(o, {
      backgroundColor: Log.config.ui.bg,
      color: Log.config.ui.colour
    });

    ä(document.body.style);
    ä(ui.style);

    for (let i = 0; i < 7; i++) {
      Log.days[Log.days.length] = Log.lexicon.days[i];
    }

    for (let i = 0; i < 12; i++) {
      Log.months[Log.months.length] = Log.lexicon.months[i];
    }

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
      new window.Notification('There is something wrong with this file.');
      return;
    }

    Log.lexicon = Dict.data;
    console.log('Lexicon installed')

    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory'));
    } else {
      Log.console.history = [];
      localStorage.setItem('logHistory', JSON.stringify(Log.console.history));
    }

    console.time('Log');
    Log.load();
    console.timeEnd('Log');

    if (!Log.keyEventInitialized) {
      Log.keyEventInitialized = true;

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
            Log.nav.horizontal();
            break;
          case 27: // Escape
            Log.commander.style.display = 'none';
            Log.commanderInput.value = '';
            Log.commanderIndex = 0;
            break;
          case 38: // Up
            focus();
            Log.commanderIndex++;
            if (Log.commanderIndex > l) Log.commanderIndex = l;
            Log.commanderInput.value = Log.console.history[l - Log.commanderIndex];
            break;
          case 40: // Down
            focus();
            Log.commanderIndex--;
            if (Log.commanderIndex < 1) Log.commanderIndex = 1;
            Log.commanderInput.value = Log.console.history[l - Log.commanderIndex];
            break;
          default:
            break;
        }
      };
    }

    document.addEventListener('click', ({target}) => {
      target === entryModal && entryModal.close()
    });
  }
};
