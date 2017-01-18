/**
 * Created by jan on 05.01.17.
 */
import _ from 'lodash';
import fp from 'lodash/fp';

// General vars

export const fremdsprachen = ['en', 'la', 'sn', 'fr']; // FIXME sa?
export const naturwissenschaften = ['ph', 'bi', 'ch'];

const e4g4 = { e4: true, g4: true, g2: false };
const g4 = { e4: false, g4: true, g2: false };
const g4g2 = { e4: false, g4: true, g2: true };
const g2 = { e4: false, g4: false, g2: true };
const e4g2 = { e4: true, g4: false, g2: true };
const e4g4g2 = { e4: true, g4: true, g2: true };

export const defaultBelegung = {
  stunden111: 4,
  stunden112: 4,
  stunden121: 4,
  stunden122: 4,
  alts: [],
};

const schwerpunkteP = {
  gw: {
    name: 'Gesellschaftswissenschenschaften',
    p1: 'ge',
    p2: fremdsprachen.concat('de').concat('ma').concat(naturwissenschaften),
    p3: 'po',
  },
  spr: {
    name: 'Sprachlich',
    p1: fremdsprachen,
    p2: fremdsprachen.concat('de'),
    p3: '*',

  },
  mk: {
    name: 'Musisch-Künstlerisch',
    p1: ['ku', 'mu'],
    p2: ['de', 'ma'],
    p3: '*',

  },
  nw: {
    name: 'Naturwissenschaftlich',
    p1: naturwissenschaften,
    p2: naturwissenschaften.concat('ma'),
    p3: '*',
  },
};

export const faecher = {
  de: { kz: 'de', name: 'Deutsch', feld: 'a', stunden: e4g4 },
  en: { kz: 'en', name: 'Englisch', feld: 'a', stunden: e4g4 },
  fr: { kz: 'fr', name: 'Französisch', feld: 'a', stunden: e4g4 },
  la: { kz: 'la', name: 'Latein', feld: 'a', stunden: e4g4 },
  sn: { kz: 'sn', name: 'Spanisch (7)', feld: 'a', stunden: g4 },
  sa: { kz: 'sa', name: 'Spanisch (10)', feld: 'a', stunden: g4 },
  ds: { kz: 'ds', name: 'Darstellendes Spiel', feld: 'a', stunden: g4g2 },
  ku: { kz: 'ku', name: 'Kunst', feld: 'a', stunden: e4g2 },
  mu: { kz: 'mu', name: 'Musik', feld: 'a', stunden: e4g2 },
  ek: { kz: 'ek', name: 'Erdkunde', feld: 'b', stunden: g4 },
  ge: { kz: 'ge', name: 'Geschichte', feld: 'b', stunden: e4g4g2 },
  po: { kz: 'po', name: 'Politik-Wirtschaft', feld: 'b', stunden: e4g4g2 },
  er: { kz: 'er', name: 'Ev. Religion', feld: 'b', stunden: g4g2 },
  kr: { kz: 'kr', name: 'Kath. Religion', feld: 'b', stunden: g4 },
  wn: { kz: 'wn', name: 'Werte und Normen', feld: 'b', stunden: g4g2 },
  ma: { kz: 'ma', name: 'Mathematik', feld: 'c', stunden: e4g4 },
  bi: { kz: 'bi', name: 'Biologie', feld: 'c', stunden: e4g4 },
  ch: { kz: 'ch', name: 'Chemie', feld: 'c', stunden: e4g4 },
  ph: { kz: 'ph', name: 'Physik', feld: 'c', stunden: e4g4 },
  if: { kz: 'if', name: 'Informatik', feld: 'c', stunden: g4g2 },
  sf: { kz: 'sf', name: 'Seminarfach', feld: '', stunden: g4g2 },
  sp: { kz: 'sp', name: 'Sport', feld: '', stunden: g2 },
  // '': {'kz': '', name: 'Dummy', feld: '', stunden: g2} // Dummy Objekt
};

const keinP = ['ds', 'wn', 'if', 'sf', 'sp'];
const nurp5 = ['ek', 'er', 'kr'];

const filterPs = fp.flow(
  fp.filter(fach => !keinP.includes(fach.kz)),
  fp.filter(fach => !nurp5.includes(fach.kz)),
  fp.map(fach => fach.kz),
);

/**
 * Get possible faecher by schwerpunkt and type (p1, p2, p3)
 * @param {string} schwerpunkt Schwerpunkt, der gewählt wurde
 * @param {string} pfach P1 / P2 / P3
 * @returns {Array.<string>} array withpossible faechers (determined by their kzs)
 */
export function getLKnachSP(schwerpunkt, pfach) {
  let vfaecher = schwerpunkteP[schwerpunkt][pfach];
  if (vfaecher === '*') {
    vfaecher = fp.flow(
      fp.filter(fach => fach.stunden.e4 === true),
      filterPs,
    )(faecher);
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
  return _.find(faecher, { name }).kz;
}

/**
 * Gets faecher only available as P4
 * @returns {Array.<string>} array containing kz's of all faechers
 */
export function getP4s() {
  return filterPs(faecher);
}

/**
 * Gets faecher only available as P5
 * @returns {Array.<string>} array containing kz's of all faechers
 */
export function getP5s() {
  return getP4s().concat(nurp5);
}

/**
 * Get KF's (Kernfächer)
 * @returns {Array.<string>}
 */
export function getKFs() {
  return fremdsprachen.concat(['ma', 'de']);
}

function isX(fach, array) {
  if (_.isString(fach)) {
    return array.includes(fach);
  }
  return array.includes(fach.kz);
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

/**
 * Get all faecher for a certain feld
 * @param feld Feld, a / b / c
 */
export function getForFeld(feld) {
  return _.filter(faecher, { feld });
}

function parseBelegung(belegung) {
  switch (belegung) {
    case '4x4': {
      return {
        stunden111: 4,
        stunden112: 4,
        stunden121: 4,
        stunden122: 4,
      };
    }
    case '2x2x11': {
      return {
        stunden111: 2,
        stunden112: 2,
        stunden121: 0,
        stunden122: 0,
      };
    }
    case '2x4x11': {
      return {
        stunden111: 4,
        stunden112: 4,
        stunden121: 0,
        stunden122: 0,
      };
    }
    case '2x4x12': {
      return {
        stunden111: 0,
        stunden112: 0,
        stunden121: 4,
        stunden122: 4,
      };
    }
    case '2x2x12': {
      return {
        stunden111: 0,
        stunden112: 0,
        stunden121: 2,
        stunden122: 2,
      };
    }
    case '4x2': {
      return {
        stunden111: 2,
        stunden112: 2,
        stunden121: 2,
        stunden122: 2,
      };
    }
    default: {
      return defaultBelegung;
    }
  }
}

export function parseBelegungAlts(belegungStr) {
  if (!belegungStr.includes('|')) {
    const belegung = parseBelegung(belegungStr);
    belegung.alts = [];
    return belegung;
  }
  const alts = belegungStr.split('|');
  const altsArr = [];
  alts.forEach((value) => {
    altsArr.push(parseBelegung(value));
  });
  const belegung = altsArr[0];
  altsArr.splice(0, 1);
  belegung.alts = altsArr;

  return belegung;
}
