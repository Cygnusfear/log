'use strict';

const timer = require('headless-work-timer');

Log.command = {

  /**
   * Import data
   */
  importData () {
    const path = dialog.showOpenDialog({
      properties: ['openFile']
    });

    if (!path) return;
    let s = '';

    console.log('Attempting import...')
    console.log('Checking file...')
    try {
      s = fs.readFileSync(path[0], 'utf-8');
    } catch (e) {
      new window.Notification(
        'An error occured while trying to load this file.'
      );
      return;
    }

    console.log('Parsing data...')
    try {
      let test = JSON.parse(s);
    } catch (e) {
      console.error(e)
      console.error('Parse failed. Check file')
      new window.Notification(
        'There is something wrong with this file. Import failed.'
      );
      return;
    }

    console.log('Installing new path...')
    Log.path = path[0];
    console.log(Log.path)
    localStorage.setItem('logDataPath', Log.path);
    dataStore.path = Log.path;

    localStorage.setItem('user', s);
    user = JSON.parse(localStorage.getItem('user'));

    try {
      Log.config = user.config;
      Log.palette = user.palette;
      Log.projectPalette = user.projectPalette;
      Log.log = Log.data.parse(Log.entries);
    } catch (e) {
      console.error('User log data contains errors');
      new window.Notification('There is something wrong with this file.');
      return;
    }

    Log.reset();
    Log.load();

    Log.options.update.all();
    new window.Notification('Log data was successfully imported.');
  },

  /**
   * Export data
   */
  exportData () {
    const data = JSON.stringify(
      JSON.parse(localStorage.getItem('user'))
    );

    dialog.showSaveDialog(file => {
      if (file === undefined) return;
      fs.writeFile(file, data, err => {
        const msg = err ?
          `An error occured creating the file ${err.message}` :
          'Your log data has been exported.';

        new window.Notification(msg);
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
          Log.command.endEntry();
          sound = 'timerEnd';
        } else {
          Log.command.startEntry(input);
          sound = 'timerStart';
        }

        Log.playSound(sound);
        new window.Notification(`Started ${state.phase}`);
      }
    });

    Log.stopTimer = _ => clock.stop();
    Log.command.startEntry(input);
  },

  // TODO: Rewrite
  startEntry (input) {
    const start = Log.time.toHex(new Date);

    if (Log.entries.length > 0 && Log.entries.slice(-1)[0].e === undefined) {
      Log.command.endEntry();
    }

    let p = [];
    let indices = [];
    let sec = '';
    let pro = '';
    let dsc = '';

    if (input.includes('"')) {
      p = input.split('');
      p.map((e, i) => e === '"' && (indices[indices.length] = i));
      for (let i = indices[0] + 1; i < indices[1]; i++) sec += p[i];
      for (let i = indices[2] + 1; i < indices[3]; i++) pro += p[i];
      for (let i = indices[4] + 1; i < indices[5]; i++) dsc += p[i];
    } else {
      if (input.includes(';')) {
        p = input.split(';');
      } else if (input.includes('|')) {
        p = input.split('|');
      } else if (input.includes(',')) {
        p = input.split(',');
      } else return;

      sec = p[0].substring(6, p[0].length).trim();
      pro = p[1].trim();
      dsc = p[2].trim();
    }

    Log.entries[Log.entries.length] = {
      s: start,
      c: sec,
      t: pro,
      d: dsc
    }

    new window.Notification(`Started: ${sec} - ${pro} - ${dsc}`);
    Log.options.update.log();
  },

  endEntry () {
    const end = Log.time.toHex(new Date);
    if (Log.log.entries === undefined) return;
    if (Log.log.count === 0) return;

    const last = Log.entries.slice(-1)[0];
    if (last.e !== undefined) return;

    last.e = end;
    clearInterval(timer);

    new window.Notification(`Ended: ${last.c} - ${last.t} - ${last.d}`);
    Log.options.update.log();
  },

  resumeEntry () {
    if (Log.log.entries === undefined) return;
    if (Log.log.count === 0) return;

    const last = Log.entries.slice(-1)[0];
    if (last.e === undefined) return;

    Log.entries[Log.entries.length] = {
      s: Log.time.toHex(new Date),
      c: last.c,
      t: last.t,
      d: last.d
    }

    new window.Notification(`Resumed: ${last.c} - ${last.t} - ${last.d}`);
    Log.options.update.log();
  },

  // TODO: Rewrite
  deleteEntry (input) {
    if (Log.log.entries === undefined) return;
    if (Log.log.count === 0) return;

    // all except first word are entry indices
    const words = input.split(' ').slice(1);

    if (words[0] === 'project') {
      Log.entries.forEach((e, id) => {
        e.t === words[1] && Log.entries.splice(id, 1);
      });
    } else if (words[0] === 'sector') {
      Log.entries.forEach((e, id) => {
        e.c === words[1] && Log.entries.splice(id, 1);
      });
    } else {
      // aui = ascending unique indices
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();
      // remove all indices. We start from the highest to avoid the shifting of indices after removal.
      aui.reverse().forEach(i => Log.entries.splice(+i - 1, 1));
    }

    Log.options.update.all();
  },

  /**
   * Edit an entry
   * @param {number} id
   * @param {string} attribute
   * @param {string|number} value
   */
  editEntry (i, attribute, value) {
    if (Log.entries.length === 0) return;
    const id = +i - 1;

    switch (attribute) {
      case 'duration': case 'dur':
        const duration = parseInt(value, 10) * 60 || 0;
        Log.entries[id].e = Log.time.offset(Log.entries[id].s, duration);
        break;
      case 'start': case 'end':
        const t = Log.time.convertDateTime(value);
        if (attribute === 'start') Log.entries[id].s = t;
        else Log.entries[id].e = t;
        break;
      case 'description': case 'desc': case 'dsc':
        Log.entries[id].d = value;
        break;
      case 'sector': case 'sec':
        Log.entries[id].c = value;
        break;
      case 'project': case 'pro':
        Log.entries[id].t = value;
        break;
      default:
        return;
    }

    Log.options.update.all();
  },

  /**
   * Rename sector/project
   * @param {string} key - Sector or project
   * @param {string} oldName - Original name
   * @param {string} newName - New name
   */
  rename (key, oldName, newName) {
    if (!~secpro.indexOf(key)) return;
    key = (key === 'sector' || key === 'sec') ? 'sector' : 'project';

    const l = Log.entries.length;
    const notFound = _ => {
      new window.Notification(`The ${key} "${oldName}" does not exist`);
    };

    if (key === 'sector') {
      if (Log.log.entBySec(oldName).length > 0) {
        for (let i = 0; i < l; i++) {
          if (Log.entries[i].c === oldName) {
            Log.entries[i].c = newName;
          }
        }
      } else {
        notFound();
        return;
      }
    } else {
      if (Log.log.entByPro(oldName).length > 0) {
        for (let i = 0; i < l; i++) {
          if (Log.entries[i].t === oldName) {
            Log.entries[i].t = newName;
          }
        }
      } else {
        notFound();
        return;
      }
    }

    new window.Notification(`${oldName} has been renamed to ${newName}`);
    Log.options.update.all();
  },

  /**
   * Invert UI colours
   */
  invert () {
    const {bg, colour} = Log.config.ui;
    Log.config.ui.colour = bg;
    Log.config.ui.bg = colour;
    Log.options.update.config();
  },

  /**
   * TODO: Implement
   * Undo last action
   */
  undo () {
    const i = Log.console.history.slice(-2)[0];
    const s = i.split(' ');

    switch (s[0].toLowerCase()) {
      case 'rename': case 'rn':
        const p = Log.console.parameterise(i);
        Log.command.rename(p[1], p[3], p[2]);
        break;
      case 'invert': case 'iv':
        Log.command.invert();
        break;
      default:
        return;
    }
  }
}
