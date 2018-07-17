'use strict';

let journalCache = {};

Log.journal = {

  displayCalendar (con) {
    const sort = Log.data.sortEntries(Log.data.getEntriesByPeriod(new Date(2018, 0, 1), new Date(2018, 11, 31)));

    if (sort === undefined || sort.length === 0) return;

    con.innerHTML = '';

    const frag = document.createDocumentFragment();

    for (let i = 0; i < 26; i++) {
      const row = document.createElement('tr');
      frag.appendChild(row);

      for (let o = 0; o < 14; o++) {
        const id = ((14 * i) + o) + 1;
        const cell = document.createElement('td');
        const pos = sort[id - 1];

        if (pos !== undefined && pos.length !== 0) {
          const d = Log.time.displayDate(Log.time.toEpoch(pos[0].s));
          Object.assign(cell, {innerHTML: d, title: d});
          cell.setAttribute(
            'onclick',
            `Log.journal.displayEntry(Log.time.toEpoch('${pos[0].s}'))`
          );
        } else {
          cell.innerHTML = '-----';
        }

        row.appendChild(cell);
      }
    }

    con.appendChild(frag)
  },

  displayEntry (date = new Date()) {
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

    const frag = document.createDocumentFragment();
    const dur = Log.data.listDurations(ent);

    jDyc.innerHTML = '';
    jEnt.innerHTML = '';

    journalDate.innerHTML = `${Log.time.displayDate(date)} (${days[date.getDay()]})`;

    Log.vis.dayChart(ent, jDyc);

    jSUM.innerHTML = Log.displayStat(Log.data.calcSum(dur));
    jMIN.innerHTML = Log.displayStat(Log.data.calcMin(dur));
    jMAX.innerHTML = Log.displayStat(Log.data.calcMax(dur));
    jAVG.innerHTML = Log.displayStat(Log.data.calcAvg(dur));
    jCOV.innerHTML = `${Log.data.coverage(ent).toFixed(2)}%`;
    jFOC.innerHTML = Log.data.projectFocus(Log.data.listProjects(ent)).toFixed(2);

    const itemEl = document.createElement('li');
    const spanEl = document.createElement('span');
    const proEl = document.createElement('span');
    const durEl = document.createElement('span');
    const descEl = document.createElement('p');

    spanEl.className = 'mr3 o7';
    itemEl.className = 'f6 lhc pb3 mb3';
    proEl.className = 'o7';
    durEl.className = 'rf o7';
    descEl.className = 'f4 lhc';

    for (let i = 0; i < l; i++) {
      const {id, s, e, c, t, d, dur} = ent[i];
      const st = Log.time.stamp(Log.time.toEpoch(s));
      const et = Log.time.stamp(Log.time.toEpoch(e));
      const item = itemEl.cloneNode();
      const idd = spanEl.cloneNode();
      const time = spanEl.cloneNode();
      const sec = spanEl.cloneNode();
      const pro = proEl.cloneNode();
      const span = durEl.cloneNode();
      const desc = descEl.cloneNode();

      idd.innerHTML = id + 1;
      time.innerHTML = `${st} &ndash; ${et}`;
      sec.innerHTML = c;
      pro.innerHTML = t;
      span.innerHTML = Log.displayStat(dur);
      desc.innerHTML = d;

      item.appendChild(idd);
      item.appendChild(time);
      item.appendChild(sec);
      item.appendChild(pro);
      item.appendChild(span);
      item.appendChild(desc);
      frag.appendChild(item);
    }

    jEnt.appendChild(frag);

    document.getElementById('entryModal').showModal();
  },
};
