'use strict';

const oa = (el, params) => {
  if (typeof el === 'string') el = document.createElement(el);
  return Object.assign(el, params);
}

Log.ui = {

  build () {
    const oe = Log.data.getRecentEntries(Log.config.ui.view - 1);
    const so = Log.data.sortEntries(oe);
    const et = Log.log.slice(-1)[0].e === undefined ?
      Log.cache.sortEnt.slice(-1)[0].slice(0, -1) :
      Log.cache.sortEnt.slice(-1)[0];

    const f = document.createDocumentFragment();
    const m = document.createElement('main');

    const c = oa('div', {id: 'container', className: 'hf'});
    const o = oa('div', {id: 'OVW', className: 'sect'});
    const d = oa('div', {id: 'DTL', className: 'dn sect'});
    const v = oa('div', {id: 'VIS', className: 'nodrag dn sect oya oxh'});
    const e = oa('div', {id: 'ENT', className: 'dn sect oya hvs'});
    const j = oa('div', {id: 'JOU', className: 'dn sect oya hvs'});
    const g = oa('div', {id: 'GUI', className: 'dn sect hf wf oys oxh'});

    f.append(c);
      c.append(Log.ui.header.build());
      c.append(m);
        m.append(o);
          o.append(Log.ui.overview.build(et, so));
        m.append(d);
          d.append(Log.ui.details.build(so));
        m.append(v);
          v.append(Log.ui.visualisation(so));
        m.append(e);
          e.append(Log.ui.entries.build());
        m.append(j);
          j.append(Log.ui.journal.build());
        m.append(g);
          // g.append(Log.ui.guide.build());
      c.append(Log.ui.delModal());
    f.append(Log.ui.commander());

    ui.append(f);
  },

  header: {

    build () {
      const h = oa('header', {className: 'mb2 f6 lhc'});
      const t = oa('h1', {className: 'dib mr3 f5 upc tk', innerHTML: 'Log'});

      h.appendChild(t);
      h.appendChild(Log.ui.header.nav());
      h.appendChild(Log.ui.header.clock());

      return h;
    },

    nav () {
      const f = document.createDocumentFragment();
      const b = oa('button', {className: 'pv1 tab on bg-cl o5 mr3'});
      const {tabs} = Log.lexicon;

      f.append(oa(b.cloneNode(), {
        className: 'pv1 tab on bg-cl of mr3',
        id: 'b-OVW', innerHTML: tabs.overview,
        onclick: () => Log.tab('OVW')
      }));

      f.append(oa(b.cloneNode(), {
        id: 'b-DTL', innerHTML: tabs.details,
        onclick: () => Log.tab('DTL')
      }));

      f.append(oa(b.cloneNode(), {
        id: 'b-VIS', innerHTML: tabs.vis,
        onclick: () => Log.tab('VIS')
      }));

      f.append(oa(b.cloneNode(), {
        id: 'b-ENT', innerHTML: tabs.entries,
        onclick: () => Log.tab('ENT')
      }));

      f.append(oa(b.cloneNode(), {
        id: 'b-JOU', innerHTML: tabs.journal,
        onclick: () => Log.tab('JOU')
      }));

      f.append(oa(b.cloneNode(), {
        id: 'b-GUI', innerHTML: tabs.guide,
        onclick: () => Log.tab('GUI')
      }));

      return f;
    },

    clock () {
      const c = oa('span', {className: 'rf f5 di tnum', innerHTML: '00:00:00'});
      Log.timerEl = c;
      Log.timer();
      return c;
    }
  },

  main () {
    const d = document.createElement('div');

    d.append(oa('div', {id: 'OVW', className: 'sect'}));
    d.append(oa('div', {id: 'DTL', className: 'dn sect'}));
    d.append(oa('div', {id: 'VIS', className: 'nodrag dn sect oya oxh'}));
    d.append(oa('div', {id: 'ENT', className: 'dn sect oya hvs'}));
    d.append(oa('div', {id: 'JOU', className: 'dn sect oya hvs'}));
    d.append(oa('div', {id: 'GUI', className: 'dn sect oys oxh'}));

    return d;
  },

  overview: {

    /**
     * @param {Object[]} e - Today's entries
     * @param {Object[]} s - Sorted entries
     */
    build (e, s) {
      const f = document.createDocumentFragment();
      const c = oa('div', {id: 'ovwC', className: 'oya ns'});
      const r = oa('div', {id: 'ovwR', className: 'f6 lhc'});

      f.append(Log.ui.overview.top(e));
      f.append(Log.ui.overview.peaks());
      f.append(c);
        c.append(Log.ui.overview.recent());
        c.append(Log.ui.overview.chart(s));
        c.append(Log.ui.overview.stats(e));
      f.append(r);
        r.append(Log.ui.overview.lists(e));

      return f;
    },

    top (ent) {
      const d = oa('div', {id: 'ovwT'});
      const m = oa('div', {className: 'mb3 psr wf sh2 bl br'});
      const c = oa('div', {className: 'psr wf sh2 nodrag'});

      d.append(m);
        m.append(Log.vis.meterLines());
      d.append(c);
        c.append(Log.vis.dayChart(ent) || '');

      return d;
    },

    peaks () {
      const l = oa('div', {id: 'ovwL'});
      const ph = document.createElement('div');
      const pd = document.createElement('div');
      const hc = oa('div', {className: 'psr h7 wf nodrag'});
      const dc = oa('div', {className: 'psr h7 wf nodrag'});
      const st = Log.data.sortEntriesByDay()[new Date().getDay()];
      const pt = Log.data.peakHours(st);

      l.append(oa('h3', {
        className: 'mb3 f6 lhc', innerHTML: Log.lexicon.peaks
      }));
      l.append(ph);
        ph.append(oa('h3', {id: 'ch', className: 'mb2 f6 lhc fwn tnum'}));
        ph.append(hc);
          hc.append(Log.vis.peakChart(0, pt));
      l.append(pd);
        pd.append(oa('h3', {id: 'cd', className: 'mb2 f6 lhc fwn'}));
        pd.append(dc);
          dc.append(Log.vis.peakChart(1, Log.cache.pkd));

      return l;
    },

    recent () {
      const {id, s, e, c, t, d} = Log.log.slice(-1)[0];
      const st = Log.time.stamp(Log.time.toEpoch(s));
      const le = document.createElement('div');
      const lt = oa('table', {className: 'wf bn f6 lhc'});
      const th = oa('thead', {className: 'al'});
      const tb = document.createElement('tbody');
      const r1 = document.createElement('tr');
      const r2 = document.createElement('tr');

      le.append(lt);
        lt.append(th);
          th.append(r1);
            r1.append(oa('th', {
              className: 'pb1 pt0 pl0', innerHTML: Log.lexicon.recent
            }));
        lt.append(tb);
          tb.append(r2);
            r2.append(oa('td', {className: 'pl0', innerHTML: id + 1}));
            r2.append(oa('td', {
              innerHTML: `${st} - ${e === undefined ?
                '' : Log.time.stamp(Log.time.toEpoch(e))}`
            }));
            r2.append(oa('td', {innerHTML: c}));
            r2.append(oa('td', {innerHTML: t}));
            r2.append(oa('td', {className: 'pr0', innerHTML: d}));

      return le;
    },

    chart (so) {
      const c = oa('div', {className: 'psr'});
      c.append(Log.vis.barChart(Log.data.bar(so)) || '');
      return c;
    },

    stats (et) {
      const stats = oa('ul', {className: 'lsn f6 lhc'});

      const {
        listDurations, getEntriesByDate, calcSum, calcMin, calcMax, calcAvg, projectFocus, listProjects, trend, coverage, streak
      } = Log.data;

      const dur = listDurations(et);
      const nd = Log.time.toEpoch(Log.log.slice(-1)[0].s);
      const st = Log.time.stamp(nd);
      const ey = getEntriesByDate(nd.addDays(-1));
      const yd = listDurations(ey);
      const sum = calcSum(dur);
      const min = calcMin(dur);
      const max = calcMax(dur);
      const avg = calcAvg(dur);
      const foc = projectFocus(listProjects(et));
      const yfoc = projectFocus(listProjects(ey));
      const enc = et.length;
      const lht = trend(sum, calcSum(yd));
      const s = [
        {
          n: Log.lexicon.stats.abbr.sum,
          v: Log.displayStat(sum),
          t: lht
        },
        {
          n: Log.lexicon.stats.abbr.minDur,
          v: Log.displayStat(sum),
          t: trend(min, calcMin(yd))},
        {
          n: Log.lexicon.stats.abbr.maxDur,
          v: Log.displayStat(min),
          t: trend(max, calcMax(yd))},
        {
          n: Log.lexicon.stats.abbr.avgDur,
          v: Log.displayStat(max),
          t: trend(avg, calcAvg(yd))},
        {
          n: Log.lexicon.stats.cov,
          v: `${coverage(et).toFixed(2)}%`,
          t: lht},
        {
          n: Log.lexicon.stats.foc,
          v: foc.toFixed(2),
          t: trend(foc, yfoc)},
        {
          n: Log.lexicon.entries,
          v: enc,
          t: trend(enc, ey.length)},
        {
          n: Log.lexicon.stats.streak,
          v: streak(),
          t: ''},
      ];

      for (let i = 0, l = s.length; i < l; i++) {
        const itm = oa('li', {className: 'mb3 c3'});
        const {n, v, t} = s[i];

        itm.append(oa('p', {className: 'f4 fwb', innerHTML: v}));
        itm.append(oa('p', {
          innerHTML: t === '' ? n : `${n} (<span class="tnum">${t}</span>)`,
          className: 'o9'
        }));

        stats.append(itm);
      }

      return stats;
    },

    lists (ent) {
      const f = document.createDocumentFragment();
      const d = document.createElement('div');
      const s = document.createElement('div');
      const p = document.createElement('div');
      const h = oa('h3', {className: 'mb3 f5 lhc'});
      const u = oa('ul', {className: 'nodrag lsn h8 oya hvs'});
      const a = u.cloneNode();
      const b = u.cloneNode();

      f.append(s);
        s.append(oa(h.cloneNode(), {innerHTML: Log.lexicon.sec.plural}));
        s.append(a);
          a.append(Log.vis.list(0, Log.data.sortValues(ent, 0, 0), ent) || '');
      f.append(p);
        p.append(oa(h.cloneNode(), {innerHTML: Log.lexicon.pro.plural}));
        p.append(b);
          b.append(Log.vis.list(1, Log.data.sortValues(ent, 1, 0), ent) || '');

      return f;
    }
  },

  details: {

    build (so) {
      const {detail, menu, summary} = Log.ui.details;
      const f = document.createDocumentFragment();
      const d = document.createElement('div');
      const m = oa('div', {className: 'oya'});
      const a = oa('div', {id: 'SUM', className: 'nodrag subsect oya hvs'});
      const b = oa('div', {id: 'SSC', className: 'dn subsect'});
      const c = oa('div', {id: 'PSC', className: 'dn subsect'});

      f.append(menu());
      f.append(m);
        m.append(a);
          a.append(summary.build(so));
        m.append(b);
        m.append(c);
        if (Log.log.length > 1) {
          b.append(detail.build(0, Log.data.sortValues(Log.log, 0, 0)[0][0]));
          c.append(detail.build(1, Log.data.sortValues(Log.log, 1, 0)[0][0]));
        }

      return f;
    },

    menu () {
      const m = document.createElement('div');
      const b = oa('button', {className: 'db mb3 subtab on bg-cl o5 mr3'});

      m.append(oa(b.cloneNode(), {
        id: 'b-SUM', innerHTML: Log.lexicon.summary,
        className: 'db mb3 subtab on bg-cl of mr3',
        onclick: () => Log.tab('SUM', 'subsect', 'subtab', true)
      }));

      m.append(oa(b.cloneNode(), {
        id: 'b-SSC', innerHTML: Log.lexicon.sec.plural,
        onclick: () => Log.tab('SSC', 'subsect', 'subtab', true)
      }));

      m.append(oa(b.cloneNode(), {
        id: 'b-PSC', innerHTML: Log.lexicon.pro.plural,
        onclick: () => Log.tab('PSC', 'subsect', 'subtab', true)
      }));

      return m;
    },

    summary: {

      build (sortedEntries) {
        const f = document.createDocumentFragment();

        f.append(Log.ui.details.summary.stats());
        f.append(Log.ui.details.summary.peaks());
        f.append(Log.ui.details.summary.focus(sortedEntries));
        f.append(Log.ui.details.summary.distribution());

        return f;
      },

      stats () {
        const {dur, sec, pro} = Log.cache;
        const stats = document.createElement('div');
        const list = oa('ul', {className: 'mb5 lsn f6 lhc r'});
        const {
          calcSum, calcMin, calcMax, calcAvg, avgLogHours, coverage
        } = Log.data;
        const s = [
          {n: Log.lexicon.stats.sum, v: Log.displayStat(calcSum(dur))},
          {n: Log.lexicon.stats.minDur, v: Log.displayStat(calcMin(dur))},
          {n: Log.lexicon.stats.maxDur, v: Log.displayStat(calcMax(dur))},
          {n: Log.lexicon.stats.avgDur, v: Log.displayStat(calcAvg(dur))},
          {n: Log.lexicon.stats.daily, v: Log.displayStat(avgLogHours())},
          {n: Log.lexicon.stats.cov,   v: `${coverage().toFixed(2)}%`},
          {n: Log.lexicon.entries, v: user.log.length},
          {n: Log.lexicon.sec.plural, v: sec.length},
          {n: Log.lexicon.pro.plural, v: pro.length}
        ];

        for (let i = 0; i < 9; i++) {
          const itm = oa('li', {className: 'mb4 c3'});
          const {n, v} = s[i];

          itm.append(oa('p', {className: 'f4 fwb', innerHTML: v}));
          itm.append(oa('p', {className: 'o9', innerHTML: n}));
          list.append(itm);
        }

        stats.append(list);

        return stats;
      },

      peaks () {
        const c = document.createElement('div');
        const a = oa('div', {className: 'dib mb4 pr4 lf sh6 w5'});
        const b = oa('div', {className: 'dib mb4 pl4 lf sh6 w5'});
        const h = oa('div', {className: 'psr hf wf'});
        const d = h.cloneNode();
        const stats = oa('ul', {className: 'mb5 lsn f6 lhc r'});
        const s = [
          {n: Log.lexicon.ph, v: Log.data.peakHour()},
          {n: Log.lexicon.pd, v: Log.data.peakDay()},
          {n: Log.lexicon.pm, v: '-'}
        ];

        for (let i = 0; i < 3; i++) {
          const item = oa('li', {className: 'mb0 c3'});
          const {n, v} = s[i];

          item.append(oa('p', {className: 'f4 fwb', innerHTML: v}));
          item.append(oa('p', {className: 'o9', innerHTML: n}));
          stats.append(item);
        }

        c.append(oa('h3', {
          className: 'mb3 f6 lhc', innerHTML: Log.lexicon.peaks
        }));
        c.append(a);
          a.append(h);
            h.append(Log.vis.peakChart(0, Log.cache.pkh));
        c.append(b);
          b.append(d);
            d.append(Log.vis.peakChart(1, Log.cache.pkd));
        c.append(stats);

        return c;
      },

      focus (entries) {
        const pf = Log.data.listFocus(1);
        const d = document.createElement('div');
        const c = oa('div', {className: 'psr mb4 wf sh5'});
        const stats = oa('ul', {className: 'mb5 lsn f6 lhc r'});
        const s = [
          {n: Log.lexicon.stats.minFoc, v: Log.data.calcMin(pf).toFixed(2)},
          {n: Log.lexicon.stats.maxFoc, v: Log.data.calcMax(pf).toFixed(2)},
          {n: Log.lexicon.stats.avgFoc, v: Log.data.calcAvg(pf).toFixed(2)}
        ];

        for (let i = 0, l = s.length; i < l; i++) {
          const itm = oa('li', {className: 'c3'});
          const {n, v} = s[i];

          itm.append(oa('p', {className: 'f4 fwb', innerHTML: v}));
          itm.append(oa('p', {className: 'o9', innerHTML: n}));

          stats.append(itm);
        }

        d.append(oa('h3', {
          className: 'mb3 f6 lhc', innerHTML: Log.lexicon.stats.foc
        }));
        d.append(c);
          c.append(Log.vis.focusChart(Log.data.listFocus(1, entries)));
        d.append(stats);

        return d;
      },

      distribution () {
        const v = Log.data.sortValues(Log.log, 0, 1);
        const d = document.createElement('div');
        const b = oa('div', {className: 'mb3 wf sh2'});
        const l = oa('ul', {className: 'lsn r'});

        d.append(oa('h3', {
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

      build (mode, key) {
        let ent = [];
        let his = [];
        let sect = '';
        let ss = '';
        let es = '';

        if (mode === 0) {
          ent = Log.data.getEntriesBySector(
            key, Log.data.getRecentEntries(Log.config.ui.view - 1)
          );
          his = Log.data.getEntriesBySector(key);
          sect = 'secsect';
          ss = 'SST';
          es = 'SEN';
        } else {
          ent = Log.data.getEntriesByProject(
            key, Log.data.getRecentEntries(Log.config.ui.view - 1)
          );
          his = Log.data.getEntriesByProject(key);
          sect = 'prosect';
          ss = 'PST';
          es = 'PEN';
        }

        const dur = Log.data.listDurations(his);
        const ph = Log.data.peakHours(his);
        const pd = Log.data.peakDays(his);
        const sh = Log.data.sortEntries(his);
        const {detail} = Log.ui.details;
        const f = document.createDocumentFragment();
        const c = oa('div', {className: 'nodrag oys hvs'});
        const s1 = oa('div', {id: ss, className: sect});
        const s2 = oa('div', {id: es, className: `dn ${sect}`});

        f.append(c);
          c.append(detail.head(key, ent));
          c.append(detail.tabs(mode));
          c.append(s1);
            s1.append(detail.overview(ent));
            s1.append(detail.stats(dur, his, sh, ph, pd));
            s1.append(detail.peaks(ph, pd));
            s1.append(detail.focus(ent, sh));
            s1.append(detail.distribution(mode, ent, his));
          c.append(s2);
            s2.append(detail.entries(mode, his));
        f.append(detail.list(mode));

        return f;
      },

      head (key, ent) {
        const f = document.createDocumentFragment();
        const {timeago, convert} = Log.time;

        f.append(oa('h2', {className: 'mb0 f4 lht', innerHTML: key}));

        f.append(oa('p', {
          className: 'mb2 f6 o7',
          innerHTML: ent.length === 0 ?
            `No activity in the past ${Log.config.ui.view} days` :
            `Updated ${timeago(convert(ent.slice(-1)[0].e) * 1E3)}`
        }));

        return f;
      },

      overview (ent) {
        const o = oa('div', {className: 'psr'});

        if (ent.length !== 0) {
          const se = Log.data.sortEntries(ent);
          o.append(Log.vis.barChart(Log.data.bar(se)));
        }

        return o;
      },

      tabs (mode) {
        const t = oa('div', {className: 'mb3 lhc'});

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

        t.append(oa('button', {
          className: 'pv1 sectab on bg-cl of mr3',
          id: `b-${stats}`, innerHTML: Log.lexicon.stat,
          onclick: () => Log.tab(stats, sect, tab)
        }));
        t.append(oa('button', {
          className: 'pv1 sectab on bg-cl o5',
          id: `b-${entries}`, innerHTML: Log.lexicon.entries,
          onclick: () => Log.tab(entries, sect, tab)
        }));

        return t;
      },

      stats (dur, his, sortHis, pkhd, pkdd) {
        const div = document.createElement('div');
        const list = oa('ul', {className: 'lsn f6 lhc r'});
        const {lexicon} = Log;
        const s = [
          {n: lexicon.stats.sum, v: Log.displayStat(Log.data.calcSum(dur))},
          {n: lexicon.stats.minDur, v: Log.displayStat(Log.data.calcMin(dur))},
          {n: lexicon.stats.maxDur, v: Log.displayStat(Log.data.calcMax(dur))},
          {n: lexicon.stats.avgDur, v: Log.displayStat(Log.data.calcAvg(dur))},
          {n: lexicon.entries, v: his.length},
          {n: lexicon.stats.streak, v: Log.data.streak(sortHis)},
          {n: lexicon.ph, v: Log.data.peakHour(pkhd)},
          {n: lexicon.pd, v: Log.data.peakDay(pkdd)}
        ];

        for (let i = 0, sl = s.length; i < sl; i++) {
          const item = oa('li', {className: 'mb4 c3'});
          const {n, v} = s[i];

          item.append(oa('p', {innerHTML: v, className: 'f4 fwb'}));
          item.append(oa('p', {innerHTML: n, className: 'o9'}));
          list.append(item);
        }

        div.append(list);

        return div;
      },

      peaks (pkh, pkd) {
        const w = document.createElement('div');
        const a = oa('div', {className: 'dib mb4 pr4 lf sh6 w5'});
        const b = oa('div', {className: 'dib mb4 pl4 lf sh6 w5'});
        const h = oa('div', {className: 'psr hf wf'});
        const d = h.cloneNode();

        w.append(oa('h3', {className: 'mb3 f6', innerHTML: Log.lexicon.peaks}));
        w.append(a);
          a.append(h);
            h.append(Log.vis.peakChart(0, pkh));
        w.append(b);
          b.append(d);
            d.append(Log.vis.peakChart(1, pkd));

        return w;
      },

      focus (ent, sortHis) {
        const foci = Log.data.listFocus(1, sortHis);
        const d = document.createElement('div');
        const stats = oa('ul', {className: 'mb4 lsn f6 lhc r'});
        const c = oa('div', {className: 'psr mb4 wf'});
        const s = [
          {n: Log.lexicon.stats.minFoc, v: Log.data.calcMin(foci).toFixed(2)},
          {n: Log.lexicon.stats.maxFoc, v: Log.data.calcMax(foci).toFixed(2)},
          {n: Log.lexicon.stats.avgFoc, v: Log.data.calcAvg(foci).toFixed(2)},
        ];

        for (let i = 0; i < 3; i++) {
          const {n, v} = s[i];
          const itm = oa('li', {className: 'c3'});

          itm.append(oa('p', {innerHTML: v, className: 'f4 fwb'}));
          itm.append(oa('p', {innerHTML: n, className: 'o9'}));

          stats.append(itm);
        }

        if (ent.length !== 0) {
          const se = Log.data.sortEntries(ent);
          c.append(Log.vis.focusChart(Log.data.listFocus(1, se), c));
        }

        d.append(oa('h3', {
          className: 'mb3 f6', innerHTML: Log.lexicon.stats.foc
        }));
        d.append(c);
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
        const b = oa('div', {className: 'mb3 wf sh2'});
        const l = oa('ul', {className: 'lsn r'});

        if (ent.length !== 0) {
          const m = mode === 0 ? 1 : 0;
          const v = Log.data.sortValues(his, m, 1);
          b.append(Log.vis.focusBar(m, v));
          l.append(Log.vis.legend(m, v));
        }

        d.append(oa('h3', {
          innerHTML: mode === 0 ? Log.lexicon.pro.plural : Log.lexicon.sec.plural,
          className: 'mb3 f6'
        }));

        d.append(b);
        d.append(l);

        return d;
      },

      entries (mode, his) {
        const t = oa('table', {className: 'wf bn f6'});
        const h = document.createElement('thead');
        const r = document.createElement('tr');
        const b = oa('tbody', {className: 'nodrag'});
        const n = [
          Log.lexicon.date, Log.lexicon.time, Log.lexicon.span,
          mode === 0 ? Log.lexicon.pro.singular : Log.lexicon.sec.singular
        ];
        const rev = his.slice(his.length - 100).reverse();

        for (let i = 0, l = rev.length; i < l; i++) {
          const {s, e, c, t, d, id} = rev[i];
          const startDate = Log.time.toEpoch(s);
          const startTime = Log.time.stamp(startDate);
          const end = Log.time.stamp(Log.time.toEpoch(e));
          const key = mode === 0 ? t : c;
          const row = document.createElement('tr');

          row.append(oa('td', {innerHTML: id + 1, className: 'pl0'}));
          row.append(oa('td', {innerHTML: Log.time.displayDate(startDate)}));
          row.append(oa('td', {innerHTML: `${startTime}–${end}`}));
          row.append(oa('td', {innerHTML: Log.time.duration(s, e).toFixed(2)}));
          row.append(oa('td', {
            innerHTML: key, className: 'c-pt',
            onclick: () => Log.nav.toDetail(mode === 0 ? 1 : 0, key)}));
          row.append(oa('td', {innerHTML: d, className: 'pr0'}));

          b.append(row);
        }

        t.append(h);
          h.append(r);
            r.append(oa('th', {className: 'pl0', innerHTML: Log.lexicon.id}));

            for (let i = 0, l = n.length; i < l; i++) {
              r.append(oa('th', {innerHTML: n[i]}));
            }

            r.append(oa('th', {className: 'pr0', innerHTML: Log.lexicon.desc}));
        t.append(b);

        return t;
      },

      list (mode) {
        const l = oa('ul', {className: 'nodrag oys lsn f6 lhc hvs'});

        if (Log.log.length > 1) {
          l.append(Log.vis.list(mode, Log.data.sortValues(Log.log, mode, 0)));
        }

        return l;
      }
    }
  },

  /**
   * @param {Object[]} so - Sorted entries
   */
  visualisation (so) {
    const f = document.createDocumentFragment();
    const m = oa('div', {className: 'psr wf sh2 bl br'});
    const v = oa('div', {className: 'nodrag oys hvs'});

    f.append(m);
      m.append(Log.vis.meterLines());
    f.append(v);
      v.append(Log.vis.visualisation(Log.data.visualisation(so)));

    return f;
  },

  entries: {

    build () {
      const f = document.createDocumentFragment();
      f.append(Log.ui.entries.table());
      f.append(Log.ui.entries.modal());
      return f;
    },

    table () {
      const t = oa('table', {className: 'wf bn f6'});
      const h = oa('thead', {className: 'al'});
      const b = oa('tbody', {className: 'nodrag'});
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
        const date = Log.time.toEpoch(s);
        const startTime = Log.time.stamp(date);
        const id = el - i - 1;
        const r = oa('tr', {id: `r${id}`});
        const time = document.createElement('td');
        const span = document.createElement('td');

        if (e === undefined) {
          time.innerHTML = `${startTime} –`;
          span.innerHTML = '—';
        } else {
          const endTime = Log.time.stamp(Log.time.toEpoch(e));
          time.innerHTML = `${startTime} – ${endTime}`;
          span.innerHTML = Log.displayStat(Log.time.duration(s, e));
        }

        r.appendChild(oa('td', {
          className: 'pl0 c-pt hover', innerHTML: el - i,
          onclick: () => Log.edit(id)
        }));

        r.appendChild(oa('td', {
          className: 'c-pt hover', innerHTML: Log.time.displayDate(date),
          onclick: () => Log.nav.toJournal(`'${s}'`)
        }));

        r.appendChild(time);
        r.appendChild(span);

        r.appendChild(oa('td', {
          className: 'c-pt hover', innerHTML: c,
          onclick: () => Log.nav.toDetail(0, c)
        }));

        r.appendChild(oa('td', {
          className: 'c-pt hover', innerHTML: t,
          onclick: () => Log.nav.toDetail(1, t)
        }));

        r.appendChild(oa('td', {className: 'pr0', innerHTML: d}));

        b.appendChild(r);
      }

      t.append(h);
        h.append(oa('th', {className: 'pl0', innerHTML: Log.lexicon.id}));

        for (let i = 0, l = n.length; i < l; i++) {
          h.append(oa('th', {innerHTML: n[i]}));
        }

        h.append(oa('th', {className: 'pr0', innerHTML: Log.lexicon.desc}));
      t.append(b);

      return t;
    },

    modal () {
      const m = oa('dialog', {id: 'editModal', className: 'p4 cn bn h6'});
      const f = oa('form', {
        id: 'editForm', className: 'nodrag', onsubmit: () => false});
      const i = oa('input', {className: 'db wf p2 mb3 bn'});

      Object.assign(m.style, {
        backgroundColor: Log.config.ui.bg, color: Log.config.ui.colour
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

      m.append(oa('p', {
        id: 'editID', className: 'mb4 f6 lhc'}));
      m.append(f);
        f.append(oa('input', {id: 'editEntryID', type: 'hidden'}));
        f.append(oa(i.cloneNode(), {
          id: 'editSector', type: 'text', placeholder: 'Sector'}));
        f.append(oa(i.cloneNode(), {
          id: 'editProject', type: 'text', placeholder: 'Project'}));
        f.append(oa(document.createElement('textarea'), {
          id: 'editDesc', className: 'db wf p2 mb3 bn',
          rows: '3', placeholder: 'Description (optional)'}));
        f.append(oa(i.cloneNode(), {
          id: 'editStart', type: 'datetime-local', step: '1'}));
        f.append(oa(i.cloneNode(), {
          id: 'editEnd', type: 'datetime-local', step: '1'}));
        f.append(oa('input', {
          id: 'editUpdate', className: 'dib p2 mr2 br1 bn',
          type: 'submit', value: 'Update'}));
        f.append(oa('input', {
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

    build () {
      const f = document.createDocumentFragment();
      f.append(Log.ui.journal.cal());
      f.append(Log.ui.journal.modal());
      return f;
    },

    cal () {
      const c = oa('table', {className: 'cal nodrag hf wf f6 lhc c-pt bn'});
      Log.journal.displayCalendar(c);
      return c;
    },

    modal () {
      const m = oa('dialog', {id: 'entryModal', className: 'p4 cn bn h6'});
      const h2 = oa('h2', {id: 'journalDate', className: 'mb4 f6 lhc'});
      const t = oa('div', {className: 'h2'});
      const mt = oa('div', {className: 'mb3 psr wf sh2 bl br'});
      const sb = oa('div', {className: 'r h7'});
      const st = oa('ul', {className: 'c3 hf oys pr4 lsn f6 lhc hvs'});
      const {stats} = Log.lexicon;
      const s = [
        {id: 'jSUM', n: stats.abbr.sum},
        {id: 'jMIN', n: stats.abbr.minDur},
        {id: 'jMAX', n: stats.abbr.maxDur},
        {id: 'jAVG', n: stats.abbr.avgDur},
        {id: 'jCOV', n: stats.cov},
        {id: 'jFOC', n: stats.foc},
      ];

      Object.assign(m.style, {
        backgroundColor: Log.config.ui.bg, color: Log.config.ui.colour
      });

      for (let i = 0, l = s.length; i < l; i++) {
        const stat = oa('li', {className: 'mb3'});
        const {id, n} = s[i];

        stat.append(oa('p', {id, innerHTML: '&ndash;', className: 'f4 fwb'}));
        stat.append(oa('p', {innerHTML: n, className: 'o9'}));

        st.append(stat);
      }

      m.append(h2);
      m.append(t);
        t.append(mt);
          mt.append(Log.vis.meterLines());
        t.append(oa('div', {id: 'jDyc', className: 'mb3 psr wf sh2'}));
      m.append(sb);
        sb.append(st);
        sb.append(oa('ul', {id: 'jEnt', className: 'c9 pl4 hf oys lsn hvs'}));

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

  delModal () {
    const m = oa('dialog', {id: 'delModal', className: 'p4 cn bn nodrag'});

    Object.assign(m.style, {
      backgroundColor: Log.config.ui.bg, color: Log.config.ui.colour
    });

    m.appendChild(oa('p', {id: 'delMessage', className: 'mb4 f6 lhc'}));
    m.appendChild(oa('ul', {id: 'delList', className: 'mb3 lsn'}));
    m.appendChild(oa('button', {
      id: 'delConfirm', className: 'p2 br1 bn f6', innerHTML: 'Delete'}));
    m.appendChild(oa('button', {
      className: 'p2 br1 bn f6 lhc', innerHTML: 'Cancel',
      onclick: () => {
        Log.modalMode = false;
        modal.close();
      }}));

    return m;
  },

  commander () {
    const commander = oa('form', {
      action: '#', className: 'dn psf b0 l0 wf f6 z9', onsubmit: () => false});
    const input = oa('input', {
      autofocus: 'autofocus', className: 'wf bg-0 blanc on bn p3',
      placeholder: Log.lexicon.console, type: 'text'});

    commander.addEventListener('submit', _ => {
      Log.commanderIndex = 0;

      const {history} = Log.console;
      const v = input.value;

      if (v !== '') {
        const l = history.length;

        if (v != history[l - 1]) history[l] = v;
        if (l >= 100) history.shift();

        localStorage.setItem('logHistory', JSON.stringify(history));
        Log.console.parse(v);
      }

      input.value = '';
      commander.style.display = 'none';
    });

    Log.commander = commander;
    Log.commanderInput = input;
    commander.append(input);

    return commander;
  }
}
