class Entry {

  constructor({id, start, end, sector, project, description}) {
    this.id = id;
    this.s = start;
    this.e = end;
    this.c = sector;
    this.t = project;
    this.d = description;

    this.sc = user.palette[this.sector] || Log.config.ui.colour;
    this.pc = user.projectPalette[this.project] || Log.config.ui.colour;

    this.dur = Log.time.duration(this.s, this.e);

    this.sc = user.palette[this.c] || Log.config.ui.colour;
    this.pc = user.projectPalette[this.t] || Log.config.ui.colour;
  }
}
