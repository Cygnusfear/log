'use strict';

let journalCache = {};

Log.journal = {

  displayCalendar () {
    const sy = new Date(2018,  0,  1);
    const ey = new Date(2018, 11, 31);

    const year = new Set(Log.log.entByPeriod(sy, ey));
    const sort = year.sortEntries();

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
      ent = new Set(Log.log.entByDate(date));
      journalCache[date] = ent;
    }

    const l = ent.entries.length;
    if (l === 0) return;

    const frg = document.createDocumentFragment();
    const dur = ent.durations;

    jDyc.innerHTML = '';
    jEnt.innerHTML = '';

    journalDate.innerHTML = `${Log.time.displayDate(date)} (${Log.days[date.getDay()]})`;

    jDyc.append(Log.vis.dayChart(ent.entries));

    jSUM.innerHTML = Log.data.displayStat(Log.data.sum(dur));
    jMIN.innerHTML = Log.data.displayStat(Log.data.min(dur));
    jMAX.innerHTML = Log.data.displayStat(Log.data.max(dur));
    jAVG.innerHTML = Log.data.displayStat(Log.data.avg(dur));
    jCOV.innerHTML = `${ent.coverage().toFixed(2)}%`;
    jFOC.innerHTML = Log.data.projectFocus(ent.projects).toFixed(2);

    const ä = (el, className, innerHTML) => ø(el, {className, innerHTML});

    console.log(ent)

    for (let i = 0; i < l; i++) {
      const {id, s, e, c, t, d, dur} = ent.entries[i];
      const st = Log.time.stamp(s);
      const et = Log.time.stamp(e);

      const itm = ø('li', {className: 'f6 lhc pb3 mb3'});
      const idd = ä('span', 'mr3 o7', id + 1);
      const tim = ä('span', 'mr3 o7', `${st} &ndash; ${et}`);
      const sec = ä('span', 'mr3 o7', c);
      const pro = ä('span', 'o7', t);
      const spn = ä('span', 'rf o7', Log.data.displayStat(dur));
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
