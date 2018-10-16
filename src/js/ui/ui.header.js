'use strict';

const Header = {
  /**
   * Build Header
   * @return {Object}
   */
  build () {
    const header = ø('header', {
      className: 'mb2 f6 lhc'
    });

    const title = ø('h1', {
      className: 'dib mr3 f5 upc tk',
      innerHTML: 'Log'
    });

    header.append(title);
    header.append(this.nav());
    header.append(this.clock());

    return header;
  },

  /**
   * Build Navigation
   * @return {Object}
   */
  nav () {
    function ä (id, innerHTML, opacity = 'o5') {
      fr.append(ø('button', {
        className: `pv1 tab on bg-cl ${opacity} mr3`,
        onclick: () => Nav.tab(id),
        id: `b-${id}`,
        innerHTML
      }));
    }

    const fr = document.createDocumentFragment();
    const {tabs} = Glossary;
    const {menu} = Nav;

    ä(menu[0], tabs.overview, 'of');
    ä(menu[1], tabs.details);
    ä(menu[2], tabs.vis);
    ä(menu[3], tabs.entries);
    ä(menu[4], tabs.journal);
    ä(menu[5], tabs.guide);

    return fr;
  },

  /**
   * Build Clock
   * @return {Object}
   */
  clock () {
    UI.timerEl = ø('span', {
      className: 'rf f5 di tnum',
      innerHTML: '00:00:00'
    });

    Log.timer();
    return UI.timerEl;
  }
}

module.exports = Header;
