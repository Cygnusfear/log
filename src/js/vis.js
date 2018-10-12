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
   * @param {Array=} data
   * @return {Object} Chart
   */
  barChart (data = []) {
    const frag = document.createDocumentFragment();
    const l = data.length;
    if (l === 0) return fr;

    const barEl = ø('div', {className: 'dib psr hf'});
    barEl.style.width = `${100 / l}%`;

    frag.append(Log.vis.axisLines());

    for (let i = 0; i < l; i++) {
      const bar = barEl.cloneNode();
      frag.append(bar);

      const ol = data[i].length;
      if (ol === 0) continue;
      for (let o = 0; o < ol; o++) {
        const slice = ø('div', {className: 'psa sw1'});
        const {b, c, h} = data[i][o];

        Ø(slice.style, {
          backgroundColor: c,
          bottom: b || 0,
          height: h
        });

        bar.append(slice);
      }
    }

    return frag;
  },

  /**
   * Generate day chart
   * @param {Array}   logs       - Entries
   * @param {Object=} ui        - UI config
   * @param {string=} ui.cm     - Colour mode
   * @param {string=} ui.colour - Foreground colour
   * @return {Object} Chart
   */
  dayChart (logs, {cm, colour} = Log.config.ui) {
    const fr = document.createDocumentFragment();
    const l = logs.length;
    if (l === 0) return fr;

    for (let i = 0, pos = 0; i < l; i++) {
      const en = ø('span', {className: 'hf lf'});
      const {wh, mg} = logs[i];

      Ø(en.style, {
        backgroundColor: logs[i][cm] || colour,
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
   * @param {number}  mode   - Sector (0) or project (1)
   * @param {Array=}  val    - Values
   * @param {string=} colour
   * @return {Object} Focus bar
   */
  focusBar (mode, val = [], colour = Log.config.ui.colour) {
    const fr = document.createDocumentFragment();
    if (mode < 0 || mode > 1) return fr;
    const l = val.length;
    if (l === 0) return fr;

    const pal = mode === 0 ? Log.palette : Log.projectPalette;

    for (let i = 0; i < l; i++) {
      const seg = ø('div', {className: 'hf lf'});
      Ø(seg.style, {
        backgroundColor: pal[val[i].n] || colour,
        width: `${val[i].v}%`
      });
      fr.append(seg);
    }

    return fr;
  },

  /**
   * Generate focus chart
   * @param {Array=}  data   - Chart data
   * @param {string=} colour - Foreground colour
   * @return {Object} Chart
   */
  focusChart (data = [], colour = Log.config.ui.colour) {
    const fr = document.createDocumentFragment();
    const l = data.length;
    if (l === 0) return fr;

    const column = ø('div', {className: 'dib hf'});
    const core = ø('div', {className: 'psa sw1 b0'});

    column.style.width = `${100 / l}%`;
    core.style.backgroundColor = colour;

    for (let i = 0; i < l; i++) {
      const cl = column.cloneNode();
      const cr = core.cloneNode();

      cr.style.height = `${data[i] * 100}%`;

      cl.append(cr);
      fr.append(cl);
    }

    return fr;
  },

  /**
   * Generate legend
   * @param {number}  mode - Sector (0) or project (1)
   * @param {Array=}  val
   * @param {string=} colour
   * @return {Object} Legend
   */
  legend (mode, val = [], colour = Log.config.ui.colour) {
    const fr = document.createDocumentFragment();
    if (mode < 0 || mode > 1) return fr;
    const l = val.length;
    if (l === 0) return fr;

    const pal = mode === 0 ? Log.palette : Log.projectPalette;

    for (let i = 0; i < l; i++) {
      const item = ø('li', {className: 'c3 mb3 f6 lhc'});

      const icon = ø('div', {
        onclick: () => Nav.toDetail(mode, val[i].n),
        className: 'dib sh3 sw3 mr2 brf vm c-pt'
      });

      const info = ø('div', {
        innerHTML: `${val[i].v.toFixed(2)}% ${val[i].n}`,
        className: 'dib vm sw6 elip tnum'
      });

      icon.style.backgroundColor = pal[val[i].n] || colour;

      item.append(icon);
      item.append(info);
      fr.append(item);
    }

    return fr;
  },

  /**
   * Generate list
   * @param {number}  mode      - Sector (0) or project (1)
   * @param {Array}   sort      - Sorted values
   * @param {Set=}    set       - Set
   * @param {number=} set.count - Set log count
   * @param {number=} set.lh    - Set log hours
   * @param {Object=} ui        - UI config
   * @param {string=} ui.cm     - Colour mode
   * @param {string=} ui.colour - Foreground colour
   * @return {Object} List
   */
  list (mode, sort = [], {count, lh} = Log.log, {cm, colour} = Log.config.ui) {
    const fr = document.createDocumentFragment();
    if (mode < 0 || mode > 1) return fr;
    const l = sort.length;
    if (l === 0 || count === 0) return fr;

    function ä (e, className, innerHTML = '') {
      return ø(e, {className, innerHTML});
    }

    const pal = mode === 0 ? Log.palette : Log.projectPalette;

    for (let i = 0; i < l; i++) {
      const {n, v} = sort[i];
      const item = ø('li', {
        className: `${i === l - 1 ? 'mb0' : 'mb4'} c-pt`,
        onclick: () => Nav.toDetail(mode, n)
      });

      const name = ä('span', 'dib xw6 elip', n);
      const span = ä('span', 'rf tnum', stat(v));
      const bar = ä('div', 'sh1');

      Ø(bar.style, {
        width: `${(v / lh * 100).toFixed(2)}%`,
        backgroundColor: (cm === 'none' ?
          colour : pal[n]) || colour
      });

      item.append(name);
      item.append(span);
      item.append(bar);
      fr.append(item);
    }

    return fr;
  },

  /**
   * Generate meter lines
   * @param {number=} n - Divisions
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
   * @param {number}  mode      - Hour (0) or day (1)
   * @param {Array=}  peaks
   * @param {Object=} ui        - UI config
   * @param {string=} ui.accent - Accent colour
   * @param {string=} ui.colour - Foreground colour
   * @return {Object} Chart
   */
  peakChart (mode, peaks = [], {accent, colour} = Log.config.ui) {
    const fr = document.createDocumentFragment();
    if (mode < 0 || mode > 1) return fr;
    const l = peaks.length;
    if (l === 0) return fr;

    function perc (v) {
      return `${v / max * 100}%`;
    }

    function createCore (i, val) {
      const core = ø('div', {
        className: 'psa b0 sw1 c-pt hoverCol',
        onmouseover: () => label(i),
        onmouseout: () => label()
      });

      Ø(core.style, {
        backgroundColor: i === now ? accent : colour,
        height: perc(val)
      });

      return core;
    }

    const colEl = ø('div', {className: 'dib hf psr'});
    colEl.style.width = `${100 / l}%`;
    const max = Math.max(...peaks);
    const d = new Date;

    let label = {};
    let now = 0;

    if (mode === 1) {
      label = Log.ui.util.setDayLabel;
      now = d.getDay();
    } else {
      label = Log.ui.util.setTimeLabel;
      now = d.getHours();
    }

    for (let i = 0; i < l; i++) {
      const column = colEl.cloneNode();
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
   * @param {Array=} data
   * @return {Object} Visualisation
   */
  visualisation (data = []) {
    const F = document.createDocumentFragment();
    const l = data.length;
    if (l === 0) return F;

    for (let i = 0; i < l; i++) {
      const r = ø('div', {className: 'db wf sh1 mt2 mb2 visRow'});
      F.append(r);

      const ol = data[i].length;
      if (ol === 0) continue;
      for (let o = 0; o < ol; o++) {
        const e = ø('div', {className: 'psr t0 hf mb1 lf'});
        const {c, m, w} = data[i][o];

        Ø(e.style, {
          backgroundColor: c,
          marginLeft: m,
          width: w
        });

        r.append(e);
      }
    }

    return F;
  }
};
