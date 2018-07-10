'use strict';

const timer = require('headless-work-timer');

Log.console = {

  history: [],

  // TODO: Rewrite
  parse (input) {
    const p = Log.console.getParams(input);
    const s = input.split(' ');

    switch (s[0].toLowerCase()) {
      case 'start':
      case 'begin':
      case 's':
        Log.console.startEntry(input);
        break;
      case 'pomodoro':
      case 'tomato':
      case 'pom':
        Log.console.startPomodoro(input);
        break;
      case 'stop':
      case 'end':
      case 'pause':
        Log.console.endEntry();
        Log.stopTimer ? Log.stopTimer() : 'noop';
        break;
      case 'resume':
      case 'continue':
        Log.console.resumeEntry();
        break;
      case 'edit':
        Log.console.editEntry(p[1], p[2], p[3]);
        break;
      case 'delete':
      case 'del':
        Log.confirmDelete(input);
        break;
      case 'undo':
        Log.console.undo();
        break;
      case 'background':
      case 'bg':
        Log.options.setBackgroundColour(s[1]);
        break;
      case 'colour':
      case 'color':
      case 'foreground':
      case 'fg':
        Log.options.setForegroundColour(s[1]);
        break;
      case 'accent':
      case 'highlight':
      case 'ac':
      case 'hl':
        Log.options.setAccent(s[1]);
        break;
      case 'colourmode':
      case 'colormode':
      case 'cm':
        Log.options.setColourMode(s[1]);
        break;
      case 'colourcode':
      case 'colorcode':
      case 'cc':
        Log.options.setColourCode(p[1], p[2], p[3]);
        break;
      case 'view':
        Log.options.setView(Number(s[1]));
        break;
      case 'calendar':
      case 'cal':
        Log.options.setCalendar(s[1]);
        break;
      case 'time':
      case 'clock':
        Log.options.setTimeFormat(s[1]);
        break;
      case 'stat':
        Log.options.setStat(s[1]);
        break;
      case 'import':
        Log.console.importData();
        break;
      case 'export':
        Log.console.exportData();
        break;
      case 'rename':
      case 'rn':
        Log.console.rename(p[1], p[2], p[3]);
        break;
      case 'invert':
      case 'iv':
        Log.console.invert();
        break;
      case 'quit':
      case 'exit':
      case 'q':
        app.quit();
        break;
      default:
        return;
    }
  },

  getParams (input) {
    if (input === undefined) return;
    if (typeof input !== 'string' || !input.includes('"')) return;

    const part = input.slice(0, input.indexOf('"') - 1).split(' ');
    const p = input.split('');
    const params = [];
    const indices = [];
    let param = '';

    part.map(e => !e.includes('"') && (params[params.length] = e));
    p.map((e, i) => e === '"' && (indices[indices.length] = i));

    for (let i = 0, l = indices.length; i < l; i++) {
      for (let o = indices[i] + 1; o < indices[i + 1]; o++) {
        param += p[o];
      }
      params[params.length] = param;
      param = '';
      i++;
    }

    return params;
  },

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
      console.log('Config installed')
      Log.palette = user.palette;
      console.log('Sector palette installed')
      Log.projectPalette = user.projectPalette;
      console.log('Project palette installed')
      Log.log = Log.data.parse(user.log);
      console.log('Logs installed');
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

  exportData () {
    const data = JSON.stringify(JSON.parse(localStorage.getItem('user')));

    dialog.showSaveDialog(file => {
      if (file === undefined) return;
      fs.writeFile(file, data, err => {
        if (err) {
          new window.Notification(`An error occured creating the file ${err.message}`);
        } else {
          new window.Notification('Your log data has been exported.');
        }
      });
    });
  },

  // TODO: Rewrite
  startPomodoro (input) {
    const clock = timer()()((state, phaseChanged) => {
      if (phaseChanged) {
        state.phase === 'break' || state.phase === 'longBreak' ?
          Log.console.endEntry() : Log.console.startEntry(input);

        state.phase === 'break' || state.phase === 'longBreak' ?
          Log.playSound('timerEnd') : Log.playSound('timerStart');

        new window.Notification(`Started ${state.phase}`);
      }
    });

    Log.stopTimer = _ => clock.stop();
    Log.console.startEntry(input);
  },

  // TODO: Rewrite
  startEntry (input) {
    if (input === undefined) return;
    if (user.log.length !== 0 && user.log.slice(-1)[0].e === undefined) Log.console.endEntry();

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

    user.log[user.log.length] = {
      s: Log.time.toHex(new Date()),
      c: sec,
      t: pro,
      d: dsc
    }

    new window.Notification(`Started: ${sec} - ${pro} - ${dsc}`);
    Log.options.update.log();
  },

  endEntry () {
    if (Log.log === undefined) return;
    if (Log.log.length === 0) return;

    const last = user.log.slice(-1)[0];
    if (last.e !== undefined) return;

    last.e = Log.time.toHex(new Date());
    clearInterval(timer);

    new window.Notification(`Ended: ${last.c} - ${last.t} - ${last.d}`);
    Log.options.update.log();
  },

  resumeEntry () {
    if (Log.log === undefined) return;
    if (Log.log.length === 0) return;

    const last = user.log.slice(-1)[0];
    if (last.e === undefined) return;

    user.log[user.log.length] = {
      s: Log.time.toHex(new Date()),
      e: undefined,
      c: last.c,
      t: last.t,
      d: last.d
    }

    new window.Notification(`Resumed: ${last.c} - ${last.t} - ${last.d}`);
    Log.options.update.log();
  },

  // TODO: Rewrite
  deleteEntry (input) {
    if (Log.log === undefined) return;
    if (Log.log.length === 0) return;

    // all except first word are entry indices
    const words = input.split(' ').slice(1);

    if (words[0] === 'project') {
      user.log.forEach((e, id) => {
        if (e.t === words[1]) user.log.splice(id, 1);
      });
    } else if (words[0] === 'sector') {
      user.log.forEach((e, id) => {
        if (e.c === words[1]) user.log.splice(id, 1);
      });
    } else {
      // aui = ascending unique indices
      const aui = words.filter((v, i, self) => self.indexOf(v) === i).sort();
      // remove all indices. We start from the highest to avoid the shifting of indices after removal.
      aui.reverse().forEach(i => user.log.splice(Number(i) - 1, 1));
    }

    Log.options.update.all();
  },

  editEntry (i, attribute, value) {
    if (user.log.length === 0) return;
    const id = Number(i) - 1;

    switch (attribute) {
      case 'start':
        user.log[id].s = Log.time.convertDateTime(value);
        break;
      case 'end':
        user.log[id].e = Log.time.convertDateTime(value);
        break;
      case 'sector':
      case 'sec':
        user.log[id].c = value;
        break;
      case 'project':
      case 'title':
      case 'pro':
        user.log[id].t = value;
        break;
      case 'description':
      case 'desc':
      case 'dsc':
        user.log[id].d = value;
        break;
      case 'duration':
      case 'dur':
        const duration = parseInt(value, 10) * 60 || 0;
        user.log[id].e = Log.time.offset(user.log[id].s, duration);
        break;
      default:
        return;
    }

    Log.options.update.all();
  },

  rename (key, oldName, newName) {
    if (['sec', 'sector', 'pro', 'project'].indexOf(key) < 0) return;
    key = (key === 'sector' || key === 'sec') ? 'sector' : 'project';

    const notFound = _ => {
      new window.Notification(`${oldName} does not exist`);
    };

    if (key === 'sector') {
      if (Log.data.getEntriesBySector(oldName).length !== 0) {
        user.log.map((e) => {
          if (e.c === oldName) e.c = newName;
        });
      } else {
        notFound();
        return;
      }
    } else {
      if (Log.data.getEntriesByProject(oldName).length !== 0) {
        user.log.map((e) => {
          if (e.t === oldName) e.t = newName;
        });
      } else {
        notFound();
        return;
      }
    }

    new window.Notification(`${oldName} has been renamed to ${newName}`);
    Log.options.update.all();
  },

  invert () {
    const c = user.config.ui.colour;
    const b = user.config.ui.bg;
    user.config.ui.colour = b;
    user.config.ui.bg = c;
    Log.options.update.config();
  },

  undo () {
    /* TODO: To be implemented */
    const i = Log.console.history.slice(-2)[0];
    const p = Log.console.getParams(i);
    const s = i.split(' ');

    switch (s[0].toLowerCase()) {
      case 'rename':
      case 'rn':
        Log.console.rename(p[1], p[3], p[2]);
        break;
      case 'invert':
      case 'iv':
        Log.console.invert();
        break;
      default:
        return;
    }
  }
};
