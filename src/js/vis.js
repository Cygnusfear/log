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
    const rowEl = document.createElement('div');
    const entryEl = document.createElement('div');

    rowEl.className = 'db wf sh1 mt2 mb2 visRow';
    entryEl.className = 'psr t0 hf mb1 lf';

    for (let i = 0; i < l; i++) {
      const row = rowEl.cloneNode();
      frag.appendChild(row);

      if (data[i].length === 0) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const entry = entryEl.cloneNode();
        const detail = user.log[data[i][o].id];
        entry.title = `${detail.c} - ${detail.t} - ${detail.d}`;
        entry.style.backgroundColor = data[i][o].col;
        entry.style.marginLeft = data[i][o].mg;
        entry.style.width = data[i][o].wd;
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

    const l = data.set.length;

    if (typeof data !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    Log.vis.gridLines(con, data.avg);

    const frag = document.createDocumentFragment();
    const columnEl = document.createElement('div');
    const entryEl = document.createElement('div');

    columnEl.className = 'dib psr hf';
    columnEl.style.width = `${100 / Log.config.ui.view}%`;
    entryEl.className = 'psa sw1';

    for (let i = 0; i < l; i++) {
      const column = columnEl.cloneNode();
      frag.appendChild(column);

      if (data.set[i].length === 0) continue;
      for (let o = 0, ol = data.set[i].length; o < ol; o++) {
        const entry = entryEl.cloneNode();
        entry.style.backgroundColor = data.set[i][o].col;
        entry.style.bottom = data.set[i][o].pos;
        entry.style.height = data.set[i][o].wh;
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

    const enEl = document.createElement('span');
    enEl.className = 'hf lf';

    for (let i = 0, l = ent.length; i < l; i++) {
      if (ent[i].e === undefined) continue;

      const wd = ent[i].dur * 3600 / 86400 * 100;
      const en = enEl.cloneNode();
      const dp = Log.utils.calcDP(ent[i].s);

      en.style.marginLeft = `${dp - (lastWidth + lastPercentage)}%`;
      en.style.backgroundColor = ent[i][colour] || colour;
      en.style.width = `${wd}%`;
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
    const max = Math.max(...peaks);

    let now, label;

    if (mode === 0) {
      now = (new Date()).getHours();
      label = 'Log.label.setTime';
    } else {
      now = (new Date()).getDay();
      label = 'Log.label.setDay';
    }

    const colEl = document.createElement('div');
    const innEl = document.createElement('div');
    const corEl = document.createElement('div');

    colEl.className = 'dib hf psr';
    colEl.style.width = `${100 / l}%`;
    corEl.className = 'psa b0 sw1 c-pt hoverCol';
    innEl.className = 'sw1 hf cn';

    for (let i = 0; i < l; i++) {
      const col = colEl.cloneNode();
      const inn = innEl.cloneNode();
      const cor = corEl.cloneNode();

      cor.setAttribute('onmouseover', `${label}(${i})`);
      cor.setAttribute('onmouseout', `${label}()`);

      cor.style.backgroundColor = i === now ?
        Log.config.ui.accent : Log.config.ui.colour;

      cor.style.height = `${peaks[i] / max * 100}%`;

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

    const namEl = document.createElement('span');
    const durEl = document.createElement('span');
    const barEl = document.createElement('div');

    namEl.className = 'dib xw6 elip';
    durEl.className = 'rf tnum';
    barEl.className = 'sh1';

    for (let i = 0, l = arr.length; i < l; i++) {
      const itm = document.createElement('li')
      const nam = namEl.cloneNode();
      const dur = durEl.cloneNode();
      const bar = barEl.cloneNode();

      wid = mode === 0 ?
        Log.data.lh(Log.data.entries.bySec(arr[i][0], ent)) / lhe * 100 :
        Log.data.lh(Log.data.entries.byPro(arr[i][0], ent)) / lhe * 100;

      col = Log.config.ui.colourMode === 'none' ?
        Log.config.ui.colour : palette[arr[i][0]];

      itm.className = `${i === arr.length - 1 ? 'mb0' : 'mb4'} c-pt`;
      itm.setAttribute('onclick', `Log.detail.${key}('${arr[i][0]}')`);

      nam.innerHTML = arr[i][0];
      dur.innerHTML = Log.stat(arr[i][1]);

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
    const divEl = document.createElement('div');

    divEl.className = 'hf lf';

    for (let i = 0, l = val.length; i < l; i++) {
      const div = divEl.cloneNode();
      div.style.backgroundColor = pal[val[i][0]] || Log.config.ui.colour;
      div.style.width = `${val[i][1]}%`;
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

    const itmEl = document.createElement('li');
    const icoEl = document.createElement('div');
    const infEl = document.createElement('div');

    itmEl.className = 'c3 mb3 f6 lhc';
    icoEl.className = 'dib sh3 sw3 mr2 brf vm c-pt';
    infEl.className = 'dib vm sw6 elip tnum';

    for (let i = 0, l = val.length; i < l; i++) {
      const col = pal[val[i][0]] || Log.config.ui.colour;
      const itm = itmEl.cloneNode();
      const ico = icoEl.cloneNode();
      const inf = infEl.cloneNode();

      ico.style.backgroundColor = col;
      ico.setAttribute('onclick', `${nav}('${val[i][0]}')`);
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

    const colEl = document.createElement('div');
    const innEl = document.createElement('div');

    colEl.className = 'dib hf';
    colEl.style.width = `${100 / l}%`;

    innEl.className = 'psa sw1 b0';
    innEl.style.backgroundColor = Log.config.ui.colour;

    for (let i = 0; i < l; i++) {
      const list = listFunc(set[i]);
      const col = colEl.cloneNode();
      const inn = innEl.cloneNode();

      inn.style.height = `${list === undefined ? 0 : 1 / list.length * 100}%`;

      col.appendChild(inn);
      frag.appendChild(col);
    }

    con.appendChild(frag);
  },

  /**
   * Create chart lines
   * @param {Object} con - Container
   * @param {number} [avg] - Average log hours
   */
  gridLines(con, avg = undefined) {
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

    if (avg !== undefined) {
      const al = document.createElement('div');
      al.className = 'psa wf bt';
      al.style.bottom = `${avg}%`;
      al.style.color = `${Log.config.ui.accent}`
      con.appendChild(al);
    }
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
