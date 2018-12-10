'use strict';

const UI = {

  header: require('./ui.header.js'),
  overview: require('./ui.overview.js'),
  commander: require('./ui.commander.js'),
  details: require('./ui.details.js'),
  entries: require('./ui.entries.js'),
  journal: require('./ui.journal.js'),
  guide: require('./ui.guide.js'),
  vis: require('./ui.vis.js'),

  modalMode: false,
  timerEl: {},

  commanderEl: {},
  commanderInput: {},
  comIndex: 0,

  days: [],
  months: [],

  /**
   * Build UI
   * @param {Object=} config
   * @param {number=} config.vw - View
   */
  build ({vw} = Log.config) {
    function ä (id, className) {
      Nav.menu[Nav.menu.length] = id;
      return ø('div', {id, className});
    }

    const ovw = new LogSet(Session.recent(vw - 1));
    const sor = Session.sortEntries().slice(-1)[0];
    const tdy = new LogSet(
      Session.last.end === undefined ?
        sor.slice(0, -1) : sor
    );

    const F = document.createDocumentFragment();
    const M = document.createElement('main');
    const c = ø('div', {id: 'container', className: 'hf'});
    const o = ä('OVW', 'sect');
    const d = ä('DTL', 'dn sect');
    const v = ä('VIS', 'nodrag dn sect oya oxh');
    const e = ä('ENT', 'dn sect oya hvs');
    const j = ä('JOU', 'dn sect oya hvs');
    const g = ä('GUI', 'dn sect hf wf oys oxh');

    F.append(c);
      c.append(this.header.build());
      c.append(M);
        M.append(o); o.append(this.overview.build(tdy, ovw));
        M.append(d); d.append(this.details.build(ovw));
        M.append(v); v.append(this.visual(ovw));
        M.append(e); e.append(this.entries.build());
        M.append(j); j.append(this.journal.build());
        M.append(g); // g.append(UI.guide.build());
      c.append(this.delModal());
    F.append(this.commander());

    ui.append(F);
  },

  /**
   * Build Main
   * @return {Object}
   */
  main () {
    function ä (id, className) {
      m.append(ø('div', {id, className}));
    }

    const F = document.createDocumentFragment();
    const m = document.createElement('div');

    ä('OVW', 'sect');
    ä('DTL', 'dn sect');
    ä('VIS', 'nodrag dn sect oya oxh');
    ä('ENT', 'dn sect oya hvs');
    ä('JOU', 'dn sect oya hvs');
    ä('GUI', 'dn sect oys oxh');

    F.append(m);
    return F;
  },

  /**
   * Build Visualisation
   * @param {LogSet} o - Overview
   * @return {Object}
   */
  visual (o) {
    function ä (c) { return ø('div', {className: c}); }

    const f = document.createDocumentFragment();
    const m = ä('psr wf sh2 bl br');
    const v = ä('nodrag oys hvs');

    f.append(m);
      m.append(UI.vis.meterLines());
    f.append(v);
      v.append(UI.vis.visualisation(o.visualisation()));

    return f;
  },

  /**
   * Build entry deletion modal
   * @param {Object=} config
   * @param {string=} config.bg - Background colour
   * @param {string=} config.fg - Foreground colour
   * @return {Object}
   */
  delModal ({bg, fg} = Log.config) {
    function ä (e, id, className, innerHTML = '') {
      modal.append(ø(e, {id, className, innerHTML}));
    }

    const modal = ø('dialog', {
      className: 'p4 cn bn nodrag',
      id: 'delModal'
    });

    Ø(modal.style, {backgroundColor: bg, color: fg});

    ä('p', 'delMessage', 'mb4 f6 lhc');
    ä('ul', 'delList', 'mb3 lsn');
    ä('button', 'delConfirm', 'p2 br1 bn f6', 'Delete')

    modal.appendChild(ø('button', {
      className: 'p2 br1 bn f6 lhc',
      innerHTML: 'Cancel',
      onclick: () => {
        UI.modalMode = false;
        modal.close();
      }
    }));

    return modal;
  },

  util: {
    setDayLabel (day = (new Date).getDay()) {
      cd.innerHTML = Glossary.days[day];
    },

    setTimeLabel (hour = (new Date).getHours()) {
      ch.innerHTML = `${hour.pad()}:00`;
    }
  }
}

module.exports = UI;
