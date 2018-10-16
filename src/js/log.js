/**
 * Log
 * A log and time-tracking utility
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

/**
 * Create Object
 * @param {string} el
 * @param {Object} params
 * @return {Object}
 */
function ø (e, params) {
  return Object.assign(document.createElement(e), params);
}

/**
 * Create Object
 * @param {Object} el
 * @param {Object} params
 * @return {Object}
 */
function Ø (e, params) {
  return Object.assign(e, params);
}

let Session = {};
let Glossary = {};
let Palette = {};

const Log = {
  clock: {},
  config: {},
  entries: [],

  cache: {
    sor: [],
    dur: [],
    pkh: [],
    pkd: [],
    pro: [],
    sec: [],
  },

  /**
   * Get log status
   * @return {boolean} Status
   */
  status () {
    return Session.count === 0 ?
      false : !Session.last.end;
  },

  /**
   * Display session time
   */
  timer () {
    if (Log.status() === false) return;
    const l = +Session.last.start;
    let d = +new Date;
    let h = 0;
    let m = 0;
    let s = 0;

    Log.clock = setInterval(_ => {
      d += 1000;

      s = ~~((d - l) / 1000);
      m = ~~(s / 60);
      h = ~~(m / 60);

      h = (h %= 24).pad();
      m = (m %= 60).pad();
      s = (s %= 60).pad();

      UI.timerEl.innerHTML = `${h}:${m}:${s}`;
    }, 1000);
  },

  /**
   * Play sound
   * @param {string} sound
   */
  playSound (sound) {
    new Audio(`${__dirname}/media/${sound}.mp3`).play();
  },

  setEditFormValues (id) {
    const {s, e, c, t, d} = Log.entries[id];

    editID.innerHTML = id + 1;
    editEntryID.value = id;
    editSector.value = c;
    editProject.value = t;
    editDesc.value = d;

    const start = toEpoch(s);
    const sy = start.getFullYear();
    const sm = (start.getMonth() + 1).pad();
    const sd = start.getDate().pad();
    const sh = start.getHours().pad();
    const sn = start.getMinutes().pad();
    const ss = start.getSeconds().pad();

    editStart.value = `${sy}-${sm}-${sd}T${sh}:${sn}:${ss}`;

    if (e !== undefined && typeof e === 'string') {
      const end = toEpoch(e);
      const ey = end.getFullYear();
      const em = (end.getMonth() + 1).pad();
      const ed = end.getDate().pad();
      const eh = end.getHours().pad();
      const en = end.getMinutes().pad();
      const es = end.getSeconds().pad();

      editEnd.value = `${ey}-${em}-${ed}T${eh}:${en}:${es}`;
    }
  },

  /**
   * Summon Edit modal
   * @param {number} id - Entry ID
   */
  edit (id) {
    editEnd.value = '';
    Log.setEditFormValues(id);
    UI.modalMode = true;
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
    let confirmation = '';

    function count (prop, key) {
      const entries = Log.entries;
      const l = entries.length;
      let count = 0;

      for (let i = 0; i < l; i++) {
        if (entries[i][prop] === key) count++;
      }

      return count;
    }

    if (mode === 'project') {
      confirmation = `Are you sure you want to delete the ${words[1]} project? ${count('t', key)} entries will be deleted. This can't be undone.`;
    } else if (mode === 'sector') {
      confirmation = `Are you sure you want to delete the ${words[1]} sector? ${count('c', key)} entries will be deleted. This can't be undone.`;
    } else {
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();
      const span = ø('span', {className: 'mr3 o7'});

      confirmation = `Are you sure you want to delete the following ${aui.length > 1 ? `${aui.length} entries` : 'entry'}? This can't be undone.`;

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
    delMessage.innerHTML = confirmation;
    delModal.showModal();
  },

  /**
   * Hacky solution
   */
  deleteIt (i) {
    Command.deleteEntry(i);
  },

  /**
   * Update entry
   * @param {number} id - Entry ID
   */
  update (id, {s, e, c, t, d}) {
    Ø(Log.entries[id], {s, e, c, t, d});
    data.set('log', Log.entries);
    editModal.close();
    UI.modalMode = false;
    Log.refresh();
  },

  /**
   * View Details
   * @param {number} mode - Sector (0) or project (1)
   * @param {string} key
   */
  viewDetails (mode, key) {
    if (mode < 0 || mode > 1) return;
    const d = document.getElementById(!mode ? 'SSC' : 'PSC');
    d.innerHTML = '';
    d.append(UI.details.detail.build(mode, key));

  },

  reset () {
    clearInterval(Log.clock);
    document.getElementById('ui').innerHTML = '';
    console.log('Reset')
  },

  /**
   * Generate session cache
   */
  generateSessionCache () {
    if (Log.entries.length === 0) return;
    Ø(Log.cache, {
      pro: Session.listProjects() || [],
      sec: Session.listSectors() || [],
      pkh: Session.peakHours() || [],
      pkd: Session.peakDays() || []
    });
  },

  load () {
    function ä (obj) {
      return Ø(obj, {
        backgroundColor: Log.config.bg,
        color: Log.config.fg
      });
    }

    Log.generateSessionCache();

    ä(document.body.style);
    ä(ui.style);

    UI.build();
    UI.util.setTimeLabel();
    UI.util.setDayLabel();

    if (Log.entries.length === 0) {
      Nav.index = 5;
    }

    Nav.tab(Nav.menu[Nav.index]);
  },

  refresh () {
    Log.reset();
    Log.load();
  },

  init (data) {
    if (data === undefined) {
      console.error('Data store not found');
      return;
    }

    try {
      const ent = data.get('log');
      Session = parse(ent);
      Object.assign(Log, {
        config: new Config(data.get('config')),
        entries: ent
      });
      Object.assign(Palette, {
        pp: data.get('pp'),
        sp: data.get('sp')
      });
    } catch (e) {
      console.error(e);
      new window.Notification('Something went wrong.');
      return;
    }

    Glossary = new Lexicon({
      path: `${__dirname}/lexicon/en.json`
    }).data;

    CLI.installHistory();
    Log.load();

    document.onkeydown = e => {
      if (UI.modalMode) return;

      function focus () {
        UI.commanderEl.style.display = 'block';
        UI.commanderInput.focus();
      }

      if (e.which >= 65 && e.which <= 90) {
        focus();
        return;
      }

      if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
        Nav.index = e.which - 49;
        Nav.tab(Nav.menu[Nav.index]);
        return;
      }

      const l = CLI.history.length;

      switch (e.which) {
        case 9: // Tab
          e.preventDefault();
          Nav.next();
          break;
        case 27: // Escape
          UI.commanderEl.style.display = 'none';
          UI.commanderInput.value = '';
          UI.comIndex = 0;
          break;
        case 38: // Up
          focus();
          UI.comIndex++;
          if (UI.comIndex > l) UI.comIndex = l;
          UI.commanderInput.value = CLI.history[l - UI.comIndex];
          break;
        case 40: // Down
          focus();
          UI.comIndex--;
          if (UI.comIndex < 1) UI.comIndex = 1;
          UI.commanderInput.value = CLI.history[l - UI.comIndex];
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
