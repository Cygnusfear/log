'use strict';

const CLI = {

  paraCom: ['edit', 'colourcode', 'colorcode', 'cc', 'rename', 'rn',],
  history: [],

  installHistory () {
    if (localStorage.hasOwnProperty('histoire')) {
      CLI.history = JSON.parse(localStorage.getItem('histoire'));
    } else {
      CLI.history = [];
      localStorage.setItem('histoire', '[]');
    }
  },

  /**
   * TODO: Rewrite
   * Extract parameters
   * @param {string} input
   * @return {Array} Parameters
   */
  parameterise (input) {
    if (input === undefined) return;
    if (!input.includes('"')) return;

    const part = input.slice(0, input.indexOf('"') - 1).split(' ');
    const p = input.split('');
    const params = [];
    const indices = [];
    let param = '';

    part.map(e => !e.includes('"') && (params[params.length] = e));
    p.map((e, i) => e === '"' && (indices[indices.length] = i));

    for (let i = 0, l = indices.length; i < l; i += 2) {
      for (let o = indices[i] + 1; o < indices[i + 1]; o++) {
        param += p[o];
      }
      params[params.length] = param;
      param = '';
    }

    return params;
  },

  /**
   * TODO: Rewrite
   * Parse input
   * @param {string} input
   */
  parse (input) {
    const s = input.split(' ');
    const key = s[0].toLowerCase();

    if (CLI.paraCom.indexOf(input) < 0) {
      switch (key) {
        case 'begin':
        case 'start':
          Command.startEntry(input);
          break;
        case 'pom':
        case 'tomato':
        case 'pomodoro':
          Command.startPomodoro(input);
          break;
        case 'end':
        case 'stop':
        case 'pause':
          Command.endEntry();
          Log.stopTimer ? Log.stopTimer() : 'noop';
          break;
        case 'resume':
        case 'continue':
          Command.resumeEntry();
          break;
        case 'del':
        case 'delete':
          Log.confirmDelete(input);
          break;
        case 'undo':
          Command.undo();
          break;
        case 'bg':
        case 'background':
          Log.config.setBackgroundColour(s[1]);
          break;
        case 'fg':
        case 'color':
        case 'colour':
        case 'foreground':
          Log.config.setForegroundColour(s[1]);
          break;
        case 'ac':
        case 'hl':
        case 'accent':
        case 'highlight':
          Log.config.setAccent(s[1]);
          break;
        case 'cm':
        case 'colormode':
        case 'colourmode':
          Log.config.setColourMode(s[1]);
          break;
        case 'view':
          Log.config.setView(+s[1]);
          break;
        case 'cal':
        case 'calendar':
          Log.config.setCalendar(s[1]);
          break;
        case 'time':
        case 'clock':
          Log.config.setTimeFormat(s[1]);
          break;
        case 'stat':
          Log.config.setStatFormat(s[1]);
          break;
        case 'import':
          Command.importData();
          break;
        case 'export':
          Command.exportData();
          break;
        case 'iv':
        case 'invert':
          Command.invert();
          break;
        case 'q':
        case 'quit':
        case 'exit':
          app.quit();
          break;
        default:
          return;
      }
    } else {
      const p = this.parameterise(input);
      switch (key) {
        case 'edit':
          Command.editEntry(p[1], p[2], p[3]);
          break;
        case 'cc':
        case 'colorcode':
        case 'colourcode':
          Log.options.set.colourCode(p[1], p[2], p[3]);
          break;
        case 'rn':
        case 'rename':
          Command.rename(p[1], p[2], p[3]);
          break;
        default:
          return;
      }
    }
  }
};
