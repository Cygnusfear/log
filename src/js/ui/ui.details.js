'use strict';

const Details = {

  /**
   * Build Details
   * @param {Set} ovw
   * @return {Object}
   */
  build (ovw) {
    function ä (id, className) {
      return ø('div', {id, className});
    }

    const f = document.createDocumentFragment();
    const d = document.createElement('div');
    const m = ø('div', {className: 'oya'});
    const a = ä('SUM', 'nodrag subsect oya hvs');
    const b = ä('SSC', 'dn subsect');
    const c = ä('PSC', 'dn subsect');

    f.append(this.menu());
    f.append(m);
      m.append(a);
        a.append(this.summary.build(ovw));
      m.append(b);
      m.append(c);
      if (Session.count > 1) {
        b.append(this.detail.build(0, Session.sortValues(0)[0].n));
        c.append(this.detail.build(1, Session.sortValues(1)[0].n));
      }

    return f;
  },

  /**
   * Build Details menu
   * @return {Object}
   */
  menu () {
    function ä (i, h, c = 'db mb3 subtab on bg-cl o5 mr3') {
      m.append(ø('button', {
        id: `b-${i}`, className: c, innerHTML: h,
        onclick: () => Nav.tab(i, 'subsect', 'subtab', true)
      }));
    }

    const m = document.createElement('div');

    ä('SUM', Glossary.summary, 'db mb3 subtab on bg-cl of mr3');
    ä('SSC', Glossary.sec.plural);
    ä('PSC', Glossary.pro.plural);

    return m;
  },

  summary: {

    /**
     * Build Summary
     * @param {Set} o - Overview
     * @return {Object}
     */
    build (o) {
      const f = document.createDocumentFragment();

      f.append(this.stats());
      f.append(this.peaks());
      f.append(this.focus(o));
      f.append(this.distri());

      return f;
    },

    /**
     * Build Summary stats
     * @return {Object}
     */
    stats () {
      function ä (e, className, innerHTML = '') {
        return ø(e, {className, innerHTML});
      }

      const dur = Session.listDurations();
      const container = document.createElement('div');
      const list = ä('ul', 'mb5 lsn f6 lhc r');
      const s = [
        {
          n: Glossary.stats.sum,
          v: sum(dur).toStat()
        }, {
          n: Glossary.stats.minDur,
          v: min(dur).toStat()
        }, {
          n: Glossary.stats.maxDur,
          v: max(dur).toStat()
        }, {
          n: 'Range',
          v: range(dur).toStat()
        }, {
          n: Glossary.stats.avgDur,
          v: avg(dur).toStat()
        }, {
          n: Glossary.stats.daily,
          v: Session.dailyAvg().toStat()
        }, {
          n: 'Standard Deviation',
          v: sd(dur).toStat()
        }, {
          n: Glossary.stats.cov,
          v: `${Session.coverage().toFixed(2)}%`
        }, {
          n: Glossary.entries,
          v: Log.entries.length
        }, {
          n: Glossary.sec.plural,
          v: Log.cache.sec.length
        }, {
          n: Glossary.pro.plural,
          v: Log.cache.pro.length
        }
      ];

      for (let i = 0; i < s.length; i++) {
        const item = ä('li', 'mb4 c3');
        item.append(ä('p', 'f4 fwb', s[i].v));
        item.append(ä('p', 'o9', s[i].n));
        list.append(item);
      }

      container.append(list);
      return container;
    },

    /**
     * Build Summary peaks
     * @return {Object}
     */
    peaks () {
      function ä (e, c, i = '') {
        return ø(e, {className: c, innerHTML: i});
      }

      const c = document.createElement('div');
      const title = ä('h3', 'mb3 f6 lhc', Glossary.peaks);
      const a = ä('div', 'dib mb4 pr4 lf sh6 w5');
      const b = ä('div', 'dib mb4 pl4 lf sh6 w5');
      const h = ä('div', 'psr hf wf');
      const d = h.cloneNode();
      const stats = ä('ul', 'mb5 lsn f6 lhc r');

      const s = [
        {n: Glossary.ph, v: Session.peakHour()},
        {n: Glossary.pd, v: Session.peakDay()},
        {n: Glossary.pm, v: Session.peakMonth()}
      ];

      const dayChart = UI.vis.peakChart(0, Log.cache.pkh);
      const weekChart = UI.vis.peakChart(1, Log.cache.pkd);

      for (let i = 0; i < 3; i++) {
        const item = ä('li', 'mb0 c3');
        item.append(ä('p', 'f4 fwb', s[i].v));
        item.append(ä('p', 'o9', s[i].n));
        stats.append(item);
      }

      c.append(title);
      c.append(a);
        a.append(h);
          h.append(dayChart);
      c.append(b);
        b.append(d);
          d.append(weekChart);
      c.append(stats);

      return c;
    },

    /**
     * Build Summary focus
     * @param {Set} o - Overview
     * @return {Object}
     */
    focus (o) {
      function ä (e, className, innerHTML = '') {
        return ø(e, {className, innerHTML});
      }

      const d = document.createElement('div');
      const c = ä('div', 'psr mb4 wf sh5');
      const st = ä('ul', 'mb5 lsn f6 lhc r');

      const pf = Session.listFocus(1);
      const s = [
        {n: Glossary.stats.minFoc, v: min(pf)},
        {n: Glossary.stats.maxFoc, v: max(pf)},
        {n: Glossary.stats.avgFoc, v: avg(pf)},
        {n: 'Standard Deviation', v: sd(pf)}
      ];

      for (let i = 0, l = s.length; i < l; i++) {
        const itm = ä('li', 'c3');
        itm.append(ä('p', 'f4 fwb', s[i].v.toFixed(2)));
        itm.append(ä('p', 'o9', s[i].n));
        st.append(itm);
      }

      d.append(ä('h3', 'mb3 f6 lhc', Glossary.stats.foc));
      d.append(c);
        c.append(UI.vis.focusChart(o.listFocus(1)));
      d.append(st);

      return d;
    },

    /**
     * Build Summary distribution
     * @return {Object}
     */
    distri () {
      const v = Session.sortValues(0, 1);
      const d = document.createElement('div');
      const b = ø('div', {className: 'mb3 wf sh2'});
      const l = ø('ul', {className: 'lsn r'});

      d.append(ø('h3', {
        className: 'mb3 f6 lhc',
        innerHTML: Glossary.sec.plural
      }));
      d.append(b);
        b.append(UI.vis.focusBar(0, v));
      d.append(l);
        l.append(UI.vis.legend(0, v));

      return d;
    }
  },

  detail: {

    /**
     * Build Detail page
     * @param {number}  mode - Sector (0) or project (1)
     * @param {string}  key - Sector or project name
     * @param {number=} view
     * @return {Object}
     */
    build (mode, key, view = Log.config.vw) {
      const rec = new Set(Session.recent(view - 1));
      let ent = {};
      let his = {};
      let sec = 'secsect';
      let ss = 'SST';
      let es = 'SEN';

      if (mode === 0) {
        ent = new Set(rec.bySector(key));
        his = new Set(Session.bySector(key));
      } else {
        ent = new Set(rec.byProject(key));
        his = new Set(Session.byProject(key));
        sec = 'prosect';
        ss = 'PST';
        es = 'PEN';
      }

      const pd = his.peakDays();
      const ph = his.peakHours();
      const fr = document.createDocumentFragment();
      const cn = ø('div', {className: 'nodrag oys hvs'});
      const s1 = ø('div', {id: ss, className: sec});
      const s2 = ø('div', {id: es, className: `dn ${sec}`});

      fr.append(cn);
        cn.append(this.head(key, ent));
        cn.append(this.tabs(mode));
        cn.append(s1);
          s1.append(this.ovw(ent));
          s1.append(this.stats(his));
          s1.append(this.peaks(ph, pd));
          s1.append(this.focus(mode, ent, his));
          s1.append(this.distri(mode, ent, his));
        cn.append(s2);
          s2.append(this.entries(mode, his));
      fr.append(this.list(mode));

      return fr;
    },

    /**
     * Build Detail head
     * @param {string}  key - Sector/project
     * @param {Object}  set
     * @param {number}  set.count
     * @param {Object}  set.last
     * @param {number=} view
     * @return {Object}
     */
    head (key, {count, last}, view = Log.config.vw) {
      const F = document.createDocumentFragment();

      F.append(ø('h2', {
        className: 'mb0 f4 lht',
        innerHTML: key
      }));

      F.append(ø('p', {
        className: 'mb2 f6 o7',
        innerHTML: count === 0 ?
          `No activity in the past ${view} days` :
          `Updated ${last.end.ago()}`
      }));

      return F;
    },

    /**
     * Build Detail overview
     * @param {Set} set
     * @return {Object}
     */
    ovw (set) {
      const o = ø('div', {className: 'psr'});
      if (set.count > 0) o.append(UI.vis.barChart(set.bar()));
      return o;
    },

    /**
     * Build Detail tabs
     * @param {number=} mode - Sector (0) or project (1)
     * @return {Object}
     */
    tabs (mode = 0) {
      function ä (i, innerHTML, c) {
        t.append(ø('button', {
          className: `pv1 sectab on bg-cl ${c}`,
          onclick: () => Nav.tab(i, sec, tab),
          id: `b-${i}`,
          innerHTML
        }));
      }

      const t = ø('div', {className: 'mb3 lhc'});

      let sec = '';
      let tab = '';
      let sta = '';
      let ent = '';

      if (mode === 0) {
        sec = 'secsect';
        tab = 'sectab';
        sta = 'SST';
        ent = 'SEN';
      } else {
        sec = 'prosect';
        tab = 'protab';
        sta = 'PST';
        ent = 'PEN';
      }

      ä(sta, Glossary.stat, 'of mr3');
      ä(ent, Glossary.entries, 'o5');

      return t;
    },

    /**
     * Build Detail stats
     * @param {Set} histoire
     * @return {Object}
     */
    stats (histoire) {
      function ä (e, c, i = '') {
        return ø(e, {className: c, innerHTML: i});
      }

      const div = document.createElement('div');
      const list = ä('ul', 'lsn f6 lhc r');
      const dur = histoire.listDurations();
      const lex = Glossary;

      const s = [
        {v: sum(dur).toStat(),   n: lex.stats.sum},
        {v: min(dur).toStat(),   n: lex.stats.minDur},
        {v: max(dur).toStat(),   n: lex.stats.maxDur},
        {v: avg(dur).toStat(),   n: lex.stats.avgDur},
        {v: histoire.count,      n: lex.entries},
        {v: histoire.streak(),   n: lex.stats.streak},
        {v: histoire.peakHour(), n: lex.ph},
        {v: histoire.peakDay(),  n: lex.pd}
      ];

      for (let i = 0, sl = s.length; i < sl; i++) {
        const item = ä('li', 'mb4 c3');
        item.append(ä('p', 'f4 fwb', s[i].v));
        item.append(ä('p', 'o9', s[i].n));
        list.append(item);
      }

      div.append(list);
      return div;
    },

    /**
     * Build Detail peaks
     * @param {Array} pkh
     * @param {Array} pkd
     * @return {Object}
     */
    peaks (pkh, pkd) {
      function ä (className) {
        return ø('div', {className});
      }

      const w = document.createElement('div');
      const a = ä('dib mb4 pr4 lf sh6 w5');
      const b = ä('dib mb4 pl4 lf sh6 w5');
      const h = ä('psr hf wf');
      const d = h.cloneNode();
      const t = ø('h3', {
        innerHTML: Glossary.peaks,
        className: 'mb3 f6'
      });

      w.append(t);
      w.append(a);
        a.append(h);
          h.append(UI.vis.peakChart(0, pkh));
      w.append(b);
        b.append(d);
          d.append(UI.vis.peakChart(1, pkd));

      return w;
    },

    /**
     * Build Detail focus
     * @param {Array} ent
     * @param {Array} sortHis
     * @return {Object}
     */
    focus (mode, ent, his) {
      function ä (el, className, innerHTML = '') {
        return ø(el, {className, innerHTML});
      }

      const mod = 1 >> mode;
      const foci = his.listFocus(mod);
      const d = document.createElement('div');
      const stats = ä('ul', 'mb4 lsn f6 lhc r');
      const chart = ä('div', 'psr mb4 wf');

      const focusStats = [
        {n: Glossary.stats.minFoc, v: min(foci)},
        {n: Glossary.stats.maxFoc, v: max(foci)},
        {n: Glossary.stats.avgFoc, v: avg(foci)},
      ];

      for (let i = 0; i < 3; i++) {
        const {n, v} = focusStats[i];
        const item = ä('li', 'c3');
        item.append(ä('p', 'f4 fwb', v.toFixed(2)));
        item.append(ä('p', 'o9', n));
        stats.append(item);
      }

      if (ent.count > 0) {
        chart.append(UI.vis.focusChart(ent.listFocus(mod)));
      }

      d.append(ä('h3', 'mb3 f6', Glossary.stats.foc));
      d.append(chart);
      d.append(stats);

      return d;
    },

    /**
     * @param {number} mode - Sector (0) or project (1)
     * @param {Array}  ent  - Entries
     * @param {Array}  his  - Entries
     */
    distri (mode, ent, his) {
      const d = document.createElement('div');
      const b = ø('div', {className: 'mb3 wf sh2'});
      const l = ø('ul', {className: 'lsn r'});

      if (ent.count > 0) {
        const m = 1 >> mode;
        const v = his.sortValues(m, 1);
        b.append(UI.vis.focusBar(m, v));
        l.append(UI.vis.legend(m, v));
      }

      d.append(ø('h3', {
        innerHTML: mode === 0 ?
          Glossary.pro.plural :
          Glossary.sec.plural,
        className: 'mb3 f6'
      }));

      d.append(b);
      d.append(l);

      return d;
    },

    /**
     * Build Detail entries
     * @param {number} mode - Sector (0) or project (1)
     * @param {Array} his
     * @return {Object}
     */
    entries (mode, his) {
      const t = ø('table', {className: 'wf bn f6'});
      const b = ø('tbody', {className: 'nodrag'});
      const h = document.createElement('thead');
      const r = document.createElement('tr');

      const n = [
        Glossary.date,
        Glossary.time,
        Glossary.span,
        mode === 0 ?
          Glossary.pro.singular :
          Glossary.sec.singular
      ];

      const rev = his.logs.slice(his.count - 100).reverse();

      function td (i, c = '') {
        return ø('td', {innerHTML: i, className: c});
      }

      for (let i = 0, l = rev.length; i < l; i++) {
        const {s, e, c, t, d, id} = rev[i];
        const key = mode === 0 ? t : c;
        const row = document.createElement('tr');

        row.append(td(id + 1, 'pl0'));
        row.append(td(s.display()));
        row.append(td(`${s.stamp()}–${e.stamp()}`));
        row.append(td(duration(s, e).toFixed(2)));

        row.append(ø('td', {
          innerHTML: key,
          className: 'c-pt',
          onclick: () => Nav.toDetail(1 >> mode, key)
        }));

        row.append(td(d, 'pr0'));

        b.append(row);
      }

      t.append(h);
        h.append(r);
          r.append(ø('th', {
            className: 'pl0', innerHTML: Glossary.id
          }));

          for (let i = 0, l = n.length; i < l; i++) {
            r.append(ø('th', {innerHTML: n[i]}));
          }

          r.append(ø('th', {
            className: 'pr0', innerHTML: Glossary.desc
          }));
      t.append(b);

      return t;
    },

    /**
     * Build Detail list
     * @param {number} mode - Sector (0) or project (1)
     * @return {Object}
     */
    list (mode) {
      const l = ø('ul', {className: 'nodrag oys lsn f6 lhc hvs'});

      if (Session.count > 1) {
        const data = Session.sortValues(mode, 0);
        l.append(UI.vis.list(mode, data));
      }

      return l;
    }
  }
}

module.exports = Details;
