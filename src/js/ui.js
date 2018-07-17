'use strict';

Log.ui = {

  build () {
    const oe = Log.data.getRecentEntries(Log.config.ui.view - 1);
    const so = Log.data.sortEntries(oe);
    const et = Log.log.slice(-1)[0].e === undefined ?
      Log.cache.sortEnt.slice(-1)[0].slice(0, -1) :
      Log.cache.sortEnt.slice(-1)[0];

    const f = document.createDocumentFragment();
    const c = Object.assign(document.createElement('div'), {
      id: 'container', className: 'hf'
    });
    const m = Object.assign(document.createElement('div'), {id: 'main'});
    const m1 = Object.assign(document.createElement('div'), {
      id: 'overview', className: 'sect hf wf'
    });
    const m2 = Object.assign(document.createElement('div'), {
      id: 'details', className: 'dn sect hf wf'
    });
    const m3 = Object.assign(document.createElement('div'), {
      id: 'visualisation', className: 'nodrag dn sect hf oya oxh'
    });
    const m4 = Object.assign(document.createElement('div'), {
      id: 'entries', className: 'dn sect hf wf oya hoverScroll'
    });
    const m5 = Object.assign(document.createElement('div'), {
      id: 'journal', className: 'dn sect hf wf oya hoverScroll'
    });
    const m6 = Object.assign(document.createElement('div'), {
      id: 'guide', className: 'dn sect hf wf oys oxh'
    });

    f.append(c);
      c.append(Log.ui.header.build());
      c.append(m);
        m1.append(Log.ui.overview.build(et, so));
        m.append(m1);
        m2.append(Log.ui.details.build(so));
        m.append(m2);
        m3.append(Log.ui.visualisation(so));
        m.append(m3);
        m4.append(Log.ui.entries.build());
        m.append(m4);
        m5.append(Log.ui.journal.build());
        m.append(m5);
        m.append(m6);
      c.append(Log.ui.delModal());
    f.append(Log.ui.commander());

    ui.append(f);
  },

  header: {

    build () {
      const h = Object.assign(document.createElement('header'), {
        className: 'mb2 f6 lhc'
      });

      h.appendChild(Object.assign(document.createElement('h1'), {
        className: 'dib mr3 f5 upc tk', innerHTML: 'Log'
      }));
      h.appendChild(Log.ui.header.nav());
      h.appendChild(Log.ui.header.clock());

      return h;
    },

    nav () {
      const f = document.createDocumentFragment();
      const b = Object.assign(document.createElement('button'), {
        className: 'pv1 tab on bg-cl o5 mr3'
      });

      f.append(Object.assign(b.cloneNode(), {
        id: 'b-overview', innerHTML: 'Overview',
        className: 'pv1 tab on bg-cl of mr3',
        onclick: () => Log.tab('overview')
      }));
      f.append(Object.assign(b.cloneNode(), {
        id: 'b-details', innerHTML: 'Details',
        onclick: () => Log.tab('details')
      }));
      f.append(Object.assign(b.cloneNode(), {
        id: 'b-visualisation', innerHTML: 'Visualisation',
        onclick: () => Log.tab('visualisation')
      }));
      f.append(Object.assign(b.cloneNode(), {
        id: 'b-entries', innerHTML: 'Entries',
        onclick: () => Log.tab('entries')
      }));
      f.append(Object.assign(b.cloneNode(), {
        id: 'b-journal', innerHTML: 'Journal',
        onclick: () => Log.tab('journal')
      }));
      f.append(Object.assign(b.cloneNode(), {
        id: 'b-guide', innerHTML: 'Guide',
        onclick: () => Log.tab('guide')
      }));

      return f;
    },

    clock () {
      const c = Object.assign(document.createElement('span'), {
        className: 'rf f5 di tnum', innerHTML: '00:00:00'
      });

      Log.timerEl = c;
      Log.timer();

      return c;
    }
  },

  main () {
    const d = document.createElement('div');

    d.append(Object.assign(document.createElement('div'), {
      className: 'sect hf wf',
      id: 'overview'
    }));
    d.append(Object.assign(document.createElement('div'), {
      className: 'dn sect hf wf',
      id: 'details'
    }));
    d.append(Object.assign(document.createElement('div'), {
      className: 'nodrag dn sect hf oya oxh',
      id: 'visualisation'
    }));
    d.append(Object.assign(document.createElement('div'), {
      className: 'dn sect hf wf oya hoverScroll',
      id: 'entries'
    }));
    d.append(Object.assign(document.createElement('div'), {
      className: 'dn sect hf wf oya hoverScroll',
      id: 'journal'
    }));
    d.append(Object.assign(document.createElement('div'), {
      className: 'dn sect hf wf oys oxh',
      id: 'guide'
    }));

    return d;
  },

  overview: {

    build (e, s) {
      const f = document.createDocumentFragment();
      const dc = Object.assign(document.createElement('div'), {
        id: 'ovwCenter',
        className: 'oya noscroll'
      });
      const dr = Object.assign(document.createElement('div'), {
        id: 'ovwRight',
        className: 'f6 lhc'
      });

      f.append(Log.ui.overview.top(e));
      f.append(Log.ui.overview.peaks());
      f.append(dc);
        dc.append(Log.ui.overview.recent());
        dc.append(Log.ui.overview.chart(s));
        dc.append(Log.ui.overview.stats(e));
      f.append(dr);
        dr.append(Log.ui.overview.lists(e));

      return f;
    },

    top (ent) {
      const d = Object.assign(document.createElement('div'), {id: 'ovwTop'});
      const m = Object.assign(document.createElement('div'), {
        id: 'ovwMeter',
        className: 'mb3 psr wf sh2 bl br'
      });
      const c = Object.assign(document.createElement('div'), {
        id: 'dayChart',
        className: 'psr wf sh2 nodrag'
      });

      d.append(m);
        m.append(Log.vis.meterLines());
      d.append(c);
        c.append(Log.vis.dayChart(ent) || '');

      return d;
    },

    peaks () {
      const l = Object.assign(document.createElement('div'), {id: 'ovwLeft'});
      const ph = Object.assign(document.createElement('div'), {
        id: 'peakHours'
      });
      const pd = document.createElement('div');
      const hc = Object.assign(document.createElement('div'), {
        id: 'phc', className: 'psr h7 wf nodrag'
      });
      const dc = Object.assign(document.createElement('div'), {
        id: 'pdc', className: 'psr h7 wf nodrag'
      });
      const pt = Log.data.peakHours(Log.data.sortEntriesByDay()[new Date().getDay()]);

      l.append(Object.assign(document.createElement('h3'), {
        className: 'mb3 f6 lhc', innerHTML: 'Peaks'
      }));
      l.append(ph);
        ph.append(Object.assign(document.createElement('h3'), {
          className: 'mb2 f6 lhc fwn tnum',
          id: 'currentHour',
          innerHTML: 'Hour'
        }));
        ph.append(hc);
          hc.append(Log.vis.peakChart(0, pt));
      l.append(pd);
        pd.append(Object.assign(document.createElement('h3'), {
          className: 'mb2 f6 lhc fwn',
          id: 'currentDay',
          innerHTML: 'Day'
        }));
        pd.append(dc);
          dc.append(Log.vis.peakChart(1, Log.cache.pkd));

      return l;
    },

    recent () {
      const now = Log.log.slice(-1)[0];
      const nowDate = Log.time.toEpoch(now.s);
      const st = Log.time.stamp(nowDate);
      const le = Object.assign(document.createElement('div'), {
        id: 'lastEntry'
      });
      const lt = Object.assign(document.createElement('table'), {
        className: 'wf bn f6 lhc'
      });
      const lth = Object.assign(document.createElement('thead'), {
        className: 'al'
      });
      const ltb = document.createElement('tbody');
      const tr1 = document.createElement('tr');
      const tr2 = document.createElement('tr');

      le.append(lt);
        lt.append(lth);
          lth.append(tr1);
            tr1.append(Object.assign(document.createElement('th'), {
              className: 'pb1 pt0 pl0', innerHTML: 'Recent'
            }));
        lt.append(ltb);
          ltb.append(tr2);
            tr2.append(Object.assign(document.createElement('td'), {
              className: 'pl0', id: 'leid', innerHTML: user.log.length
            }));
            tr2.append(Object.assign(document.createElement('td'), {
              className: 'ltim',
              innerHTML: now.e === undefined ?
                `${st} –` : `${st} – ${Log.time.stamp(Log.time.toEpoch(now.e))}`
            }));
            tr2.append(Object.assign(document.createElement('td'), {
              className: 'lsec', innerHTML: now.c
            }));
            tr2.append(Object.assign(document.createElement('td'), {
              className: 'lpro', innerHTML: now.t
            }));
            tr2.append(Object.assign(document.createElement('td'), {
              className: 'pr0', innerHTML: now.d
            }));

      return le;
    },

    chart (so) {
      const c = Object.assign(document.createElement('div'), {
        id: 'overviewChart', className: 'psr'
      });
      c.append(Log.vis.barChart(Log.data.bar(so)) || '');
      return c;
    },

    stats (et) {
      const stats = Object.assign(document.createElement('ul'), {
        id: 'todayStats', className: 'lsn f6 lhc'
      });
      const dur = Log.data.listDurations(et);
      const now = Log.log.slice(-1)[0];
      const nowDate = Log.time.toEpoch(now.s);
      const st = Log.time.stamp(nowDate);
      const yd = Log.data.getEntriesByDate(nowDate.addDays(-1));
      const yDur = Log.data.listDurations(yd);
      const sum = Log.data.calcSum(dur);
      const min = Log.data.calcMin(dur);
      const max = Log.data.calcMax(dur);
      const avg = Log.data.calcAvg(dur);
      const foc = Log.data.projectFocus(Log.data.listProjects(et));
      const yfoc = Log.data.projectFocus(Log.data.listProjects(yd));
      const enc = et.length;
      const lhTrend = Log.data.trend(sum, Log.data.calcSum(yDur));
      const s = [
        {
          n: 'Total',
          v: Log.displayStat(sum),
          t: lhTrend
        },
        {
          n: 'Min',
          v: Log.displayStat(sum),
          t: Log.data.trend(min, Log.data.calcMin(yDur))
        },
        {
          n: 'Max',
          v: Log.displayStat(min),
          t: Log.data.trend(max, Log.data.calcMax(yDur))
        },
        {
          n: 'Avg',
          v: Log.displayStat(max),
          t: Log.data.trend(avg, Log.data.calcAvg(yDur))
        },
        {
          n: 'Coverage',
          v: `${Log.data.coverage(et).toFixed(2)}%`,
          t: lhTrend
        },
        {
          n: 'Focus',
          v: foc.toFixed(2),
          t: Log.data.trend(foc, yfoc)
        },
        {
          n: 'Logs',
          v: enc,
          t: Log.data.trend(enc, yd.length)
        },
        {
          n: 'Streak',
          v: Log.data.streak(),
          t: undefined
        },
      ];

      for (let i = 0, l = s.length; i < l; i++) {
        const {n, v, t} = s[i];
        const itm = Object.assign(document.createElement('li'), {
          className: 'mb3 c3'
        });

        itm.append(Object.assign(document.createElement('p'), {
          className: 'f4 fwb',
          innerHTML: v
        }));

        itm.append(Object.assign(document.createElement('p'), {
          innerHTML: `${n} (<span class="tnum">${t}</span>)`,
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
      const h = Object.assign(document.createElement('h3'), {
        className: 'mb3 f5 lhc'
      });
      const ul = Object.assign(document.createElement('ul'), {
        className: 'nodrag lsn h8 oya hoverScroll'
      });
      const sb = ul.cloneNode();
      const pb = ul.cloneNode();

      f.append(s);
        s.append(Object.assign(h.cloneNode(), {innerHTML: 'Sectors'}));
        s.append(sb);
          sb.append(Log.vis.list(0, Log.data.sortValues(ent, 0, 0), ent) || '');
      f.append(p);
        p.append(Object.assign(h.cloneNode(), {innerHTML: 'Projects'}));
        p.append(pb);
          pb.append(Log.vis.list(1, Log.data.sortValues(ent, 1, 0), ent) || '');

      return f;
    }
  },

  details: {

    build (so) {
      const {detail, summary} = Log.ui.details;
      const f = document.createDocumentFragment();
      const d = document.createElement('div');
      const m = Object.assign(document.createElement('div'), {
        className: 'oya'
      });
      const sm = Object.assign(document.createElement('div'), {
        id: 'summary', className: 'nodrag subsect hf oya hoverScroll'
      });
      const sd = Object.assign(document.createElement('div'), {
        id: 'sectorDetails', className: 'dn subsect hf'
      });
      const pd = Object.assign(document.createElement('div'), {
        id: 'projectDetails', className: 'dn subsect hf'
      });

      f.append(Log.ui.details.menu());
      f.append(m);
        m.append(sm);
          sm.append(summary.build(so));
        m.append(sd);
        m.append(pd);
        if (Log.log.length > 1) {
          sd.append(detail.build(0, Log.data.sortValues(Log.log, 0, 0)[0][0]));
          pd.append(detail.build(1, Log.data.sortValues(Log.log, 1, 0)[0][0]));
        }

      return f;
    },

    menu () {
      const menu = document.createElement('div');
      const btn = Object.assign(document.createElement('button'), {
        className: 'db mb3 subtab on bg-cl o5 mr3'
      });

      menu.append(Object.assign(btn.cloneNode(), {
        id: 'b-summary',
        className: 'db mb3 subtab on bg-cl of mr3',
        innerHTML: 'Summary',
        onclick: () => Log.tab('summary', 'subsect', 'subtab', true)
      }));

      menu.append(Object.assign(btn.cloneNode(), {
        id: 'b-sectorDetails',
        innerHTML: 'Sectors',
        onclick: () => Log.tab('sectorDetails', 'subsect', 'subtab', true)
      }));

      menu.append(Object.assign(btn.cloneNode(), {
        id: 'b-projectDetails',
        innerHTML: 'Projects',
        onclick: () => Log.tab('projectDetails', 'subsect', 'subtab', true)
      }));

      return menu;
    },

    summary: {

      build (so) {
        const f = document.createDocumentFragment();

        f.append(Log.ui.details.summary.stats());
        f.append(Log.ui.details.summary.peaks());
        f.append(Log.ui.details.summary.focus(so));
        f.append(Log.ui.details.summary.distribution());

        return f;
      },

      stats () {
        const {dur, sec, pro} = Log.cache;
        const stats = document.createElement('div');
        const list = Object.assign(document.createElement('ul'), {
          id: 'sumStats', className: 'mb5 lsn f6 lhc r'
        });
        const s = [
          {n: 'Total Hours', v: Log.displayStat(Log.data.calcSum(dur))},
          {n: 'Min Duration', v: Log.displayStat(Log.data.calcMin(dur))},
          {n: 'Max Duration', v: Log.displayStat(Log.data.calcMax(dur))},
          {n: 'Avg Duration', v: Log.displayStat(Log.data.calcAvg(dur))},
          {n: 'Daily Average', v: Log.displayStat(Log.data.avgLogHours())},
          {n: 'Coverage',   v: `${Log.data.coverage().toFixed(2)}%`},
          {n: 'Entries', v: user.log.length},
          {n: 'Sectors', v: sec.length},
          {n: 'Projects', v: pro.length}
        ];

        for (let i = 0; i < 9; i++) {
          const {n, v} = s[i];
          const stat = Object.assign(document.createElement('li'), {
            className: 'mb4 c3'
          });

          stat.append(Object.assign(document.createElement('p'), {
            className: 'f4 fwb', innerHTML: v
          }));

          stat.append(Object.assign(document.createElement('p'), {
            className: 'o9', innerHTML: n
          }));

          list.append(stat);
        }

        stats.append(list);

        return stats;
      },

      peaks () {
        const c = document.createElement('div');
        const h3 = Object.assign(document.createElement('h3'), {
          className: 'mb3 f6 lhc', innerHTML: 'Peaks'
        });
        const d1 = Object.assign(document.createElement('div'), {
          className: 'dib mb4 pr4 lf sh6 w5'
        });
        const d2 = Object.assign(document.createElement('div'), {
          className: 'dib mb4 pl4 lf sh6 w5'
        });
        const pth = Object.assign(document.createElement('div'), {
          id: 'pth', className: 'psr hf wf'
        });
        const pdh = Object.assign(document.createElement('div'), {
          id: 'pdh', className: 'psr hf wf'
        });
        const stats = Object.assign(document.createElement('ul'), {
          className: 'mb5 lsn f6 lhc r'
        });
        const s = [
          {n: 'Peak Hour', v: Log.data.peakHour()},
          {n: 'Peak Day', v: Log.data.peakDay()},
          {n: 'Peak Month', v: '-'}
        ];

        for (let i = 0; i < 3; i++) {
          const {n, v} = s[i];
          const item = Object.assign(document.createElement('li'), {
            className: 'mb0 c3'
          });

          item.append(Object.assign(document.createElement('p'), {
            className: 'f4 fwb', innerHTML: v
          }));
          item.append(Object.assign(document.createElement('p'), {
            className: 'o9', innerHTML: n
          }));

          stats.append(item);
        }

        c.append(Object.assign(document.createElement('h3'), {
          className: 'mb3 f6 lhc', innerHTML: 'Peaks'
        }));
        c.append(d1);
          d1.append(pth);
            pth.append(Log.vis.peakChart(0, Log.cache.pkh));
        c.append(d2);
          d2.append(pdh);
            pdh.append(Log.vis.peakChart(1, Log.cache.pkd));
        c.append(stats);

        return c;
      },

      focus (ent) {
        const pf = Log.data.listFocus(1);
        const d = document.createElement('div');
        const chart = Object.assign(document.createElement('div'), {
          id: 'focusChart', className: 'psr mb4 wf sh5'
        });
        const stats = Object.assign(document.createElement('ul'), {
          className: 'mb5 lsn f6 lhc r'
        });
        const s = [
          {n: 'Min Focus', v: Log.data.calcMin(pf).toFixed(2)},
          {n: 'Max Focus', v: Log.data.calcMax(pf).toFixed(2)},
          {n: 'Avg Focus', v: Log.data.calcAvg(pf).toFixed(2)}
        ];

        for (let i = 0, l = s.length; i < l; i++) {
          const {n, v} = s[i];
          const itm = Object.assign(document.createElement('li'), {
            className: 'c3'
          });

          itm.append(Object.assign(document.createElement('p'), {
            className: 'f4 fwb', innerHTML: v
          }));

          itm.append(Object.assign(document.createElement('p'), {
            className: 'o9', innerHTML: n
          }));

          stats.append(itm);
        }

        d.append(Object.assign(document.createElement('h3'), {
          className: 'mb3 f6 lhc', innerHTML: 'Focus'
        }));
        d.append(chart);
          chart.append(Log.vis.focusChart(Log.data.listFocus(1, ent)));
        d.append(stats);

        return d;
      },

      distribution () {
        const v = Log.data.sortValues(Log.log, 0, 1);
        const d = document.createElement('div');
        const b = Object.assign(document.createElement('div'), {
          id: 'secFocBar', className: 'mb3 wf sh2'
        });
        const l = Object.assign(document.createElement('ul'), {
          id: 'secLegSum', className: 'lsn r'
        });

        d.append(Object.assign(document.createElement('h3'), {
          className: 'mb3 f6 lhc', innerHTML: 'Sectors'
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
        let statSect = '';
        let entrySect = '';

        if (mode === 0) {
          ent = Log.data.getEntriesBySector(
            key, Log.data.getRecentEntries(Log.config.ui.view - 1)
          );
          his = Log.data.getEntriesBySector(key);
          sect = 'secsect';
          statSect = 'sectorStats';
          entrySect = 'sectorEntries';
        } else {
          ent = Log.data.getEntriesByProject(
            key, Log.data.getRecentEntries(Log.config.ui.view - 1)
          );
          his = Log.data.getEntriesByProject(key);
          sect = 'prosect';
          statSect = 'projectStats';
          entrySect = 'projectEntries';
        }

        const dur = Log.data.listDurations(his);
        const ph = Log.data.peakHours(his);
        const pd = Log.data.peakDays(his);
        const sh = Log.data.sortEntries(his);
        const el = ent.length;
        const {detail} = Log.ui.details;
        const f = document.createDocumentFragment();
        const c = Object.assign(document.createElement('div'), {
          className: 'nodrag oys hoverScroll'
        });
        const s1 = Object.assign(document.createElement('div'), {
          id: statSect, className: `${sect} hf`
        });
        const s2 = Object.assign(document.createElement('div'), {
          id: entrySect, className: `dn ${sect} hf`
        });

        f.append(c);
          c.append(detail.head(mode, key, ent, el));
          c.append(detail.tabs(mode));
          c.append(s1);
            s1.append(detail.overview(mode, ent));
            s1.append(detail.stats(dur, his, sh, ph, pd));
            s1.append(detail.peaks(ph, pd));
            s1.append(detail.focus(mode, ent, sh));
            s1.append(detail.distribution(mode, ent, his));
          c.append(s2);
            s2.append(detail.entries(mode, his));
        f.append(detail.list(mode));

        return f;
      },

      head (mode, key, ent, el) {
        const f = document.createDocumentFragment();

        f.append(Object.assign(document.createElement('h2'), {
          id: mode === 0 ? 'sectorTitle' : 'projectTitle',
          className: 'mb0 f4 lht',
          innerHTML: key
        }));

        f.append(Object.assign(document.createElement('p'), {
          id: mode === 0 ? 'sectorLastUpdate' : 'projectLastUpdate',
          className: 'mb2 f6 o7',
          innerHTML: el === 0 ?
            `No activity in the past ${Log.config.ui.view} days` :
            `Updated ${Log.time.timeago(Log.time.convert(ent.slice(-1)[0].e) * 1E3)}`
        }));

        return f;
      },

      overview (mode, ent) {
        const o = Object.assign(document.createElement('div'), {
          id: mode === 0 ? 'sectorOverviewChart' : 'projectOverviewChart',
          className: 'psr'
        });

        if (ent.length !== 0) {
          const se = Log.data.sortEntries(ent);
          o.append(Log.vis.barChart(Log.data.bar(se)));
        }

        return o;
      },

      tabs (mode) {
        const t = Object.assign(document.createElement('div'), {
          className: 'mb3 lhc'
        });

        let sect = '';
        let tab = '';
        let stats = '';
        let entries = '';

        if (mode === 0) {
          sect = 'secsect';
          tab = 'sectab';
          stats = 'sectorStats';
          entries = 'sectorEntries';
        } else {
          sect = 'prosect';
          tab = 'protab';
          stats = 'projectStats';
          entries = 'projectEntries';
        }

        t.append(Object.assign(document.createElement('button'), {
          className: 'pv1 sectab on bg-cl of mr3',
          id: `b-${stats}`,
          innerHTML: 'Stats',
          onclick: () => Log.tab(stats, sect, tab)
        }));
        t.append(Object.assign(document.createElement('button'), {
          className: 'pv1 sectab on bg-cl o5',
          id: `b-${entries}`,
          innerHTML: 'Entries',
          onclick: () => Log.tab(entries, sect, tab)
        }));

        return t;
      },

      stats (dur, his, sortHis, pkhd, pkdd) {
        const d = document.createElement('div');
        const list = Object.assign(document.createElement('ul'), {
          className: 'lsn f6 lhc r'
        });
        const s = [
          {n: 'Total Hours', v: Log.displayStat(Log.data.calcSum(dur))},
          {n: 'Min Duration', v: Log.displayStat(Log.data.calcMin(dur))},
          {n: 'Max Duration', v: Log.displayStat(Log.data.calcMax(dur))},
          {n: 'Avg Duration', v: Log.displayStat(Log.data.calcAvg(dur))},
          {n: 'Entries', v: his.length},
          {n: 'Streak', v: Log.data.streak(sortHis)},
          {n: 'Peak Hour', v: Log.data.peakHour(pkhd)},
          {n: 'Peak Day', v: Log.data.peakDay(pkdd)}
        ];

        for (let i = 0, l = s.length; i < l; i++) {
          const {n, v} = s[i];
          const item = Object.assign(document.createElement('li'), {
            className: 'mb4 c3'
          });

          item.append(Object.assign(document.createElement('p'), {
            innerHTML: v, className: 'f4 fwb'
          }));
          item.append(Object.assign(document.createElement('p'), {
            innerHTML: n, className: 'o9'
          }));

          list.append(item);
        }

        d.append(list);

        return d;
      },

      peaks (pkh, pkd) {
        const w = document.createElement('div');
        const d1 = Object.assign(document.createElement('div'), {
          className: 'dib mb4 pr4 lf sh6 w5'
        });
        const d2 = Object.assign(document.createElement('div'), {
          className: 'dib mb4 pl4 lf sh6 w5'
        });
        const h = Object.assign(document.createElement('div'), {
          className: 'psr hf wf'
        });
        const d = h.cloneNode();

        h.append(Log.vis.peakChart(0, pkh));
        d.append(Log.vis.peakChart(1, pkd));

        d1.append(h);
        d2.append(d);

        w.append(Object.assign(document.createElement('h3'), {
          className: 'mb3 f6', innerHTML: 'Peaks'
        }));
        w.append(d1);
        w.append(d2);

        return w;
      },

      focus (mode, ent, sortHis) {
        const foci = Log.data.listFocus(1, sortHis);
        const d = document.createElement('div');
        const stats = Object.assign(document.createElement('ul'), {
          className: 'mb4 lsn f6 lhc r'
        });
        const c = Object.assign(document.createElement('div'), {
          id: mode === 0 ? 'sFoc' : 'pFoc', className: 'psr mb4 wf'
        });
        const s = [
          {n: 'Min Focus', v: Log.data.calcMin(foci).toFixed(2)},
          {n: 'Max Focus', v: Log.data.calcMax(foci).toFixed(2)},
          {n: 'Avg Focus', v: Log.data.calcAvg(foci).toFixed(2)},
        ];

        for (let i = 0; i < 3; i++) {
          const {n, v} = s[i];
          const itm = Object.assign(document.createElement('li'), {
            className: 'c3'
          });

          itm.append(Object.assign(document.createElement('p'), {
            innerHTML: v,
            className: 'f4 fwb'
          }));
          itm.append(Object.assign(document.createElement('p'), {
            innerHTML: n,
            className: 'o9'
          }));

          stats.append(itm);
        }

        if (ent.length !== 0) {
          const se = Log.data.sortEntries(ent);
          c.append(Log.vis.focusChart(Log.data.listFocus(1, se), c));
        }

        d.append(Object.assign(document.createElement('h3'), {
          className: 'mb3 f6', innerHTML: 'Focus'
        }));
        d.append(c);
        d.append(stats);

        return d;
      },

      distribution (mode, ent, his) {
        const d = document.createElement('div');
        const b = Object.assign(document.createElement('div'), {
          id: mode === 0 ?
            'sectorFocusDistribution' : 'projectFocusDistribution',
          className: 'mb3 wf sh2'
        });
        const l = Object.assign(document.createElement('ul'), {
          id: mode === 0 ? 'sectorLegend' : 'projectLegend',
          className: 'lsn r'
        });

        if (ent.length !== 0) {
          const mod = mode === 0 ? 1 : 0;
          const sv = Log.data.sortValues(his, mod, 1);
          b.append(Log.vis.focusBar(mod, sv));
          l.append(Log.vis.legend(mod, sv));
        }

        d.append(Object.assign(document.createElement('h3'), {
          className: 'mb3 f6',
          innerHTML: mode === 0 ? 'Projects' : 'Sectors'
        }));
        d.append(b);
        d.append(l);

        return d;
      },

      entries (mode, his) {
        const table = Object.assign(document.createElement('table'), {
          className: 'wf bn'
        });
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const tbody = Object.assign(document.createElement('tbody'), {
          id: mode === 0 ? 'sectorLogs' : 'projectLogs',
          className: 'nodrag f6'
        });;
        const rev = his.slice(his.length - 100).reverse();

        for (let i = 0, l = rev.length; i < l; i++) {
          const {s, e, c, t, d, id} = rev[i];
          const startDate = Log.time.toEpoch(s);
          const startTime = Log.time.stamp(startDate);
          const detailKey = mode === 0 ? t : c;
          const row = Object.assign(document.createElement('tr'), {
            className: 'f6 al'
          });
          const time = document.createElement('td');
          const span = document.createElement('td');

          if (rev[i].e === undefined) {
            time.innerHTML = startTimestartTime;
            span.innerHTML = '–';
          } else {
            const end = Log.time.stamp(Log.time.toEpoch(e));
            time.innerHTML = `${startTime}–${end}`;
            span.innerHTML = Log.time.duration(s, e).toFixed(2);
          }

          row.append(Object.assign(document.createElement('td'), {
            innerHTML: id + 1, className: 'pl0'
          }));
          row.append(Object.assign(document.createElement('td'), {
            innerHTML: Log.time.displayDate(startDate)
          }));

          row.append(time);
          row.append(span);

          row.append(Object.assign(document.createElement('td'), {
            innerHTML: detailKey, className: 'c-pt',
            onclick: () => Log.nav.toDetail(mode === 0 ? 1 : 0, detailKey)
          }));
          row.append(Object.assign(document.createElement('td'), {
            innerHTML: d, className: 'pr0'
          }));

          tbody.append(row);
        }

        table.append(thead);
          thead.append(tr);
            tr.append(Object.assign(document.createElement('th'), {
              className: 'pl0', innerHTML: 'ID'
            }));
            tr.append(Object.assign(document.createElement('th'), {
              innerHTML: 'Date'
            }));
            tr.append(Object.assign(document.createElement('th'), {
              innerHTML: 'Time'
            }));
            tr.append(Object.assign(document.createElement('th'), {
              innerHTML: 'Span'
            }));
            tr.append(Object.assign(document.createElement('th'), {
              innerHTML: mode === 0 ? 'Project' : 'Sector'
            }));
            tr.append(Object.assign(document.createElement('th'), {
              className: 'pr0', innerHTML: 'Details'
            }));

        table.append(tbody);

        return table;
      },

      list (mode) {
        const list = Object.assign(document.createElement('ul'), {
          // id: mode === 0 ? 'sectorsList' : 'projectsList',
          className: 'nodrag oys lsn f6 lhc hoverScroll'
        });

        if (Log.log.length > 1) {
          const sv = Log.data.sortValues(Log.log, mode, 0);
          list.append(Log.vis.list(mode, sv));
        }

        return list;
      }
    }
  },

  visualisation (so) {
    const f = document.createDocumentFragment();
    const m = Object.assign(document.createElement('div'), {
      id: 'visMeter', className: 'psr wf sh2 bl br'
    });
    const v = Object.assign(document.createElement('div'), {
      className: 'nodrag oys hoverScroll'
    });

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
      const t = Object.assign(document.createElement('table'), {
        className: 'wf bn f6'
      });
      const h = Object.assign(document.createElement('thead'), {
        className: 'al'
      });
      const b = Object.assign(document.createElement('tbody'), {
        id: 'logbook', className: 'nodrag'
      });
      const n = ['Date', 'Time', 'Span', 'Sector', 'Project'];
      const el = user.log.length
      const arr = user.log.slice(el - 100).reverse();

      for (let i = 0, l = arr.length; i < l; i++) {
        const {s, e, c, t, d} = arr[i];
        const startDate = Log.time.toEpoch(s);
        const startTime = Log.time.stamp(startDate);
        const entryID = el - i - 1;
        const row = Object.assign(document.createElement('tr'), {
          id: `r${entryID}`
        });
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

        row.appendChild(Object.assign(document.createElement('td'), {
          className: 'pl0 c-pt hover',
          innerHTML: el - i,
          onclick: () => Log.edit(entryID)
        }));
        row.appendChild(Object.assign(document.createElement('td'), {
          className: 'c-pt hover',
          innerHTML: Log.time.displayDate(startDate),
          onclick: () => Log.nav.toJournal(`'${s}'`)
        }));
        row.appendChild(time);
        row.appendChild(span);
        row.appendChild(Object.assign(document.createElement('td'), {
          className: 'c-pt hover',
          innerHTML: c,
          onclick: () => Log.nav.toDetail(0, c)
        }));
        row.appendChild(Object.assign(document.createElement('td'), {
          className: 'c-pt hover',
          innerHTML: t,
          onclick: () => Log.nav.toDetail(1, t)
        }));
        row.appendChild(Object.assign(document.createElement('td'), {
          className: 'pr0',
          innerHTML: d
        }));

        b.appendChild(row);
      }

      t.append(h);
        h.append(Object.assign(document.createElement('th'), {
          className: 'pl0', innerHTML: 'ID'
        }));
        for (let i = 0, l = n.length; i < l; i++) {
          h.append(Object.assign(document.createElement('th'), {
            innerHTML: n[i]
          }));
        }
        h.append(Object.assign(document.createElement('th'), {
          className: 'pr0', innerHTML: 'Details'
        }));
      t.append(b);
        // b.append(Log.displayEntries(user.log, 100));

      return t;
    },

    modal () {
      const m = Object.assign(document.createElement('dialog'), {
        id: 'editModal', className: 'p4 cn bn h6'
      });
      const f = Object.assign(document.createElement('form'), {
        id: 'editForm', className: 'nodrag', onsubmit: () => false
      });

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

      m.append(Object.assign(document.createElement('p'), {
        id: 'editID', className: 'mb4 f6 lhc'
      }));
      m.append(f);
        f.append(Object.assign(document.createElement('input'), {
          id: 'editEntryID', type: 'hidden'
        }));
        f.append(Object.assign(document.createElement('input'), {
          id: 'editSector', className: 'db wf p2 mb3 bn',
          type: 'text', placeholder: 'Sector'
        }));
        f.append(Object.assign(document.createElement('input'), {
          id: 'editProject', className: 'db wf p2 mb3 bn',
          type: 'text', placeholder: 'Project'
        }));
        f.append(Object.assign(document.createElement('textarea'), {
          id: 'editDesc', className: 'db wf p2 mb3 bn',
          rows: '3', placeholder: 'Description (optional)'
        }));
        f.append(Object.assign(document.createElement('input'), {
          id: 'editStart', className: 'db wf p2 mb3 bn',
          type: 'datetime-local', step: '1'
        }));
        f.append(Object.assign(document.createElement('input'), {
          id: 'editEnd', className: 'db wf p2 mb3 bn',
          type: 'datetime-local', step: '1'
        }));
        f.append(Object.assign(document.createElement('input'), {
          id: 'editUpdate', className: 'dib p2 mr2 br1 bn',
          type: 'submit', value: 'Update'
        }));
        f.append(Object.assign(document.createElement('input'), {
          id: 'editCancel', className: 'dib p2 br1 bn',
          type: 'button', value: 'Cancel',
          onclick: () => {
            Log.modalMode = false;
            m.close();
          }
        }));

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
      const c = Object.assign(document.createElement('table'), {
        id: 'cal', className: 'calendar nodrag hf wf f6 lhc c-pt bn'
      });

      Log.journal.displayCalendar(c);

      return c;
    },

    modal () {
      const modal = Object.assign(document.createElement('dialog'), {
        id: 'entryModal', className: 'p4 cn bn h6'
      });
      const h2 = Object.assign(document.createElement('h2'), {
        id: 'journalDate', className: 'mb4 f6 lhc'
      });
      const top = Object.assign(document.createElement('div'), {
        className: 'h2'
      });
      const meter = Object.assign(document.createElement('div'), {
        id: 'jMeter', className: 'mb3 psr wf sh2 bl br'
      });
      const sidebar = Object.assign(document.createElement('div'), {
        className: 'r h7'
      });
      const stats = Object.assign(document.createElement('ul'), {
        className: 'c3 hf oys pr4 lsn f6 lhc hoverScroll'
      });
      const s = [
        {id: 'jSUM', n: 'Total Hours'},
        {id: 'jMIN', n: 'Min Duration'},
        {id: 'jMAX', n: 'Max Duration'},
        {id: 'jAVG', n: 'Avg Duration'},
        {id: 'jCOV', n: 'Coverage'},
        {id: 'jFOC', n: 'Focus'},
      ];

      Object.assign(modal.style, {
        backgroundColor: Log.config.ui.bg,
        color: Log.config.ui.colour
      });

      for (let i = 0, l = s.length; i < l; i++) {
        const {id, n} = s[i];
        const stat = Object.assign(document.createElement('li'), {
          className: 'mb3'
        });

        stat.append(Object.assign(document.createElement('p'), {
          id, innerHTML: '&ndash;', className: 'f4 fwb'
        }));
        stat.append(Object.assign(document.createElement('p'), {
          innerHTML: n, className: 'o9'
        }));

        stats.append(stat);
      }

      modal.append(h2);
      modal.append(top);
        top.append(meter);
          meter.append(Log.vis.meterLines());
        top.append(Object.assign(document.createElement('div'), {
          id: 'jDyc', className: 'mb3 psr wf sh2'
        }));
      modal.append(sidebar);
        sidebar.append(stats);
        sidebar.append(Object.assign(document.createElement('ul'), {
          id: 'jEnt', className: 'c9 pl4 hf oys lsn hoverScroll'
        }));

      return modal;
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
    const modal = document.createElement('dialog');

    modal.appendChild(Object.assign(document.createElement('p'), {
      id: 'delMessage', className: 'mb4 f6 lhc'
    }));
    modal.appendChild(Object.assign(document.createElement('ul'), {
      id: 'delList', className: 'mb3 lsn'
    }));
    modal.appendChild(Object.assign(document.createElement('button'), {
      id: 'delConfirm', className: 'p2 br1 bn f6'
    }));
    modal.appendChild(Object.assign(document.createElement('button'), {
      className: 'p2 br1 bn f6 lhc',
      onclick: () => {
        Log.modalMode = false;
        modal.close();
      }
    }));

    return modal;
  },

  commander () {
    const commander = Object.assign(document.createElement('form'), {
      action: '#',
      className: 'dn psf b0 l0 wf f6 z9',
      id: 'commander',
      onsubmit: () => false
    });

    const input = Object.assign(document.createElement('input'), {
      autofocus: 'autofocus',
      className: 'wf bg-0 blanc on bn p3',
      id: 'commanderInput',
      placeholder: 'Log.console',
      type: 'text'
    });

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
