/**
 * Created by jan on 05.01.17.
 */
import _ from 'underscore';
import s from 'underscore.string';

_.mixin(s.exports());

// General vars

const fremdsprachen = ['en', 'la', 'sn', 'fr'];
const naturwissenschaften = ['ph', 'bi', 'ch'];

const e4g4 = {e4: true, g4: true, g2: false}; // TODO Export ?
const g4 = {e4: false, g4: true, g2: false};
const g4g2 = {e4: false, g4: true, g2: true};
const g2 = {e4: false, g4: false, g2: true};
const e4g2 = {e4: true, g4: false, g2: true};
const e4g4g2 = {e4: true, g4: true, g2: true};

const schwerpunkteP = {
  gw: {
    name: 'Gesellschaftswissenschenschaften',
    p1: 'ge',
    p2: fremdsprachen.concat('de').concat('ma').concat(naturwissenschaften),
    p3: 'po'
  },
  spr: {
    name: 'Sprachlich',
    p1: fremdsprachen,
    p2: fremdsprachen.concat('de'),
    p3: '*'

  },
  mk: {
    name: 'Musisch-Künstlerisch',
    p1: ['ku', 'mu'],
    p2: ['de', 'ma'],
    p3: '*'

  },
  nw: {
    name: 'Naturwissenschaftlich',
    p1: naturwissenschaften,
    p2: naturwissenschaften.concat('ma'),
    p3: '*'
  }
};

export const faecher = {
  de: {kz: 'de', name: 'Deutsch', feld: 'a', stunden: e4g4},
  en: {kz: 'en', name: 'Englisch', feld: 'a', stunden: e4g4},
  fr: {kz: 'fr', name: 'Französisch', feld: 'a', stunden: e4g4},
  la: {kz: 'la', name: 'Latein', feld: 'a', stunden: e4g4},
  sn: {kz: 'sn', name: 'Spanisch (7)', feld: 'a', stunden: g4},
  sa: {kz: 'sn', name: 'Spanisch (10)', feld: 'a', stunden: g4},
  ds: {kz: 'ds', name: 'Darstellendes Spiel', feld: 'a', stunden: g4g2},
  ku: {kz: 'ku', name: 'Kunst', feld: 'a', stunden: e4g2},
  mu: {kz: 'mu', name: 'Musik', feld: 'a', stunden: e4g2},
  ek: {kz: 'ek', name: 'Erdkunde', feld: 'b', stunden: g4},
  ge: {kz: 'ge', name: 'Geschichte', feld: 'b', stunden: e4g4g2},
  po: {kz: 'po', name: 'Politik-Wirtschaft', feld: 'b', stunden: e4g4g2},
  er: {kz: 'er', name: 'Ev. Religion', feld: 'b', stunden: g4g2},
  kr: {kz: 'kr', name: 'Kath. Religion', feld: 'b', stunden: g4},
  wn: {kz: 'wn', name: 'Werte und Normen', feld: 'b', stunden: g4g2},
  ma: {kz: 'ma', name: 'Mathematik', feld: 'c', stunden: e4g4},
  bi: {kz: 'bi', name: 'Biologie', feld: 'c', stunden: e4g4},
  ch: {kz: 'ch', name: 'Chemie', feld: 'c', stunden: e4g4},
  ph: {kz: 'ph', name: 'Physik', feld: 'c', stunden: e4g4},
  if: {kz: 'if', name: 'Informatik', feld: 'c', stunden: g4g2},
  sf: {kz: 'sf', name: 'Seminarfach', feld: '', stunden: g4g2},
  sp: {kz: 'sp', name: 'Sport', feld: '', stunden: g2}
  // '': {'kz': '', name: 'Dummy', feld: '', stunden: g2} // Dummy Objekt
};

let keinP = ['ds', 'wn', 'if', 'sf', 'sp'];
let nurp5 = ['ek', 'er', 'kr'];

/**
 * Get possible faecher by schwerpunkt and type (p1, p2, p3)
 * @param {string} schwerpunkt Schwerpunkt, der gewählt wurde
 * @param {string} pfach P1 / P2 / P3
 * @returns {Array.<string>} array withpossible faechers (determined by their kzs)
 */
export function getLKnachSP(schwerpunkt, pfach) {
  let vfaecher = schwerpunkteP[schwerpunkt][pfach];
  if (vfaecher === '*') {
    vfaecher = [];
    _.each(faecher, (fach, key) => {
      if (fach.stunden.e4 === true && _.indexOf(keinP, key) < 0) {
        vfaecher.push(fach.kz);
      }
    });
  }
  if (!Array.isArray(vfaecher)) {
    vfaecher = [vfaecher];
  }
  return vfaecher;
}

/**
 * Resolves name (like "Deutsch") to a kz (like "de")
 * @param {string} name Name of a fach (like "Deutsch")
 */
export function nameToKZ(name) {
  return _.findWhere(faecher, {name: name}).kz;
}

/**
 * Gets faecher only available as P5
 * @returns {Array.<string>} array containing kz's of all faechers
 */
export function getP5s() {
  return getP4s().concat(nurp5);
}

/**
 * Gets faecher only available as P4
 * @returns {Array.<string>} array containing kz's of all faechers
 */
export function getP4s() {
  let vfaecher = [];
  _.each(faecher, (fach, key) => {
    if (_.indexOf(keinP, key) < 0) {
      vfaecher.push(key);
    }
  });
  return vfaecher;
}

/**
 * Get KF's (Kernfächer)
 * @returns {Array.<string>}
 */
export function getKFs() {
  return fremdsprachen.concat(['ma', 'de']);
}

/**
 * Check if fach is Kernfach
 * @param {string|object} fach Fach as KZ or object
 * @returns {boolean}
 */
export function isKernfach(fach) {
  return isX(fach, getKFs());
}

/**
 * Check if fach is Fremdsprache
 * @param {string|object} fach Fach as KZ or object
 * @returns {boolean}
 */
export function isFremdsprache(fach) {
  return isX(fach, fremdsprachen);
}

/**
 * Check if fach is Naturwissenschaft
 * @param {string|object} fach Fach as KZ or object
 * @returns {boolean}
 */
export function isNW(fach) {
  return isX(fach, naturwissenschaften);
}

function isX(fach, array) {
  if (_.isString(fach)) {
    return _.indexOf(array, fach) !== -1;
  }
  return _.indexOf(array, fach.kz) !== -1;
}
