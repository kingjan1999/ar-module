/**
 * Created by jan on 05.01.17.
 */
import _ from 'lodash';
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
        if (!_.isEmpty(ps[p])) {
          // Add fach, use default stunden configuration
          this.addFach(c.faecher[ps[p]], p, {}, i > 3 ? 'gk' : 'lk');
        }
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
    const stunden = _.defaults(stundeno, c.defaultBelegung);

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
   * Checks if studienplan has fach
   * @param kz Fach as KZ
   * @return {Boolean}
   */
  hasFach(kz) {
    return _.has(this.fachstunden, kz);
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
    return _.findKey(this.fachstunden, { typ: 'ef' });
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
    return (this.getStunden('111')
      + this.getStunden('112')
      + this.getStunden('121')
      + this.getStunden('122')) / 4;
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

  /**
   * Get possible P3 Selections
   * @return {Array.<string>} array containing kzs
   */
  getPossibleP3() {
    const arr = c.getLKnachSP(this.schwerpunkt, 'p3');
    return _.without(arr, this.p1, this.p2);
  }

  /**
   * Get possible P4 Selections
   * @return {Array.<string>} array containing kzs
   */
  getPossibleP4() {
    let arr = c.getP4s();
    arr = _.without(arr, this.p1, this.p2, this.p3);
    const count = this.getFeldCount();
    if (count.a < 1 && count.b < 1) {
      // we need either a / b
      arr = _.filter(arr, kz => c.faecher[kz].feld === 'a' || c.faecher[kz].feld === 'b');
    } else if (count.a < 1 && count.c < 1) {
      // we need either a /c
      arr = _.filter(arr, kz => c.faecher[kz].feld === 'a' || c.faecher[kz].feld === 'c');
    } else if (count.b < 1 && count.c < 1) {
      // we need either b / c
      arr = _.filter(arr, kz => c.faecher[kz].feld === 'b' || c.faecher[kz].feld === 'c');
    }
    if (this.getKernFachCount() < 1 || (count.b < 1 && this.getKernFachCount() < 2)) {
      arr = this.onlyKF(arr);
    }

    return arr;
  }

  /**
   * Get possible P5 Selections
   * @return {Array.<string>} array containing kzs
   */
  getPossibleP5() {
    let arr = c.getP5s();
    arr = _.without(arr, this.p1, this.p2, this.p3, this.p4);
    const count = this.getFeldCount();
    const kfcount = this.getKernFachCount();
    if (kfcount < 2) {
      arr = this.onlyKF(arr);
    }
    if (count.a < 1) {
      arr = _.filter(arr, kz => c.faecher[kz].feld === 'a');
    } else if (count.b < 1) {
      arr = _.filter(arr, kz => c.faecher[kz].feld === 'b');
    } else if (count.c < 1) {
      arr = _.filter(arr, kz => c.faecher[kz].feld === 'c');
    }

    return arr;
  }

  /**
   * Get possible EFs
   * @return object with two keys, faecher and belegung
   */
  getPossibleEF() {
    switch (this.schwerpunkt) {
      case 'gw': {
        let arr = c.fremdsprachen.concat(c.naturwissenschaften);
        arr = this.filterPs(arr);
        return {
          faecher: arr,
          belegung: c.parseBelegungAlts('2x4x11|4x4'),
        };
      }
      case 'spr': {
        if (this.p2 === 'de' && !(c.isFremdsprache(this.p3)
            || c.isFremdsprache(this.p4)
            || c.isFremdsprache(this.p5)
          )) {
          return {
            faecher: this.filterPs(c.fremdsprachen),
            belegung: c.defaultBelegung,
          };
        }
        return { faecher: null };
      }
      case 'nw': {
        if (this.p2 === 'ma' && !(c.isNW(this.p3) || c.isNW(this.p4) || c.isNW(this.p5))) {
          return {
            faecher: this.filterPs(c.naturwissenschaften),
            belegung: c.defaultBelegung,
          };
        }
        return { faecher: null };
      }
      case 'mk': {
        const belegung = c.parseBelegungAlts('2x2x11|2x2x12');
        if (this.p1 === 'mu') {
          return { faecher: this.filterPs(['ku', 'ds']), belegung };
        }
        return { faecher: this.filterPs(['mu']), belegung };
      }
      default: {
        return { faecher: null };
      }
    }
  }

  /**
   * Adds default faecher, like sp / sf / de / ma
   */
  addDefaultFaecher() {
    c.defaultFaecher.forEach((fach) => {
      if (!this.hasFach(fach.fach.kz)) {
        this.addFach(fach.fach, 'b', fach.belegung, 'gk');
      }
    });
  }

  /**
   * Get count for all felder
   * @return Object with keys a,b,c
   */
  getFeldCount() {
    const count = { a: 0, b: 0, c: 0 };
    Object.entries(this.fachstunden).forEach((fach) => {
      const feld = c.faecher[fach[0]].feld;
      if (feld === 'a') {
        count.a += 1;
      } else if (feld === 'b') {
        count.b += 1;
      } else if (feld === 'c') {
        count.c += 1;
      }
    });
    return count;
  }

  /**
   * Get kernfach count
   * @return {Number} Count of kernfächer
   */
  getKernFachCount() {
    return this.countAppearance(['de', 'ma']) + (this.hasArrayFach(c.fremdsprachen) ? 1 : 0);
  }

  /**
   * Removes p1-p5 from array
   * @param arr Array containing kzs
   * @return {*|{start}} array without p1-p5
   */
  filterPs(arr) {
    return _.without(arr, this.p1, this.p2, this.p3, this.p4, this.p5);
  }

  /**
   * Allow only KFs
   * @param arr Array to filter
   * @return {*|Array.<T>|Array} Array containing posible KF
   */
  onlyKF(arr) {
    const hasFremdsprache = this.hasArrayFach(c.fremdsprachen);
    // Dringend gesucht: Ein Kernfach
    return _.filter(arr, (kz) => {
      if (hasFremdsprache) {
        return c.isKernfach(kz) && !c.isFremdsprache(kz);
      }
      return c.isKernfach(kz);
    });
  }
}

module
  .exports = Studienplan;
