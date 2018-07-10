'use strict';

window.addEventListener('dragover', e => {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('drop', e => {
  e.preventDefault();
  e.stopPropagation();

  const files = e.dataTransfer.files;

  for (const file_id in files) {
    const file = files[file_id];

    if (file.name.indexOf('.json') < 0) {
      console.log('skipped', file);
      continue;
    }

    const path = file.path;
    const reader = new FileReader();

    reader.onload = e => {
      const o = JSON.parse(e.target.result);

      user.config.ui.bg = o.config.ui.bg || '#f8f8f8';
      user.config.ui.colour = o.config.ui.colour || '#202020';
      user.config.ui.accent = o.config.ui.accent || '#eb4e32';
      user.config.ui.colourMode = o.config.ui.colourMode || 'sector';
      user.config.ui.view = o.config.ui.view || 28;
      user.config.ui.stat = o.config.ui.stat || 'decimal';

      user.config.system.calendar = o.config.system.calendar || 'gregorian';
      user.config.system.timeFormat = o.config.system.timeFormat || '24';

      user.palette = o.palette || {};
      user.projectPalette = o.projectPalette || {};
      user.log = o.log || [];

      Log.path = path;
      localStorage.setItem('logDataPath', path);
      dataStore.path = Log.path;

      localStorage.setItem('user', o);
      user = JSON.parse(localStorage.getItem('user'));

      new window.Notification('Your log data was successfully imported.');
      Log.options.update.all();
    };

    reader.readAsText(file);
    return;
  }
});
