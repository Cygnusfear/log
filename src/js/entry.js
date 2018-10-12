class Entry {

  /**
   * Construct an entry
   * @param {Object} attr
   * @param {number} attr.id - Entry ID
   * @param {Date}   attr.s  - Start time
   * @param {Date}   attr.e  - End time
   * @param {string} attr.c  - Sector
   * @param {string} attr.t  - Project
   * @param {string} attr.d  - Description
   */
  constructor(attr) {
    Object.assign(this, attr);
    this.dur = duration(this.s, this.e);
  }

  get start ()   { return this.s; }
  get end ()     { return this.e; }
  get sector ()  { return this.c; }
  get project () { return this.t; }
  get desc ()    { return this.d; }

  set setStart (s)   { this.s = s; }
  set setEnd (e)     { this.e = e; }
  set setSector (c)  { this.c = c; }
  set setProject (t) { this.t = t; }
  set setDesc (d)    { this.d = d; }

  get sc () { return Log.palette[this.sector]; }
  get pc () { return Log.projectPalette[this.project]; }
  get wh () { return this.calcWidth(); }
  get mg () { return this.calcMargin(); }

  /**
   * Calculate left margin
   * @return {number} Margin
   */
  calcMargin () {
    const d = this.start;
    const m = new Date(d).setHours(0, 0, 0);
    return (+d / 1E3 - +m / 1E3) / 86400 * 100;
  }

  /**
   * Calculate duration width
   * @return {number} Width
   */
  calcWidth () {
    return this.dur * 3600 / 864;
  }
}
