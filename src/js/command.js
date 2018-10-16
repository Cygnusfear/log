'use strict';

const timer = require('headless-work-timer');

const Command = {

  importData () {
    const path = dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (path === undefined) return;
    let s = '';

    console.log('Attempting import...');
    try {
      s = fs.readFileSync(path[0], 'utf-8');
    } catch (e) {
      console.log(e);
      new window.Notification(
        'An error occured while trying to load this file.'
      );
      return;
    }

    console.log('Parsing data...');
    try {
      let test = JSON.parse(s);
    } catch (e) {
      console.error(e);
      console.error('Parse failed. Check file');
      new window.Notification(
        'There is something wrong with this file. Import failed.'
      );
      return;
    }

    console.log('Installing new path...');
    const newPath = path[0];
    console.log(newPath);
    localStorage.setItem('logDataPath', newPath);
    dataStore.path = newPath;

    localStorage.setItem('user', s);
    user = JSON.parse(localStorage.getItem('user'));

    try {
      Log.config = user.config;
      Palette.sp = user.sp;
      Palette.pp = user.pp;
      Session = parse(Log.entries);
    } catch (e) {
      console.error('User log data contains errors');
      new window.Notification('There is something wrong with this file.');
      return;
    }

    Log.reset();
    Log.load();

    Update.all();
    new window.Notification('Log data was successfully imported.');
  },

  exportData () {
    const data = JSON.stringify(
      JSON.parse(localStorage.getItem('user'))
    );

    dialog.showSaveDialog(file => {
      if (file === undefined) return;
      fs.writeFile(file, data, err => {
        new window.Notification(
          err ?
            `An error occured creating the file ${err.message}` :
            'Your log data has been exported.'
        );
      });
    });
  },

  /**
   * TODO: Rewrite
   * Start Pomodoro entry
   * @param {string} input
   */
  startPomodoro (input) {
    const clock = timer()()((state, phaseChanged) => {
      if (phaseChanged) {
        let sound = '';

        if (state.phase === 'break' || state.phase === 'longBreak') {
          Command.endEntry();
          sound = 'timerEnd';
        } else {
          Command.startEntry(input);
          sound = 'timerStart';
        }

        Log.playSound(sound);
        new window.Notification(`Started ${state.phase}`);
      }
    });

    Log.stopTimer = _ => clock.stop();
    Command.startEntry(input);
  },

  // TODO: Rewrite
  startEntry (input) {
    const s = (new Date).toHex();

    // End ongoing log, if any
    if (
      Log.entries.length !== 0 &&
      Log.entries.slice(-1)[0].e === undefined) {
      Command.endEntry();
    }

    let indices = [];
    let p = [];
    let c = '';
    let t = '';
    let d = '';

    if (input.includes('"')) {
      p = input.split('');
      p.map((e, i) => e === '"' && (indices[indices.length] = i));
      for (let i = indices[0] + 1; i < indices[1]; i++) c += p[i];
      for (let i = indices[2] + 1; i < indices[3]; i++) t += p[i];
      for (let i = indices[4] + 1; i < indices[5]; i++) d += p[i];
    } else {
      if (input.includes(';')) {
        p = input.split(';');
      } else if (input.includes('|')) {
        p = input.split('|');
      } else if (input.includes(',')) {
        p = input.split(',');
      } else return;

      c = p[0].substring(6, p[0].length).trim();
      t = p[1].trim();
      d = p[2].trim();
    }

    Log.entries[Log.entries.length] = {s, c, t, d};
    new window.Notification(`Started: ${c} - ${t} - ${d}`);
    Update.log();
  },

  endEntry () {
    const end = (new Date).toHex();
    if (Session.logs === undefined) return;
    if (Session.count === 0) return;

    const last = Log.entries.slice(-1)[0];
    if (last.e !== undefined) return;

    last.e = end;
    clearInterval(timer);

    new window.Notification(`Ended: ${last.c} - ${last.t} - ${last.d}`);
    Update.log();
  },

  resumeEntry () {
    const s = (new Date).toHex();
    if (Session.logs === undefined) return;
    if (Session.count === 0) return;

    const {e, c, t, d} = Log.entries.slice(-1)[0];
    if (e === undefined) return;

    Log.entries[Log.entries.length] = {s, c, t, d};
    new window.Notification(`Resumed: ${c} - ${t} - ${d}`);
    Update.log();
  },

  /**
   * TODO: Rewrite
   * Delete entry
   * @param {string} input
   */
  deleteEntry (input) {
    if (Session.logs === undefined) return;
    if (Session.count === 0) return;

    // all except first word are entry indices
    const words = input.split(' ').slice(1);

    if (words[0] === 'project') {
      Log.entries.forEach(({t}, id) => {
        t === words[1] && Log.entries.splice(id, 1);
      });
    } else if (words[0] === 'sector') {
      Log.entries.forEach(({c}, id) => {
        c === words[1] && Log.entries.splice(id, 1);
      });
    } else {
      // aui = ascending unique indices
      const aui = words.filter((v, i, self) => {
        return self.indexOf(v) === i;
      }).sort();
      // remove all indices. We start from the highest to avoid
      // the shifting of indices after removal.
      aui.reverse().forEach(i => Log.entries.splice(+i - 1, 1));
    }

    Update.all();
  },

  /**
   * TODO: Re-implement timestamp editing
   * Edit an entry
   * @param {number} id
   * @param {string} attr
   * @param {string|number} val
   */
  editEntry (i, attr, val) {
    if (Log.entries.length === 0) return;
    const id = +i - 1;

    switch (attr) {
      case 'duration': case 'dur':
        const duration = parseInt(val, 10) * 60 || 0;
        Log.entries[id].e = offset(Log.entries[id].s, duration);
        break;
      case 'description': case 'desc': case 'dsc':
        Log.entries[id].d = val;
        break;
      case 'sector': case 'sec':
        Log.entries[id].c = val;
        break;
      case 'project': case 'pro':
        Log.entries[id].t = val;
        break;
      default:
        return;
    }

    Update.all();
  },

  /**
   * Rename sector/project
   * @param {string} key - Sector or project
   * @param {string} oldName - Original name
   * @param {string} newName - New name
   */
  rename (key, oldName, newName) {
    if (secpro.indexOf(key) < 0) return;
    const typ = (key === 'sector' || key === 'sec') ?
      'sector' : 'project';

    const l = Log.entries.length;
    const notFound = `The ${typ} "${oldName}" does not exist`;

    if (typ === 'sector') {
      if (Session.bySector(oldName).length > 0) {
        for (let i = 0; i < l; i++) {
          if (Log.entries[i].c === oldName) {
            Log.entries[i].c = newName;
          }
        }
      } else {
        new window.Notification(notFound);
        return;
      }
    } else {
      if (Session.byProject(oldName).length > 0) {
        for (let i = 0; i < l; i++) {
          if (Log.entries[i].t === oldName) {
            Log.entries[i].t = newName;
          }
        }
      } else {
        new window.Notification(notFound);
        return;
      }
    }

    new window.Notification(`${oldName} has been renamed to ${newName}`);
    Update.all();
  },

  /**
   * Invert UI colours
   */
  invert () {
    const {bg, fg} = Log.config;
    Log.config.fg = bg;
    Log.config.bg = fg;
    Update.config();
  },

  /**
   * TODO: Implement
   * Undo last action
   */
  undo () {
    const i = CLI.history.slice(-2)[0];
    const s = i.split(' ');

    switch (s[0].toLowerCase()) {
      case 'rename': case 'rn':
        const p = CLI.parameterise(i);
        Command.rename(p[1], p[3], p[2]);
        break;
      case 'invert': case 'iv':
        Command.invert();
        break;
      default:
        return;
    }
  }
}

module.exports = Command;
