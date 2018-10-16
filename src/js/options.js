'use strict';

Log.options = {

  set: {

    /**
     * Set sector/project colour code
     * @param {string} mode - Sector or project
     * @param {string} key - Name
     * @param {string} colour
     */
    colourCode (mode, key, colour) {
      if (
        secpro.indexOf(mode) < 0 ||
        key === undefined ||
        colour === undefined
      ) return;

      if (mode === 'sector' || mode === 'sec') {
        Palette.sp[key] = colour;
        Update.secPalette();
      } else {
        Palette.pp[key] = colour;
        Update.proPalette();
      }
    }
  }
};
