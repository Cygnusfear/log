'use strict';

const ø = (el, params) => {
  typeof el === 'string' && (el = document.createElement(el));
  return Object.assign(el, params);
}

Log.ui = {

  /**
   * Build UI
   */
  build () {
    const {cache: {sortEnt}, data, log, config} = Log;
    const oe = data.getRecentEntries(config.ui.view - 1);
    const so = data.sortEntries(oe);
    const et = log.slice(-1)[0].e === undefined ?
      sortEnt.slice(-1)[0].slice(0, -1) :
      sortEnt.slice(-1)[0];

    const frag = document.createDocumentFragment();
    const main = document.createElement('main');

    const ä = (id, className) => {
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

    frag.append(c);
      c.append(this.header.build());
      c.append(main);
        main.append(o);
          o.append(this.overview.build(et, so));
        main.append(d);
          d.append(this.details.build(so));
        main.append(v);
          v.append(this.visualisation(so));
        main.append(e);
          e.append(this.entries.build());
        main.append(j);
          j.append(this.journal.build());
        main.append(g);
          // g.append(Log.ui.guide.build());
      c.append(this.delModal());
    frag.append(this.commander());

    ui.append(frag);
  },

  header: {

    /**
     * Build Header
     * @return {Object} Node
     */
    build () {
      const h = ø('header', {className: 'mb2 f6 lhc'});
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
     * @return {Object} Node
     */
    nav () {
      const frag = document.createDocumentFragment();
      const {tabs} = Log.lexicon;

      const ä = (id, innerHTML, className = 'pv1 tab on bg-cl o5 mr3') => {
        frag.append(ø('button', {
          className,
          innerHTML,
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

      return frag;
    },

    /**
     * Build Clock
     * @return {Object} Node
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
   * @return {Object} Node
   */
  main () {
    const ä = (id, className) => m.append(ø('div', {id, className}));
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
     * @param {Object[]} e - Today's entries
     * @param {Object[]} s - Sorted entries
     * @return {Object} Node
     */
    build (e, s) {
      const ä = (id, className) => ø('div', {id, className});
      const f = document.createDocumentFragment();
      const c = ä('ovwC', 'oya ns');
      const r = ä('ovwR', 'f6 lhc');

      f.append(this.top(e));
      f.append(this.peaks());
      f.append(c);
        c.append(this.recent());
        c.append(this.chart(s));
        c.append(this.stats(e));
      f.append(r);
        r.append(this.lists(e));

      return f;
    },

    /**
     * Build Overview Top
     * @param {Object[]} ent
     * @return {Object} Node
     */
    top (ent) {
      const d = ø('div', {id: 'ovwT'});
      const m = ø('div', {className: 'mb3 psr wf sh2 bl br'});
      const c = ø('div', {className: 'psr wf sh2 nodrag'});

      d.append(m);
        m.append(Log.vis.meterLines());
      d.append(c);
        c.append(Log.vis.dayChart(ent) || '');

      return d;
    },

    /**
     * Build Overview Left
     * @return {Object} Node
     */
    peaks () {
      const {lexicon, data, vis, cache} = Log;
      const ä = (el, className, innerHTML = '') => {
        return ø(el, {className, innerHTML});
      }

      const ol = ø('div', {id: 'ovwL'});
      const ph = document.createElement('div');
      const pd = document.createElement('div');
      const hc = ä('div', 'psr h7 wf nodrag');
      const dc = hc.cloneNode();
      const st = data.sortEntriesByDay()[new Date().getDay()];
      const pt = data.peakHours(st);

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
     * @return {Object} Node
     */
    recent () {
      const {time, log, lexicon} = Log;
      const {id, s, e, c, t, d} = log.slice(-1)[0];
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
              innerHTML: `${st} - ${e === undefined ?
                '' : time.stamp(e)}`
            }));
            r2.append(ø('td', {innerHTML: c}));
            r2.append(ø('td', {innerHTML: t}));
            r2.append(ø('td', {className: 'pr0', innerHTML: d}));

      return le;
    },

    /**
     * Build Overview Chart
     * @param {Object[]} sortedOverview
     * @return {Object} Node
     */
    chart (sortedOverview) {
      const container = ø('div', {className: 'psr'});
      const data = Log.data.bar(sortedOverview);
      const chart = Log.vis.barChart(data);

      container.append(chart || '');
      return container;
    },

    /**
     * Build Overview stats
     * @param {Object[]} entries
     * @return {Object} Node
     */
    stats (entries) {
      const ä = (el, className, innerHTML = '') => {
        return ø(el, {className, innerHTML});
      }

      const stats = ä('ul', 'lsn f6 lhc');
      const {data, displayStat, log, time, lexicon} = Log;
      const dur = data.listDurations(entries);

      const s = [
        {
          n: lexicon.stats.sum,
          v: displayStat(data.calcSum(dur))
        }, {
          n: lexicon.stats.minDur,
          v: displayStat(data.calcMin(dur))
        }, {
          n: lexicon.stats.maxDur,
          v: displayStat(data.calcMax(dur))
        }, {
          n: lexicon.stats.avgDur,
          v: displayStat(data.calcAvg(dur))
        }, {
          n: lexicon.stats.cov,
          v: `${data.coverage(entries).toFixed(2)}%`
        }, {
          n: lexicon.stats.foc,
          v: data.projectFocus(data.listProjects(entries)).toFixed(2)
        }, {
          n: lexicon.entries,
          v: entries.length
        }, {
          n: lexicon.stats.streak,
          v: data.streak(),
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
     * @param {Object[]} entries
     * @return {Object} Node
     */
    lists (entries) {
      const ä = innerHTML => ø('h3', {className: 'mb3 f5 lhc', innerHTML});
      const {vis: {list}, data: {sortValues}, lexicon} = Log;

      const frag = document.createDocumentFragment();
      const sectors = document.createElement('div');
      const projects = document.createElement('div');

      const sTitle = ä(lexicon.sec.plural);
      const pTitle = ä(lexicon.pro.plural);

      const listEl = ø('ul', {className: 'nodrag lsn h8 oya hvs'});
      const sList = listEl.cloneNode();
      const pList = listEl.cloneNode();
      const sData = list(0, sortValues(entries, 0, 0), entries);
      const pData = list(1, sortValues(entries, 1, 0), entries);

      frag.append(sectors);
        sectors.append(sTitle);
        sectors.append(sList);
          sList.append(sData || '');
      frag.append(projects);
        projects.append(pTitle);
        projects.append(pList);
          pList.append(pData || '');

      return frag;
    }
  },

  details: {

    /**
     * Build Details
     * @param {Object[]} so - Sorted overview
     * @return {Object} Node
     */
    build (so) {
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
          a.append(this.summary.build(so));
        m.append(b);
        m.append(c);
        if (log.length > 1) {
          b.append(this.detail.build(0, sortValues(log, 0, 0)[0][0]));
          c.append(this.detail.build(1, sortValues(log, 1, 0)[0][0]));
        }

      return f;
    },

    /**
     * Build Details menu
     * @return {Object} Node
     */
    menu () {
      const {summary, sec, pro} = Log.lexicon;
      const m = document.createElement('div');

      const ä = (i, ih, cn = 'db mb3 subtab on bg-cl o5 mr3') => {
        m.append(ø('button', {
          id: `b-${i}`, className: cn, innerHTML: ih,
          onclick: () => Log.tab(i, 'subsect', 'subtab', true)
        }));
      }

      ä('SUM', summary, 'db mb3 subtab on bg-cl of mr3');
      ä('SSC', sec.plural);
      ä('PSC', pro.plural);

      return m;
    },

    summary: {

      /**
       * Build Summary
       * @param {Object[]} sortedEntries
       * @return {Object} Node
       */
      build (sortedEntries) {
        const f = document.createDocumentFragment();

        f.append(this.stats());
        f.append(this.peaks());
        f.append(this.focus(sortedEntries));
        f.append(this.distribution());

        return f;
      },

      /**
       * Build Summary stats
       * @return {Object} Node
       */
      stats () {
        const ä = (el, className, innerHTML = '') => {
          return ø(el, {className, innerHTML});
        }

        const {lexicon, displayStat, data, cache} = Log;
        const container = document.createElement('div');
        const list = ä('ul', 'mb5 lsn f6 lhc r');
        const s = [
          {
            n: lexicon.stats.sum,
            v: displayStat(data.calcSum(cache.dur))
          }, {
            n: lexicon.stats.minDur,
            v: displayStat(data.calcMin(cache.dur))
          }, {
            n: lexicon.stats.maxDur,
            v: displayStat(data.calcMax(cache.dur))
          }, {
            n: lexicon.stats.avgDur,
            v: displayStat(data.calcAvg(cache.dur))
          }, {
            n: lexicon.stats.daily,
            v: displayStat(data.avgLogHours())
          }, {
            n: lexicon.stats.cov,
            v: `${data.coverage().toFixed(2)}%`
          }, {
            n: lexicon.entries,
            v: user.log.length
          }, {
            n: lexicon.sec.plural,
            v: cache.sec.length
          }, {
            n: lexicon.pro.plural,
            v: cache.pro.length
          }
        ];

        for (let i = 0; i < 9; i++) {
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
       * @return {Object} Node
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
          {n: lexicon.ph, v: data.peakHour()},
          {n: lexicon.pd, v: data.peakDay()},
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
       * @return {Object} Node
       */
      focus (entries) {
        const ä = (e, className, innerHTML = '') => {
          return ø(e, {className, innerHTML});
        }

        const {data, lexicon, vis} = Log;
        const d = document.createElement('div');
        const c = ä('div', 'psr mb4 wf sh5');
        const st = ä('ul', 'mb5 lsn f6 lhc r');

        const pf = data.listFocus(1);
        const s = [
          {n: lexicon.stats.minFoc, v: data.calcMin(pf)},
          {n: lexicon.stats.maxFoc, v: data.calcMax(pf)},
          {n: lexicon.stats.avgFoc, v: data.calcAvg(pf)}
        ];

        for (let i = 0, l = s.length; i < l; i++) {
          const itm = ä('li', 'c3');
          itm.append(ä('p', 'f4 fwb', s[i].v.toFixed(2)));
          itm.append(ä('p', 'o9', s[i].n));
          st.append(itm);
        }

        d.append(ä('h3', 'mb3 f6 lhc', lexicon.stats.foc));
        d.append(c);
          c.append(vis.focusChart(data.listFocus(1, entries)));
        d.append(st);

        return d;
      },

      /**
       * Build Summary distribution
       * @return {Object} Node
       */
      distribution () {
        const v = Log.data.sortValues(Log.log, 0, 1);
        const d = document.createElement('div');
        const b = ø('div', {className: 'mb3 wf sh2'});
        const l = ø('ul', {className: 'lsn r'});

        d.append(ø('h3', {
          className: 'mb3 f6 lhc', innerHTML: Log.lexicon.sec.plural
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
       * @return {Object} Node
       */
      build (mode, key) {
        const {data, config} = Log;
        let ent = [];
        let his = [];
        let sect = '';
        let ss = '';
        let es = '';

        if (mode === 0) {
          ent = data.getEntriesBySector(
            key, data.getRecentEntries(config.ui.view - 1)
          );
          his = data.getEntriesBySector(key);
          sect = 'secsect';
          ss = 'SST';
          es = 'SEN';
        } else {
          ent = data.getEntriesByProject(
            key, data.getRecentEntries(config.ui.view - 1)
          );
          his = data.getEntriesByProject(key);
          sect = 'prosect';
          ss = 'PST';
          es = 'PEN';
        }

        const dur = data.listDurations(his);
        const ph = data.peakHours(his);
        const pd = data.peakDays(his);
        const sh = data.sortEntries(his);
        const f = document.createDocumentFragment();
        const c = ø('div', {className: 'nodrag oys hvs'});
        const s1 = ø('div', {id: ss, className: sect});
        const s2 = ø('div', {id: es, className: `dn ${sect}`});

        f.append(c);
          c.append(this.head(key, ent));
          c.append(this.tabs(mode));
          c.append(s1);
            s1.append(this.overview(ent));
            s1.append(this.stats(dur, his, sh, ph, pd));
            s1.append(this.peaks(ph, pd));
            s1.append(this.focus(ent, sh));
            s1.append(this.distribution(mode, ent, his));
          c.append(s2);
            s2.append(this.entries(mode, his));
        f.append(this.list(mode));

        return f;
      },

      /**
       * Build Detail head
       * @param {string} key - Sector or project name
       * @param {Object[]} ent
       * @return {Object} Node
       */
      head (key, ent) {
        const f = document.createDocumentFragment();
        const timeago = Log.time.timeago(
          ent.slice(-1)[0].e * 1E3);

        f.append(ø('h2', {className: 'mb0 f4 lht', innerHTML: key}));
        f.append(ø('p', {
          className: 'mb2 f6 o7',
          innerHTML: ent.length === 0 ?
            `No activity in the past ${Log.config.ui.view} days` :
            `Updated ${timeago}`
        }));

        return f;
      },

      /**
       * Build Detail overview
       * @param {Object[]} ent
       * @return {Object} Node
       */
      overview (ent) {
        const o = ø('div', {className: 'psr'});

        if (ent.length !== 0) {
          const se = Log.data.sortEntries(ent);
          o.append(Log.vis.barChart(Log.data.bar(se)));
        }

        return o;
      },

      /**
       * Build Detail tabs
       * @param {number} mode - Sector (0) or project (1)
       * @return {Object} Node
       */
      tabs (mode) {
        const t = ø('div', {className: 'mb3 lhc'});

        let sect = '';
        let tab = '';
        let stats = '';
        let entries = '';

        if (mode === 0) {
          sect = 'secsect';
          tab = 'sectab';
          stats = 'SST';
          entries = 'SEN';
        } else {
          sect = 'prosect';
          tab = 'protab';
          stats = 'PST';
          entries = 'PEN';
        }

        t.append(ø('button', {
          className: 'pv1 sectab on bg-cl of mr3',
          id: `b-${stats}`, innerHTML: Log.lexicon.stat,
          onclick: () => Log.tab(stats, sect, tab)
        }));
        t.append(ø('button', {
          className: 'pv1 sectab on bg-cl o5',
          id: `b-${entries}`, innerHTML: Log.lexicon.entries,
          onclick: () => Log.tab(entries, sect, tab)
        }));

        return t;
      },

      /**
       * Build Detail stats
       * @param {Objectp[]} dur - List of durations
       * @param {Object[]} his
       * @param {Object[]} sortedHis
       * @param {Object[]} pkhd
       * @param {Object[]} pkdd
       * @return {Object} Node
       */
      stats (dur, his, sortHis, pkhd, pkdd) {
        const ä = (e, c, i = '') => ø(e, {className: c, innerHTML: i});
        const {lexicon, data, displayStat} = Log;

        const div = document.createElement('div');
        const list = ä('ul', 'lsn f6 lhc r');

        const s = [
          {n: lexicon.stats.sum,    v: displayStat(data.calcSum(dur))},
          {n: lexicon.stats.minDur, v: displayStat(data.calcMin(dur))},
          {n: lexicon.stats.maxDur, v: displayStat(data.calcMax(dur))},
          {n: lexicon.stats.avgDur, v: displayStat(data.calcAvg(dur))},
          {n: lexicon.entries,      v: his.length},
          {n: lexicon.stats.streak, v: data.streak(sortHis)},
          {n: lexicon.ph,           v: data.peakHour(pkhd)},
          {n: lexicon.pd,           v: data.peakDay(pkdd)}
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
       * @return {Object} Node
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

        const ph = Log.vis.peakChart(0, pkh);
        const pd = Log.vis.peakChart(1, pkd);

        w.append(t);
        w.append(a);
          a.append(h);
            h.append(ph);
        w.append(b);
          b.append(d);
            d.append(pd);

        return w;
      },

      /**
       * Build Detail focus
       * @param {Object[]} ent
       * @param {Object[]} sortHis
       * @return {Object} Node
       */
      focus (ent, sortHis) {
        const {data, lexicon, vis} = Log;
        const foci = data.listFocus(1, sortHis);

        const ä = (el, className, innerHTML = '') => {
          return ø(el, {className, innerHTML});
        }

        const d = document.createElement('div');
        const stats = ä('ul', 'mb4 lsn f6 lhc r');
        const chart = ä('div', 'psr mb4 wf');

        const focusStats = [
          {n: lexicon.stats.minFoc, v: data.calcMin(foci)},
          {n: lexicon.stats.maxFoc, v: data.calcMax(foci)},
          {n: lexicon.stats.avgFoc, v: data.calcAvg(foci)},
        ];

        for (let i = 0; i < 3; i++) {
          const {n, v} = focusStats[i];
          const item = ä('li', 'c3');
          item.append(ä('p', 'f4 fwb', v.toFixed(2)));
          item.append(ä('p', 'o9', n));
          stats.append(item);
        }

        if (ent.length !== 0) {
          const se = data.sortEntries(ent);
          chart.append(vis.focusChart(data.listFocus(1, se)));
        }

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
      distribution (mode, ent, his) {
        const d = document.createElement('div');
        const b = ø('div', {className: 'mb3 wf sh2'});
        const l = ø('ul', {className: 'lsn r'});

        if (ent.length !== 0) {
          const m = mode === 0 ? 1 : 0;
          const v = Log.data.sortValues(his, m, 1);
          b.append(Log.vis.focusBar(m, v));
          l.append(Log.vis.legend(m, v));
        }

        d.append(ø('h3', {
          innerHTML: mode === 0 ? Log.lexicon.pro.plural : Log.lexicon.sec.plural,
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
       * @return {Object} Node
       */
      entries (mode, his) {
        const t = ø('table', {className: 'wf bn f6'});
        const h = document.createElement('thead');
        const r = document.createElement('tr');
        const b = ø('tbody', {className: 'nodrag'});

        const n = [
          Log.lexicon.date,
          Log.lexicon.time,
          Log.lexicon.span,
          mode === 0 ?
            Log.lexicon.pro.singular :
            Log.lexicon.sec.singular
        ];

        const rev = his.slice(his.length - 100).reverse();
        const {toEpoch, stamp, displayDate, duration} = Log.time;

        const td = (innerHTML, className = '') => {
          return ø('td', {innerHTML, className});
        }

        for (let i = 0, l = rev.length; i < l; i++) {
          const {s, e, c, t, d, id} = rev[i];
          const startDate = s;
          const startTime = stamp(startDate);
          const end = stamp(e);
          const key = mode === 0 ? t : c;
          const row = document.createElement('tr');

          row.append(td(id + 1, 'pl0'));
          row.append(td(displayDate(startDate)));
          row.append(td(`${startTime}–${end}`));
          row.append(td(duration(s, e).toFixed(2)));

          row.append(ø('td', {
            innerHTML: key,
            className: 'c-pt',
            onclick: () => Log.nav.toDetail(mode === 0 ? 1 : 0, key)}));

          row.append(td(d, 'pr0'));

          b.append(row);
        }

        t.append(h);
          h.append(r);
            r.append(ø('th', {className: 'pl0', innerHTML: Log.lexicon.id}));

            for (let i = 0, l = n.length; i < l; i++) {
              r.append(ø('th', {innerHTML: n[i]}));
            }

            r.append(ø('th', {className: 'pr0', innerHTML: Log.lexicon.desc}));
        t.append(b);

        return t;
      },

      /**
       * Build Detail list
       * @param {number} mode - Sector (0) or project (1)
       * @return {Object} Node
       */
      list (mode) {
        const list = ø('ul', {className: 'nodrag oys lsn f6 lhc hvs'});

        if (Log.log.length > 1) {
          const data = Log.data.sortValues(Log.log, mode, 0);
          list.append(Log.vis.list(mode, data));
        }

        return list;
      }
    }
  },

  /**
   * @param {Object[]} so - Sorted entries
   */
  visualisation (so) {
    const ä = className => ø('div', {className});
    const f = document.createDocumentFragment();
    const m = ä('psr wf sh2 bl br');
    const v = ä('nodrag oys hvs');

    f.append(m);
      m.append(Log.vis.meterLines());
    f.append(v);
      v.append(Log.vis.visualisation(Log.data.visualisation(so)));

    return f;
  },

  entries: {

    /**
     * Build Entries
     * @return {Object} Node
     */
    build () {
      const f = document.createDocumentFragment();
      f.append(this.table());
      f.append(this.modal());
      return f;
    },

    /**
     * Build Entries table
     * @return {Object} Node
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
        Log.lexicon.sec.singular,
        Log.lexicon.pro.singular
      ];

      const el = user.log.length;
      const arr = user.log.slice(el - 100).reverse();

      for (let i = 0, l = arr.length; i < l; i++) {
        const {s, e, c, t, d} = arr[i];
        const sd = Log.time.toEpoch(s);
        const ed = Log.time.toEpoch(e);
        const startTime = Log.time.stamp(sd);
        const id = el - i - 1;
        const r = ø('tr', {id: `r${id}`});
        const time = document.createElement('td');
        const span = document.createElement('td');

        if (e === undefined) {
          time.innerHTML = `${startTime} –`;
          span.innerHTML = '—';
        } else {
          const endTime = Log.time.stamp(Log.time.toEpoch(e));
          time.innerHTML = `${startTime} – ${endTime}`;
          span.innerHTML = Log.displayStat(Log.time.duration(sd, ed));
        }

        r.appendChild(ø('td', {
          innerHTML: el - i,
          className: 'pl0 c-pt hover',
          onclick: () => Log.edit(id)
        }));

        r.appendChild(ø('td', {
          className: 'c-pt hover',
          innerHTML: Log.time.displayDate(sd),
          onclick: () => Log.nav.toJournal(`'${s}'`)
        }));

        r.appendChild(time);
        r.appendChild(span);

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
     * @return {Object} Node
     */
    modal () {
      const m = ø('dialog', {
        id: 'editModal',
        className: 'p4 cn bn h6'
      });

      const f = ø('form', {
        id: 'editForm',
        className: 'nodrag',
        onsubmit: () => false
      });

      const i = ø('input', {className: 'db wf p2 mb3 bn'});

      ø(m.style, {
        backgroundColor: Log.config.ui.bg,
        color: Log.config.ui.colour
      });

      m.onkeydown = e => {e.key === 'Escape' && (Log.modalMode = false);}

      document.addEventListener('click', ({target}) => {
        if (target === m) {
          Log.modalMode = false;
          m.close();
        }
      });

      f.addEventListener('submit', _ => {
        Log.update(editEntryID.value);
        Log.modalMode = false;
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
            Log.modalMode = false;
            m.close();
          }}));

      return m;
    }
  },

  journal: {

    /**
     * Build Journal
     * @return {Object} Node
     */
    build () {
      const f = document.createDocumentFragment();
      f.append(this.cal());
      f.append(this.modal());
      return f;
    },

    /**
     * Build Journal Calendar
     * @return {Object} Node
     */
    cal () {
      const c = ø('table', {className: 'cal nodrag hf wf f6 lhc c-pt bn'});
      c.append(Log.journal.displayCalendar());
      return c;
    },

    /**
     * Build Journal Modal
     * @param {Object} [ui] - UI config
     * @param {string} [ui.bg] - Background colour
     * @param {string} [ui.colour] - Colour
     * @return {Object} Node
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
    }
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
   * @return {Object} Node
   */
  delModal () {
    const modal = ø('dialog', {
      className: 'p4 cn bn nodrag',
      id: 'delModal'
    });

    ø(modal.style, {
      backgroundColor: Log.config.ui.bg,
      color: Log.config.ui.colour
    });

    const ä = (e, id, className, innerHTML = '') => {
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
   * @return {Object} Node
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
      const value = input.value;

      Log.commanderIndex = 0;

      if (value !== '') {
        const l = history.length;

        value !== history[l - 1] && (history[l] = value);
        l >= 100 && history.shift();

        localStorage.setItem('logHistory', JSON.stringify(history));
        Log.console.parse(value);
      }

      commander.style.display = 'none';
      input.value = '';
    });

    Log.commander = commander;
    Log.commanderInput = input;
    commander.append(input);
    return commander;
  }
}
