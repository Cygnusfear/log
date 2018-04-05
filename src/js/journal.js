const journalCache = {};

Log.journal = {

  /**
   * Display entries from a date
   * @param {Object} [date] - Date
   */
  display(date = new Date()) {
    if (typeof date !== 'object') return;

    let ent = [];
    if (date in journalCache) {
      ent = journalCache[date];
    } else {
      ent = Log.data.entries.byDate(date);
      journalCache[date] = ent;
    }

    if (ent.length === 0) return;

    jDyc.innerHTML = '';
    jEnt.innerHTML = '';

    journalDate.innerHTML = `${Log.time.displayDate(date)} (${days[date.getDay()]})`;

    Log.vis.day(date, jDyc);

    const dur = Log.data.listDur(ent);

    jLHT.innerHTML = Log.data.sum(dur).toFixed(2);
    jLSN.innerHTML = Log.data.min(dur).toFixed(2);
    jLSX.innerHTML = Log.data.max(dur).toFixed(2);
    jASD.innerHTML = Log.data.avg(dur).toFixed(2);
    jLPT.innerHTML = `${Log.data.lp(ent).toFixed(2)}%`;
    jFT.innerHTML = Log.data.proFocus(Log.data.listPro(ent)).toFixed(2);

    for (let i = 0, l = ent.length; i < l; i++) {
      const li = document.createElement('li');
      const id = document.createElement('span');
      const tm = document.createElement('span');
      const sc = document.createElement('span');
      const pr = document.createElement('span');
      const dr = document.createElement('span');
      const dc = document.createElement('p');

      li.className = `f6 lhc ${i !== l - 1 && 'pb3 mb3'}`;
      id.className = 'mr3 o7';
      id.innerHTML = ent[i].id + 1;
      tm.className = 'mr3 o7';
      tm.innerHTML = `${Log.time.stamp(Log.time.convert(ent[i].s))} &ndash; ${Log.time.stamp(Log.time.convert(ent[i].e))}`;
      sc.className = 'mr3 o7';
      sc.innerHTML = ent[i].c;
      pr.className = 'o7';
      pr.innerHTML = ent[i].t;
      dr.className = 'rf o7';
      dr.innerHTML = ent[i].dur.toFixed(2);
      dc.className = 'f4 lhc';
      dc.innerHTML = ent[i].d;

      li.appendChild(id);
      li.appendChild(tm);
      li.appendChild(sc);
      li.appendChild(pr);
      li.appendChild(dr);
      li.appendChild(dc);
      jEnt.appendChild(li);
    }
  },

  /**
   * Dislay calendar
   */
  cal() {
    const ent = Log.data.sortEnt(Log.data.recEnt(400));

    const sf = (ent) => {
      const list = Log.data.listSec(ent);
      let a = 0;
      let b = '';

      for (let i = list.length - 1; i >= 0; i--) {
        const x = Log.data.sp(list[i], ent);
        x > a && (a = x, b = list[i]);
      }

      return b;
    };

    // const diff = Log.time.convert(ent[0][0].s).getDay();

    for (let i = 0; i < 7; i++) {
      const rw = cal.insertRow(i);
      for (let o = 0; o < 52; o++) {
        const id = (365 - i) - (7 * o) - 1;
        const cell = rw.insertCell(o);

        if (ent[365 - id] === undefined || ent[365 - id].length === 0) continue;

        const foc = sf(ent[365 - id]);

        if (Log.config.ui.colourMode === 'none') {
          cell.style.backgroundColor = Log.config.ui.colour;
        } else {
          cell.style.backgroundColor = Log.palette[foc] || Log.projectPalette[foc] || Log.config.ui.colour;
        }

        cell.setAttribute('onclick', `Log.journal.translate('${ent[365 - id][0].s}')`);

        cell.title = Log.time.displayDate(Log.time.convert(ent[365 - id][0].s));
      }
    }
  },

  /**
   * Convert hex into Date and display in Journal
   * @param {string} h - Hexadecimal time
   */
  translate(h) {
    if (typeof h !== 'string' || h.length === 0) return;
    Log.journal.display(Log.time.convert(h));
  }
};
