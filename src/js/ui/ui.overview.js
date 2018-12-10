'use strict';

const Overview = {

  /**
   * Build Overview
   * @param {LogSet} t - Today
   * @param {LogSet} o - Overview
   * @return {Object}
   */
  build (t, o) {
    function ä (id, className) {
      return ø('div', {id, className});
    }

    const F = document.createDocumentFragment();
    const c = ä('ovwC', 'oya ns');
    const r = ä('ovwR', 'f6 lhc');

    F.append(this.top(t));
    F.append(this.peaks());
    F.append(c);
      c.append(this.recent());
      c.append(this.chart(o));
      c.append(this.stats(t));
    F.append(r);
      r.append(this.lists(t));

    return F;
  },

  /**
   * Build Overview Top
   * @param {LogSet}   t - Today
   * @param {Array} t.logs
   * @return {Object}
   */
  top ({logs}) {
    const F = document.createDocumentFragment();
    const d = ø('div', {id: 'ovwT'});
    const m = ø('div', {className: 'mb3 psr wf sh2 bl br'});
    const c = ø('div', {className: 'psr wf sh2 nodrag'});

    F.append(d);
      d.append(m);
        m.append(UI.vis.meterLines());
      d.append(c);
        c.append(UI.vis.dayChart(logs) || '');

    return F;
  },

  /**
   * Build Overview Left
   * @return {Object}
   */
  peaks () {
    function ä (e, className, innerHTML = '') {
      return ø(e, {className, innerHTML});
    }

    const F = document.createDocumentFragment();
    const ol = ø('div', {id: 'ovwL'});
    const ph = document.createElement('div');
    const pd = document.createElement('div');
    const hc = ä('div', 'psr h7 wf nodrag');
    const dc = hc.cloneNode();
    const st = new LogSet(Session.sortByDay()[(new Date).getDay()]);
    const pt = st.peakHours();

    F.append(ol);
      ol.append(ä('h3', 'mb3 f6 lhc', Glossary.peaks));
      ol.append(ph);
        ph.append(ø('h3', {id: 'ch', className: 'mb2 f6 lhc fwn tnum'}));
        ph.append(hc);
          hc.append(UI.vis.peakChart(0, pt));
      ol.append(pd);
        pd.append(ø('h3', {id: 'cd', className: 'mb2 f6 lhc fwn'}));
        pd.append(dc);
          dc.append(UI.vis.peakChart(1, Log.cache.pkd));

    return F;
  },

  /**
   * Build Overview Recent
   * @return {Object}
   */
  recent () {
    const {id, start, end, c, t, d} = Session.logs.slice(-1)[0];
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
            className: 'pb1 pt0 pl0', innerHTML: Glossary.recent
          }));
      lt.append(tb);
        tb.append(r2);
          r2.append(ø('td', {className: 'pl0', innerHTML: id + 1}));
          r2.append(ø('td', {
            innerHTML: `${start.stamp()} - ${!end ? '' : end.stamp()}`
          }));
          r2.append(ø('td', {innerHTML: c}));
          r2.append(ø('td', {innerHTML: t}));
          r2.append(ø('td', {className: 'pr0', innerHTML: d}));

    return le;
  },

  /**
   * Build Overview Chart
   * @param {LogSet} ovw
   * @return {Object}
   */
  chart (ovw) {
    const c = ø('div', {className: 'psr'});
    const b = UI.vis.barChart(ovw.bar());
    c.append(b || '');
    return c;
  },

  /**
   * Build Overview stats
   * @param {LogSet} today
   * @return {Object}
   */
  stats (today) {
    function ä (e, className, innerHTML = '') {
      return ø(e, {className, innerHTML});
    }

    const stats = ä('ul', 'lsn f6 lhc');
    const dur = today.listDurations();

    const s = [
      {n: Glossary.stats.sum,    v:  sum(dur).toStat()},
      {n: Glossary.stats.minDur, v:  min(dur).toStat()},
      {n: Glossary.stats.maxDur, v:  max(dur).toStat()},
      {n: Glossary.stats.avgDur, v:  avg(dur).toStat()},
      {n: Glossary.stats.cov,    v: `${today.coverage().toFixed(2)}%`},
      {n: Glossary.stats.foc,    v:  today.projectFocus().toFixed(2)},
      {n: Glossary.entries,      v:  today.count},
      {n: Glossary.stats.streak, v:  Session.streak()},
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
   * @param {LogSet} today
   * @return {Object}
   */
  lists (today) {
    function ä (innerHTML) {
      return ø('h3', {className: 'mb3 f5 lhc', innerHTML});
    }

    const fr = document.createDocumentFragment();
    const ds = document.createElement('div');
    const dp = document.createElement('div');

    const le = ø('ul', {className: 'nodrag lsn h8 oya hvs'});
    const sl = le.cloneNode();
    const pl = le.cloneNode();

    const sd = UI.vis.list(0, today.sortValues(0), today);
    const pd = UI.vis.list(1, today.sortValues(1), today);

    fr.append(ds);
      ds.append(ä(Glossary.sec.plural));
      ds.append(sl);
        sl.append(sd || '');
    fr.append(dp);
      dp.append(ä(Glossary.pro.plural));
      dp.append(pl);
        pl.append(pd || '');

    return fr;
  }
}

module.exports = Overview;
