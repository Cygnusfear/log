'use strict';

let journalCache = {};

Log.journal = {

  dialog() {
    document.getElementById('entryModal').showModal();
  },

  displayCalendar() {
    const sort = Log.data.sortEntries(Log.data.getEntriesByPeriod(new Date(2018, 0, 1), new Date(2018, 11, 31)));

    if (sort === undefined || sort.length === 0) return;

    const sf = ent => {
      const list = Log.data.listSectors(ent);
      let a = 0;
      let b = '';

      for (let i = list.length - 1; i >= 0; i--) {
        const x = Log.data.sectorPercentage(list[i], ent);
        x > a && (a = x, b = list[i]);
      }

      return b;
    };

    for (let i = 0; i < 26; i++) {
      const rw = cal.insertRow(i);
      for (let o = 0; o < 14; o++) {
        const id = ((14 * i) + o) + 1;
        const cell = rw.insertCell(o);
        const pos = sort[id - 1];

        cell.innerHTML = '--';

        if (pos === undefined || pos.length === 0) {
          cell.style.opacity = '.5'
          continue;
        }

        let date = '';
        let d = Log.time.toEpoch(pos[0].s);
        switch (Log.config.system.calendar) {
          case 'aequirys':
          case 'desamber':
            date = `${Aequirys.month(id)}${`0${Aequirys.date(id)}`.substr(-2)}`;
            break;
          case 'monocal':
            date = Monocal.shorter(Monocal.convert(d)).substring(0, 4);
            break;
          default:
            date = `${months[d.getMonth()].substring(0, 1)}${`0${d.getDate()}`.slice(-2)}`;
            break;
        }

        cell.innerHTML = date;

        const foc = sf(pos);

        if (Log.config.ui.colourMode === 'none') {
          cell.style.borderLeft = `2px solid ${Log.config.ui.colour}`;
        } else {
          cell.style.borderLeft = `2px solid ${Log.palette[foc] || Log.projectPalette[foc] || Log.config.ui.colour}`;
        }

        cell.setAttribute('onclick', `Log.journal.displayEntry(Log.time.toEpoch('${pos[0].s}'))`);
        cell.title = Log.time.displayDate(Log.time.toEpoch(pos[0].s));
      }
    }
  },

  displayEntry(date = new Date()) {
    if (typeof date !== 'object') return;

    let ent = [];
    if (date in journalCache) {
      ent = journalCache[date];
    } else {
      ent = Log.data.getEntriesByDate(date);
      journalCache[date] = ent;
    }

    const l = ent.length;
    if (l === 0) return;

    const fragment = document.createDocumentFragment();
    const durations = Log.data.listDurations(ent);

    jDyc.innerHTML = '';
    jEnt.innerHTML = '';

    journalDate.innerHTML = `${Log.time.displayDate(date)} (${days[date.getDay()]})`;

    Log.vis.dayChart(ent, jDyc);

    jSUM.innerHTML = Log.displayStat(Log.data.calcSum(durations));
    jMIN.innerHTML = Log.displayStat(Log.data.calcMin(durations));
    jMAX.innerHTML = Log.displayStat(Log.data.calcMax(durations));
    jAVG.innerHTML = Log.displayStat(Log.data.calcAvg(durations));
    jCOV.innerHTML = `${Log.data.coverage(ent).toFixed(2)}%`;
    jFOC.innerHTML = Log.data.projectFocus(Log.data.listProjects(ent)).toFixed(2);

    const itemEl = document.createElement('li');
    const idEl = document.createElement('span');
    const timeEl = document.createElement('span');
    const sectorEl = document.createElement('span');
    const projectEl = document.createElement('span');
    const durationEl = document.createElement('span');
    const descEl = document.createElement('p');

    itemEl.className = 'f6 lhc pb3 mb3';
    idEl.className = 'mr3 o7';
    timeEl.className = 'mr3 o7';
    sectorEl.className = 'mr3 o7';
    projectEl.className = 'o7';
    durationEl.className = 'rf o7';
    descEl.className = 'f4 lhc';

    for (let i = 0; i < l; i++) {
      const item = itemEl.cloneNode();
      const id = idEl.cloneNode();
      const time = timeEl.cloneNode();
      const sector = sectorEl.cloneNode();
      const project = projectEl.cloneNode();
      const duration = durationEl.cloneNode();
      const desc = descEl.cloneNode();

      id.innerHTML = ent[i].id + 1;
      time.innerHTML = `${Log.time.stamp(Log.time.toEpoch(ent[i].s))} &ndash; ${Log.time.stamp(Log.time.toEpoch(ent[i].e))}`;
      sector.innerHTML = ent[i].c;
      project.innerHTML = ent[i].t;
      duration.innerHTML = ent[i].dur.toFixed(2);
      desc.innerHTML = ent[i].d;

      item.appendChild(id);
      item.appendChild(time);
      item.appendChild(sector);
      item.appendChild(project);
      item.appendChild(duration);
      item.appendChild(desc);
      fragment.appendChild(item);
    }

    jEnt.appendChild(fragment);

    Log.journal.dialog();
  },
};
