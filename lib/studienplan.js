/**
 * Created by jan on 05.01.17.
 */
import _ from 'underscore';
import s from 'underscore.string';

_.mixin(s.exports());

class Studienplan {

  /**
   *
   * @param schwerpunkt
   * @param ps
   * @param fachstunden
   */
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

  /**
   * Gets current step
   * @return {number} Number from 1-5
   */
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

  /**
   * Adds fach
   * @param {Object} fach Fach
   * @param {string} typ Typ, either p1-p5 / ef / b
   * @param {object} stunden Stundenobject containing keys: stunden111, stunden112, stunden121, stunden122
   * @param {string} anforderung Anforderungsniveau, either gk or lk
   */
  addFach(fach, typ = 'b', stunden = {}, anforderung = 'gk') {
    // TODO Validate arguments, better default arguments (don't use _.defaults)
    stunden = _.defaults(stunden, {
      stunden111: 4,
      stunden112: 4,
      stunden121: 4,
      stunden122: 4,
      alts: {}
    });

    this.fachstunden[fach.kz] = {
      typ: typ,
      anforderung: anforderung,
      stunden: stunden
    };
  }

  /**
   * Gets Fachbelegung by kz
   * @param kz KZ of fach
   * @return {*} Fachbelegung
   */
  getFach(kz) {
    return this.fachstunden[kz];
  }

  /**
   * Counts how often a fach from a certain array is choosen
   * @param arr Array containing fächer to be counted
   * @return Number of appearances
   */
  countAppearance(arr) {
    return _.intersection(arr, _.keys(this.fachstunden)).length;
  }

  /**
   * Checks if stundenplan contains a fach from a array
   * @param arr array to check
   * @return {boolean}
   */
  hasArrayFach(arr) {
    return this.countAppearance(arr) > 0;
  }

  /**
   * Gets EF
   * @return Index of object containing ef (e.g. 'de')
   */
  getEF() {
    return _.findKey(this.fachstunden, value => {
      return value.typ === 'ef';
    });
  }

  /**
   * Returns stunden in given semester
   * @param semester Semester e.g. 111 / 112 / 121 / 122
   * @return {number} Stunden in semester / week
   */
  getStunden(semester) {
    let gesamt = 0;
    for (let [key, fach] of Object.entries(this.fachstunden)) { // eslint-disable-line no-unused-vars
      gesamt += fach.stunden['stunden' + semester];
    }
    return gesamt;
  }

  /**
   * Returns average stunden in all four semester
   * @return {number} average stunden / week
   */
  getStundenSchnitt() {
    return (this.getStunden('111') + this.getStunden('112') + this.getStunden('121') + this.getStunden('122')) / 4;
  }

  removeFach(kz) {
    delete this.fachstunden[kz];
  }

  /**
   * Serializes as json
   * TODO Better import / export
   */
  serialize() {
    return JSON.stringify(this);
  }

}

module.exports = Studienplan;
