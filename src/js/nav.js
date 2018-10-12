const Nav = {
  menu: [],
  index: 0,

  /**
   * Move to next tab
   */
  next () {
    Nav.index = Nav.index === 5 ? 0 : Nav.index + 1;
    Nav.tab(Nav.menu[Nav.index]);
  },

  /**
   * Open tab
   * @param {string}   s - ID
   * @param {string=}  g - Group
   * @param {string=}  t - Tab group
   * @param {boolean=} v - Vertical?
   */
  tab (s, g = 'sect', t = 'tab', v = false) {
    const o =  v ? 'db mb3' : 'pv1';
    const n = `${o} ${t} on bg-cl o5 mr3`;
    const x =  document.getElementsByClassName(g);
    const b =  document.getElementsByClassName(t);
    const cb = document.getElementById(`b-${s}`);
    const ct = document.getElementById(s);

    Nav.index = Nav.menu.indexOf(s);

    for (let i = 0, l = x.length; i < l; i++) {
      x[i].style.display = 'none';
    }

    for (let i = 0, l = b.length; i < l; i++) {
      b[i].className = n;
    }

    ct.style.display = 'grid';
    cb.className = `${o} ${t} on bg-cl of mr3`;
  },

  /**
   * Navigate to Journal entry
   * @param {string} h - Hex
   */
  toJournal (h) {
    Nav.tab('JOU');
    Log.journal.translate(h);
  },

  /**
   * Navigate to sector or project detail
   * @param {number} mod - Sector (0) or project (1)
   * @param {string} key
   */
  toDetail (mod, key) {
    if (
      mod < 0 || mod > 1 ||
      key === undefined
    ) return;

    Log.viewDetails(mod, key);
    Nav.tab(!mod ? 'SSC' : 'PSC', 'subsect', 'subtab', true);
    Nav.tab('DTL');
  }
}
