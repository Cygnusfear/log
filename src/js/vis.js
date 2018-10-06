'use strict';

Log.vis = {

  /**
   * Generate chart axis lines
   * @return {Object} Lines
   */
  axisLines () {
    const fr = document.createDocumentFragment();
    const cl = 'psa wf bt o1';
    const dv = ø('div', {className: cl});

    const l2 = dv.cloneNode();
    const l3 = dv.cloneNode();
    const l4 = dv.cloneNode();
    const l5 = dv.cloneNode();
    l5.className = `${cl} b0`;

    l4.style.top = '75%';
    l3.style.top = '50%';
    l2.style.top = '25%';

    fr.append(dv.cloneNode());
    fr.append(l2);
    fr.append(l3);
    fr.append(l4);
    fr.append(l5);

    return fr;
  },

  /**
   * Generate bar chart
   * @param {Object[]} [data]
   * @return {Object} Chart
   */
  barChart (data = []) {
    const l = data.length;
    if (!l) return;

    const fr = document.createDocumentFragment();
    const column = ø('div', {className: 'dib psr hf'});
    column.style.width = `${100 / l}%`;

    fr.append(Log.vis.axisLines());

    for (let i = 0; i < l; i++) {
      const col = column.cloneNode();
      fr.append(col);

      if (!data[i].length) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const {b, c, h} = data[i][o];
        const ent = ø('div', {className: 'psa sw1'});
        ø(ent.style, {backgroundColor: c, bottom: b || 0, height: h});
        col.append(ent);
      }
    }

    return fr;
  },

  /**
   * Generate day chart
   * @param {Object[]} ent - Entries
   * @param {Object} [ui] - UI config
   * @param {string} [ui.cm] - Colour mode
   * @param {string} [ui.colour] - Default colour
   * @return {Object} Chart
   */
  dayChart (ent, {cm, colour} = Log.config.ui) {
    const l = ent.length;
    if (!l) return;

    const fr = document.createDocumentFragment();

    for (let i = 0, pos = 0; i < l; i++) {
      const en = ø('span', {className: 'hf lf'});
      const {wh, mg} = ent[i];

      ø(en.style, {
        backgroundColor: ent[i][cm] || colour,
        marginLeft: `${mg - pos}%`,
        width: `${wh}%`
      });

      fr.append(en);
      pos = wh + mg;
    }

    return fr;
  },

  /**
   * Generate focus bar
   * @param {number} mode - Sector (0) or project (1)
   * @param {Object[]} [val] - Values
   * @param {string} [colour]
   * @return {Object} Focus bar
   */
  focusBar (mode, val = [], colour = Log.config.ui.colour) {
    if (mode < 0 || mode > 1) return;
    const l = val.length;
    if (!l) return;

    const pal = !mode ? Log.palette : Log.projectPalette;
    const fr = document.createDocumentFragment();

    for (let i = 0; i < l; i++) {
      const seg = ø('div', {className: 'hf lf'});
      ø(seg.style, {
        backgroundColor: pal[val[i].n] || colour,
        width: `${val[i].v}%`
      });
      fr.append(seg);
    }

    return fr;
  },

  /**
   * Generate focus chart
   * @param {Object[]} [data]
   * @param {string} [colour]
   * @return {Object} Chart
   */
  focusChart (data = [], colour = Log.config.ui.colour) {
    const l = data.length;
    if (!l) return;

    const fr = document.createDocumentFragment();
    const col = ø('div', {className: 'dib hf'});
    const core = ø('div', {className: 'psa sw1 b0'});

    col.style.width = `${100 / l}%`;
    core.style.backgroundColor = colour;

    for (let i = 0; i < l; i++) {
      const cl = col.cloneNode();
      const cr = core.cloneNode();

      cr.style.height = `${data[i] * 100}%`;

      cl.append(cr);
      fr.append(cl);
    }

    return fr;
  },

  /**
   * Generate legend
   * @param {number} mode - Sector (0) or project (1)
   * @param {Object[]} [val]
   * @param {string} [colour]
   * @return {Object} Legend
   */
  legend (mode, val = [], colour = Log.config.ui.colour) {
    if (mode < 0 || mode > 1) return;
    const l = val.length;
    if (!l) return;

    const frag = document.createDocumentFragment();
    const pal = !mode ? Log.palette : Log.projectPalette;

    for (let i = 0; i < l; i++) {
      const item = ø('li', {className: 'c3 mb3 f6 lhc'});

      const icon = ø('div', {
        className: 'dib sh3 sw3 mr2 brf vm c-pt',
        onclick: () => Log.nav.toDetail(mode, val[i].n)
      });

      const info = ø('div', {
        className: 'dib vm sw6 elip tnum',
        innerHTML: `${val[i].v.toFixed(2)}% ${val[i].n}`
      });

      icon.style.backgroundColor = pal[val[i].n] || colour;

      item.append(icon);
      item.append(info);
      frag.append(item);
    }

    return frag;
  },

  /**
   * Generate list
   * @param {number} mode - Sector (0) or project (1)
   * @param {Object[]} sort - Sorted values
   * @param {Set} [set]
   * @param {Object} [ui] - UI preferences
   * @param {string} [ui.cm]
   * @param {string} [ui.colour]
   * @return {Object} Node
   */
  list (mode, sort = [], set = Log.log, {cm, colour} = Log.config.ui) {
    if (mode < 0 || mode > 1) return;
    const l = sort.length;
    if (!l) return;
    if (!set.entries.length) return;

    const pal = !mode ? Log.palette : Log.projectPalette;
    const frag = document.createDocumentFragment();
    const lh = set.logHours();

    const ä = (e, c, i = '') => ø(e, {className: c, innerHTML: i});

    for (let i = 0; i < l; i++) {
      const {n, v} = sort[i];
      const item = ø('li', {
        className: `${i === l - 1 ? 'mb0' : 'mb4'} c-pt`,
        onclick: () => Log.nav.toDetail(mode, n)
      });

      const name = ä('span', 'dib xw6 elip', n);
      const span = ä('span', 'rf tnum', Log.data.stat(v));
      const bar = ä('div', 'sh1');

      ø(bar.style, {
        width: `${(v / lh * 100).toFixed(2)}%`,
        backgroundColor: (cm === 'none' ?
          colour : pal[n]) || colour
      });

      item.append(name);
      item.append(span);
      item.append(bar);
      frag.append(item);
    }

    return frag;
  },

  /**
   * Generate meter lines
   * @param {number} [n] - Divisions
   * @return {Object} Lines
   */
  meterLines (n = 24) {
    const f = document.createDocumentFragment();
    const y = 100 / n;

    for (let i = 0, x = 0; i < n; i++) {
      const l = ø('div', {
        className: `psa ${!(i % 2) ? 'h5' : 'hf'} br o7`
      });
      l.style.left = `${x += y}%`;
      f.append(l);
    }

    return f;
  },

  /**
   * Generate peak chart
   * @param {number}   mode        - Hour (0) or day (1)
   * @param {Object[]} [peaks]
   * @param {Object}   [ui]        - UI config
   * @param {string}   [ui.accent] - Accent colour
   * @param {string}   [ui.colour] - Default colour
   * @return {Object} Chart
   */
  peakChart (mode, peaks = [], {accent, colour} = Log.config.ui) {
    const l = peaks.length;
    if (mode < 0 || mode > 1) return;
    if (!l) return;

    const columnEl = ø('div', {className: 'dib hf psr'});
    const fr = document.createDocumentFragment();
    const max = Math.max(...peaks);
    const d = new Date;

    let label = {};
    let now = 0;

    if (mode === 1) {
      now = d.getDay();
      label = Log.ui.util.setDayLabel;
    } else {
      now = d.getHours();
      label = Log.ui.util.setTimeLabel;
    }

    columnEl.style.width = `${100 / l}%`;

    const perc = v => `${v / max * 100}%`;
    const createCore = (i, val) => {
      const core = ø('div', {
        className: 'psa b0 sw1 c-pt hoverCol',
        onmouseover: () => label(i),
        onmouseout: () => label()
      });

      ø(core.style, {
        height: perc(val),
        backgroundColor: i === now ? accent : colour
      });

      return core;
    }

    for (let i = 0; i < l; i++) {
      const column = columnEl.cloneNode();
      const mantle = ø('div', {className: 'sw1 hf cn'});
      const core = createCore(i, peaks[i]);

      mantle.append(core);
      column.append(mantle);
      fr.append(column);
    }

    return fr;
  },

  /**
   * Generate visualisation
   * @param {Object[]} [data]
   * @return {Object} Visualisation
   */
  visualisation (data = []) {
    const l = data.length;
    if (!l) return;

    const fr = document.createDocumentFragment();

    for (let i = 0; i < l; i++) {
      const r = ø('div', {className: 'db wf sh1 mt2 mb2 visRow'});
      fr.append(r);

      if (!data[i].length) continue;
      for (let o = 0, ol = data[i].length; o < ol; o++) {
        const {c, m, w} = data[i][o];
        const e = ø('div', {className: 'psr t0 hf mb1 lf'});
        ø(e.style, {backgroundColor: c, marginLeft: m, width: w});
        r.append(e);
      }
    }

    return fr;
  }
};
