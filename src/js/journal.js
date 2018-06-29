'use strict';

let journalCache = {};

Log.journal = {

  displayCalendar() {
    const sort = Log.data.sortEntries(Log.data.getEntriesByPeriod(new Date(2018, 0, 1), new Date(2018, 11, 31)));

    if (sort === undefined || sort.length === 0) return;

    cal.innerHTML = '';

    const frag = document.createDocumentFragment();

    for (let i = 0; i < 26; i++) {
      const row = document.createElement('tr');
      frag.appendChild(row);

      for (let o = 0; o < 14; o++) {
        const id = ((14 * i) + o) + 1;
        const cell = document.createElement('td');
        const pos = sort[id - 1];

        if (pos !== undefined && pos.length !== 0) {
          const d = Log.time.toEpoch(pos[0].s);

          cell.innerHTML = Log.time.displayDate(d);

          cell.setAttribute('onclick', `Log.journal.displayEntry(Log.time.toEpoch('${pos[0].s}'))`);
          cell.title = Log.time.displayDate(d);
        } else {
          cell.innerHTML = '-';
        }

        row.appendChild(cell);
      }
    }

    cal.appendChild(frag)
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
      duration.innerHTML = Log.displayStat(ent[i].dur);
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

    document.getElementById('entryModal').showModal();
  },
};
