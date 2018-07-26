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

  keyEventInitialized: false,

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
    if (Log.log.length === 0) return;
    return Log.log.slice(-1)[0].e === undefined;
  },

  timer () {
    if (!Log.status()) return;
    const l = Log.time.toEpoch(Log.log.slice(-1)[0].s).getTime();
    const clock = document.getElementById('timer');

    Log.clock = setInterval(_ => {
      let s = ~~((new Date().getTime() - l) / 1E3);
      let m = ~~(s / 60);
      let h = ~~(m / 60);

      h %= 24;
      m %= 60;
      s %= 60;

      Log.timerEl.innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`;
    }, 1E3);
  },

  playSound (sound) {
    new Audio(`${__dirname}/media/${sound}.mp3`).play();
  },

  displayStat (val) {
    if (Log.config.ui.stat === 'decimal') {
      return val.toFixed(2);
    } else {
      const v = val.toString().split('.');
      if (v.length === 1) v[1] = '0';
      const mm = `0${(Number(`0.${v[1]}`) * 60).toFixed(0)}`.substr(-2);
      return `${v[0]}:${mm}`;
    }
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
    let count = 0;

    if (words[0] === 'project') {
      user.log.forEach((e, id) => {
        if (e.t === words[1]) count++;
      });

      delMessage.innerHTML = `Are you sure you want to delete the ${words[1]} project? ${count} entries will be deleted. This can't be undone.`;
    } else if (words[0] === 'sector') {
      let count = 0;
      user.log.forEach((e, id) => {
        if (e.c === words[1]) count++;
      });

      delMessage.innerHTML = `Are you sure you want to delete the ${words[1]} sector? ${count} entries will be deleted. This can't be undone.`;
    } else {
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();

      delMessage.innerHTML = aui.length > 1 ?
        `Are you sure you want to delete the following ${aui.length} entries? This can't be undone.` :
        'Are you sure you want to delete the following entry? This can\'t be undone.' ;

      const span = oa('span', {className: 'mr3 o7'});

      aui.forEach(i => {
        const {s, e, c, t, d} = user.log[Number(i) - 1];
        const start = Log.time.stamp(Log.time.toEpoch(s));
        const end = Log.time.stamp(Log.time.toEpoch(e));
        const li = document.createElement('li');
        const id = span.cloneNode();
        const tm = span.cloneNode();
        const sc = span.cloneNode();
        const pr = document.createElement('span');
        const dc = document.createElement('p');

        li.className = 'f6 lhc pb3 mb3';
        id.innerHTML = i;
        tm.innerHTML = `${start} &ndash; ${end}`;
        sc.innerHTML = c;

        Object.assign(pr, {className: 'o7', innerHTML: t});
        Object.assign(dc, {className: 'f4 lhc', innerHTML: d});

        li.appendChild(id);
        li.appendChild(tm);
        li.appendChild(sc);
        li.appendChild(pr);
        li.appendChild(dc);
        delList.append(li);
      });
    }

    delConfirm.setAttribute('onclick', `Log.deleteIt('${i}')`);
    delModal.showModal();
  },

  /**
   * Hacky solution
   */
  deleteIt (i) {
    Log.console.deleteEntry(i);
    // delModal.close();
  },

  /**
   * Update entry
   * @param {number} id - Entry ID
   */
  update (id) {
    const row = document.getElementById(`r${id}`);
    const nodes = row.childNodes;
    const s = new Date(editStart.value);
    const e = editEnd.value === '' ? '' : new Date(editEnd.value);
    const sh = Log.time.toHex(s);
    const eh = e === '' ? undefined : Log.time.toHex(e);

    nodes[1].innerHTML = Log.time.displayDate(s);

    if (eh === undefined) {
      nodes[2].innerHTML = Log.time.stamp(s);
      nodes[3].innerHTML = '—';
    } else {
      nodes[2].innerHTML = `${Log.time.stamp(s)} – ${Log.time.stamp(e)}`;
      nodes[3].innerHTML = Log.time.duration(sh, eh).toFixed(2);
    }

    nodes[4].innerHTML = editSector.value;
    nodes[5].innerHTML = editProject.value;
    nodes[6].innerHTML = editDesc.value;

    Object.assign(user.log[id], {
      s: sh,
      e: eh,
      c: editSector.value,
      t: editProject.value,
      d: editDesc.value
    })

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

  calcDurPercent (h) {
    if (h in durPercentCache) {
      return durPercentCache[h];
    } else {
      const s = Log.time.toEpoch(h);
      return durPercentCache[h] = (
        s.getTime() / 1E3 -
        (new Date(
          s.getFullYear(), s.getMonth(), s.getDate()
        )).getTime() / 1E3
      ) / 86400 * 100;
    }
  },

  calcWidth (dur) {
    return dur in widthCache ? widthCache[dur] :
      widthCache[dur] = dur * 360 / 8640 * 100;
  },

  tab (s, g = 'sect', t = 'tab', v = false) {
    const x = document.getElementsByClassName(g);
    const b = document.getElementsByClassName(t);
    const n = `${v ? `db mb3 ${t}` : `pv1 ${t}`} on bg-cl o5 mr3`;

    Log.nav.index = Log.nav.menu.indexOf(s);

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none';
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = n;
    }

    document.getElementById(s).style.display = 'grid';
    document.getElementById(`b-${s}`).className = `${v ?
      `db mb3 ${t}` : `pv1 ${t}`} on bg-cl of mr3`;
  },

  setDayLabel (d = new Date().getDay()) {
    cd.innerHTML = days[d].substring(0, 3);
  },

  setTimeLabel (h = new Date().getHours()) {
    ch.innerHTML = `${h}:00`;
  },

  reset () {
    clearInterval(Log.clock);
    ui.innerHTML = '';
    console.log('Reset')
  },

  nav: {
    menu: ['OVW', 'DTL', 'VIS', 'ENT', 'JOU', 'GUI'],

    index: 0,

    horizontal () {
      const {nav, tab} = Log;
      nav.index = nav.index === 5 ? 0 : nav.index + 1;
      tab(nav.menu[nav.index], 'sect', 'tab');
    },

    toJournal (h) {
      Log.tab('JOU', 'sect', 'tab');
      Log.journal.translate(h);
    },

    toDetail (mod, key) {
      if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
      if (typeof key !== 'string' || key.length === 0) return;

      Log.tab('DTL', 'sect', 'tab');
      Log.tab(mod === 0 ? 'SSC' : 'PSC', 'subsect', 'subtab', true);
      Log.viewDetails(mod, key);
    }
  },

  generateSessionCache () {
    if (user.log.length === 0) return;
    const {data} = Log;
    Object.assign(Log.cache, {
      sortEnt: data.sortEntries(),
      sec: data.listSectors() || [],
      pro: data.listProjects() || [],
      proFoc: data.listFocus(1) || [],
      pkh: data.peakHours() || [],
      pkd: data.peakDays() || [],
      dur: data.listDurations() || []
    });
  },

  load () {
    const {bg, colour} = Log.config.ui;

    Object.assign(document.body.style, {backgroundColor: bg, color: colour});
    Object.assign(ui.style, {backgroundColor: bg, color: colour});

    Log.generateSessionCache();

    Log.ui.build();

    if (user.log.length === 0) {
      Log.nav.index = 5;
      Log.tab('guide', 'sect', 'tab');
      return;
    }
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
      console.error('User log data contains errors');
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

        switch (e.which) {
          case 9: // Tab
            e.preventDefault();
            Log.nav.horizontal();
            break;
          case 27: // Escape
            Log.commanderInput.value = '';
            Log.commander.style.display = 'none';
            Log.commanderIndex = 0;
            break;
          case 38: // Up
            Log.commander.style.display = 'block';
            Log.commanderInput.focus();
            Log.commanderIndex++;
            if (Log.commanderIndex > l) Log.commanderIndex = l;
            Log.commanderInput.value = Log.console.history[l - Log.commanderIndex];
            break;
          case 40: // Down
            Log.commander.style.display = 'block';
            Log.commanderInput.focus();
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
