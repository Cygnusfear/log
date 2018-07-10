'use strict';

class Store {
  constructor (opts) {
    this.path = opts.path;
    this.data = parseDataFile(this.path, opts.defaults);
  }

  get (key) {
    return this.data[key];
  }

  set (key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile (filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    return defaults;
  }
}

module.exports = Store;
