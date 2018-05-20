'use strict';

class Store {
  constructor(opts) {
    this.path = opts.path;
    this.data = parseDataFile(this.path, opts.defaults);
  }

  /**
   * Get data object property
   * @param {string} key - Property
   * @returns Property
   */
  get(key) {
    return this.data[key];
  }

  /**
   * Set data object property
   * @param {string} key - Key
   * @param {string} val - Value
   */
  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (error) {
    console.error('Something went wrong with file parsing')
    // return defaults;
  }
}

module.exports = Store;
