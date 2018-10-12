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
      if (secpro.indexOf(mode) < 0) return;
      if (key === undefined || colour === undefined) return;

      if (mode === 'sector' || mode === 'sec') {
        Log.palette[key] = colour;
        Update.palette();
      } else {
        Log.projectPalette[key] = colour;
        Update.projectPalette();
      }
    }
  }
};
