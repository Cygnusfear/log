'use strict';

const Journal = {

  /**
   * Build Journal
   * @return {Object}
   */
  build () {
    const f = document.createDocumentFragment();
    f.append(this.cal());
    f.append(this.modal());
    return f;
  },

  /**
   * Build Journal Calendar
   * @return {Object}
   */
  cal () {
    const c = ø('table', {className: 'cal nodrag hf wf f6 lhc c-pt bn'});
    const sy = new Date(2018,  0,  1);
    const ey = new Date(2018, 11, 31);
    const year = new LogSet(Session.byPeriod(sy, ey));
    const sort = year.sortEntries();

    if (sort.length === 0) return c;

    for (let i = 0; i < 26; i++) {
      const row = document.createElement('tr');
      c.append(row);

      for (let o = 0; o < 14; o++) {
        const cell = document.createElement('td');
        const id = (14 * i) + o;
        const pos = sort[id];

        if (pos === undefined || pos.length < 1) {
          cell.innerHTML = '-----';
          cell.style.opacity = '0.1';
        } else {
          const d = pos[0].start;
          Ø(cell, {
            onclick: () => UI.journal.displayEntry(d),
            innerHTML: d.display()
          });
        }

        row.append(cell);
      }
    }

    return c;
  },

  /**
   * Build Journal Modal
   * @param {Object=} config
   * @param {string=} config.bg     - Background colour
   * @param {string=} config.colour - Foreground colour
   * @return {Object}
   */
  modal ({bg, fg} = Log.config) {
    function ä (el, className) {
      return ø(el, {className});
    }

    const m = ø('dialog', {id: 'entryModal', className: 'p4 cn bn h6'});
    const h2 = ø('h2', {id: 'journalDate', className: 'mb4 f6 lhc'});
    const t = ä('div', 'h2');
    const mt = ä('div', 'mb3 psr wf sh2 bl br');
    const sb = ä('div', 'r h7');
    const st = ä('ul', 'c3 hf oys pr4 lsn f6 lhc hvs');

    const s = [
      {id: 'jSUM', n: Glossary.stats.abbr.sum},
      {id: 'jMIN', n: Glossary.stats.abbr.minDur},
      {id: 'jMAX', n: Glossary.stats.abbr.maxDur},
      {id: 'jAVG', n: Glossary.stats.abbr.avgDur},
      {id: 'jCOV', n: Glossary.stats.cov},
      {id: 'jFOC', n: Glossary.stats.foc},
    ];

    Ø(m.style, {backgroundColor: bg, color: fg});

    for (let i = 0, l = s.length; i < l; i++) {
      const stat = ø('li', {className: 'mb3'});
      const {id, n} = s[i];

      stat.append(ø('p', {id, innerHTML: '&ndash;', className: 'f4 fwb'}));
      stat.append(ø('p', {innerHTML: n, className: 'o9'}));

      st.append(stat);
    }

    m.append(h2);
    m.append(t);
      t.append(mt);
        mt.append(UI.vis.meterLines());
      t.append(ø('div', {id: 'jDyc', className: 'mb3 psr wf sh2'}));
    m.append(sb);
      sb.append(st);
      sb.append(ø('ul', {id: 'jEnt', className: 'c9 pl4 hf oys lsn hvs'}));

    return m;
  },

  /**
   * Display journal entry
   * @param {Date=} d
   */
  displayEntry (d = (new Date)) {
    const thisDay = new LogSet(Session.byDate(d));
    const l = thisDay.count;
    if (l === 0) return;

    const fr = document.createDocumentFragment();
    const dur = thisDay.listDurations();

    jDyc.innerHTML = '';
    jEnt.innerHTML = '';

    journalDate.innerHTML = `${d.display()} (${Glossary.days[d.getDay()]})`;

    jDyc.append(UI.vis.dayChart(thisDay.logs));

    jSUM.innerHTML =  sum(dur).toStat();
    jMIN.innerHTML =  min(dur).toStat();
    jMAX.innerHTML =  max(dur).toStat();
    jAVG.innerHTML =  avg(dur).toStat();
    jCOV.innerHTML = `${thisDay.coverage().toFixed(2)}%`;
    jFOC.innerHTML =  thisDay.projectFocus().toFixed(2);

    function ä (e, className, innerHTML) {
      return ø(e, {className, innerHTML});
    }

    for (let i = 0; i < l; i++) {
      const {
        id, start, end, sector, project, desc, dur
      } = thisDay.logs[i];
      const st = start.stamp();
      const et = end.stamp();

      const item = ø('li', {className: 'f6 lhc pb3 mb3'});
      const eid = ä('span', 'mr3 o7', id + 1);
      const time = ä('span', 'mr3 o7', `${st} &ndash; ${et}`);
      const sec = ä('span', 'mr3 o7', sector);
      const pro = ä('span', 'o7', project);
      const span = ä('span', 'rf o7', dur.toStat());
      const dsc = ä('p', 'f4 lhc', desc);

      item.append(eid);
      item.append(time);
      item.append(sec);
      item.append(pro);
      item.append(span);
      item.append(dsc);
      fr.append(item);
    }

    jEnt.append(fr);
    document.getElementById('entryModal').showModal();
  },
}

module.exports = Journal;
