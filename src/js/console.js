'use strict';

const paraCom = [
  'edit', 'colourcode', 'colorcode', 'cc', 'rename', 'rn'
];

Log.console = {

  history: [],

  installHistory () {
    if (localStorage.hasOwnProperty('logHistory')) {
      Log.console.history = JSON.parse(localStorage.getItem('logHistory'));
    } else {
      Log.console.history = [];
      localStorage.setItem('logHistory', '[]');
    }
  },

  /**
   * Extract parameters
   * @param {string} input
   * @return {Object[]} Parameters
   */
  parameterise (input) {
    if (!input) return;
    if (!input.includes('"')) return;

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

  /**
   * TODO: Rewrite
   * Parse input
   * @param {string} input
   */
  parse (input) {
    const s = input.split(' ');
    const key = s[0].toLowerCase();

    if (!~paraCom.indexOf(input)) {
      switch (key) {
        case 'start':
        case 'begin':
          Log.command.startEntry(input);
          break;
        case 'pomodoro':
        case 'tomato':
        case 'pom':
          Log.command.startPomodoro(input);
          break;
        case 'stop':
        case 'end':
        case 'pause':
          Log.command.endEntry();
          Log.stopTimer ? Log.stopTimer() : 'noop';
          break;
        case 'resume':
        case 'continue':
          Log.command.resumeEntry();
          break;
        case 'delete':
        case 'del':
          Log.confirmDelete(input);
          break;
        case 'undo':
          Log.command.undo();
          break;
        case 'background':
        case 'bg':
          Log.options.set.bg(s[1]);
          break;
        case 'colour':
        case 'color':
        case 'foreground':
        case 'fg':
          Log.options.set.fg(s[1]);
          break;
        case 'accent':
        case 'highlight':
        case 'ac':
        case 'hl':
          Log.options.set.accent(s[1]);
          break;
        case 'colourmode':
        case 'colormode':
        case 'cm':
          Log.options.set.colourMode(s[1]);
          break;
        case 'view':
          Log.options.set.view(+s[1]);
          break;
        case 'calendar':
        case 'cal':
          Log.options.set.calendar(s[1]);
          break;
        case 'time':
        case 'clock':
          Log.options.set.time(s[1]);
          break;
        case 'stat':
          Log.options.set.stat(s[1]);
          break;
        case 'import':
          Log.command.importData();
          break;
        case 'export':
          Log.command.exportData();
          break;
        case 'invert':
        case 'iv':
          Log.command.invert();
          break;
        case 'quit':
        case 'exit':
        case 'q':
          app.quit();
          break;
        default:
          return;
      }
    } else {
      const p = this.parameterise(input);

      switch (key) {
        case 'edit':
          Log.command.editEntry(p[1], p[2], p[3]);
          break;
        case 'colourcode':
        case 'colorcode':
        case 'cc':
          Log.options.set.colourCode(p[1], p[2], p[3]);
          break;
        case 'rename':
        case 'rn':
          Log.command.rename(p[1], p[2], p[3]);
          break;
        default:
          return;
      }
    }
  }
};
