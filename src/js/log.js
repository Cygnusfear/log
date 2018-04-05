/**
 * Log
 * A log and time-tracking system
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

const mainSectors = [phc, pdc, dyc, ovc, pth, pdh, secBars, proBars, secList, proList, visual, logbook, focusChart, secFocBar, secLegSum, jDyc, jEnt, cal];

const secSectors = [secChart, sPKH, sPKD, proFocDetail, proLeg, sFoc, secLog];
const proSectors = [proChart, secFocDetail, secLeg, pPKH, pPKD, pFoc, proLog];

const secDetailCache = {};
const proDetailCache = {};

var Log = {

  path: '',

  log: [],
  config: {},
  palette: {},
  projectPalette: {},
  clock: {},

  keyEventInitialized: false,

  cache: {
    entByDay: [],
    sortEnt: [],
    proFoc: [],
    dur: [],
    pkh: [],
    pkd: [],
    pro: [],
    sec: []
  },

  cmdIndex: 0,

  /**
   * Get log status; true means a session is in progress
   * @returns {boolean} Log status
   */
  status() {
    if (Log.log.length === 0) return;
    return Log.log.slice(-1)[0].e === undefined;
  },

  /**
   * Display a session timer
   * @param {boolean} status - Log status
   */
  timer(status) {
    if (!status) return;
    const l = Log.time.convert(Log.log.slice(-1)[0].s).getTime();
    const clock = document.getElementById('timer');

    Log.clock = setInterval(_ => {
      let s = ~~((new Date().getTime() - l) / 1E3);
      let m = ~~(s / 60);
      let h = ~~(m / 60);

      h %= 24;
      m %= 60;
      s %= 60;

      if (Log.config.system.timeFormat === 'decimal') {
        clock.innerHTML = Log.time.toDecimal(~~((new Date().getTime() - l) / 1E3));
      } else {
        clock.innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`;
      }
    }, 1E3);
  },

  /**
   * Play a sound effect
   * @param {string} sound - name of the sound file in /media
   */
  playSoundEffect(sound) {
    const audio = new Audio(`${__dirname}/media/${sound}.mp3`);
    audio.play();
  },

  /**
   * Display a log table
   * @param {Object[]} [ent] - Entries
   * @param {number} [num] - Number of entries to show
   * @param {string} [con] - Container
   */
  display(ent = user.log, num = 50, con = logbook) {
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof num !== 'number') return;
    if (typeof con !== 'object' || con === null) return;

    const arr = ent.slice(ent.length - num).reverse();

    for (let i = 0, l = arr.length; i < l; i++) {
      const rw = con.insertRow(i);
      const ic = rw.insertCell(0); // ID
      const dc = rw.insertCell(1); // date
      const tc = rw.insertCell(2); // time
      const rc = rw.insertCell(3); // duration
      const sc = rw.insertCell(4); // sector
      const pc = rw.insertCell(5); // project
      const nc = rw.insertCell(6); // description

      const dt = Log.time.convert(arr[i].s);
      const st = Log.time.stamp(dt);

      ic.className = 'pl0';
      ic.innerHTML = ent.length - i;

      dc.className = 'c-pt hvl';
      dc.innerHTML = Log.time.displayDate(dt);
      dc.setAttribute('onclick', `Log.nav.toJournal('${arr[i].s}')`);

      if (arr[i].e === undefined) {
        tc.innerHTML = `${st}`;
        rc.innerHTML = '—';
      } else {
        tc.innerHTML = `${st} – ${Log.time.stamp(Log.time.convert(arr[i].e))}`;
        rc.innerHTML = Log.time.duration(arr[i].s, arr[i].e).toFixed(2);
      }

      sc.innerHTML = arr[i].c;
      sc.className = 'c-pt hvl';
      sc.setAttribute('onclick', `Log.nav.toSecDetail('${arr[i].c}')`);

      pc.innerHTML = arr[i].t;
      pc.className = 'c-pt hvl';
      pc.setAttribute('onclick', `Log.nav.toProDetail('${arr[i].t}')`);

      nc.innerHTML = arr[i].d;
    }
  },

  detail: {

    /**
     * View sector details
     * @param {string} sec - Sector
     */
    sec(sec = Log.cache.sec.sort()[0]) {
      if (typeof sec !== 'string' || sec.length === 0) return;

      secSectors.map(e => e.innerHTML = '');

      let ent = [];
      let his = [];
      let dur = [];
      let pkh = [];
      let pkd = [];

      if (sec in secDetailCache) {
        ent = secDetailCache[sec].ent;
        his = secDetailCache[sec].his;
        dur = secDetailCache[sec].dur;
        pkh = secDetailCache[sec].pkh;
        pkd = secDetailCache[sec].pkd;
      } else {
        ent = Log.data.entries.bySec(
          sec, Log.data.recEnt(Log.config.ui.view - 1)
        );

        his = Log.data.entries.bySec(sec);
        dur = Log.data.listDur(his);
        pkh = Log.data.peakHours(his);
        pkd = Log.data.peakDays(his);

        secDetailCache[sec] = {
          ent, his, dur, pkh, pkd
        }
      }

      secTtl.innerHTML = sec;

      sectorLastUpdate.innerHTML = ent.length === 0 ?
        `No activity in the past ${Log.config.ui.view} days` :
        `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`;

      sEnt.innerHTML = his.length;
      sLHH.innerHTML = Log.data.sum(dur).toFixed(2);
      sLNH.innerHTML = Log.data.min(dur).toFixed(2);
      sLXH.innerHTML = Log.data.max(dur).toFixed(2);
      sASD.innerHTML = Log.data.avg(dur).toFixed(2);
      sPHH.innerHTML = Log.data.peakHour(pkh);
      sPDH.innerHTML = Log.data.peakDay(pkd);
      sSTK.innerHTML = Log.data.streak(Log.data.sortEnt(his));

      Log.vis.peakChart(0, pkh, sPKH);
      Log.vis.peakChart(1, pkd, sPKD);

      if (ent.length !== 0) {
        const foc = Log.data.listFocus(1, Log.data.sortEnt(ent));

        Log.vis.bar(Log.data.bar(ent, 'project'), secChart);
        Log.vis.focusChart(1, ent, sFoc);

        sFavg.innerHTML = Log.data.avg(foc).toFixed(2);
        sFmin.innerHTML = Log.data.min(foc).toFixed(2);
        sFmax.innerHTML = Log.data.max(foc).toFixed(2);

        Log.vis.focusBar(1, ent, proFocDetail);
        Log.vis.legend(1, ent, proLeg);
      }

      if (typeof ent !== 'object' || ent.length === 0) return;

      const arr = Log.data.entries.bySec(sec);
      const rev = arr.slice(arr.length - 100).reverse();

      for (let i = 0, l = rev.length; i < l; i++) {
        const rw = secLog.insertRow(i);

        const ic = rw.insertCell(0); // ID
        const dc = rw.insertCell(1); // date
        const tc = rw.insertCell(2); // time
        const rc = rw.insertCell(3); // duration
        const pc = rw.insertCell(4); // project
        const nc = rw.insertCell(5); // description

        const dt = Log.time.convert(rev[i].s);
        const st = Log.time.stamp(dt);

        ic.className = 'pl0';
        ic.innerHTML = rev[i].id;
        dc.innerHTML = Log.time.displayDate(dt);

        if (rev[i].e === undefined) {
          tc.innerHTML = st;
          rc.innerHTML = '–';
        } else {
          tc.innerHTML = `${st}–${Log.time.stamp(Log.time.convert(rev[i].e))}`;
          rc.innerHTML = Log.time.duration(rev[i].s, rev[i].e).toFixed(2);
        }

        pc.className = 'c-pt';
        pc.setAttribute('onclick', `Log.nav.toProDetail('${rev[i].t}')`);
        pc.innerHTML = rev[i].t;
        nc.innerHTML = rev[i].d;
      }
    },

    /**
     * View project details
     * @param {string} pro - Project
     */
    pro(pro = Log.cache.pro.sort()[0]) {
      if (typeof pro !== 'string' || pro.length === 0) return;

      proSectors.map(e => e.innerHTML = '');

      let ent = [];
      let his = [];
      let dur = [];
      let pkh = [];
      let pkd = [];

      if (pro in proDetailCache) {
        ent = proDetailCache[pro].ent;
        his = proDetailCache[pro].his;
        dur = proDetailCache[pro].dur;
        pkh = proDetailCache[pro].pkh;
        pkd = proDetailCache[pro].pkd;
      } else {
        ent = Log.data.entries.byPro(
          pro, Log.data.recEnt(Log.config.ui.view - 1)
        );

        his = Log.data.entries.byPro(pro);
        dur = Log.data.listDur(his);
        pkh = Log.data.peakHours(his);
        pkd = Log.data.peakDays(his);

        proDetailCache[pro] = {
          ent, his, dur, pkh, pkd
        }
      }

      proTtl.innerHTML = pro;

      proLastUpdate.innerHTML = ent.length === 0 ?
        `No activity in the past ${Log.config.ui.view} days` :
        `Updated ${Log.time.timeago(Log.time.parse(ent.slice(-1)[0].e) * 1E3)}`;

      pEnt.innerHTML = his.length;
      pLHH.innerHTML = Log.data.sum(dur).toFixed(2);
      pLNH.innerHTML = Log.data.min(dur).toFixed(2);
      pLXH.innerHTML = Log.data.max(dur).toFixed(2);
      pASD.innerHTML = Log.data.avg(dur).toFixed(2);
      pPHH.innerHTML = Log.data.peakHour(pkh);
      pPDH.innerHTML = Log.data.peakDay(pkd);
      pSTK.innerHTML = Log.data.streak(Log.data.sortEnt(his));

      Log.vis.peakChart(0, pkh, pPKH);
      Log.vis.peakChart(1, pkd, pPKD);

      if (ent.length !== 0) {
        const foc = Log.data.listFocus(0, Log.data.sortEnt(ent));

        Log.vis.bar(Log.data.bar(ent), proChart);
        Log.vis.focusChart(0, ent, pFoc);

        pFavg.innerHTML = Log.data.avg(foc).toFixed(2);
        pFmin.innerHTML = Log.data.min(foc).toFixed(2);
        pFmax.innerHTML = Log.data.max(foc).toFixed(2);

        Log.vis.focusBar(0, ent, secFocDetail);
        Log.vis.legend(0, ent, secLeg);
      }

      const arr = Log.data.entries.byPro(pro);
      const rev = arr.slice(arr.length - 100).reverse();

      for (let i = 0, l = rev.length; i < l; i++) {
        const rw = proLog.insertRow(i);

        const ic = rw.insertCell(0); // ID
        const dc = rw.insertCell(1); // date
        const tc = rw.insertCell(2); // time
        const rc = rw.insertCell(3); // duration
        const sc = rw.insertCell(4); // sector
        const nc = rw.insertCell(5); // description

        const dt = Log.time.convert(rev[i].s);
        const st = Log.time.stamp(dt);

        ic.className = 'pl0';
        ic.innerHTML = rev[i].id;
        dc.innerHTML = Log.time.displayDate(dt);

        if (rev[i].e === undefined) {
          tc.innerHTML = `${st}`;
          rc.innerHTML = '–';
        } else {
          tc.innerHTML = `${st}–${Log.time.stamp(Log.time.convert(rev[i].e))}`;
          rc.innerHTML = Log.time.duration(rev[i].s, rev[i].e).toFixed(2);
        }

        sc.className = 'c-pt';
        sc.setAttribute('onclick', `Log.nav.toSecDetail('${rev[i].c}')`);
        sc.innerHTML = rev[i].c;
        nc.innerHTML = rev[i].d;
      }
    }
  },

  utils: {

    /**
     * Calculate DP
     */
    calcDP(a) {
      if (a === undefined) return;

      const s = Log.time.convert(a);
      const y = s.getFullYear();
      const m = s.getMonth();
      const d = s.getDate();

      return ((
        new Date(y, m, d, s.getHours(), s.getMinutes(), s.getSeconds())
      ).getTime() / 1E3 - (
          new Date(y, m, d)
        ).getTime() / 1E3) / 86400 * 100;
    }
  },

  /**
   * Open a tab
   */
  tab(s, g, t, v = false) {
    const x = document.getElementsByClassName(g);
    const b = document.getElementsByClassName(t);
    const n = `${v ? `db mb3 ${t}` : `pv1 ${t}`} on bg-cl o5 mr3`;

    Log.nav.index = Log.nav.menu.indexOf(s);

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none';
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = n;
    }

    document.getElementById(s).style.display = 'grid';
    document.getElementById(`b-${s}`).className = `${v ?
      `db mb3 ${t}` : `pv1 ${t}`} on bg-cl of mr3`;
  },

  reset() {
    clearInterval(Log.clock);
    document.getElementById('timer').innerHTML = '00:00:00';
    mainSectors.map(e => e.innerHTML = '');
  },

  nav: {
    menu: ['ovw', 'lis', 'vis', 'tab', 'jou', 'gui'],
    index: 0,

    horizontal() {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1;
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
    },

    /**
     * Navigate to journal entry
     * @param {string} h - Hexadecimal time
     */
    toJournal(h) {
      Log.tab('jou', 'sect', 'tab');
      Log.journal.translate(h);
    },

    /**
     * Navigate to sector detail
     * @param {string} s - Sector
     */
    toSecDetail(s) {
      Log.tab('lis', 'sect', 'tab');
      Log.tab('sec', 'subsect', 'subtab', true);
      Log.detail.sec(s);
    },

    /**
     * Navigate to project detail
     * @param {string} p - Project
     */
    toProDetail(p) {
      Log.tab('lis', 'sect', 'tab');
      Log.tab('pro', 'subsect', 'subtab', true);
      Log.detail.pro(p);
    }
  },

  gen: {

    /**
     * Generate session cache
     */
    cache() {
      Log.cache.sortEnt = Log.data.sortEnt();
      Log.cache.sec = Log.data.listSec();
      Log.cache.pro = Log.data.listPro();
      Log.cache.proFoc = Log.data.listFocus(1);
      Log.cache.pkh = Log.data.peakHours();
      Log.cache.pkd = Log.data.peakDays();
      Log.cache.dur = Log.data.listDur();
      Log.cache.entByDay = Log.data.entries.byDay(new Date().getDay());
    },

    stats: {

      /**
       * Calculate and display today's stats
       * @param {Object} en - Today's entries
       */
      today(en) {
        const dur = Log.data.listDur(en);
        const now = Log.log.slice(-1)[0];
        const st = Log.time.stamp(Log.time.convert(now.s));

        tFOC.innerHTML = Log.data.proFocus(Log.data.listPro(en)).toFixed(2);
        tLPT.innerHTML = `${Log.data.lp(en).toFixed(2)}%`;
        tLHT.innerHTML = Log.data.sum(dur).toFixed(2);
        tLSN.innerHTML = Log.data.min(dur).toFixed(2);
        tLSX.innerHTML = Log.data.max(dur).toFixed(2);
        tASD.innerHTML = Log.data.avg(dur).toFixed(2);
        tSTK.innerHTML = Log.data.streak();
        tENC.innerHTML = en.length;

        leid.innerHTML = user.log.length;
        ltim.innerHTML = now.e === undefined ?
          `${st} –` :
          `${st} – ${Log.time.stamp(Log.time.convert(now.e))}`;
        lsec.innerHTML = now.c;
        lpro.innerHTML = now.t;
        ldsc.innerHTML = now.d;

        Log.vis.list(0, 0, secBars, en);
        Log.vis.list(1, 0, proBars, en);
      },

      /**
       * Calculate and display Details stats
       * @param {Object} mn - Overview entries
       */
      details(mn) {
        LHH.innerHTML = Log.data.sum(Log.cache.dur).toFixed(2);
        LNH.innerHTML = Log.data.min(Log.cache.dur).toFixed(2);
        LXH.innerHTML = Log.data.max(Log.cache.dur).toFixed(2);
        ASD.innerHTML = Log.data.avg(Log.cache.dur).toFixed(2);
        LPH.innerHTML = `${Log.data.lp().toFixed(2)}%`;
        ALH.innerHTML = Log.data.avgLh().toFixed(2);
        SCC.innerHTML = Log.cache.sec.length;
        PRC.innerHTML = Log.cache.pro.length;
        PHH.innerHTML = Log.data.peakHour();
        PDH.innerHTML = Log.data.peakDay();
        EHC.innerHTML = user.log.length;

        Log.vis.peakChart(0, Log.cache.pkh, pth);
        Log.vis.peakChart(1, Log.cache.pkd, pdh);
        Log.vis.focusChart(1, mn);

        if (Log.cache.proFoc.length !== 0) {
          Favg.innerHTML = Log.data.avg(Log.cache.proFoc).toFixed(2);
          Fmin.innerHTML = Log.data.min(Log.cache.proFoc).toFixed(2);
          Fmax.innerHTML = Log.data.max(Log.cache.proFoc).toFixed(2);
        }

        Log.vis.focusBar(0, Log.log, secFocBar);
        Log.vis.legend(0, Log.log, secLegSum);
      }
    }
  },

  load() {
    Log.config = user.config;
    Log.palette = user.palette;
    Log.projectPalette = user.projectPalette;
    Log.log = Log.data.parse(user.log);

    ui.style.backgroundColor = Log.config.ui.bg;
    ui.style.color = Log.config.ui.colour;

    if (user.log.length === 0) {
      Log.nav.index = 5;
      Log.tab('gui', 'sect', 'tab');
      return;
    }

    Log.gen.cache();

    Log.timer(Log.status());

    const mn = Log.data.recEnt(Log.config.ui.view - 1);

    Log.vis.peakChart(0, Log.data.peakHours(Log.data.sortEntByDay()[new Date().getDay()]), phc);
    Log.vis.peakChart(1, Log.cache.pkd, pdc);

    if (Log.log.length !== 1) {
      flh.innerHTML = Log.data.forecast.lh().toFixed(2);
      fsd.innerHTML = Log.data.forecast.sd().toFixed(2);
      fsf.innerHTML = Log.data.forecast.sf();
    }

    Log.vis.meterLines(ovwMeter);
    Log.vis.day();
    Log.vis.bar(Log.data.bar(mn), ovc);

    // Today's stats
    const en = Log.data.entries.byDate();
    if (en.length !== 0) Log.gen.stats.today(en);

    // Details stats
    Log.gen.stats.details(mn);

    if (Log.log.length > 1) {
      Log.detail.sec(Log.data.sortValues(Log.log, 0, 0)[0][0]);
      Log.vis.list(0, 0, secList);
      Log.detail.pro(Log.data.sortValues(Log.log, 1, 0)[0][0]);
      Log.vis.list(1, 0, proList);
    }

    Log.vis.meterLines(visMeter);
    Log.vis.line(Log.data.line(mn), visual);
    Log.display(user.log, 100);
    Log.journal.cal();
    Log.vis.meterLines(jMeter);
    Log.journal.display();
  },

  init() {
    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory'));
    } else {
      Log.console.history = [];
      localStorage.setItem('logHistory', JSON.stringify(Log.console.history));
    }

    cmd.addEventListener('submit', _ => {
      Log.cmdIndex = 0;
      if (con.value !== '') {
        if (con.value != Log.console.history[Log.console.history.length - 1]) {
          Log.console.history.push(con.value);
        }
        if (Log.console.history.length >= 100) Log.console.history.shift();
        localStorage.setItem('logHistory', JSON.stringify(Log.console.history));
        Log.console.parse(con.value);
      }

      con.value = '';
      cmd.style.display = 'none';
    });

    if (!Log.keyEventInitialized) {
      Log.keyEventInitialized = true;

      document.onkeydown = e => {
        if (e.which >= 65 && e.which <= 90) {
          cmd.style.display = 'block';
          con.focus();
        } else if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
          Log.nav.index = e.which - 49;
          Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
        } else if (e.key === 'Escape') {
          con.value = '';
          cmd.style.display = 'none';
          Log.cmdIndex = 0;
        } else if (e.which === 38) {
          cmd.style.display = 'block';
          con.focus();
          Log.cmdIndex++;

          const history = Log.console.history.length;

          if (Log.cmdIndex > history) {
            Log.cmdIndex = history;
          }

          con.value = Log.console.history[history - Log.cmdIndex];
        } else if (e.which === 40) {
          cmd.style.display = 'block';
          con.focus();
          Log.cmdIndex--;

          if (Log.cmdIndex < 1) Log.cmdIndex = 1;
          con.value = Log.console.history[Log.console.history.length - Log.cmdIndex];
        } else if (e.key === 'Tab') {
          e.preventDefault();
          Log.nav.horizontal();
        }

        if (e.key === 'o' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          Log.console.importUser();
          return;
        }

        if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          Log.console.exportUser();
        }
      };
    }

    const user = {
      config: dataStore.get('config') || {},
      palette: dataStore.get('palette') || {},
      projectPalette: dataStore.get('projectPalette') || {},
      log: dataStore.get('log') || [],
    }

    console.time('Log')
    Log.load();
    console.timeEnd('Log')
  }
};
