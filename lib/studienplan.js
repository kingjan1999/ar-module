/**
 * Created by jan on 05.01.17.
 */
import _ from 'underscore';
import s from 'underscore.string';

_.mixin(s.exports());

class Studienplan {

  constructor(schwerpunkt = '', ps = {p1: '', p2: '', p3: '', p4: '', p5: ''}, fachstunden = {}) {
    // Schwerpunkt
    this.schwerpunkt = schwerpunkt;

    // P-Fächer (TODO Objekt ?)
    this.p1 = ps.p1;
    this.p2 = ps.p2;
    this.p3 = ps.p3;
    this.p4 = ps.p4;
    this.p5 = ps.p5;

    // Ergänzungs- und ZusatzFächer
    this.fachstunden = fachstunden;
  }

  getStep() {
    if (_.isBlank(this.schwerpunkt)) {
      return 1;
    }
    if (_.isBlank(this.p1) || _.isBlank(this.p2) || _.isBlank(this.p3)) {
      return 2;
    }
    if (_.isBlank(this.p4) || _.isBlank(this.p5)) {
      return 3;
    }
    if (_.isEmpty(this.fachstunden)) {
      return 4;
    }
    return 5;
  }

}

module.exports = Studienplan;
