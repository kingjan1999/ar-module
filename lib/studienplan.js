/**
 * Created by jan on 05.01.17.
 */
import _ from 'underscore';
import * as c from './constants';


class Studienplan {

  /**
   *
   * @param {string} schwerpunkt Gewählter Schwerpunkt
   * @param {object} ps Object with p1-p5 as keys and kzs as values
   * @param {object} fachstunden Fachstunden object
   * @param {boolean} generatePStunden Adds Pstunden to fachstunden?
   */
  constructor(schwerpunkt = '', ps = {
    p1: '',
    p2: '',
    p3: '',
    p4: '',
    p5: '',
  }, fachstunden = {}, generatePStunden = false) {
    // Schwerpunkt
    this.schwerpunkt = schwerpunkt;

    // P-Fächer (TODO Objekt ? Überhaupt notwendig?)
    this.p1 = ps.p1;
    this.p2 = ps.p2;
    this.p3 = ps.p3;
    this.p4 = ps.p4;
    this.p5 = ps.p5;

    // Ergänzungs- und ZusatzFächer
    this.fachstunden = fachstunden;

    if (generatePStunden) {
      for (let i = 1; i < 6; i += 1) {
        const p = `p${i}`;
        this.addFach(c.faecher[ps[p]], p, {}, i > 3 ? 'gk' : 'lk'); // Add fach, use default stunden configuration
      }
    }
  }

  /**
   * Gets current step
   * @return {number} Number from 1-5
   */
  getStep() {
    if (_.isEmpty(this.schwerpunkt)) {
      return 1;
    }
    if (_.isEmpty(this.p1) || _.isEmpty(this.p2) || _.isEmpty(this.p3)) {
      return 2;
    }
    if (_.isEmpty(this.p4) || _.isEmpty(this.p5)) {
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
   * @param {object} stundeno Stundenobject containing keys: stunden111 - stunden122
   * @param {string} anforderung Anforderungsniveau, either gk or lk
   */
  addFach(fach, typ = 'b', stundeno = {}, anforderung = 'gk') {
    // TODO Validate arguments, better default arguments (don't use _.defaults)
    const stunden = _.defaults(stundeno, {
      stunden111: 4,
      stunden112: 4,
      stunden121: 4,
      stunden122: 4,
      alts: {},
    });

    this.fachstunden[fach.kz] = {
      typ,
      anforderung,
      stunden,
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
    return _.findKey(this.fachstunden, value => value.typ === 'ef');
  }

  /**
   * Returns stunden in given semester
   * @param semester Semester e.g. 111 / 112 / 121 / 122
   * @return {number} Stunden in semester / week
   */
  getStunden(semester) {
    let gesamt = 0;
    Object.entries(this.fachstunden).forEach((fach) => {
      gesamt += fach[1].stunden[`stunden${semester}`];
    });
    return gesamt;
  }

  /**
   * Returns average stunden in all four semester
   * @return {number} average stunden / week
   */
  getStundenSchnitt() {
    return (this.getStunden('111') + this.getStunden('112') + this.getStunden('121') + this.getStunden('122')) / 4;
  }

  /**
   * Removes fach
   * @param kz Fach as KZ
   */
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

  /**
   * Get possible P1 Selections
   * @return {Array.<string>} array containing kzs
   */
  getPossibleP1() {
    return c.getLKnachSP(this.schwerpunkt, 'p1');
  }

  /**
   * Get possible P2 Selections
   * @return {Array.<string>} array containing kzs
   */
  getPossibleP2() {
    const arr = c.getLKnachSP(this.schwerpunkt, 'p2');
    return _.without(arr, this.p1);
  }

  getPossibleP3() {
    const arr = c.getLKnachSP(this.schwerpunkt, 'p3');
    return _.without(arr, this.p1, this.p2);
  }

}

module.exports = Studienplan;
