/**
 * Log
 * A log and time-tracking utility
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

let user = {};
let durPercentCache = {};
let widthCache = {};

let Log = {

  path: '',
  modalMode: false,

  config: {},
  log: [],
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
    sec: [],
  },

  commanderIndex: 0,

  status () {
    if (Log.log.length === 0) return;
    return Log.log.slice(-1)[0].e === undefined;
  },

  timer () {
    if (!Log.status()) return;
    const l = Log.time.toEpoch(Log.log.slice(-1)[0].s).getTime();
    const clock = document.getElementById('timer');

    Log.clock = setInterval(_ => {
      let s = ~~((new Date().getTime() - l) / 1E3);
      let m = ~~(s / 60);
      let h = ~~(m / 60);

      h %= 24;
      m %= 60;
      s %= 60;

      clock.innerHTML = `${`0${h}`.substr(-2)}:${`0${m}`.substr(-2)}:${`0${s}`.substr(-2)}`;
    }, 1E3);
  },

  playSound (sound) {
    new Audio(`${__dirname}/media/${sound}.mp3`).play();
  },

  displayEntries (ent = user.log, num = 50, con = logbook) {
    const el = ent.length;

    if (typeof ent !== 'object' || el === 0) return;
    if (typeof num !== 'number') return;
    if (typeof con !== 'object' || con === null) return;

    con.innerHTML = '';

    const arr = ent.slice(el - num).reverse();
    const frag = document.createDocumentFragment();
    const td = document.createElement('td');

    td.className = 'c-pt hover';

    const idc = td.cloneNode();
    const descc = td.cloneNode();

    idc.className = 'pl0 c-pt hover';
    descc.className = 'pr0';

    for (let i = 0, l = arr.length; i < l; i++) {
      const {s, e, c, t, d} = arr[i];
      const startDate = Log.time.toEpoch(s);
      const startTime = Log.time.stamp(startDate);
      const entryID = el - i - 1;
      const row = document.createElement('tr');
      const id = idc.cloneNode();
      const date = td.cloneNode();
      const time = td.cloneNode();
      const span = td.cloneNode();
      const sec = td.cloneNode();
      const pro = td.cloneNode();
      const dsc = descc.cloneNode();

      row.id = `r${entryID}`;

      id.setAttribute('onclick', `Log.edit(${entryID})`);
      date.setAttribute('onclick', `Log.nav.toJournal('${s}')`);
      sec.setAttribute('onclick', `Log.nav.toDetail(0, '${c}')`);
      pro.setAttribute('onclick', `Log.nav.toDetail(1, '${t}')`);

      id.innerHTML = el - i;
      date.innerHTML = Log.time.displayDate(startDate);

      if (e === undefined) {
        time.innerHTML = `${startTime} –`;
        span.innerHTML = '—';
      } else {
        const endTime = Log.time.stamp(Log.time.toEpoch(e));
        time.innerHTML = `${startTime} – ${endTime}`;
        span.innerHTML = Log.displayStat(Log.time.duration(s, e));
      }

      sec.innerHTML = c;
      pro.innerHTML = t;
      dsc.innerHTML = d;

      row.appendChild(id);
      row.appendChild(date);
      row.appendChild(time);
      row.appendChild(span);
      row.appendChild(sec);
      row.appendChild(pro);
      row.appendChild(dsc);
      frag.appendChild(row);
    }

    con.appendChild(frag);
  },

  displayStat (val) {
    if (Log.config.ui.stat === 'decimal') {
      return val.toFixed(2);
    } else {
      const v = val.toString().split('.');
      if (v.length === 1) v[1] = '0';
      const mm = `0${(Number(`0.${v[1]}`) * 60).toFixed(0)}`.substr(-2);
      return `${v[0]}:${mm}`;
    }
  },

  /**
   * Summon Edit modal
   * @param {number} id - Entry ID
   */
  edit (id) {
    editStart.value = '';
    editEnd.value = '';

    const entry = user.log[id];
    const s = Log.time.toEpoch(entry.s);
    const sy = s.getFullYear();
    const sm = `0${s.getMonth() + 1}`.substr(-2);
    const sd = `0${s.getDate()}`.substr(-2);
    const sh = `0${s.getHours()}`.substr(-2);
    const sn = `0${s.getMinutes()}`.substr(-2);
    const ss = `0${s.getSeconds()}`.substr(-2);

    editID.innerHTML = id + 1;
    editEntryID.value = id;
    editSector.value = entry.c;
    editProject.value = entry.t;
    editDesc.value = entry.d;

    editStart.value = `${sy}-${sm}-${sd}T${sh}:${sn}:${ss}`;

    if (entry.e !== undefined) {
      const e = Log.time.toEpoch(entry.e);
      const ey = e.getFullYear();
      const em = `0${e.getMonth() + 1}`.substr(-2);
      const ed = `0${e.getDate()}`.substr(-2);
      const eh = `0${e.getHours()}`.substr(-2);
      const en = `0${e.getMinutes()}`.substr(-2);
      const es = `0${e.getSeconds()}`.substr(-2);

      editEnd.value = `${ey}-${em}-${ed}T${eh}:${en}:${es}`;
    }

    Log.modalMode = true;
    document.getElementById('editModal').showModal();
  },

  /**
   * Summon Delete modal
   * @param {string} i - Command input
   */
  confirmDelete (i) {
    delList.innerHTML = '';

    const words = i.split(' ').slice(1);
    let count = 0;

    if (words[0] === 'project') {
      user.log.forEach((e, id) => {
        if (e.t === words[1]) count++;
      });

      delMessage.innerHTML = `Are you sure you want to delete the ${words[1]} project? ${count} entries will be deleted. This can't be undone.`;
    } else if (words[0] === 'sector') {
      let count = 0;
      user.log.forEach((e, id) => {
        if (e.c === words[1]) count++;
      });

      delMessage.innerHTML = `Are you sure you want to delete the ${words[1]} sector? ${count} entries will be deleted. This can't be undone.`;
    } else {
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();

      delMessage.innerHTML = aui.length > 1 ?
        `Are you sure you want to delete the following ${aui.length} entries? This can't be undone.` :
        'Are you sure you want to delete the following entry? This can\'t be undone.' ;

      const span = document.createElement('span');
      span.className = 'mr3 o7';

      aui.forEach(i => {
        const {s, e, c, t, d} = user.log[Number(i) - 1];
        const start = Log.time.stamp(Log.time.toEpoch(s));
        const end = Log.time.stamp(Log.time.toEpoch(e));
        const li = document.createElement('li');
        const id = span.cloneNode();
        const tm = span.cloneNode();
        const sc = span.cloneNode();
        const pr = document.createElement('span');
        const dc = document.createElement('p');

        li.className = 'f6 lhc pb3 mb3';
        id.innerHTML = i;
        tm.innerHTML = `${start} &ndash; ${end}`;
        sc.innerHTML = c;

        Object.assign(pr, {className: 'o7', innerHTML: t});
        Object.assign(dc, {className: 'f4 lhc', innerHTML: d});

        li.appendChild(id);
        li.appendChild(tm);
        li.appendChild(sc);
        li.appendChild(pr);
        li.appendChild(dc);
        delList.append(li);
      });
    }

    delConfirm.setAttribute('onclick', `Log.deleteIt('${i}')`);
    delModal.showModal();
  },

  /**
   * Hacky solution
   */
  deleteIt (i) {
    Log.console.deleteEntry(i);
    delModal.close();
  },

  /**
   * Update entry
   * @param {number} id - Entry ID
   */
  update (id) {
    const row = document.getElementById(`r${id}`);
    const nodes = row.childNodes;
    const s = new Date(editStart.value);
    const e = editEnd.value === '' ? '' : new Date(editEnd.value);
    const sh = Log.time.toHex(s);
    const eh = e === '' ? undefined : Log.time.toHex(e);

    nodes[1].innerHTML = Log.time.displayDate(s);

    if (eh === undefined) {
      nodes[2].innerHTML = Log.time.stamp(s);
      nodes[3].innerHTML = '—';
    } else {
      nodes[2].innerHTML = `${Log.time.stamp(s)} – ${Log.time.stamp(e)}`;
      nodes[3].innerHTML = Log.time.duration(sh, eh).toFixed(2);
    }

    nodes[4].innerHTML = editSector.value;
    nodes[5].innerHTML = editProject.value;
    nodes[6].innerHTML = editDesc.value;

    Object.assign(user.log[id], {
      s: sh,
      e: eh,
      c: editSector.value,
      t: editProject.value,
      d: editDesc.value
    })

    localStorage.setItem('user', JSON.stringify(user));
    dataStore.set('log', user.log);

    journalCache = {};

    document.getElementById('editModal').close();
    Log.modalMode = false;

    Log.refresh();
  },

  viewDetails (mode, key) {
    if (typeof mode !== 'number' || mode < 0 || mode > 1) return;
    if (typeof key !== 'string' || key.length === 0) return;

    let ent = [], his = [], dur = [], pkh = [], pkd = [];
    let title = '', lastUpdate = '';
    let sum, min, max, avg, enc, stk, phh, pdh;

    let entArr = [];
    let entryTable;

    if (mode === 0) {
      ent = Log.data.getEntriesBySector(
        key, Log.data.getRecentEntries(Log.config.ui.view - 1)
      );

      his = Log.data.getEntriesBySector(key);
      dur = Log.data.listDurations(his);
      pkh = Log.data.peakHours(his);
      pkd = Log.data.peakDays(his);

      title = sectorTitle;
      lastUpdate = sectorLastUpdate;

      sum = sSUM;
      min = sMIN;
      max = sMAX;
      avg = sAVG;
      enc = sENC;
      stk = sSTK;
      phh = sPHH;
      pdh = sPDH;

      entArr = Log.data.getEntriesBySector(key);
      entryTable = sectorLogs;
    } else {
      ent = Log.data.getEntriesByProject(
        key, Log.data.getRecentEntries(Log.config.ui.view - 1)
      );

      his = Log.data.getEntriesByProject(key);
      dur = Log.data.listDurations(his);
      pkh = Log.data.peakHours(his);
      pkd = Log.data.peakDays(his);

      title = projectTitle;
      lastUpdate = projectLastUpdate;

      sum = pSUM;
      min = pMIN;
      max = pMAX;
      avg = pAVG;
      enc = pENC;
      stk = pSTK;
      phh = pPHH;
      pdh = pPDH;

      entArr = Log.data.getEntriesByProject(key);
      entryTable = projectLogs;
    }

    const sortHis = Log.data.sortEntries(his);
    const el = ent.length;

    title.innerHTML = key;

    lastUpdate.innerHTML = el === 0 ?
      `No activity in the past ${Log.config.ui.view} days` :
      `Updated ${Log.time.timeago(Log.time.convert(ent.slice(-1)[0].e) * 1E3)}`;

    sum.innerHTML = Log.displayStat(Log.data.calcSum(dur));
    min.innerHTML = Log.displayStat(Log.data.calcMin(dur));
    max.innerHTML = Log.displayStat(Log.data.calcMax(dur));
    avg.innerHTML = Log.displayStat(Log.data.calcAvg(dur));
    enc.innerHTML = his.length;
    stk.innerHTML = Log.data.streak(sortHis);
    phh.innerHTML = Log.data.peakHour(pkh);
    pkd.innerHTML = Log.data.peakDay(pkd);

    if (typeof ent !== 'object' || el === 0) return;

    entryTable.innerHTML = '';

    const rev = entArr.slice(entArr.length - 100).reverse();
    const frag = document.createDocumentFragment();
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const idCell = td.cloneNode();
    const spCell = td.cloneNode();
    const descCell = td.cloneNode();

    idCell.className = 'pl0';
    spCell.className = 'c-pt';
    descCell.className = 'pr0';

    for (let i = 0, l = rev.length; i < l; i++) {
      const {s, e, c, t, d, id} = rev[i];
      const startDate = Log.time.toEpoch(s);
      const startTime = Log.time.stamp(startDate);
      const detailKey = mode === 0 ? t : c;
      const row = tr.cloneNode();
      const idd = idCell.cloneNode();
      const date = td.cloneNode();
      const time = td.cloneNode();
      const span = td.cloneNode();
      const pro = spCell.cloneNode();
      const desc = descCell.cloneNode();

      pro.setAttribute(
        'onclick', `Log.nav.toDetail(${mode === 0 ? 1 : 0}, '${detailKey}')`
      );

      idd.innerHTML = id + 1;
      date.innerHTML = Log.time.displayDate(startDate);

      if (rev[i].e === undefined) {
        time.innerHTML = startTimestartTime;
        span.innerHTML = '–';
      } else {
        const end = Log.time.stamp(Log.time.toEpoch(e));
        time.innerHTML = `${startTime}–${end}`;
        span.innerHTML = Log.time.duration(s, e).toFixed(2);
      }

      pro.innerHTML = detailKey;
      desc.innerHTML = d;

      row.appendChild(idd);
      row.appendChild(date);
      row.appendChild(time);
      row.appendChild(span);
      row.appendChild(pro);
      row.appendChild(desc);
      frag.appendChild(row);
    }

    entryTable.appendChild(frag);

    if (mode === 0) {
      Log.vis.peakChart(0, pkh, sPKH);
      Log.vis.peakChart(1, pkd, sPKD);

      if (el !== 0) {
        const foci = Log.data.listFocus(1, sortHis);
        const sortEnt = Log.data.sortEntries(ent);
        const pfSortVal = Log.data.sortValues(his, 1, 1);

        Log.vis.barChart(Log.data.bar(sortEnt, 'project'), sectorOverviewChart);
        Log.vis.focusChart(Log.data.listFocus(1, sortEnt), sFoc);

        sFavg.innerHTML = Log.data.calcAvg(foci).toFixed(2);
        sFmin.innerHTML = Log.data.calcMin(foci).toFixed(2);
        sFmax.innerHTML = Log.data.calcMax(foci).toFixed(2);

        Log.vis.focusBar(1, pfSortVal, proFocDetail);
        Log.vis.legend(1, pfSortVal, proLeg);
      }
    } else {
      Log.vis.peakChart(0, pkh, pPKH);
      Log.vis.peakChart(1, pkd, pPKD);

      if (el !== 0) {
        const foci = Log.data.listFocus(0, sortHis);
        const sortEnt = Log.data.sortEntries(ent);
        const sfSortVal = Log.data.sortValues(his, 0, 1);

        Log.vis.barChart(Log.data.bar(sortEnt), projectOverviewChart);
        Log.vis.focusChart(Log.data.listFocus(0, sortEnt), pFoc);

        pFavg.innerHTML = Log.data.calcAvg(foci).toFixed(2);
        pFmin.innerHTML = Log.data.calcMin(foci).toFixed(2);
        pFmax.innerHTML = Log.data.calcMax(foci).toFixed(2);

        Log.vis.focusBar(0, sfSortVal, sectorFocusDistribution);
        Log.vis.legend(0, sfSortVal, sectorLegend);
      }
    }
  },

  calcDurPercent (h) {
    if (h in durPercentCache) {
      return durPercentCache[h];
    } else {
      const s = Log.time.toEpoch(h);
      return durPercentCache[h] = (
        s.getTime() / 1E3 -
        (new Date(
          s.getFullYear(), s.getMonth(), s.getDate()
        )).getTime() / 1E3
      ) / 86400 * 100;
    }
  },

  calcWidth (dur) {
    return dur in widthCache ? widthCache[dur] :
      widthCache[dur] = dur * 360 / 8640 * 100;
  },

  tab (s, g, t, v = false) {
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

  setDayLabel (d = new Date().getDay()) {
    currentDay.innerHTML = days[d].substring(0, 3);
  },

  setTimeLabel (h = new Date().getHours()) {
    currentHour.innerHTML = `${h}:00`;
  },

  reset () {
    clearInterval(Log.clock);
    document.getElementById('timer').innerHTML = '00:00:00';
  },

  nav: {
    menu: [
      'overview', 'details', 'visualisation', 'entries', 'journal', 'guide'
    ],

    index: 0,

    horizontal () {
      const {nav, tab} = Log;
      nav.index = nav.index === 5 ? 0 : nav.index + 1;
      tab(nav.menu[nav.index], 'sect', 'tab');
    },

    toJournal (h) {
      Log.tab('journal', 'sect', 'tab');
      Log.journal.translate(h);
    },

    toDetail (mod, key) {
      if (typeof mod !== 'number' || mod < 0 || mod > 1) return;
      if (typeof key !== 'string' || key.length === 0) return;

      const s = mod === 0 ? 'sectorDetails' : 'projectDetails';

      Log.tab('details', 'sect', 'tab');
      Log.tab(s, 'subsect', 'subtab', true);
      Log.viewDetails(mod, key);
    }
  },

  generateSessionCache () {
    const {data} = Log;
    Object.assign(Log.cache, {
      sortEnt: data.sortEntries(),
      sec: data.listSectors() || [],
      pro: data.listProjects() || [],
      proFoc: data.listFocus(1) || [],
      pkh: data.peakHours() || [],
      pkd: data.peakDays() || [],
      dur: data.listDurations() || []
    });
  },

  todayStats (ent) {
    if (typeof ent !== 'object' || ent.length === 0) return;

    const dur = Log.data.listDurations(ent);
    const now = Log.log.slice(-1)[0];
    const nowDate = Log.time.toEpoch(now.s);
    const st = Log.time.stamp(nowDate);
    const yd = Log.data.getEntriesByDate(nowDate.addDays(-1));
    const yDur = Log.data.listDurations(yd);
    const sum = Log.data.calcSum(dur);
    const min = Log.data.calcMin(dur);
    const max = Log.data.calcMax(dur);
    const avg = Log.data.calcAvg(dur);
    const foc = Log.data.projectFocus(Log.data.listProjects(ent));
    const yfoc = Log.data.projectFocus(Log.data.listProjects(yd));
    const enc = ent.length;
    const lhTrend = Log.data.trend(sum, Log.data.calcSum(yDur));

    tSUM.innerHTML = Log.displayStat(sum);
    tMIN.innerHTML = Log.displayStat(min);
    tMAX.innerHTML = Log.displayStat(max);
    tAVG.innerHTML = Log.displayStat(avg);
    tCOV.innerHTML = `${Log.data.coverage(ent).toFixed(2)}%`;
    tFOC.innerHTML = foc.toFixed(2);
    tSTK.innerHTML = Log.data.streak();
    tENC.innerHTML = enc;

    tSUMtr.innerHTML = lhTrend;
    tMINtr.innerHTML = Log.data.trend(min, Log.data.calcMin(yDur));
    tMAXtr.innerHTML = Log.data.trend(max, Log.data.calcMax(yDur));
    tAVGtr.innerHTML = Log.data.trend(avg, Log.data.calcAvg(yDur));
    tCOVtr.innerHTML = lhTrend;
    tFOCtr.innerHTML = Log.data.trend(foc, yfoc);
    tENCtr.innerHTML = Log.data.trend(enc, yd.length);

    leid.innerHTML = user.log.length;
    ltim.innerHTML = now.e === undefined ?
      `${st} –` : `${st} – ${Log.time.stamp(Log.time.toEpoch(now.e))}`;
    lsec.innerHTML = now.c;
    lpro.innerHTML = now.t;
    ldsc.innerHTML = now.d;

    Log.vis.list(0, Log.data.sortValues(ent, 0, 0), secBars, ent);
    Log.vis.list(1, Log.data.sortValues(ent, 1, 0), proBars, ent);
  },

  detailStats (ent) {
    const sortVal = Log.data.sortValues(Log.log, 0, 1);

    SUM.innerHTML = Log.displayStat(Log.data.calcSum(Log.cache.dur));
    MIN.innerHTML = Log.displayStat(Log.data.calcMin(Log.cache.dur));
    MAX.innerHTML = Log.displayStat(Log.data.calcMax(Log.cache.dur));
    AVG.innerHTML = Log.displayStat(Log.data.calcAvg(Log.cache.dur));
    COV.innerHTML = `${Log.data.coverage().toFixed(2)}%`;
    DAV.innerHTML = Log.displayStat(Log.data.avgLogHours());
    SCC.innerHTML = Log.cache.sec.length;
    PRC.innerHTML = Log.cache.pro.length;
    PHH.innerHTML = Log.data.peakHour();
    PDH.innerHTML = Log.data.peakDay();
    ENC.innerHTML = user.log.length;

    Log.vis.peakChart(0, Log.cache.pkh, pth);
    Log.vis.peakChart(1, Log.cache.pkd, pdh);
    Log.vis.focusChart(Log.data.listFocus(1, ent), focusChart);

    if (Log.cache.proFoc.length !== 0) {
      Favg.innerHTML = Log.data.calcAvg(Log.cache.proFoc).toFixed(2);
      Fmin.innerHTML = Log.data.calcMin(Log.cache.proFoc).toFixed(2);
      Fmax.innerHTML = Log.data.calcMax(Log.cache.proFoc).toFixed(2);
    }

    Log.vis.focusBar(0, sortVal, secFocBar);
    Log.vis.legend(0, sortVal, secLegSum);
  },

  load () {
    const {bg, colour} = Log.config.ui;

    Object.assign(ui.style, {backgroundColor: bg, color: colour});
    Object.assign(editModal.style, {backgroundColor: bg, color: colour});
    Object.assign(entryModal.style, {backgroundColor: bg, color: colour});
    Object.assign(delModal.style, {backgroundColor: bg, color: colour});

    if (user.log.length === 0) {
      Log.nav.index = 5;
      Log.tab('guide', 'sect', 'tab');
      return;
    }

    Log.generateSessionCache();

    const overviewEntries = Log.data.getRecentEntries(Log.config.ui.view - 1);
    const sortOverview = Log.data.sortEntries(overviewEntries);
    const entriesToday = Log.log.slice(-1)[0].e === undefined ?
      Log.cache.sortEnt.slice(-1)[0].slice(0, -1) :
      Log.cache.sortEnt.slice(-1)[0];

    Log.setTimeLabel();
    Log.setDayLabel();

    Log.vis.peakChart(0, Log.data.peakHours(Log.data.sortEntriesByDay()[new Date().getDay()]), phc);
    Log.vis.peakChart(1, Log.cache.pkd, pdc);

    Log.vis.dayChart(entriesToday, dayChart);
    Log.vis.barChart(Log.data.bar(sortOverview), overviewChart);

    Log.todayStats(entriesToday);
    Log.detailStats(sortOverview);

    if (Log.log.length > 1) {
      const sortValSec = Log.data.sortValues(Log.log, 0, 0);
      const sortValPro = Log.data.sortValues(Log.log, 1, 0);

      Log.viewDetails(0, sortValSec[0][0]);
      Log.vis.list(0, sortValSec, sectorsList);

      Log.viewDetails(1, sortValPro[0][0]);
      Log.vis.list(1, sortValPro, projectsList);
    }

    Log.vis.visualisation(Log.data.visualisation(sortOverview));
    Log.displayEntries(user.log, 50);
    Log.journal.displayCalendar();

    Log.timer();
  },

  refresh () {
    Log.reset();
    Log.load();
  },

  init () {
    user = {
      config: dataStore.get('config'),
      palette: dataStore.get('palette'),
      projectPalette: dataStore.get('projectPalette'),
      log: dataStore.get('log')
    }

    try {
      Log.config = user.config;
      Log.palette = user.palette;
      Log.projectPalette = user.projectPalette;
      Log.log = Log.data.parse(user.log);
    } catch (e) {
      console.error('User log data contains errors');
      new window.Notification('There is something wrong with this file.');
      return;
    }

    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory'));
    } else {
      Log.console.history = [];
      localStorage.setItem('logHistory', JSON.stringify(Log.console.history));
    }

    console.time('Log');
    Log.load();
    console.timeEnd('Log');

    if (!Log.keyEventInitialized) {
      Log.keyEventInitialized = true;

      document.onkeydown = e => {
        if (Log.modalMode) return;

        if (e.which >= 65 && e.which <= 90) {
          commander.style.display = 'block';
          commanderInput.focus();
          return;
        }

        if (e.which >= 48 && e.which <= 54 && (e.ctrlKey || e.metaKey)) {
          Log.nav.index = e.which - 49;
          Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
          return;
        }

        const l = Log.console.history.length;

        switch (e.which) {
          case 9: // Tab
            e.preventDefault();
            Log.nav.horizontal();
            break;
          case 27: // Escape
            commanderInput.value = '';
            commander.style.display = 'none';
            Log.commanderIndex = 0;
            break;
          case 38: // Up
            commander.style.display = 'block';
            commanderInput.focus();
            Log.commanderIndex++;
            if (Log.commanderIndex > l) Log.commanderIndex = l;
            commanderInput.value = Log.console.history[l - Log.commanderIndex];
            break;
          case 40: // Down
            commander.style.display = 'block';
            commanderInput.focus();
            Log.commanderIndex--;
            if (Log.commanderIndex < 1) Log.commanderIndex = 1;
            commanderInput.value = Log.console.history[l - Log.commanderIndex];
            break;
          default:
            break;
        }
      };
    }

    commander.addEventListener('submit', _ => {
      Log.commanderIndex = 0;

      const v = commanderInput.value;

      if (v !== '') {
        const l = Log.console.history.length;

        if (v != Log.console.history[l - 1]) Log.console.history[l] = v;
        if (l >= 100) Log.console.history.shift();

        localStorage.setItem('logHistory', JSON.stringify(Log.console.history));
        Log.console.parse(v);
      }

      commanderInput.value = '';
      commander.style.display = 'none';
    });

    document.addEventListener('click', ({target}) => {
      target === entryModal && entryModal.close()
    });

    editModal.onkeydown = e => {
      if (e.key === 'Escape') Log.modalMode = false;
    }

    document.addEventListener('click', ({target}) => {
      if (target === editModal) {
        Log.modalMode = false;
        editModal.close();
      }
    });

    editForm.addEventListener('submit', _ => {
      Log.update(editEntryID.value);
      Log.modalMode = false;
    });
  }
};
