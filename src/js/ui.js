'use strict';

/**
 * Create Object
 * @param {string|Object} el
 * @param {Object} params
 * return {Object}
 */
function ø (el, params) {
  const e = typeof el === 'string' ?
    document.createElement(el) : el;
  return Object.assign(e, params);
}

Log.ui = {

  /**
   * Build UI
   * @param {number} [view]
   */
  build (view = Log.config.ui.view) {
    const ovw = new Set(Log.log.recent(view - 1));
    const sor = Log.cache.sor.slice(-1)[0];
    const tdy = new Set(!Log.log.last.e ? sor.slice(0, -1) : sor);

    const F = document.createDocumentFragment();
    const M = document.createElement('main');

    function ä (id, className) {
      Log.nav.menu[Log.nav.menu.length] = id;
      return ø('div', {id, className});
    }

    const c = ø('div', {id: 'container', className: 'hf'});
    const o = ä('OVW', 'sect');
    const d = ä('DTL', 'dn sect');
    const v = ä('VIS', 'nodrag dn sect oya oxh');
    const e = ä('ENT', 'dn sect oya hvs');
    const j = ä('JOU', 'dn sect oya hvs');
    const g = ä('GUI', 'dn sect hf wf oys oxh');

    F.append(c);
      c.append(this.header.build());
      c.append(M);
        M.append(o);
          o.append(this.overview.build(tdy, ovw));
        M.append(d);
          d.append(this.details.build(ovw));
        M.append(v);
          v.append(this.visualisation(ovw));
        M.append(e);
          e.append(this.entries.build());
        M.append(j);
          j.append(this.journal.build());
        M.append(g);
          // g.append(Log.ui.guide.build());
      c.append(this.delModal());
    F.append(this.commander());

    ui.append(F);
  },

  header: {

    /**
     * Build Header
     * @return {Node}
     */
    build () {
      const h = ø('header', {
        className: 'mb2 f6 lhc'
      });

      const t = ø('h1', {
        className: 'dib mr3 f5 upc tk',
        innerHTML: 'Log'
      });

      h.appendChild(t);
      h.appendChild(this.nav());
      h.appendChild(this.clock());

      return h;
    },

    /**
     * Build Navigation
     * @return {Node}
     */
    nav () {
      const F = document.createDocumentFragment();
      const {tabs} = Log.lexicon;

      function ä (id, i, c = 'pv1 tab on bg-cl o5 mr3') {
        F.append(ø('button', {
          className: c,
          innerHTML: i,
          id: `b-${id}`,
          onclick: () => Log.tab(id)
        }));
      }

      ä('OVW', tabs.overview, 'pv1 tab on bg-cl of mr3');
      ä('DTL', tabs.details);
      ä('VIS', tabs.vis);
      ä('ENT', tabs.entries);
      ä('JOU', tabs.journal);
      ä('GUI', tabs.guide);

      return F;
    },

    /**
     * Build Clock
     * @return {Node}
     */
    clock () {
      const c = ø('span', {
        className: 'rf f5 di tnum',
        innerHTML: '00:00:00'
      });

      Log.timerEl = c;
      Log.timer();
      return c;
    }
  },

  /**
   * Build Main
   * @return {Node}
   */
  main () {
    function ä (id, className) {
      m.append(ø('div', {id, className}));
    }

    const m = document.createElement('div');

    ä('OVW', 'sect');
    ä('DTL', 'dn sect');
    ä('VIS', 'nodrag dn sect oya oxh');
    ä('ENT', 'dn sect oya hvs');
    ä('JOU', 'dn sect oya hvs');
    ä('GUI', 'dn sect oys oxh');

    return m;
  },

  overview: {

    /**
     * Build Overview
     * @param {Set} t - Today
     * @param {Set} o - Overview
     * @return {Node}
     */
    build (t, o) {
      function ä (id, className) {
        return ø('div', {id, className});
      }

      const f = document.createDocumentFragment();
      const c = ä('ovwC', 'oya ns');
      const r = ä('ovwR', 'f6 lhc');

      f.append(this.top(t));
      f.append(this.peaks());
      f.append(c);
        c.append(this.recent());
        c.append(this.chart(o));
        c.append(this.stats(t));
      f.append(r);
        r.append(this.lists(t));

      return f;
    },

    /**
     * Build Overview Top
     * @param {Set} t - Today
     * @return {Node}
     */
    top (t) {
      const d = ø('div', {id: 'ovwT'});
      const m = ø('div', {className: 'mb3 psr wf sh2 bl br'});
      const c = ø('div', {className: 'psr wf sh2 nodrag'});

      d.append(m);
        m.append(Log.vis.meterLines());
      d.append(c);
        c.append(Log.vis.dayChart(t.entries) || '');

      return d;
    },

    /**
     * Build Overview Left
     * @return {Node}
     */
    peaks () {
      const {lexicon, data, vis, cache} = Log;
      const ä = (e, c, i = '') => ø(e, {className: c, innerHTML: i});

      const ol = ø('div', {id: 'ovwL'});
      const ph = document.createElement('div');
      const pd = document.createElement('div');
      const hc = ä('div', 'psr h7 wf nodrag');
      const dc = hc.cloneNode();
      const st = new Set(Log.log.sortByDay()[(new Date).getDay()]);
      const pt = st.peakHours();

      ol.append(ä('h3', 'mb3 f6 lhc', lexicon.peaks));
      ol.append(ph);
        ph.append(ø('h3', {id: 'ch', className: 'mb2 f6 lhc fwn tnum'}));
        ph.append(hc);
          hc.append(vis.peakChart(0, pt));
      ol.append(pd);
        pd.append(ø('h3', {id: 'cd', className: 'mb2 f6 lhc fwn'}));
        pd.append(dc);
          dc.append(vis.peakChart(1, cache.pkd));

      return ol;
    },

    /**
     * Build Overview Recent
     * @return {Node}
     */
    recent () {
      const {time, log, lexicon} = Log;
      const {id, s, e, c, t, d} = log.entries.slice(-1)[0];
      const st = time.stamp(s);
      const le = document.createElement('div');
      const lt = ø('table', {className: 'wf bn f6 lhc'});
      const th = ø('thead', {className: 'al'});
      const tb = document.createElement('tbody');
      const r1 = document.createElement('tr');
      const r2 = document.createElement('tr');

      le.append(lt);
        lt.append(th);
          th.append(r1);
            r1.append(ø('th', {
              className: 'pb1 pt0 pl0', innerHTML: lexicon.recent
            }));
        lt.append(tb);
          tb.append(r2);
            r2.append(ø('td', {className: 'pl0', innerHTML: id + 1}));
            r2.append(ø('td', {
              innerHTML: `${st} - ${!e ? '' : time.stamp(e)}`
            }));
            r2.append(ø('td', {innerHTML: c}));
            r2.append(ø('td', {innerHTML: t}));
            r2.append(ø('td', {className: 'pr0', innerHTML: d}));

      return le;
    },

    /**
     * Build Overview Chart
     * @param {Set} ovw
     * @return {Node}
     */
    chart (ovw) {
      const c = ø('div', {className: 'psr'});
      const b = Log.vis.barChart(ovw.bar());
      c.append(b || '');
      return c;
    },

    /**
     * Build Overview stats
     * @param {Set} today
     * @return {Node}
     */
    stats (today) {
      const ä = (e, className, innerHTML = '') => {
        return ø(e, {className, innerHTML});
      }

      const stats = ä('ul', 'lsn f6 lhc');
      const {data, log, time, lexicon} = Log;
      const dur = today.durations;

      const s = [
        {
          n: lexicon.stats.sum,
          v: data.stat(data.sum(dur))
        }, {
          n: lexicon.stats.minDur,
          v: data.stat(data.min(dur))
        }, {
          n: lexicon.stats.maxDur,
          v: data.stat(data.max(dur))
        }, {
          n: lexicon.stats.avgDur,
          v: data.stat(data.avg(dur))
        }, {
          n: lexicon.stats.cov,
          v: `${today.coverage().toFixed(2)}%`
        }, {
          n: lexicon.stats.foc,
          v: today.projectFocus().toFixed(2)
        }, {
          n: lexicon.entries,
          v: today.count
        }, {
          n: lexicon.stats.streak,
          v: Log.log.streak(),
        },
      ];

      for (let i = 0, l = s.length; i < l; i++) {
        const item = ä('li', 'mb3 c3');
        item.append(ä('p', 'f4 fwb', s[i].v));
        item.append(ä('p', 'o9', s[i].n));
        stats.append(item);
      }

      return stats;
    },

    /**
     * Build Overview lists
     * @param {Set} today
     * @return {Node}
     */
    lists (today) {
      const ä = innerHTML => ø('h3', {className: 'mb3 f5 lhc', innerHTML});

      const fr = document.createDocumentFragment();
      const ds = document.createElement('div');
      const dp = document.createElement('div');

      const le = ø('ul', {className: 'nodrag lsn h8 oya hvs'});
      const sl = le.cloneNode();
      const pl = le.cloneNode();

      const sd = Log.vis.list(0, today.sortValues(0, 0), today);
      const pd = Log.vis.list(1, today.sortValues(1, 0), today);

      fr.append(ds);
        ds.append(ä(Log.lexicon.sec.plural));
        ds.append(sl);
          sl.append(sd || '');
      fr.append(dp);
        dp.append(ä(Log.lexicon.pro.plural));
        dp.append(pl);
          pl.append(pd || '');

      return fr;
    }
  },

  details: {

    /**
     * Build Details
     * @param {Set} ovw
     * @return {Node}
     */
    build (ovw) {
      const {data: {sortValues}, log} = Log;
      const f = document.createDocumentFragment();
      const d = document.createElement('div');

      const ä = (id, className) => ø('div', {id, className});

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
        if (log.count > 1) {
          b.append(this.detail.build(0, Log.log.sortValues(0, 0)[0].n));
          c.append(this.detail.build(1, Log.log.sortValues(1, 0)[0].n));
        }

      return f;
    },

    /**
     * Build Details menu
     * @return {Node}
     */
    menu () {
      function ä (i, h, c = 'db mb3 subtab on bg-cl o5 mr3') {
        m.append(ø('button', {
          id: `b-${i}`, className: c, innerHTML: h,
          onclick: () => Log.tab(i, 'subsect', 'subtab', true)
        }));
      }

      const m = document.createElement('div');

      ä('SUM', Log.lexicon.summary, 'db mb3 subtab on bg-cl of mr3');
      ä('SSC', Log.lexicon.sec.plural);
      ä('PSC', Log.lexicon.pro.plural);

      return m;
    },

    summary: {

      /**
       * Build Summary
       * @param {Set} o - Overview
       * @return {Node}
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
       * @return {Node}
       */
      stats () {
        function ä (e, className, innerHTML = '') {
          return ø(e, {className, innerHTML});
        }

        const {lexicon, data, cache} = Log;
        const container = document.createElement('div');
        const list = ä('ul', 'mb5 lsn f6 lhc r');
        const s = [
          {
            n: lexicon.stats.sum,
            v: data.stat(data.sum(cache.dur))
          }, {
            n: lexicon.stats.minDur,
            v: data.stat(data.min(cache.dur))
          }, {
            n: lexicon.stats.maxDur,
            v: data.stat(data.max(cache.dur))
          }, {
            n: 'Range',
            v: data.stat(data.range(cache.dur))
          }, {
            n: lexicon.stats.avgDur,
            v: data.stat(data.avg(cache.dur))
          }, {
            n: lexicon.stats.daily,
            v: data.stat(Log.log.dailyAvg())
          }, {
            n: 'Standard Deviation',
            v: data.stat(data.sd(cache.dur))
          }, {
            n: lexicon.stats.cov,
            v: `${Log.log.coverage().toFixed(2)}%`
          }, {
            n: lexicon.entries,
            v: Log.entries.length
          }, {
            n: lexicon.sec.plural,
            v: cache.sec.length
          }, {
            n: lexicon.pro.plural,
            v: cache.pro.length
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
       * @return {Node}
       */
      peaks () {
        const ä = (e, c, i = '') => ø(e, {className: c, innerHTML: i});
        const {cache, data, lexicon, vis} = Log;

        const c = document.createElement('div');
        const title = ä('h3', 'mb3 f6 lhc', lexicon.peaks);
        const a = ä('div', 'dib mb4 pr4 lf sh6 w5');
        const b = ä('div', 'dib mb4 pl4 lf sh6 w5');
        const h = ä('div', 'psr hf wf');
        const d = h.cloneNode();
        const stats = ä('ul', 'mb5 lsn f6 lhc r');

        const s = [
          {n: lexicon.ph, v: Log.log.peakHour()},
          {n: lexicon.pd, v: Log.log.peakDay()},
          {n: lexicon.pm, v: '-'}
        ];

        const dayChart = vis.peakChart(0, cache.pkh);
        const weekChart = vis.peakChart(1, cache.pkd);

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
       * @return {Node}
       */
      focus (o) {
        const ä = (e, className, innerHTML = '') => {
          return ø(e, {className, innerHTML});
        }

        const {data, lexicon, vis} = Log;
        const d = document.createElement('div');
        const c = ä('div', 'psr mb4 wf sh5');
        const st = ä('ul', 'mb5 lsn f6 lhc r');

        const pf = Log.log.listFocus(1);
        const s = [
          {n: lexicon.stats.minFoc, v: data.min(pf)},
          {n: lexicon.stats.maxFoc, v: data.max(pf)},
          {n: lexicon.stats.avgFoc, v: data.avg(pf)},
          {n: 'Standard Deviation', v: data.sd(pf)}
        ];

        for (let i = 0, l = s.length; i < l; i++) {
          const itm = ä('li', 'c3');
          itm.append(ä('p', 'f4 fwb', s[i].v.toFixed(2)));
          itm.append(ä('p', 'o9', s[i].n));
          st.append(itm);
        }

        d.append(ä('h3', 'mb3 f6 lhc', lexicon.stats.foc));
        d.append(c);
          c.append(vis.focusChart(o.listFocus(1)));
        d.append(st);

        return d;
      },

      /**
       * Build Summary distribution
       * @return {Node}
       */
      distri () {
        const v = Log.log.sortValues(0, 1);
        const d = document.createElement('div');
        const b = ø('div', {className: 'mb3 wf sh2'});
        const l = ø('ul', {className: 'lsn r'});

        d.append(ø('h3', {
          className: 'mb3 f6 lhc',
          innerHTML: Log.lexicon.sec.plural
        }));
        d.append(b);
          b.append(Log.vis.focusBar(0, v));
        d.append(l);
          l.append(Log.vis.legend(0, v));

        return d;
      }
    },

    detail: {

      /**
       * Build Detail page
       * @param {number} mode - Sector (0) or project (1)
       * @param {string} key - Sector or project name
       * @param {number} [view]
       * @return {Node}
       */
      build (mode, key, view = Log.config.ui.view) {
        const rec = new Set(Log.log.recent(view - 1));
        let ent = {};
        let his = {};
        let sec = 'secsect';
        let ss = 'SST';
        let es = 'SEN';

        if (!mode) {
          ent = new Set(rec.bySector(key));
          his = new Set(Log.log.bySector(key));
        } else {
          ent = new Set(rec.byProject(key));
          his = new Set(Log.log.byProject(key));
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
       * @param {string} key - Sector/project
       * @param {Object} set
       * @param {number} set.count
       * @param {Object} set.last
       * @param {number} [view]
       * @return {Node}
       */
      head (key, {count, last}, view = Log.config.ui.view) {
        const f = document.createDocumentFragment();

        f.append(ø('h2', {className: 'mb0 f4 lht', innerHTML: key}));
        f.append(ø('p', {
          className: 'mb2 f6 o7',
          innerHTML: !count ?
            `No activity in the past ${view} days` :
            `Updated ${Log.time.ago(last.e)}`
        }));

        return f;
      },

      /**
       * Build Detail overview
       * @param {Set} set
       * @return {Node}
       */
      ovw (set) {
        const o = ø('div', {className: 'psr'});
        !!set.count && o.append(Log.vis.barChart(set.bar()));
        return o;
      },

      /**
       * Build Detail tabs
       * @param {number} [mode] - Sector (0) or project (1)
       * @return {Node}
       */
      tabs (mode = 0) {
        const t = ø('div', {className: 'mb3 lhc'});

        let sec = '';
        let tab = '';
        let sta = '';
        let ent = '';

        if (!mode) {
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

        const ä = (i, innerHTML, c) => {
          t.append(ø('button', {
            innerHTML,
            id: `b-${i}`,
            onclick: () => Log.tab(i, sec, tab),
            className: `pv1 sectab on bg-cl ${c}`
          }));
        }

        ä(sta, Log.lexicon.stat, 'of mr3');
        ä(ent, Log.lexicon.entries, 'o5');

        return t;
      },

      /**
       * Build Detail stats
       * @param {Set} his
       * @return {Node}
       */
      stats (his) {
        const ä = (e, c, i = '') => ø(e, {className: c, innerHTML: i});
        const {lexicon, data} = Log;

        const div = document.createElement('div');
        const list = ä('ul', 'lsn f6 lhc r');

        const dur = his.durations;

        const s = [
          {n: lexicon.stats.sum,    v: data.stat(data.sum(dur))},
          {n: lexicon.stats.minDur, v: data.stat(data.min(dur))},
          {n: lexicon.stats.maxDur, v: data.stat(data.max(dur))},
          {n: lexicon.stats.avgDur, v: data.stat(data.avg(dur))},
          {n: lexicon.entries,      v: his.count},
          {n: lexicon.stats.streak, v: his.streak()},
          {n: lexicon.ph,           v: his.peakHour()},
          {n: lexicon.pd,           v: his.peakDay()}
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
       * @param {Object[]} pkh
       * @param {Object[]} pkd
       * @return {Node}
       */
      peaks (pkh, pkd) {
        const w = document.createElement('div');
        const ä = className => ø('div', {className});
        const a = ä('dib mb4 pr4 lf sh6 w5');
        const b = ä('dib mb4 pl4 lf sh6 w5');
        const h = ä('psr hf wf');
        const d = h.cloneNode();

        const t = ø('h3', {
          innerHTML: Log.lexicon.peaks,
          className: 'mb3 f6'
        });

        w.append(t);
        w.append(a);
          a.append(h);
            h.append(Log.vis.peakChart(0, pkh));
        w.append(b);
          b.append(d);
            d.append(Log.vis.peakChart(1, pkd));

        return w;
      },

      /**
       * Build Detail focus
       * @param {Object[]} ent
       * @param {Object[]} sortHis
       * @return {Node}
       */
      focus (mode, ent, his) {
        const {data, lexicon, vis} = Log;
        const mod = 1 >> mode;
        const foci = his.listFocus(mod);

        const ä = (el, className, innerHTML = '') => {
          return ø(el, {className, innerHTML});
        }

        const d = document.createElement('div');
        const stats = ä('ul', 'mb4 lsn f6 lhc r');
        const chart = ä('div', 'psr mb4 wf');

        const focusStats = [
          {n: lexicon.stats.minFoc, v: data.min(foci)},
          {n: lexicon.stats.maxFoc, v: data.max(foci)},
          {n: lexicon.stats.avgFoc, v: data.avg(foci)},
        ];

        for (let i = 0; i < 3; i++) {
          const {n, v} = focusStats[i];
          const item = ä('li', 'c3');
          item.append(ä('p', 'f4 fwb', v.toFixed(2)));
          item.append(ä('p', 'o9', n));
          stats.append(item);
        }

        !!ent.count && chart.append(vis.focusChart(ent.listFocus(mod)));

        d.append(ä('h3', 'mb3 f6', lexicon.stats.foc));
        d.append(chart);
        d.append(stats);

        return d;
      },

      /**
       * @param {number} mode - Sector (0) or project (1)
       * @param {Object[]} ent - Entries
       * @param {Object[]} his - Entries
       */
      distri (mode, ent, his) {
        const d = document.createElement('div');
        const b = ø('div', {className: 'mb3 wf sh2'});
        const l = ø('ul', {className: 'lsn r'});

        if (!!ent.count) {
          const m = 1 >> mode;
          const v = his.sortValues(m, 1);
          b.append(Log.vis.focusBar(m, v));
          l.append(Log.vis.legend(m, v));
        }

        d.append(ø('h3', {
          innerHTML: !mode ?
            Log.lexicon.pro.plural :
            Log.lexicon.sec.plural,
          className: 'mb3 f6'
        }));

        d.append(b);
        d.append(l);

        return d;
      },

      /**
       * Build Detail entries
       * @param {number} mode - Sector (0) or project (1)
       * @param {Object[]} his
       * @return {Node}
       */
      entries (mode, his) {
        const t = ø('table', {className: 'wf bn f6'});
        const b = ø('tbody', {className: 'nodrag'});
        const h = document.createElement('thead');
        const r = document.createElement('tr');

        const n = [
          Log.lexicon.date,
          Log.lexicon.time,
          Log.lexicon.span,
          !mode ?
            Log.lexicon.pro.singular :
            Log.lexicon.sec.singular
        ];

        const rev = his.entries.slice(his.count - 100).reverse();
        const {stamp, displayDate, duration} = Log.time;

        const td = (i, c = '') => ø('td', {innerHTML: i, className: c});

        for (let i = 0, l = rev.length; i < l; i++) {
          const {s, e, c, t, d, id} = rev[i];
          const key = !mode ? t : c;
          const row = document.createElement('tr');

          row.append(td(id + 1, 'pl0'));
          row.append(td(displayDate(s)));
          row.append(td(`${stamp(s)}–${stamp(e)}`));
          row.append(td(duration(s, e).toFixed(2)));

          row.append(ø('td', {
            innerHTML: key,
            className: 'c-pt',
            onclick: () => Log.nav.toDetail(1 >> mode, key)
          }));

          row.append(td(d, 'pr0'));

          b.append(row);
        }

        t.append(h);
          h.append(r);
            r.append(ø('th', {
              className: 'pl0', innerHTML: Log.lexicon.id
            }));

            for (let i = 0, l = n.length; i < l; i++) {
              r.append(ø('th', {innerHTML: n[i]}));
            }

            r.append(ø('th', {
              className: 'pr0', innerHTML: Log.lexicon.desc
            }));
        t.append(b);

        return t;
      },

      /**
       * Build Detail list
       * @param {number} mode - Sector (0) or project (1)
       * @return {Node}
       */
      list (mode) {
        const l = ø('ul', {className: 'nodrag oys lsn f6 lhc hvs'});

        if (Log.log.count > 1) {
          const data = Log.log.sortValues(mode, 0);
          l.append(Log.vis.list(mode, data));
        }

        return l;
      }
    }
  },

  /**
   * Build Visualisation
   * @param {Set} o - Overview
   * @return {Node}
   */
  visualisation (o) {
    const ä = c => ø('div', {className: c});
    const f = document.createDocumentFragment();
    const m = ä('psr wf sh2 bl br');
    const v = ä('nodrag oys hvs');

    f.append(m);
      m.append(Log.vis.meterLines());
    f.append(v);
      v.append(Log.vis.visualisation(o.visualisation()));

    return f;
  },

  entries: {

    /**
     * Build Entries
     * @return {Node}
     */
    build () {
      const f = document.createDocumentFragment();
      f.append(this.table());
      f.append(this.modal());
      return f;
    },

    /**
     * Build Entries table
     * @return {Node}
     */
    table () {
      const ä = (e, c, i = '') => ø(e, {className: c, innerHTML: i});

      const t = ä('table', 'wf bn f6');
      const h = ä('thead', 'al');
      const b = ä('tbody', 'nodrag');

      const n = [
        Log.lexicon.date,
        Log.lexicon.time,
        Log.lexicon.span,
        'Score',
        Log.lexicon.sec.singular,
        Log.lexicon.pro.singular
      ];

      const el = Log.entries.length;
      const arr = Log.entries.slice(el - 100).reverse();

      const mean = Log.data.avg(Log.cache.dur);
      const sd = Log.data.sd(Log.cache.dur);

      for (let i = 0, l = arr.length; i < l; i++) {
        const {s, e, c, t, d} = arr[i];
        const sd = Log.time.toEpoch(s);
        const ed = Log.time.toEpoch(e);
        const st = Log.time.stamp(sd);
        const id = el - i - 1;
        const r = ø('tr', {id: `r${id}`});
        const time = document.createElement('td');
        const span = time.cloneNode();
        const zscore = time.cloneNode();

        if (!e) {
          time.innerHTML = `${st} –`;
          span.innerHTML = '—';
          zscore.innerHTML = '—';
        } else {
          const et = Log.time.stamp(Log.time.toEpoch(e));
          const dur = Log.time.duration(sd, ed);
          const score = dur - mean;

          time.innerHTML = `${st} – ${et}`;
          span.innerHTML = Log.data.stat(dur);
          zscore.innerHTML = Log.data.stat(score);
        }

        r.appendChild(ø('td', {
          innerHTML: el - i,
          className: 'pl0 c-pt hover',
          onclick: () => Log.edit(id)
        }));

        r.appendChild(ø('td', {
          className: 'c-pt hover',
          innerHTML: Log.time.displayDate(sd),
          onclick: () => Log.nav.toJournal(s)
        }));

        r.appendChild(time);
        r.appendChild(span);
        r.appendChild(zscore);

        r.appendChild(ø('td', {
          innerHTML: c,
          className: 'c-pt hover',
          onclick: () => Log.nav.toDetail(0, c)
        }));

        r.appendChild(ø('td', {
          innerHTML: t,
          className: 'c-pt hover',
          onclick: () => Log.nav.toDetail(1, t)
        }));

        r.appendChild(ä('td', 'pr0', d));
        b.appendChild(r);
      }

      t.append(h);
        h.append(ä('th', 'pl0', Log.lexicon.id));
        for (let i = 0, l = n.length; i < l; i++)
          h.append(ä('th', '', n[i]));
        h.append(ä('th', 'pr0', Log.lexicon.desc));
      t.append(b);

      return t;
    },

    /**
     * Build Entries modal
     * @param {Object} ui
     * @param {string} ui.bg
     * @param {string} ui.colour
     * @return {Node}
     */
    modal ({bg, colour} = Log.config.ui) {
      const m = ø('dialog', {
        id: 'editModal',
        className: 'p4 cn bn h6',
        onkeydown: e => {
          e.key === 'Escape' && (Log.modalMode = !1);
        }
      });

      const f = ø('form', {
        id: 'editForm',
        className: 'nodrag',
        onsubmit: () => !1
      });

      const i = ø('input', {className: 'db wf p2 mb3 bn'});

      ø(m.style, {backgroundColor: bg, color: colour});

      document.addEventListener('click', ({target}) => {
        if (target === m) {
          Log.modalMode = !1;
          m.close();
        }
      });

      f.addEventListener('submit', _ => {
        const e = !editEnd.value === '' ?
          '' : new Date(editEnd.value);

        Log.update(editEntryID.value, {
          s: Log.time.toHex(new Date(editStart.value)),
          e: e === '' ? undefined : Log.time.toHex(e),
          c: editSector.value,
          t: editProject.value,
          d: editDesc.value
        });

        Log.modalMode = !1;
      });

      m.append(ø('p', {id: 'editID', className: 'mb4 f6 lhc'}));
      m.append(f);
        f.append(ø('input', {id: 'editEntryID', type: 'hidden'}));

        f.append(ø(i.cloneNode(), {
          id: 'editSector', type: 'text', placeholder: 'Sector'}));

        f.append(ø(i.cloneNode(), {
          id: 'editProject', type: 'text', placeholder: 'Project'}));

        f.append(ø('textarea', {
          id: 'editDesc', className: 'db wf p2 mb3 bn',
          rows: '3', placeholder: 'Description (optional)'}));

        f.append(ø(i.cloneNode(), {
          id: 'editStart', type: 'datetime-local', step: '1'}));

        f.append(ø(i.cloneNode(), {
          id: 'editEnd', type: 'datetime-local', step: '1'}));

        f.append(ø('input', {
          id: 'editUpdate', className: 'dib p2 mr2 br1 bn',
          type: 'submit', value: 'Update'}));

        f.append(ø('input', {
          id: 'editCancel', className: 'dib p2 br1 bn',
          type: 'button', value: 'Cancel',
          onclick: () => {
            Log.modalMode = !1;
            m.close();
          }}));

      return m;
    }
  },

  journal: {

    /**
     * Build Journal
     * @return {Node}
     */
    build () {
      const f = document.createDocumentFragment();
      f.append(this.cal());
      f.append(this.modal());
      return f;
    },

    /**
     * Build Journal Calendar
     * @return {Node}
     */
    cal () {
      const c = ø('table', {className: 'cal nodrag hf wf f6 lhc c-pt bn'});
      const sy = new Date(2018,  0,  1);
      const ey = new Date(2018, 11, 31);
      const year = new Set(Log.log.byPeriod(sy, ey));
      const sort = year.sortEntries();

      if (!sort.length) return;

      for (let i = 0; i < 26; i++) {
        const row = document.createElement('tr');
        c.append(row);

        for (let o = 0; o < 14; o++) {
          const id = (14 * i) + o;
          const cell = document.createElement('td');
          const pos = sort[id];

          if (!!pos && !!pos.length) {
            const date = pos[0].s;
            const d = Log.time.displayDate(date);
            ø(cell, {
              innerHTML: d,
              onclick: () => Log.ui.journal.displayEntry(date)
            });
          } else {
            cell.innerHTML = '-----';
            cell.style.opacity = '0.1';
          }

          row.append(cell);
        }
      }

      return c;
    },

    /**
     * Build Journal Modal
     * @param {Object} [ui] - UI config
     * @param {string} [ui.bg] - Background colour
     * @param {string} [ui.colour] - Colour
     * @return {Node}
     */
    modal ({bg, colour} = Log.config.ui) {
      const ä = (el, className) => ø(el, {className});
      const m = ø('dialog', {id: 'entryModal', className: 'p4 cn bn h6'});
      const h2 = ø('h2', {id: 'journalDate', className: 'mb4 f6 lhc'});
      const t = ä('div', 'h2');
      const mt = ä('div', 'mb3 psr wf sh2 bl br');
      const sb = ä('div', 'r h7');
      const st = ä('ul', 'c3 hf oys pr4 lsn f6 lhc hvs');

      const {stats} = Log.lexicon;
      const s = [
        {id: 'jSUM', n: stats.abbr.sum},
        {id: 'jMIN', n: stats.abbr.minDur},
        {id: 'jMAX', n: stats.abbr.maxDur},
        {id: 'jAVG', n: stats.abbr.avgDur},
        {id: 'jCOV', n: stats.cov},
        {id: 'jFOC', n: stats.foc},
      ];

      ø(m.style, {backgroundColor: bg, color: colour});

      for (let i = 0, l = s.length; i < l; i++) {
        const stat = ø('li', {className: 'mb3'});
        const {id, n} = s[i];

        stat.append(ø('p', {id, innerHTML: '&ndash;', className: 'f4 fwb'}));
        stat.append(ø('p', {innerHTML: n, className: 'o9'}));

        st.append(stat);
      }

      m.append(h2);
      m.append(t);
        t.append(mt);
          mt.append(Log.vis.meterLines());
        t.append(ø('div', {id: 'jDyc', className: 'mb3 psr wf sh2'}));
      m.append(sb);
        sb.append(st);
        sb.append(ø('ul', {id: 'jEnt', className: 'c9 pl4 hf oys lsn hvs'}));

      return m;
    },

    /**
     * Display journal entry
     * @param {Date} [date]
     */
    displayEntry (date = new Date()) {
      const ent = new Set(Log.log.byDate(date));
      const l = ent.count;
      if (!l) return;

      const frg = document.createDocumentFragment();
      const dur = ent.durations;

      jDyc.innerHTML = '';
      jEnt.innerHTML = '';

      journalDate.innerHTML = `${Log.time.displayDate(date)} (${Log.days[date.getDay()]})`;

      jDyc.append(Log.vis.dayChart(ent.entries));

      jSUM.innerHTML = Log.data.stat(Log.data.sum(dur));
      jMIN.innerHTML = Log.data.stat(Log.data.min(dur));
      jMAX.innerHTML = Log.data.stat(Log.data.max(dur));
      jAVG.innerHTML = Log.data.stat(Log.data.avg(dur));
      jCOV.innerHTML = `${ent.coverage().toFixed(2)}%`;
      jFOC.innerHTML = ent.projectFocus().toFixed(2);

      const ä = (e, className, innerHTML) => ø(e, {className, innerHTML});

      for (let i = 0; i < l; i++) {
        const {id, s, e, c, t, d, dur} = ent.entries[i];
        const st = Log.time.stamp(s);
        const et = Log.time.stamp(e);

        const itm = ø('li', {className: 'f6 lhc pb3 mb3'});
        const idd = ä('span', 'mr3 o7', id + 1);
        const tim = ä('span', 'mr3 o7', `${st} &ndash; ${et}`);
        const sec = ä('span', 'mr3 o7', c);
        const pro = ä('span', 'o7', t);
        const spn = ä('span', 'rf o7', Log.data.stat(dur));
        const dsc = ä('p', 'f4 lhc', d);

        itm.append(idd);
        itm.append(tim);
        itm.append(sec);
        itm.append(pro);
        itm.append(spn);
        itm.append(dsc);
        frg.append(itm);
      }

      jEnt.append(frg);
      document.getElementById('entryModal').showModal();
    },
  },

  guide: {

    build () {

    },

    toc () {

    },

    content () {

    },

    about () {

    }

  },

  /**
   * Build entry deletion modal
   * @param {string} bg - Background colour
   * @param {string} dc - Default colour
   * @return {Node}
   */
  delModal (bg = Log.config.ui.bg, dc = Log.config.ui.colour) {
    const modal = ø('dialog', {
      className: 'p4 cn bn nodrag',
      id: 'delModal'
    });

    ø(modal.style, {backgroundColor: bg, color: dc});

    function ä (e, id, className, innerHTML = '') {
      modal.append(ø(e, {id, className, innerHTML}));
    }

    ä('p', 'delMessage', 'mb4 f6 lhc');
    ä('ul', 'delList', 'mb3 lsn');
    ä('button', 'delConfirm', 'p2 br1 bn f6', 'Delete')

    modal.appendChild(ø('button', {
      className: 'p2 br1 bn f6 lhc',
      innerHTML: 'Cancel',
      onclick: () => {
        Log.modalMode = false;
        modal.close();
      }
    }));

    return modal;
  },

  /**
   * Build commander
   * @return {Node}
   */
  commander () {
    const commander = ø('form', {
      className: 'dn psf b0 l0 wf f6 z9',
      onsubmit: () => false,
      action: '#'
    });

    const input = ø('input', {
      className: 'wf bg-0 blanc on bn p3',
      placeholder: Log.lexicon.console,
      autofocus: 'autofocus',
      type: 'text'
    });

    commander.addEventListener('submit', _ => {
      const {history} = Log.console;
      const val = input.value;

      Log.comIndex = 0;

      if (val !== '') {
        const l = history.length;

        val !== history[l - 1] && (history[l] = val);
        l >= 100 && history.shift();

        localStorage.setItem('histoire', JSON.stringify(history));
        Log.console.parse(val);
      }

      commander.style.display = 'none';
      input.value = '';
    });

    Log.commander = commander;
    Log.commanderInput = input;
    commander.append(input);
    return commander;
  },

  util: {
    setDayLabel (d = (new Date).getDay()) {
      cd.innerHTML = Log.days[d];
    },

    setTimeLabel (h = (new Date).getHours()) {
      ch.innerHTML = `${`0${h}`.substr(-2)}:00`;
    }
  }
}
