'use strict';

Log.vis = {

  axisLines(con, avg = undefined) {
    if (con === undefined) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    const cl = 'psa wf bt o1';

    div.className = cl;

    const l1 = div.cloneNode();
    const l2 = div.cloneNode();
    const l3 = div.cloneNode();
    const l4 = div.cloneNode();
    const l5 = div.cloneNode();

    l5.className = `${cl} b0`;

    l4.style.top = '75%';
    l3.style.top = '50%';
    l2.style.top = '25%';

    frag.appendChild(l1);
    frag.appendChild(l2);
    frag.appendChild(l3);
    frag.appendChild(l4);
    frag.appendChild(l5);

    if (avg !== undefined) {
      if (typeof avg !== 'number' || avg === 0) return;
      const ind = document.createElement('div');
      ind.style.color = `${Log.config.ui.accent}`;
      ind.style.bottom = `${avg}%`;
      ind.className = 'psa wf bt';
      frag.appendChild(ind);
    }

    con.appendChild(frag);
  },

  barChart(data, con) {
    if (data === undefined || con === undefined) return;

    const l = data.set.length;

    if (typeof data !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    Log.vis.axisLines(con, data.avg);

    const frag = document.createDocumentFragment();
    const col = document.createElement('div');
    const ent = document.createElement('div');

    col.style.width = `${100 / Log.config.ui.view}%`;
    col.className = 'dib psr hf';

    ent.className = 'psa sw1';

    for (let i = 0; i < l; i++) {
      const c = col.cloneNode();

      frag.appendChild(c);

      if (data.set[i].length === 0) continue;
      for (let o = 0, ol = data.set[i].length; o < ol; o++) {
        const e = ent.cloneNode();

        e.style.backgroundColor = data.set[i][o].col;
        e.style.bottom = data.set[i][o].pos;
        e.style.height = data.set[i][o].wh;

        c.appendChild(e);
      }
    }

    con.appendChild(frag);
  },

  dayChart(ent, con) {
    if (ent === undefined || con === undefined) return;

    const l = ent.length;

    if (typeof ent !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const frag = document.createDocumentFragment();
    const entryEl = document.createElement('span');

    let colour = Log.config.ui.colour;
    let lastPercentage = 0;
    let lastWidth = 0;

    switch (Log.config.ui.colourMode) {
      case 'sector':
        colour = 'sc';
        break;
      case 'project':
        colour = 'pc';
        break;
      default:
        break;
    }

    entryEl.className = 'hf lf';

    for (let i = 0; i < l; i++) {
      if (ent[i].e === undefined) continue;

      const width = ent[i].dur * 3600 / 86400 * 100;
      const entry = entryEl.cloneNode();
      const dp = Log.calcDurPercent(ent[i].s);

      entry.style.marginLeft = `${dp - (lastWidth + lastPercentage)}%`;
      entry.title = `${ent[i].c} - ${ent[i].t} - ${ent[i].d}`;
      entry.style.backgroundColor = ent[i][colour] || colour;
      entry.style.width = `${width}%`;

      frag.appendChild(entry);

      lastWidth = width;
      lastPercentage = dp;
    }

    con.appendChild(frag);
  },

  focusBar(mode, val, con) {
    if (mode === undefined || val === undefined || con === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;

    const l = val.length;

    if (typeof val !== 'object' || l === 0) return;
    if (typeof container !== 'object' || con === null) return;

    con.innerHTML = '';

    const pal = mode === 0 ? Log.palette : Log.projectPalette;
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');

    div.className = 'hf lf';

    for (let i = 0; i < l; i++) {
      const seg = div.cloneNode();
      seg.style.backgroundColor = pal[val[i][0]] || Log.config.ui.colour;
      seg.style.width = `${val[i][1]}%`;
      frag.appendChild(seg);
    }

    con.appendChild(frag);
  },

  focusChart(mode, ent, con = focusChart) {
    if (mode === undefined) return;

    const l = ent.length;

    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof ent !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const func = mode === 0 ? Log.data.listSectors : Log.data.listProjects;
    const frag = document.createDocumentFragment();
    const col = document.createElement('div');
    const core = document.createElement('div');

    col.style.width = `${100 / l}%`;
    col.className = 'dib hf';

    core.style.backgroundColor = Log.config.ui.colour;
    core.className = 'psa sw1 b0';

    for (let i = 0; i < l; i++) {
      const list = func(ent[i]);
      const cl = col.cloneNode();
      const cr = core.cloneNode();

      cr.style.height = `${list === undefined ? 0 : 1 / list.length * 100}%`;

      cl.appendChild(cr);
      frag.appendChild(cl);
    }

    con.appendChild(frag);
  },

  legend(mode, val, con) {
    if (mode === undefined || val === undefined || con === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;

    const l = val.length;

    if (typeof val !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const frag = document.createDocumentFragment();
    const itemEl = document.createElement('li');
    const iconEl = document.createElement('div');
    const infoEl = document.createElement('div');

    let nav = 'Log.nav.toSectorDetail';
    let pal = Log.palette;

    if (mode === 1) {
      nav = 'Log.nav.toProjectDetail';
      pal = Log.projectPalette;
    }

    iconEl.className = 'dib sh3 sw3 mr2 brf vm c-pt';
    infoEl.className = 'dib vm sw6 elip tnum';
    itemEl.className = 'c3 mb3 f6 lhc';

    for (let i = 0; i < l; i++) {
      const item = itemEl.cloneNode();
      const icon = iconEl.cloneNode();
      const info = infoEl.cloneNode();

      icon.style.backgroundColor = pal[val[i][0]] || Log.config.ui.colour;
      info.innerHTML = `${val[i][1].toFixed(2)}% ${val[i][0]}`;
      icon.setAttribute('onclick', `${nav}('${val[i][0]}')`);

      item.appendChild(icon);
      item.appendChild(info);
      frag.appendChild(item);
    }

    con.appendChild(frag);
  },

  list(mode, sort, con, ent = Log.log) {
    if (mode === undefined || sort === undefined || con === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;

    const l = sort.length;

    if (typeof sort !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    con.innerHTML = '';

    const frag = document.createDocumentFragment();
    const lh = Log.data.logHours(ent);

    let func = Log.data.getEntriesBySector;
    let pal = Log.palette;
    let key = 'Sector';

    if (mode === 1) {
      func = Log.data.getEntriesByProject;
      pal = Log.projectPalette;
      key = 'Project';
    }

    const itemEl = document.createElement('li');
    const nameEl = document.createElement('span');
    const durEl = document.createElement('span');
    const barEl = document.createElement('div');

    nameEl.className = 'dib xw6 elip';
    durEl.className = 'rf tnum';
    barEl.className = 'sh1';

    for (let i = 0; i < l; i++) {
      const colour = Log.config.ui.colourMode === 'none' ?
        Log.config.ui.colour : pal[sort[i][0]];

      const item = itemEl.cloneNode();
      const name = nameEl.cloneNode();
      const dur = durEl.cloneNode();
      const bar = barEl.cloneNode();

      name.innerHTML = sort[i][0];
      dur.innerHTML = Log.displayStat(sort[i][1]);

      item.setAttribute('onclick', `Log.nav.to${key}Detail('${sort[i][0]}')`);
      item.className = `${i === l - 1 ? 'mb0' : 'mb4'} c-pt`;

      bar.style.width = `${Log.data.logHours(func(sort[i][0], ent)) / lh * 100}%`;
      bar.style.backgroundColor = colour || Log.config.ui.colour;

      item.appendChild(name);
      item.appendChild(dur);
      item.appendChild(bar);
      frag.appendChild(item);
    }

    con.appendChild(frag);
  },

  meterLines(con) {
    if (con === undefined) return;
    if (typeof con !== 'object') return;

    const frag = document.createDocumentFragment();
    const line = document.createElement('div');

    for (let i = 0, x = 0; i < 24; i++) {
      const l = line.cloneNode();
      l.className = `psa ${i % 2 === 0 ? 'h5' : 'hf'} br o7`;
      l.style.left = `${x += 4.17}%`;
      frag.appendChild(l);
    }

    con.appendChild(frag);
  },

  peakChart(mode, peaks, con) {
    if (
      mode === undefined || peaks === undefined || con === undefined
    ) return;

    const l = peaks.length;

    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof peaks !== 'object' || l === 0) return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const frag = document.createDocumentFragment();
    const columnEl = document.createElement('div');
    const mantleEl = document.createElement('div');
    const coreEl = document.createElement('div');
    const max = Math.max(...peaks);

    let now = new Date().getHours();
    let label = 'Log.setTimeLabel';

    if (mode === 1) {
      now = new Date().getDay();
      label = 'Log.setDayLabel';
    }

    columnEl.className = 'dib hf psr';
    columnEl.style.width = `${100 / l}%`;
    mantleEl.className = 'sw1 hf cn';
    coreEl.className = 'psa b0 sw1 c-pt hoverCol';

    for (let i = 0; i < l; i++) {
      const column = columnEl.cloneNode();
      const mantle = mantleEl.cloneNode();
      const core = coreEl.cloneNode();

      core.style.height = `${peaks[i] / max * 100}%`;
      core.style.backgroundColor = i === now ?
        Log.config.ui.accent : Log.config.ui.colour;

      core.setAttribute('onmouseover', `${label}(${i})`);
      core.setAttribute('onmouseout', `${label}()`);

      mantle.appendChild(core);
      column.appendChild(mantle);
      frag.appendChild(column);
    }

    con.appendChild(frag);
  },

  visualisation(data) {
    if (data === undefined) return;

    const l = data.length;

    if (typeof data !== 'object' || l === 0) return;

    const con = document.getElementById('visual');
    const frag = document.createDocumentFragment();
    const ent = document.createElement('div');
    const row = document.createElement('div');

    row.className = 'db wf sh1 mt2 mb2 visRow';
    ent.className = 'psr t0 hf mb1 lf';

    con.innerHTML = '';

    for (let i = 0; i < l; i++) {
      const r = row.cloneNode();

      frag.appendChild(r);

      if (data[i].length === 0) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const e = ent.cloneNode();

        e.style.backgroundColor = data[i][o].col;
        e.style.marginLeft = data[i][o].mg;
        e.style.width = data[i][o].wd;

        r.appendChild(e);
      }
    }

    con.appendChild(frag);
  },
};
