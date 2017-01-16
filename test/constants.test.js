// import abirechner from '../lib';
import chai from 'chai';
import * as consts from '../lib/constants';

chai.should();

describe('helper functions / consts', () => {
  it('faecher should be exported!', () => {
    consts.faecher.de.name.should.equal('Deutsch');
  });
  it('nametokz should work', () => {
    consts.nameToKZ('Deutsch').should.equal('de');
  });
  it('getLKnachSP should work', () => {
    consts.getLKnachSP('spr', 'p1').should.eql(['en', 'la', 'sn', 'fr']);
    consts.getLKnachSP('gw', 'p1').should.eql(['ge']);
    consts.getLKnachSP('nw', 'p3').should.eql(['de', 'en', 'fr', 'la', 'ku', 'mu', 'ge', 'po', 'ma', 'bi', 'ch', 'ph']);
  });
  it('getP4s and getP5s should work', () => {
    consts.getP4s().should.eql(['de', 'en', 'fr', 'la', 'sn', 'sa', 'ku', 'mu', 'ge', 'po', 'ma', 'bi', 'ch', 'ph']);
    consts.getP5s().should.eql(['de', 'en', 'fr', 'la', 'sn', 'sa', 'ku', 'mu', 'ge', 'po', 'ma', 'bi', 'ch', 'ph', 'ek', 'er', 'kr']);
  });
  it('getKFs should work', () => {
    consts.getKFs().should.eql(['en', 'la', 'sn', 'fr', 'ma', 'de']);
  });
  it('isX should work', () => {
    consts.isFremdsprache('la').should.equal(true);
    consts.isFremdsprache(consts.faecher.bi).should.equal(false);

    consts.isKernfach('de').should.equal(true);
    consts.isKernfach(consts.faecher.ds).should.equal(false);

    consts.isNW(consts.faecher.ch).should.equal(true);
    consts.isNW('fr').should.equal(false);
  });
  it('getForFeld should work', () => {
    consts.getForFeld('a').forEach((val) => {
      val.feld.should.equal('a');
    });
  });
  it('parseBelegungAlts should work', () => {
    let belegung = consts.parseBelegungAlts('4x4');
    belegung.stunden111.should.equal(4);

    belegung = consts.parseBelegungAlts('4x4|2x2x11|af');
    belegung.stunden121.should.equal(4);
    belegung.alts[0].stunden111.should.equal(2);
    belegung.alts[0].stunden121.should.equal(0);
    belegung.alts[1].stunden111.should.equal(4);

    belegung = consts.parseBelegungAlts('2x4x11|2x2x12|2x4x12|2x4x11|4x2');
    belegung.stunden111.should.equal(4);
    belegung.alts[0].stunden121.should.equal(2);
    belegung.alts[1].stunden121.should.equal(4);
    belegung.alts[2].stunden111.should.equal(4);
    belegung.alts[3].stunden111.should.equal(2);
  });
});
