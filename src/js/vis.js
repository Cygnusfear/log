Log.vis = {

  /**
   * Display line visualisation
   * @param {Object[]} data - Data
   * @param {Object} con - Container
   */
  line(data, con) {
    if (data === undefined || con === undefined) return;

    const l = data.length;

    if (typeof data !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const frag = document.createDocumentFragment();

    for (let i = 0; i < l; i++) {
      const row = document.createElement('div');
      row.className = 'db wf sh1 mt2 mb2 visRow';
      frag.appendChild(row);

      if (data[i].length === 0) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const entry = document.createElement('div');
        const detail = user.log[data[i][o].id];
        entry.style.backgroundColor = data[i][o].col;
        entry.style.marginLeft = data[i][o].mg;
        entry.className = 'psr t0 hf mb1 lf';
        entry.style.width = data[i][o].wd;
        entry.title = `${detail.c} - ${detail.t} - ${detail.d}`;
        row.appendChild(entry);
      }
    }

    con.appendChild(frag);
  },

  /**
   * Display a bar visualisation
   * @param {Object[]} data - Data
   * @param {Object} con - Container
   */
  bar(data, con) {
    if (data === undefined || con === undefined) return;

    const l = data.length;

    if (typeof data !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    Log.vis.gridLines(con);

    const frag = document.createDocumentFragment();
    const width = `${100 / Log.config.ui.view}%`;

    for (let i = 0; i < l; i++) {
      const column = document.createElement('div');
      column.className = 'dib psr hf';
      column.style.width = width;
      frag.appendChild(column);

      if (data[i].length === 0) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const entry = document.createElement('div');
        entry.style.backgroundColor = data[i][o].col;
        entry.style.bottom = data[i][o].pos;
        entry.style.height = data[i][o].wh;
        entry.className = 'psa sw1';
        column.appendChild(entry);
      }
    }

    con.appendChild(frag);
  },

  /**
   * Display a day chart
   * @param {Object} [date] - Date
   * @param {Object} [con] - Container
   */
  day(date = new Date(), con = dyc) {
    if (typeof date !== 'object') return;
    if (typeof con !== 'object' || con === null) return;

    const frag = document.createDocumentFragment();
    const ent = Log.data.entries.byDate(date);
    if (ent.length === 0) return;

    let colour = '';
    switch (Log.config.ui.colourMode) {
      case 'sector':
      case 'sec':
        colour = 'sc';
        break;
      case 'project':
      case 'pro':
        colour = 'pc';
        break;
      default:
        colour = Log.config.ui.colour;
        break;
    }

    let lastWidth = 0;
    let lastPercentage = 0;

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === undefined) continue;

      const wd = ent[i].dur * 3600 / 86400 * 100;
      const en = document.createElement('a');
      const dp = Log.utils.calcDP(ent[i].s);

      en.style.marginLeft = `${dp - (lastWidth + lastPercentage)}%`;
      en.style.backgroundColor = ent[i][colour] || colour;
      en.style.width = `${wd}%`;
      en.className = 'hf lf';
      en.title = `${ent[i].c} - ${ent[i].t} - ${ent[i].d}`;

      frag.appendChild(en);

      lastWidth = wd;
      lastPercentage = dp;
    }

    con.appendChild(frag);
  },

  /**
   * Display peak days chart
   * @param {number} mode - Hours (0) or days (1)
   * @param {Object[]} peaks - Peaks
   * @param {Object} con - Container
   */
  peakChart(mode, peaks, con) {
    if (mode === undefined || peaks === undefined || con === undefined) return;

    const l = peaks.length;

    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof peaks !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const frag = document.createDocumentFragment();
    const now = mode === 0 ? (new Date()).getHours() : (new Date()).getDay();
    const max = Math.max(...peaks);
    const wid = `${100 / l}%`;

    for (let i = 0; i < l; i++) {
      const col = document.createElement('div');
      const inn = document.createElement('div');
      const cor = document.createElement('div');

      col.className = 'dib hf psr';
      cor.className = 'psa b0 sw1';
      inn.className = 'sw1 hf cn';

      cor.style.backgroundColor = i === now ?
        Log.config.ui.accent : Log.config.ui.colour;

      cor.style.height = `${peaks[i] / max * 100}%`;
      col.style.width = wid;

      inn.appendChild(cor);
      col.appendChild(inn);
      frag.appendChild(col);
    }

    con.appendChild(frag);
  },

  /**
   * List sectors or projects
   * @param {number} mode - Sector (0) or project (1)
   * @param {number} val - Hours (0) or percentages (1)
   * @param {Object} con - Container
   * @param {Object[]} [ent] - Entries
   */
  list(mode, val, con, ent = Log.log) {
    if (mode === undefined || val === undefined || con === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof val !== 'number' || val < 0 || val > 1) return;
    if (typeof con !== 'object' || con === null) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    const frag = document.createDocumentFragment();
    const arr = Log.data.sortValues(ent, mode, val);
    const lhe = Log.data.lh(ent);

    let col = '';
    let wid = 0;
    let key = '';
    let palette = {};

    if (mode === 0) {
      key = 'sec';
      palette = Log.palette;
    } else {
      key = 'pro';
      palette = Log.projectPalette;
    }

    for (let i = 0, l = arr.length; i < l; i++) {
      const nam = document.createElement('span');
      const dur = document.createElement('span');
      const bar = document.createElement('div');
      const itm = document.createElement('li');

      wid = mode === 0 ?
        Log.data.lh(Log.data.entries.bySec(arr[i][0], ent)) / lhe * 100 :
        Log.data.lh(Log.data.entries.byPro(arr[i][0], ent)) / lhe * 100;

      col = Log.config.ui.colourMode === 'none' ?
        Log.config.ui.colour : palette[arr[i][0]];

      itm.className =  `${i === arr.length - 1 ? 'mb0' : 'mb4'} c-pt`;
      itm.setAttribute('onclick', `Log.detail.${key}('${arr[i][0]}')`);

      nam.className = 'dib xw6 elip';
      nam.innerHTML = arr[i][0];

      dur.className = 'rf tnum';
      dur.innerHTML = arr[i][1].toFixed(2);

      bar.className = 'sh1';
      bar.style.backgroundColor = col || Log.config.ui.colour;
      bar.style.width = `${wid}%`;

      itm.appendChild(nam);
      itm.appendChild(dur);
      itm.appendChild(bar);
      frag.appendChild(itm);
    }

    con.appendChild(frag);
  },

  /**
   * Display a focus distribution bar
   * @param {number} mod - Sector (0) or project (1)
   * @param {Object[]} [ent] - Entries
   * @param {Object} [con] - Container
   */
  focusBar(mod, ent = Log.log, con = focusBar) {
    if (mod === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const frag = document.createDocumentFragment();
    const val = Log.data.sortValues(ent, mod, 1);
    const pal = mod === 0 ? Log.palette : Log.projectPalette;

    for (let i = 0, l = val.length; i < l; i++) {
      const div = document.createElement('div');
      div.style.backgroundColor = pal[val[i][0]] || Log.config.ui.colour;
      div.style.width = `${val[i][1]}%`;
      div.className = 'hf lf';
      frag.appendChild(div);
    }

    con.appendChild(frag);
  },

  /**
   * Create legend
   * @param {number} mod - Sector (0) or project (1)
   * @param {Object[]} [ent] - Entries
   * @param {string} [con] - Container
   */
  legend(mod, ent = Log.log, con = document.getElementById('legend')) {
    if (mod === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const frag = document.createDocumentFragment();
    const val = Log.data.sortValues(ent, mod, 1);
    let pal, nav;

    if (mod === 0) {
      pal = Log.palette;
      nav = 'Log.nav.toSecDetail';
    } else {
      pal = Log.projectPalette;
      nav = 'Log.nav.toProDetail';
    }

    for (let i = 0, l = val.length; i < l; i++) {
      const col = pal[val[i][0]] || Log.config.ui.colour;
      const itm = document.createElement('li');
      const ico = document.createElement('div');
      const inf = document.createElement('div');

      itm.className = 'c3 mb3 f6 lhc';

      ico.className = 'dib sh3 sw3 mr2 brf vm c-pt';
      ico.style.backgroundColor = col;
      ico.setAttribute('onclick', `${nav}('${val[i][0]}')`);

      inf.className = 'dib vm sw6 elip tnum';
      inf.innerHTML = `${val[i][1].toFixed(2)}% ${val[i][0]}`;

      itm.appendChild(ico);
      itm.appendChild(inf);
      frag.appendChild(itm);
    }

    con.appendChild(frag);
  },

  /**
   * Display a focus chart
   * @param {number} mod - Sector (0) or project (1)
   * @param {Object[]} [ent] - Entries
   * @param {string} [con] - Container
   */
  focusChart(mod, ent = Log.log, con = focusChart) {
    if (mod === undefined) return;
    if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof con !== 'object' || con === null) return;

    const frag = document.createDocumentFragment();
    const set = Log.data.sortEnt(ent);
    const l = set.length;
    const wid = `${100 / l}%`;
    const listFunc = mod === 0 ?
      Log.data.listSec : Log.data.listPro;

    for (let i = 0; i < l; i++) {
      const list = listFunc(set[i]);
      const col = document.createElement('div');
      const inn = document.createElement('div');

      col.className = 'dib hf';
      col.style.width = wid;

      inn.className = 'psa sw1 b0';
      inn.style.backgroundColor = Log.config.ui.colour;
      inn.style.height = `${list === undefined ? 0 : 1 / list.length * 100}%`;

      col.appendChild(inn);
      frag.appendChild(col);
    }

    con.appendChild(frag);
  },

  /**
   * Create chart lines
   * @param {Object} con - Container
   */
  gridLines(con) {
    if (con === undefined) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const d1 = document.createElement('div');
    const d2 = document.createElement('div');
    const d3 = document.createElement('div');
    const d4 = document.createElement('div');
    const d5 = document.createElement('div');
    const cl = 'psa wf bt o1';

    d5.className = `${cl} b0`;
    d4.className = cl;
    d3.className = cl;
    d2.className = cl;
    d1.className = cl;

    d4.style.top = '75%';
    d3.style.top = '50%';
    d2.style.top = '25%';

    con.appendChild(d1);
    con.appendChild(d2);
    con.appendChild(d3);
    con.appendChild(d4);
    con.appendChild(d5);
  },

  /**
   * Create meter lines
   * @param {Object} c - Container
   */
  meterLines(c) {
    if (c === undefined) return;
    if (typeof c !== 'object') return;
    for (let i = 0, l = 0; i < 24; i++) {
      l += 4.17;
      const d = document.createElement('div');
      d.className = `psa ${i % 2 === 0 ? 'h5' : 'hf'} br o7`;
      d.style.left = `${l}%`;
      c.appendChild(d);
    }
  },
};
