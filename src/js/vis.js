'use strict';

Log.vis = {

  axisLines (avg = undefined) {
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');
    const cl = 'psa wf bt o1';

    div.className = cl;

    const l2 = div.cloneNode();
    const l3 = div.cloneNode();
    const l4 = div.cloneNode();
    const l5 = div.cloneNode();

    l5.className = `${cl} b0`;
    l4.style.top = '75%';
    l3.style.top = '50%';
    l2.style.top = '25%';

    frag.appendChild(div.cloneNode());
    frag.appendChild(l2);
    frag.appendChild(l3);
    frag.appendChild(l4);
    frag.appendChild(l5);

    if (avg !== undefined && typeof avg === 'number') {
      if (avg === 0) return;
      const ind = document.createElement('div');
      ind.className = 'psa wf bt';
      Object.assign(ind.style, {
        color: Log.config.ui.accent,
        bottom: `${avg}%`
      });
      frag.appendChild(ind);
    }

    return frag;
  },

  barChart (data) {
    if (data === undefined) return;

    const l = data.set.length;

    if (typeof data !== 'object' || l === 0) return;

    const frag = document.createDocumentFragment();
    const column = document.createElement('div');
    const entry = document.createElement('div');

    frag.appendChild(Log.vis.axisLines(data.avg));

    column.style.width = `${100 / Log.config.ui.view}%`;
    column.className = 'dib psr hf';
    entry.className = 'psa sw1';

    for (let i = 0; i < l; i++) {
      const col = column.cloneNode();
      frag.appendChild(col);

      if (data.set[i].length === 0) continue;
      for (let o = 0, ol = data.set[i].length; o < ol; o++) {
        const {b, c, h} = data.set[i][o];
        const ent = entry.cloneNode();
        Object.assign(ent.style, {backgroundColor: c, bottom: b, height: h});
        col.appendChild(ent);
      }
    }

    return frag;
  },

  dayChart (ent) {
    if (ent === undefined) return;

    const l = ent.length;

    if (typeof ent !== 'object' || l === 0) return;

    const {colourMode, colour} = Log.config.ui;
    const frag = document.createDocumentFragment();
    const entryEl = document.createElement('span');
    const col = colourMode === 'sector' ? 'sc' :
      colourMode === 'project' ? pc : colour;

    entryEl.className = 'hf lf';

    for (let i = 0, lastPosition = 0; i < l; i++) {
      const {s, dur} = ent[i];
      const width = Log.calcWidth(dur);
      const dp = Log.calcDurPercent(s);
      const entry = entryEl.cloneNode();

      Object.assign(entry.style, {
        marginLeft: `${dp - lastPosition}%`,
        backgroundColor: ent[i][col] || col,
        width: `${width}%`
      });

      frag.appendChild(entry);
      lastPosition = width + dp;
    }

    return frag;
  },

  focusBar (mode, val) {
    if (mode === undefined || val === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;

    const l = val.length;

    if (typeof val !== 'object' || l === 0) return;

    const pal = mode === 0 ? Log.palette : Log.projectPalette;
    const frag = document.createDocumentFragment();
    const div = document.createElement('div');

    div.className = 'hf lf';

    for (let i = 0; i < l; i++) {
      const seg = div.cloneNode();
      Object.assign(seg.style, {
        backgroundColor: pal[val[i][0]] || Log.config.ui.colour,
        width: `${val[i][1]}%`
      });
      frag.appendChild(seg);
    }

    return frag;
  },

  focusChart (data) {
    const l = data.length;

    if (typeof data !== 'object' || l === 0) return;

    const frag = document.createDocumentFragment();
    const col = document.createElement('div');
    const core = document.createElement('div');

    col.style.width = `${100 / l}%`;
    col.className = 'dib hf';

    core.style.backgroundColor = Log.config.ui.colour;
    core.className = 'psa sw1 b0';

    for (let i = 0; i < l; i++) {
      const cl = col.cloneNode();
      const cr = core.cloneNode();

      cr.style.height = `${(data[i] * 100).toFixed(2)}%`;

      cl.appendChild(cr);
      frag.appendChild(cl);
    }

    return frag;
  },

  legend (mode, val) {
    if (mode === undefined || val === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;

    const l = val.length;

    if (typeof val !== 'object' || l === 0) return;

    const frag = document.createDocumentFragment();
    const itemEl = document.createElement('li');
    const iconEl = document.createElement('div');
    const infoEl = document.createElement('div');
    const pal = mode === 0 ? Log.palette : Log.projectPalette;

    iconEl.className = 'dib sh3 sw3 mr2 brf vm c-pt';
    infoEl.className = 'dib vm sw6 elip tnum';
    itemEl.className = 'c3 mb3 f6 lhc';

    for (let i = 0; i < l; i++) {
      const item = itemEl.cloneNode();
      const icon = iconEl.cloneNode();
      const info = infoEl.cloneNode();
      const name = val[i][0];

      icon.style.backgroundColor = pal[name] || Log.config.ui.colour;
      info.innerHTML = `${val[i][1].toFixed(2)}% ${name}`;
      icon.setAttribute('onclick', `Log.nav.toDetail(${mode}, '${name}')`);

      item.appendChild(icon);
      item.appendChild(info);
      frag.appendChild(item);
    }

    return frag;
  },

  list (mode, sort, ent = Log.log) {
    if (mode === undefined || sort === undefined) return;
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;

    const l = sort.length;

    if (typeof sort !== 'object' || l === 0) return;
    if (typeof ent !== 'object' || ent.length === 0) return;

    const pal = mode === 0 ? Log.palette : Log.projectPalette;
    const frag = document.createDocumentFragment();
    const nameEl = document.createElement('span');
    const spanEl = document.createElement('span');
    const barEl = document.createElement('div');
    const lh = Log.data.logHours(ent);

    nameEl.className = 'dib xw6 elip';
    spanEl.className = 'rf tnum';
    barEl.className = 'sh1';

    for (let i = 0; i < l; i++) {
      const item = document.createElement('li');
      const name = nameEl.cloneNode();
      const span = spanEl.cloneNode();
      const bar = barEl.cloneNode();
      const n = sort[i][0];
      const v = sort[i][1];

      item.setAttribute('onclick', `Log.nav.toDetail(${mode}, '${n}')`);
      item.className = `${i === l - 1 ? 'mb0' : 'mb4'} c-pt`;

      Object.assign(bar.style, {
        width: `${(v / lh * 100).toFixed(2)}%`,
        backgroundColor: (Log.config.ui.colourMode === 'none' ?
          Log.config.ui.colour : pal[n]) || Log.config.ui.colour
      });

      name.innerHTML = n;
      span.innerHTML = Log.displayStat(v);

      item.appendChild(name);
      item.appendChild(span);
      item.appendChild(bar);
      frag.appendChild(item);
    }

    return frag;
  },

  meterLines () {
    const f = document.createDocumentFragment();

    for (let i = 0, x = 0; i < 24; i++) {
      const l = document.createElement('div');
      l.className = `psa ${i % 2 === 0 ? 'h5' : 'hf'} br o7`;
      l.style.left = `${x += 4.17}%`;
      f.appendChild(l);
    }

    return f;
  },

  peakChart (mode, peaks) {
    if (mode === undefined || peaks === undefined) return;

    const l = peaks.length;

    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof peaks !== 'object' || l === 0) return;

    const frag = document.createDocumentFragment();
    const columnEl = document.createElement('div');
    const mantleEl = document.createElement('div');
    const coreEl = document.createElement('div');
    const max = Math.max(...peaks);
    const d = new Date();

    let now = d.getHours();
    let label = 'Log.setTimeLabel';

    if (mode === 1) {
      now = d.getDay();
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

      Object.assign(core.style, {
        height: `${peaks[i] / max * 100}%`,
        backgroundColor: i === now ?
          Log.config.ui.accent : Log.config.ui.colour
      });

      core.setAttribute('onmouseover', `${label}(${i})`);
      core.setAttribute('onmouseout', `${label}()`);

      mantle.appendChild(core);
      column.appendChild(mantle);
      frag.appendChild(column);
    }

    return frag;
  },

  visualisation (data) {
    if (data === undefined) return;

    const l = data.length;

    if (typeof data !== 'object' || l === 0) return;

    const frag = document.createDocumentFragment();
    const row = document.createElement('div');
    const ent = document.createElement('div');

    row.className = 'db wf sh1 mt2 mb2 visRow';
    ent.className = 'psr t0 hf mb1 lf';

    for (let i = 0; i < l; i++) {
      const r = row.cloneNode();
      frag.appendChild(r);

      if (data[i].length === 0) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const e = ent.cloneNode();
        const {c, m, w} = data[i][o];
        Object.assign(e.style, {backgroundColor: c, marginLeft: m, width: w});
        r.appendChild(e);
      }
    }

    return frag;
  }
};
