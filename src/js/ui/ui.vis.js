'use strict';

const Vis = {

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
    const fr = document.createDocumentFragment();
    const l = data.length;
    if (l === 0) return fr;

    const barEl = ø('div', {className: 'dib psr hf'});
    const sliceEl = ø('div', {className: 'psa sw1 b0'});
    barEl.style.width = `${100 / l}%`;

    fr.append(UI.vis.axisLines());

    for (let i = 0; i < l; i++) {
      const bar = barEl.cloneNode();
      const day = data[i];
      const dl = day.length;

      fr.append(bar);

      if (dl === 0) continue;
      for (let o = 0; o < dl; o++) {
        const slice = sliceEl.cloneNode();
        Ø(slice.style, day[o]);
        bar.append(slice);
      }
    }

    return fr;
  },

  /**
   * Generate day chart
   * @param {Array}   logs
   * @param {Object=} config
   * @param {string=} config.cm - Colour mode
   * @param {string=} config.fg - Foreground colour
   * @return {Object} Chart
   */
  dayChart (logs, {cm, fg} = Log.config) {
    const fr = document.createDocumentFragment();
    const l = logs.length;
    if (l === 0) return fr;

    for (let i = 0, pos = 0; i < l; i++) {
      const en = ø('span', {className: 'hf lf'});
      const {wh, mg} = logs[i];

      Ø(en.style, {
        backgroundColor: logs[i][cm] || fg,
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
   * @param {number}  mod - Sector (0) or project (1)
   * @param {Array=}  val  - Values
   * @param {string=} fg   - Foreground colour
   * @return {Object} Focus bar
   */
  focusBar (mod, val = [], fg = Log.config.fg) {
    const fr = document.createDocumentFragment();
    if (mod < 0 || mod > 1) return fr;
    const l = val.length;
    if (l === 0) return fr;

    const pal = Palette[mod === 0 ? 'sp' : 'pp'];
    const segEl = ø('div', {className: 'hf lf'});

    for (let i = 0; i < l; i++) {
      const seg = segEl.cloneNode();
      const {n, p} = val[i];

      Ø(seg.style, {
        backgroundColor: pal[n] || fg,
        width: `${p}%`
      });

      fr.append(seg);
    }

    return fr;
  },

  /**
   * Generate focus chart
   * @param {Array=}  data - Chart data
   * @param {string=} fg   - Foreground colour
   * @return {Object} Chart
   */
  focusChart (data = [], fg = Log.config.fg) {
    const fr = document.createDocumentFragment();
    const l = data.length;
    if (l === 0) return fr;

    const column = ø('div', {className: 'dib hf'});
    const core = ø('div', {className: 'psa sw1 b0 hf'});

    column.style.width = `${100 / l}%`;
    core.style.backgroundColor = fg;

    for (let i = 0; i < l; i++) {
      const cl = column.cloneNode();
      const cr = core.cloneNode();
      const v = data[i];

      if (v !== 1) {
        cr.style.height = `${data[i] * 100}%`;
      }

      cl.append(cr);
      fr.append(cl);
    }

    return fr;
  },

  /**
   * Generate legend
   * @param {number}  mod - Sector (0) or project (1)
   * @param {Array=}  val
   * @param {string=} fg
   * @return {Object} Legend
   */
  legend (mod, val = [], fg = Log.config.fg) {
    const fr = document.createDocumentFragment();
    if (mod < 0 || mod > 1) return fr;
    const l = val.length;
    if (l === 0) return fr;

    const pal = Palette[mod === 0 ? 'sp' : 'pp'];

    for (let i = 0; i < l; i++) {
      const {n, h, p} = val[i];
      const item = ø('li', {className: 'c3 mb3 f6 lhc'});

      const icon = ø('div', {
        onclick: () => Nav.toDetail(mod, n),
        className: 'dib sh3 sw3 mr2 brf vm c-pt'
      });

      const info = ø('div', {
        innerHTML: `${p.toFixed(2)}% ${n}`,
        className: 'dib vm sw6 elip tnum'
      });

      icon.style.backgroundColor = pal[n] || fg;

      item.append(icon);
      item.append(info);
      fr.append(item);
    }

    return fr;
  },

  /**
   * Generate list
   * @param {number}  mod      - Sector (0) or project (1)
   * @param {Array}   sort      - Sorted values
   * @param {LogSet=} set       - Set
   * @param {number=} set.count - Set log count
   * @param {number=} set.lh    - Set log hours
   * @param {Object=} config
   * @param {string=} config.cm - Colour mode
   * @param {string=} config.fg - Foreground colour
   * @return {Object} List
   */
  list (mod, sort = [], {count, lh} = Session, {cm, fg} = Log.config) {
    const fr = document.createDocumentFragment();
    if (mod < 0 || mod > 1) return fr;
    const l = sort.length;
    if (l === 0 || count === 0) return fr;

    function ä (e, className, innerHTML = '') {
      return ø(e, {className, innerHTML});
    }

    const pal = Palette[mod === 0 ? 'sp' : 'pp'];

    for (let i = 0; i < l; i++) {
      const {n, h, p} = sort[i];
      const item = ø('li', {
        className: `${i === l - 1 ? 'mb0' : 'mb4'} c-pt`,
        onclick: () => Nav.toDetail(mod, n)
      });

      const name = ä('span', 'dib xw6 elip', n);
      const span = ä('span', 'rf tnum', h.toStat());
      const bar = ä('div', 'sh1');

      Ø(bar.style, {
        width: `${p}%`,
        backgroundColor: (cm === 'none' ?
          fg : pal[n]) || fg
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
    const fr = document.createDocumentFragment();
    const ln = ø('div', {className: 'psa br o7'});

    for (let i = 0, x = 0, y = 100 / n; i < n; i++) {
      const l = ln.cloneNode();
      Ø(l.style, {
        height: i % 2 ? '100%' : '50%',
        left: `${x += y}%`
      });
      fr.append(l);
    }

    return fr;
  },

  /**
   * Generate peak chart
   * @param {number}  mod      - Hour (0) or day (1)
   * @param {Array=}  peaks
   * @param {Object=} config
   * @param {string=} config.ac - Accent colour
   * @param {string=} config.fg - Foreground colour
   * @return {Object} Chart
   */
  peakChart (mod, peaks = [], {ac, fg} = Log.config) {
    const fr = document.createDocumentFragment();
    if (mod < 0 || mod > 1) return fr;
    const l = peaks.length;
    if (l === 0) return fr;

    function perc (v) { return `${v / max * 100}%`; }

    function genCore (i, val) {
      const core = ø('div', {
        className: 'psa b0 sw1 c-pt hoverCol',
        onmouseover: () => label(i),
        onmouseout: () => label()
      });

      Ø(core.style, {
        backgroundColor: i === now ? ac : fg,
        height: perc(val)
      });

      return core;
    }

    const colEl = ø('div', {className: 'dib hf psr'});
    const manEl = ø('div', {className: 'sw1 hf cn'});
    colEl.style.width = `${100 / l}%`;
    const max = Math.max(...peaks);
    const d = new Date;

    let label = {};
    let now = 0;

    if (mod === 1) {
      label = UI.util.setDayLabel;
      now = d.getDay();
    } else {
      label = UI.util.setTimeLabel;
      now = d.getHours();
    }

    for (let i = 0; i < l; i++) {
      const column = colEl.cloneNode();
      const mantle = manEl.cloneNode();
      const core = genCore(i, peaks[i]);

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

    const row = ø('div', {className: 'db wf sh1 mt2 mb2 visRow'});
    const ent = ø('div', {className: 'psr t0 hf mb1 lf'});

    for (let i = 0; i < l; i++) {
      const r = row.cloneNode();
      const ol = data[i].length;

      F.append(r);

      if (ol === 0) continue;
      for (let o = 0; o < ol; o++) {
        const e = ent.cloneNode();
        Ø(e.style, data[i][o]);
        r.append(e);
      }
    }

    return F;
  }
}

module.exports = Vis;
