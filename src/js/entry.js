class Entry {

  constructor({id, s, e, c, t, d}) {
    this.id = id;
    this.s = s;
    this.e = e;
    this.c = c;
    this.t = t;
    this.d = d;

    this.dur = Log.time.duration(this.s, this.e);
  }

  get sc () { return user.palette[this.c]; }
  get pc () { return user.projectPalette[this.t]; }
  get width () { return this.calcWidth(); }
  get margin () { return this.calcDurPercent(); }

  calcDurPercent () {
    const a = this.s;
    return (
      +a / 1E3 -
      +(new Date(
        a.getFullYear(), a.getMonth(), a.getDate()
      )) / 1E3
    ) / 86400 * 100;
  }

  calcWidth () {
    return this.dur * 3600 / 864;
  }
}
