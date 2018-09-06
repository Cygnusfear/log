'use strict';

let journalCache = {};

Log.journal = {

  displayCalendar () {
    const sy = new Date(2018,  0,  1);
    const ey = new Date(2018, 11, 31);

    const year = Log.data.entByPeriod(sy, ey);
    const sort = Log.data.sortEntries(year);

    if (sort.length === 0) return;

    const frg = document.createDocumentFragment();

    for (let i = 0; i < 26; i++) {
      const row = document.createElement('tr');
      frg.append(row);

      for (let o = 0; o < 14; o++) {
        const id = (14 * i) + o;
        const cell = document.createElement('td');
        const pos = sort[id];

        if (pos !== undefined && pos.length > 0) {
          const date = pos[0].s;
          const d = Log.time.displayDate(date);
          ø(cell, {
            innerHTML: d,
            onclick: () => {
              Log.journal.displayEntry(date)
            }
          });
        }

        row.append(cell);
      }
    }

    return frg;
  },

  displayEntry (date = new Date()) {
    let ent = [];
    if (date in journalCache) {
      ent = journalCache[date];
    } else {
      ent = Log.data.entByDate(date);
      journalCache[date] = ent;
    }

    const l = ent.length;
    if (l === 0) return;

    const frg = document.createDocumentFragment();
    const dur = Log.data.listDurations(ent);

    jDyc.innerHTML = '';
    jEnt.innerHTML = '';

    journalDate.innerHTML = `${Log.time.displayDate(date)} (${days[date.getDay()]})`;

    jDyc.append(Log.vis.dayChart(ent));

    jSUM.innerHTML = Log.displayStat(Log.data.sum(dur));
    jMIN.innerHTML = Log.displayStat(Log.data.min(dur));
    jMAX.innerHTML = Log.displayStat(Log.data.max(dur));
    jAVG.innerHTML = Log.displayStat(Log.data.avg(dur));
    jCOV.innerHTML = `${Log.data.coverage(ent).toFixed(2)}%`;
    jFOC.innerHTML = Log.data.projectFocus(Log.data.listProjects(ent)).toFixed(2);

    const ä = (el, className, innerHTML) => ø(el, {className, innerHTML});

    for (let i = 0; i < l; i++) {
      const {id, s, e, c, t, d, dur} = ent[i];
      const st = Log.time.stamp(s);
      const et = Log.time.stamp(e);

      const itm = ø('li', {className: 'f6 lhc pb3 mb3'});
      const idd = ä('span', 'mr3 o7', id + 1);
      const tim = ä('span', 'mr3 o7', `${st} &ndash; ${et}`);
      const sec = ä('span', 'mr3 o7', c);
      const pro = ä('span', 'o7', t);
      const spn = ä('span', 'rf o7', Log.displayStat(dur));
      const dsc = ä('p', 'f4 lhc', d);

      itm.append(idd);
      itm.append(tim);
      itm.append(sec);
      itm.append(pro);
      itm.append(spn);
      itm.append(dsc);
      frg.append(itm);
    }

    jEnt.append(frg);
    document.getElementById('entryModal').showModal();
  },
};
