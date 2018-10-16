'use strict';

/**
 * Build commander
 * @return {Object}
 */
const Commander = function () {
  const commander = ø('form', {
    className: 'dn psf b0 l0 wf f6 z9',
    onsubmit: () => false,
    action: '#'
  });

  const input = ø('input', {
    className: 'wf bg-0 blanc on bn p3',
    placeholder: Glossary.console,
    autofocus: 'autofocus',
    type: 'text'
  });

  commander.addEventListener('submit', _ => {
    const {history} = CLI;
    const val = input.value;

    Log.comIndex = 0;

    if (val !== '') {
      const l = history.length;

      if (val !== history[l - 1]) history[l] = val;
      if (l >= 100) history.shift();

      localStorage.setItem('histoire', JSON.stringify(history));
      CLI.parse(val);
    }

    commander.style.display = 'none';
    input.value = '';
  });

  UI.commanderEl = commander;
  UI.commanderInput = input;
  commander.append(input);
  return commander;
}

module.exports = Commander;
