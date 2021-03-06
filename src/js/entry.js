'use strict';

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

  get sc () { return Palette.sp[this.sector]; }
  get pc () { return Palette.pp[this.project]; }
  get wh () { return this.calcWidth(); }
  get mg () { return this.calcMargin(); }

  set setStart (s)   { this.s = s; }
  set setEnd (e)     { this.e = e; }
  set setSector (c)  { this.c = c; }
  set setProject (t) { this.t = t; }
  set setDesc (d)    { this.d = d; }

  /**
   * Calculate left margin
   * @return {number} Margin
   */
  calcMargin () {
    const d = this.start;
    const m = new Date(d).setHours(0, 0, 0);
    return (+d - +m) / 864E3;
  }

  /**
   * Calculate duration width
   * @return {number} Width
   */
  calcWidth () {
    return this.dur * 25 / 6;;
  }
}

module.exports = Entry;
