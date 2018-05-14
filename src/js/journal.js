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

      li.className = 'f6 lhc pb3 mb3';
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

    Log.journal.dialog();
  },

  /**
   * Dislay calendar
   */
  cal() {
    const sort = Log.data.sortEnt(Log.data.entries.byPeriod(new Date(2018, 0, 1), new Date(2018, 11, 31)));

    const sf = ent => {
      const list = Log.data.listSec(ent);
      let a = 0;
      let b = '';

      for (let i = list.length - 1; i >= 0; i--) {
        const x = Log.data.sp(list[i], ent);
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
        let d = Log.time.convert(pos[0].s);
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

        cell.setAttribute('onclick', `Log.journal.translate('${pos[0].s}')`);
        cell.title = Log.time.displayDate(Log.time.convert(pos[0].s));
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
  },

  /**
   * Show Journal modal
   */
  dialog() {
    document.getElementById('entryModal').showModal();
  }
};
