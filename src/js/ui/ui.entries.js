'use strict';

const Entries = {

  /**
   * Build Entries
   * @return {Object}
   */
  build () {
    const f = document.createDocumentFragment();
    f.append(this.table());
    f.append(this.modal());
    return f;
  },

  /**
   * Build Entries table
   * @return {Object}
   */
  table () {
    function ä (e, className, innerHTML = '') {
      return ø(e, {className, innerHTML});
    }

    const f = document.createDocumentFragment();
    const t = ä('table', 'wf bn f6');
    const h = ä('thead', 'al');
    const b = ä('tbody', 'nodrag');

    const n = [
      Glossary.date,
      Glossary.time,
      Glossary.span,
      Glossary.sec.singular,
      Glossary.pro.singular
    ];

    const el = Log.entries.length;
    const arr = Log.entries.slice(el - 100).reverse();

    for (let i = 0, l = arr.length; i < l; i++) {
      const {s, e, c, t, d} = arr[i];
      const sd = toEpoch(s);
      const ed = toEpoch(e);
      const st = sd.stamp();
      const id = el - i - 1;
      const r = ø('tr', {id: `r${id}`});
      const time = document.createElement('td');
      const span = time.cloneNode();

      if (e === undefined) {
        time.innerHTML = `${st} –`;
        span.innerHTML = '—';
      } else {
        time.innerHTML = `${st} – ${toEpoch(e).stamp()}`;
        span.innerHTML = duration(sd, ed).toStat();
      }

      r.appendChild(ø('td', {
        onclick: () => Log.edit(id),
        className: 'pl0 c-pt hover',
        innerHTML: el - i,
      }));

      r.appendChild(ø('td', {
        onclick: () => Nav.toJournal(s),
        className: 'c-pt hover',
        innerHTML: sd.display()
      }));

      r.appendChild(time);
      r.appendChild(span);

      r.appendChild(ø('td', {
        onclick: () => Nav.toDetail(0, c),
        className: 'c-pt hover',
        innerHTML: c
      }));

      r.appendChild(ø('td', {
        onclick: () => Nav.toDetail(1, t),
        className: 'c-pt hover',
        innerHTML: t
      }));

      r.appendChild(ä('td', 'pr0', d));
      b.appendChild(r);
    }

    t.append(h);
      h.append(ä('th', 'pl0', Glossary.id));
      for (let i = 0, l = n.length; i < l; i++) {
        h.append(ä('th', '', n[i]));
      }
      h.append(ä('th', 'pr0', Glossary.desc));
    t.append(b);
    f.append(t);

    return f;
  },

  /**
   * Build Entries modal
   * @param {Object} config
   * @param {string} config.bg - Background
   * @param {string} config.fg - Foreground
   * @return {Object}
   */
  modal ({bg, fg} = Log.config) {
    const m = ø('dialog', {
      id: 'editModal',
      className: 'p4 cn bn h6',
      onkeydown: e => {
        e.key === 'Escape' && (UI.modalMode = false);
      }
    });

    const f = ø('form', {
      onsubmit: () => false,
      className: 'nodrag',
      id: 'editForm'
    });

    const i = ø('input', {className: 'db wf p2 mb3 bn'});

    Ø(m.style, {backgroundColor: bg, color: fg});

    document.addEventListener('click', ({target}) => {
      if (target === m) {
        UI.modalMode = false;
        m.close();
      }
    });

    f.addEventListener('submit', _ => {
      const e = editEnd.value === '' ?
        '' : new Date(editEnd.value);

      Log.update(editEntryID.value, {
        s: new Date(editStart.value).toHex(),
        e: e === '' ? undefined : e.toHex(),
        c: editSector.value,
        t: editProject.value,
        d: editDesc.value
      });

      UI.modalMode = false;
    });

    m.append(ø('p', {id: 'editID', className: 'mb4 f6 lhc'}));
    m.append(f);
      f.append(ø('input', {id: 'editEntryID', type: 'hidden'}));

      f.append(Ø(i.cloneNode(), {
        id: 'editSector', type: 'text', placeholder: 'Sector'}));

      f.append(Ø(i.cloneNode(), {
        id: 'editProject', type: 'text', placeholder: 'Project'}));

      f.append(ø('textarea', {
        id: 'editDesc', className: 'db wf p2 mb3 bn',
        rows: '3', placeholder: 'Description (optional)'}));

      f.append(Ø(i.cloneNode(), {
        id: 'editStart', type: 'datetime-local', step: '1'}));

      f.append(Ø(i.cloneNode(), {
        id: 'editEnd', type: 'datetime-local', step: '1'}));

      f.append(ø('input', {
        id: 'editUpdate', className: 'dib p2 mr2 br1 bn',
        type: 'submit', value: 'Update'}));

      f.append(ø('input', {
        id: 'editCancel', className: 'dib p2 br1 bn',
        type: 'button', value: 'Cancel',
        onclick: () => {
          UI.modalMode = false;
          m.close();
        }}));

    return m;
  }
}

module.exports = Entries;
