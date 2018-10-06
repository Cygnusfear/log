class Entry {

  constructor({id, s, e, c, t, d}) {
    Object.assign(this, {id, s, e, c, t, d});
    this.dur = Log.time.duration(this.s, this.e);
  }

  get sc () { return Log.palette[this.c]; }
  get pc () { return Log.projectPalette[this.t]; }
  get wh () { return this.calcWidth(); }
  get mg () { return this.calcMargin(); }

  /**
   * Calculate left margin
   * @return {number} Margin
   */
  calcMargin () {
    const a = new Date(this.s);
    const m = new Date(a).setHours(0, 0, 0);
    return (+a / 1E3 - +m / 1E3) / 86400 * 100;
  }

  /**
   * Calculate duration width
   * @return {number} Width
   */
  calcWidth () {
    return this.dur * 3600 / 864;
  }
}
