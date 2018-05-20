/**
 * Log
 * A log and time-tracking utility
 *
 * @author Josh Avanier
 * @license MIT
 */

'use strict';

let user = {};
let secDetailCache = {};
let proDetailCache = {};

var Log = {

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

  status() {
    if (Log.log.length === 0) return;
    return Log.log.slice(-1)[0].e === undefined;
  },

  timer() {
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

  playSound(sound) {
    const audio = new Audio(`${__dirname}/media/${sound}.mp3`);
    audio.play();
  },

  displayEntryTable(ent = user.log, num = 50, con = logbook) {
    if (typeof ent !== 'object' || ent.length === 0) return;
    if (typeof num !== 'number') return;
    if (typeof con !== 'object' || con === null) return;

    const arr = ent.slice(ent.length - num).reverse();

    for (let i = 0, l = arr.length; i < l; i++) {
      const row = con.insertRow(i);
      const id = row.insertCell(0);
      const date = row.insertCell(1);
      const time = row.insertCell(2);
      const span = row.insertCell(3);
      const sec = row.insertCell(4);
      const pro = row.insertCell(5);
      const desc = row.insertCell(6);

      const startDate = Log.time.toEpoch(arr[i].s);
      const startTime = Log.time.stamp(startDate);

      row.id = `tr-${ent.length - i - 1}`;

      id.setAttribute('onclick', `Log.edit(${ent.length - i - 1})`);
      id.className = 'pl0 c-pt hover';
      id.innerHTML = ent.length - i;

      date.setAttribute('onclick', `Log.nav.toJournal('${arr[i].s}')`);
      date.innerHTML = Log.time.displayDate(startDate);
      date.className = 'c-pt hover';

      if (arr[i].e === undefined) {
        time.innerHTML = startTime;
        span.innerHTML = '—';
      } else {
        time.innerHTML = `${startTime} – ${Log.time.stamp(Log.time.toEpoch(arr[i].e))}`;
        span.innerHTML = Log.displayStat(Log.time.duration(arr[i].s, arr[i].e));
      }

      sec.setAttribute('onclick', `Log.nav.toSectorDetail('${arr[i].c}')`);
      sec.className = 'c-pt hover';
      sec.innerHTML = arr[i].c;

      pro.setAttribute('onclick', `Log.nav.toProjectDetail('${arr[i].t}')`);
      pro.className = 'c-pt hover';
      pro.innerHTML = arr[i].t;

      desc.className = 'pr0'
      desc.innerHTML = arr[i].d;
    }
  },

  displayStat(value) {
    if (Log.config.ui.stat === 'human') {
      const split = value.toString().split('.');
      return `${split[0]}:${`0${(Number(`0.${split[1]}`) * 60).toFixed(0)}`.substr(-2)}`;
    } else return `${value.toFixed(2)} h`;
  },

  /**
   * Summon Edit modal
   * @param {number} id - Entry ID
   */
  edit(id) {
    const entry = user.log[id];

    editStart.value = '';
    editEnd.value = '';

    editID.innerHTML = `Entry ${id + 1}`;

    editEntryID.value = id;

    editSector.value = entry.c;
    editProject.value = entry.t;
    editDesc.value = entry.d;

    const start = Log.time.toEpoch(entry.s);

    editStart.value = `${start.getFullYear()}-${`0${start.getMonth() + 1}`.substr(-2)}-${`0${start.getDate()}`.substr(-2)}T${`0${start.getHours()}`.substr(-2)}:${`0${start.getMinutes()}`.substr(-2)}:${`0${start.getSeconds()}`.substr(-2)}`;

    if (entry.e !== undefined) {
      const end = Log.time.toEpoch(entry.e);

      editEnd.value = `${end.getFullYear()}-${`0${end.getMonth() + 1}`.substr(-2)}-${`0${end.getDate()}`.substr(-2)}T${`0${end.getHours()}`.substr(-2)}:${`0${end.getMinutes()}`.substr(-2)}:${`0${end.getSeconds()}`.substr(-2)}`;
    }

    Log.modalMode = true;
    document.getElementById('editModal').showModal();
  },

  /**
   * Summon Delete modal
   * @param {string} i - Command input
   */
  confirmDelete(i) {
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

      aui.forEach(i => {
        const ent = user.log[Number(i) - 1];
        const li = document.createElement('li');
        const id = document.createElement('span');
        const tm = document.createElement('span');
        const sc = document.createElement('span');
        const pr = document.createElement('span');
        const dc = document.createElement('p');

        li.className = 'f6 lhc pb3 mb3';

        id.className = 'mr3 o7';
        id.innerHTML = i;

        tm.className = 'mr3 o7';
        tm.innerHTML = `${Log.time.stamp(Log.time.toEpoch(ent.s))} &ndash; ${Log.time.stamp(Log.time.toEpoch(ent.e))}`;

        sc.className = 'mr3 o7';
        sc.innerHTML = ent.c;

        pr.className = 'o7';
        pr.innerHTML = ent.t;

        dc.className = 'f4 lhc';
        dc.innerHTML = ent.d;

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
  deleteIt(i) {
    Log.console.deleteEntry(i);
    delModal.close();
  },

  /**
   * Update entry
   * @param {number} id - Entry ID
   */
  update(id) {
    const row = document.getElementById(`tr-${id}`);
    const children = row.childNodes;
    const start = new Date(editStart.value);
    const end = editEnd.value === '' ? '' : new Date(editEnd.value);
    const startHex = Log.time.toHex(start);
    const endHex = end === '' ? undefined : Log.time.toHex(end);

    children[1].innerHTML = Log.time.displayDate(start);

    if (endHex === undefined) {
      children[2].innerHTML = Log.time.stamp(start);
      children[3].innerHTML = '—';
    } else {
      children[2].innerHTML = `${Log.time.stamp(start)} – ${Log.time.stamp(end)}`;
      children[3].innerHTML = Log.time.duration(startHex, endHex).toFixed(2);
    }

    children[4].innerHTML = editSector.value;
    children[5].innerHTML = editProject.value;
    children[6].innerHTML = editDesc.value;

    user.log[id].s = startHex;
    user.log[id].e = endHex;
    user.log[id].c = editSector.value;
    user.log[id].t = editProject.value;
    user.log[id].d = editDesc.value;

    localStorage.setItem('user', JSON.stringify(user));
    dataStore.set('log', user.log);

    secDetailCache = {};
    proDetailCache = {};
    journalCache = {};

    document.getElementById('editModal').close();
    Log.modalMode = false;

    Log.refresh();
  },

  sectorDetails(sec = Log.cache.sec.sort()[0]) {
    if (typeof sec !== 'string' || sec.length === 0) return;

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
      ent = Log.data.getEntriesBySector(
        sec, Log.data.getRecentEntries(Log.config.ui.view - 1)
      );

      his = Log.data.getEntriesBySector(sec);
      dur = Log.data.listDurations(his);
      pkh = Log.data.peakHours(his);
      pkd = Log.data.peakDays(his);

      secDetailCache[sec] = {
        ent, his, dur, pkh, pkd
      };
    }

    const sortHis = Log.data.sortEntries(his);
    const el = ent.length;

    sectorTitle.innerHTML = sec;

    sectorLastUpdate.innerHTML = ent.length === 0 ?
      `No activity in the past ${Log.config.ui.view} days` :
      `Updated ${Log.time.timeago(Log.time.convert(ent.slice(-1)[0].e) * 1E3)}`;

    sSUM.innerHTML = Log.displayStat(Log.data.calcSum(dur));
    sMIN.innerHTML = Log.displayStat(Log.data.calcMin(dur));
    sMAX.innerHTML = Log.displayStat(Log.data.calcMax(dur));
    sAVG.innerHTML = Log.displayStat(Log.data.calcAvg(dur));
    sENC.innerHTML = his.length;
    sSTK.innerHTML = Log.data.streak(sortHis);
    sPHH.innerHTML = Log.data.peakHour(pkh);
    sPDH.innerHTML = Log.data.peakDay(pkd);

    Log.vis.peakChart(0, pkh, sPKH);
    Log.vis.peakChart(1, pkd, sPKD);

    if (ent.length !== 0) {
      const foci = Log.data.listFocus(1, sortHis);
      const sortEnt = Log.data.sortEntries(ent);
      const pfSortVal = Log.data.sortValues(his, 1, 1);

      Log.vis.barChart(Log.data.bar(sortEnt, 'project'), sectorOverviewChart);
      Log.vis.focusChart(1, sortEnt, sFoc);

      sFavg.innerHTML = Log.data.calcAvg(foci).toFixed(2);
      sFmin.innerHTML = Log.data.calcMin(foci).toFixed(2);
      sFmax.innerHTML = Log.data.calcMax(foci).toFixed(2);

      Log.vis.focusBar(1, pfSortVal, proFocDetail);
      Log.vis.legend(1, pfSortVal, proLeg);
    }

    if (typeof ent !== 'object' || ent.length === 0) return;

    const arr = Log.data.getEntriesBySector(sec);
    const rev = arr.slice(arr.length - 100).reverse();

    sectorLogs.innerHTML = '';

    for (let i = 0, l = rev.length; i < l; i++) {
      const row = sectorLogs.insertRow(i);
      const id = row.insertCell(0);
      const date = row.insertCell(1);
      const time = row.insertCell(2);
      const span = row.insertCell(3);
      const pro = row.insertCell(4);
      const desc = row.insertCell(5);

      const startDate = Log.time.toEpoch(rev[i].s);
      const startTime = Log.time.stamp(startDate);

      id.innerHTML = rev[i].id + 1;
      id.className = 'pl0';

      date.innerHTML = Log.time.displayDate(startDate);

      if (rev[i].e === undefined) {
        time.innerHTML = startTimestartTime;
        span.innerHTML = '–';
      } else {
        time.innerHTML = `${startTime}–${Log.time.stamp(Log.time.toEpoch(rev[i].e))}`;
        span.innerHTML = Log.time.duration(rev[i].s, rev[i].e).toFixed(2);
      }

      pro.setAttribute('onclick', `Log.nav.toProjectDetail('${rev[i].t}')`);
      pro.innerHTML = rev[i].t;
      pro.className = 'c-pt';

      desc.innerHTML = rev[i].d;
      desc.className = 'pr0';
    }
  },

  projectDetails(pro = Log.cache.pro.sort()[0]) {
    if (typeof pro !== 'string' || pro.length === 0) return;

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
      ent = Log.data.getEntriesByProject(
        pro, Log.data.getRecentEntries(Log.config.ui.view - 1)
      );

      his = Log.data.getEntriesByProject(pro);
      dur = Log.data.listDurations(his);
      pkh = Log.data.peakHours(his);
      pkd = Log.data.peakDays(his);

      proDetailCache[pro] = {
        ent, his, dur, pkh, pkd
      }
    }

    const sortHis = Log.data.sortEntries(his);
    const el = ent.length;

    projectTitle.innerHTML = pro;

    projectLastUpdate.innerHTML = el === 0 ?
      `No activity in the past ${Log.config.ui.view} days` :
      `Updated ${Log.time.timeago(Log.time.convert(ent.slice(-1)[0].e) * 1E3)}`;

    pSUM.innerHTML = Log.displayStat(Log.data.calcSum(dur));
    pMIN.innerHTML = Log.displayStat(Log.data.calcMin(dur));
    pMAX.innerHTML = Log.displayStat(Log.data.calcMax(dur));
    pAVG.innerHTML = Log.displayStat(Log.data.calcAvg(dur));
    pENC.innerHTML = his.length;
    pSTK.innerHTML = Log.data.streak(sortHis);
    pPHH.innerHTML = Log.data.peakHour(pkh);
    pPDH.innerHTML = Log.data.peakDay(pkd);

    Log.vis.peakChart(0, pkh, pPKH);
    Log.vis.peakChart(1, pkd, pPKD);

    if (el !== 0) {
      const foci = Log.data.listFocus(0, sortHis);
      const sortEnt = Log.data.sortEntries(ent);
      const sfSortVal = Log.data.sortValues(his, 0, 1);

      Log.vis.barChart(Log.data.bar(sortEnt), projectOverviewChart);
      Log.vis.focusChart(0, sortEnt, pFoc);

      pFavg.innerHTML = Log.data.calcAvg(foci).toFixed(2);
      pFmin.innerHTML = Log.data.calcMin(foci).toFixed(2);
      pFmax.innerHTML = Log.data.calcMax(foci).toFixed(2);

      Log.vis.focusBar(0, sfSortVal, sectorFocusDistribution);
      Log.vis.legend(0, sfSortVal, sectorLegend);
    }

    const arr = Log.data.getEntriesByProject(pro);
    const rev = arr.slice(arr.length - 100).reverse();

    projectLogs.innerHTML = '';

    for (let i = 0, l = rev.length; i < l; i++) {
      const row = projectLogs.insertRow(i);
      const id = row.insertCell(0);
      const date = row.insertCell(1);
      const time = row.insertCell(2);
      const span = row.insertCell(3);
      const sec = row.insertCell(4);
      const desc = row.insertCell(5);

      const startDate = Log.time.toEpoch(rev[i].s);
      const startTime = Log.time.stamp(startDate);

      id.innerHTML = rev[i].id + 1;
      id.className = 'pl0';

      date.innerHTML = Log.time.displayDate(startDate);

      if (rev[i].e === undefined) {
        time.innerHTML = `${startTime}`;
        span.innerHTML = '–';
      } else {
        time.innerHTML = `${startTime}–${Log.time.stamp(Log.time.toEpoch(rev[i].e))}`;
        span.innerHTML = Log.time.duration(rev[i].s, rev[i].e).toFixed(2);
      }

      sec.setAttribute('onclick', `Log.nav.toSectorDetail('${rev[i].c}')`);
      sec.innerHTML = rev[i].c;
      sec.className = 'c-pt';

      desc.innerHTML = rev[i].d;
      desc.className = 'pr0';
    }
  },

  calcDurPercent(hex) {
    if (hex === undefined) return;
    if (typeof hex !== 'string' || hex.length === 0) return;

    const s = Log.time.toEpoch(hex);

    return (
      s.getTime() / 1E3 -
      (new Date(
        s.getFullYear(), s.getMonth(), s.getDate()
      )).getTime() / 1E3
    ) / 86400 * 100;
  },

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

  setDayLabel(day = new Date().getDay()) {
    currentDay.innerHTML = days[day].substring(0, 3);
  },

  setTimeLabel(hour = new Date().getHours()) {
    currentHour.innerHTML = `${hour}:00`;
  },

  reset() {
    clearInterval(Log.clock);
    document.getElementById('timer').innerHTML = '00:00:00';
  },

  nav: {
    menu: [
      'overview', 'details', 'visualisation', 'entries', 'journal', 'guide'
    ],

    index: 0,

    horizontal() {
      Log.nav.index = Log.nav.index === 5 ? 0 : Log.nav.index + 1;
      Log.tab(Log.nav.menu[Log.nav.index], 'sect', 'tab');
    },

    toJournal(h) {
      Log.tab('journal', 'sect', 'tab');
      Log.journal.translate(h);
    },

    toSectorDetail(s) {
      Log.tab('details', 'sect', 'tab');
      Log.tab('sectorDetails', 'subsect', 'subtab', true);
      Log.sectorDetails(s);
    },

    toProjectDetail(p) {
      Log.tab('details', 'sect', 'tab');
      Log.tab('projectDetails', 'subsect', 'subtab', true);
      Log.projectDetails(p);
    }
  },

  generateSessionCache() {
    Log.cache.sortEnt = Log.data.sortEntries();
    Log.cache.sec = Log.data.listSectors();
    Log.cache.pro = Log.data.listProjects();
    Log.cache.proFoc = Log.data.listFocus(1);
    Log.cache.pkh = Log.data.peakHours();
    Log.cache.pkd = Log.data.peakDays();
    Log.cache.dur = Log.data.listDurations();
    Log.cache.entByDay = Log.data.getEntriesByDay(new Date().getDay());

    console.log('Session cache generated');
  },

  todayStats(ent) {
    if (typeof ent !== 'object' || ent.length === 0) return;

    const dur = Log.data.listDurations(ent);
    const now = Log.log.slice(-1)[0];
    const nowDate = Log.time.toEpoch(now.s);
    const st = Log.time.stamp(nowDate);

    const yesterday = Log.data.getEntriesByDate(nowDate.addDays(-1));
    const yDur = Log.data.listDurations(yesterday);
    const yFoc = Log.data.projectFocus(Log.data.listProjects(yesterday));

    const sum = Log.data.calcSum(dur);
    const min = Log.data.calcMin(dur);
    const max = Log.data.calcMax(dur);
    const avg = Log.data.calcAvg(dur);
    const cov = Log.data.coverage(ent);
    const foc = Log.data.projectFocus(Log.data.listProjects(ent));
    const enc = ent.length;

    const lhTrend = Log.data.trend(sum, Log.data.calcSum(yDur));

    tSUM.innerHTML = Log.displayStat(sum);
    tMIN.innerHTML = Log.displayStat(min);
    tMAX.innerHTML = Log.displayStat(max);
    tAVG.innerHTML = Log.displayStat(avg);
    tCOV.innerHTML = `${cov.toFixed(2)}%`;
    tFOC.innerHTML = foc.toFixed(2);
    tSTK.innerHTML = Log.data.streak();
    tENC.innerHTML = enc;

    tSUMtr.innerHTML = lhTrend;
    tMINtr.innerHTML = Log.data.trend(min, Log.data.calcMin(yDur));
    tMAXtr.innerHTML = Log.data.trend(max, Log.data.calcMax(yDur));
    tAVGtr.innerHTML = Log.data.trend(avg, Log.data.calcAvg(yDur));
    tCOVtr.innerHTML = lhTrend;
    tFOCtr.innerHTML = Log.data.trend(foc, yFoc);
    tENCtr.innerHTML = Log.data.trend(enc, yesterday.length);

    leid.innerHTML = user.log.length;
    ltim.innerHTML = now.e === undefined ?
      `${st} –` : `${st} – ${Log.time.stamp(Log.time.toEpoch(now.e))}`;
    lsec.innerHTML = now.c;
    lpro.innerHTML = now.t;
    ldsc.innerHTML = now.d;

    Log.vis.list(0, Log.data.sortValues(ent, 0, 0), secBars, ent);
    Log.vis.list(1, Log.data.sortValues(ent, 1, 0), proBars, ent);
  },

  detailStats(ent) {
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
    Log.vis.focusChart(1, ent);

    if (Log.cache.proFoc.length !== 0) {
      Favg.innerHTML = Log.data.calcAvg(Log.cache.proFoc).toFixed(2);
      Fmin.innerHTML = Log.data.calcMin(Log.cache.proFoc).toFixed(2);
      Fmax.innerHTML = Log.data.calcMax(Log.cache.proFoc).toFixed(2);
    }

    Log.vis.focusBar(0, sortVal, secFocBar);
    Log.vis.legend(0, sortVal, secLegSum);
  },

  load() {
    ui.style.backgroundColor = Log.config.ui.bg;
    ui.style.color = Log.config.ui.colour;

    editModal.style.backgroundColor = Log.config.ui.bg;
    editModal.style.color = Log.config.ui.colour;

    entryModal.style.backgroundColor = Log.config.ui.bg;
    entryModal.style.color = Log.config.ui.colour;

    delModal.style.backgroundColor = Log.config.ui.bg;
    delModal.style.color = Log.config.ui.colour;

    if (user.log.length === 0) {
      Log.nav.index = 5;
      Log.tab('gui', 'sect', 'tab');
      return;
    }

    Log.generateSessionCache();

    Log.timer();

    const overviewEntries = Log.data.getRecentEntries(Log.config.ui.view - 1);
    const sortOverview = Log.data.sortEntries(overviewEntries);
    const entriesToday = Log.data.getEntriesByDate();

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

      Log.sectorDetails(sortValSec[0][0]);
      Log.vis.list(0, sortValSec, sectorsList);

      Log.projectDetails(sortValPro[0][0]);
      Log.vis.list(1, sortValPro, projectsList);
    }

    Log.vis.visualisation(Log.data.visualisation(sortOverview));
    Log.displayEntryTable(user.log, 100);
    Log.journal.displayCalendar();
  },

  refresh() {
    Log.reset();
    Log.load();
  },

  init() {
    user = {
      config: dataStore.get('config'),
      palette: dataStore.get('palette'),
      projectPalette: dataStore.get('projectPalette'),
      log: dataStore.get('log')
    }

    try {
      Log.config = user.config;
      console.log('Config installed');
      Log.palette = user.palette;
      console.log('Sector palette installed');
      Log.projectPalette = user.projectPalette;
      console.log('Project palette installed');
      Log.log = Log.data.parse(user.log);
      console.log('Logs installed');
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

        const hl = Log.console.history.length;

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
            if (Log.commanderIndex > hl) Log.commanderIndex = hl;
            commanderInput.value = Log.console.history[hl - Log.commanderIndex];
            break;
          case 40: // Down
            commander.style.display = 'block';
            commanderInput.focus();
            Log.commanderIndex--;
            if (Log.commanderIndex < 1) Log.commanderIndex = 1;
            commanderInput.value = Log.console.history[hl - Log.commanderIndex];
            break;
          default:
            break;
        }

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
      };
    }

    commander.addEventListener('submit', _ => {
      Log.commanderIndex = 0;

      const val = commanderInput.value;

      if (val !== '') {
        const hl = Log.console.history.length;

        if (val != Log.console.history[hl - 1]) {
          Log.console.history[hl] = val;
        }

        if (hl >= 100) Log.console.history.shift();

        localStorage.setItem('logHistory', JSON.stringify(Log.console.history));
        Log.console.parse(val);
      }

      commanderInput.value = '';
      commander.style.display = 'none';
    });


    document.addEventListener('click', ({target}) => {
      target === entryModal && entryModal.close()
    });

    editModal.onkeydown = e => {
      (e.key === 'Escape') && (Log.modalMode = false);
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
