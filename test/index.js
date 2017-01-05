// import abirechner from '../lib';
import * as consts from '../lib/constants';
import Studienplan from '../lib/studienplan';
import chai from 'chai';
chai.should();

describe('helper functions / consts', function () {
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
    consts.getP4s().should.eql(['de', 'en', 'fr', 'la', 'sn', 'sa', 'ku', 'mu', 'ek', 'ge', 'po', 'er', 'kr', 'ma', 'bi', 'ch', 'ph']);
    consts.getP5s().should.eql(['de', 'en', 'fr', 'la', 'sn', 'sa', 'ku', 'mu', 'ek', 'ge', 'po', 'er', 'kr', 'ma', 'bi', 'ch', 'ph', 'ek', 'er', 'kr']);
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
});

describe('studienplan', () => {
  it('studienplan should be created!', () => {
    let sp = new Studienplan();
    sp.p1.should.equal('');
  });
  it('step should be correctly determined!', () => {
    let sp = new Studienplan();
    sp.getStep().should.equal(1);

    sp.schwerpunkt = 'spr';
    sp.getStep().should.equal(2);

    sp.p1 = consts.faecher.de;
    sp.p2 = consts.faecher.bi;
    sp.p3 = consts.faecher.la;
    sp.getStep().should.equal(3);

    sp.p4 = consts.faecher.ma;
    sp.p5 = consts.faecher.ge;
    sp.getStep().should.equal(4);

    sp.addFach(consts.faecher.ds, 'b', {stunden11: 4, stunden12: 4}, 'gk');
    sp.getStep().should.equal(5);
  });

  it('has array fach should work', () => {
    let sp = new Studienplan();

    sp.addFach(consts.faecher.ds, 'b', {stunden11: 4, stunden12: 4}, 'gk');
    sp.getFach('ds').typ.should.equal('b');
    sp.hasArrayFach(['ds', 'bi']).should.equal(true);
  });
});
