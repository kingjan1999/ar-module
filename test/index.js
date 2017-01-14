// import abirechner from '../lib';
import chai from 'chai';
import * as consts from '../lib/constants';
import Studienplan from '../lib/studienplan';

const should = chai.should();

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
  it('studienplan should be created and serialized !', () => {
    const sp = new Studienplan('spr', { p1: 'de', p2: 'la', p3: 'ma', p4: 'ge', p5: 'ph' }, {
      de: {
        typ: 'p1',
        anforderung: 'lk',
        stunden: {
          stunden111: 4,
          stunden112: 4,
          stunden121: 4,
          stunden122: 4,
          alts: {},
        },
      },
    });
    sp.p1.should.equal('de');

    sp.serialize().should.equal('{"schwerpunkt":"spr","p1":"de","p2":"la","p3":"ma","p4":"ge","p5":"ph","fachstunden":{"de":{"typ":"p1","anforderung":"lk","stunden":{"stunden111":4,"stunden112":4,"stunden121":4,"stunden122":4,"alts":{}}}}}');

    const sp2 = new Studienplan('spr', { p1: 'de', p2: 'la', p3: 'ma', p4: 'ge', p5: 'ph' }, {}, true);
    sp2.getStunden('111').should.equal(20);
    sp2.getFach('ma').anforderung.should.equal('lk');
  });
  it('step should be correctly determined!', () => {
    const sp = new Studienplan();
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

    sp.addFach(consts.faecher.ds, 'b', {}, 'gk');
    sp.getStep().should.equal(5);
  });

  it('has array fach should work', () => {
    const sp = new Studienplan();

    sp.addFach(consts.faecher.ds, 'b', {}, 'gk');
    sp.getFach('ds').typ.should.equal('b');
    sp.getFach('ds').stunden.stunden111.should.equal(4);
    sp.hasArrayFach(['ds', 'bi']).should.equal(true);
  });

  it('appearances should be counted correctly', () => {
    const sp = new Studienplan();

    sp.addFach(consts.faecher.bi);
    sp.addFach(consts.faecher.ch);

    sp.countAppearance(['bi', 'ch', 'ph']).should.equal(2);
    sp.countAppearance(['de', 'ds', 'la']).should.equal(0);
  });

  it('getEF should work', () => {
    const sp = new Studienplan();

    sp.addFach(consts.faecher.la, 'ef');

    sp.getEF().should.equal('la');
  });

  it('getStunden / getStundenSchnitt should work', () => {
    const sp = new Studienplan();

    sp.addFach(consts.faecher.bi);
    sp.addFach(consts.faecher.ch);
    sp.addFach(consts.faecher.ge, 'p1', { stunden111: 4, stunden112: 4, stunden121: 2 }, 'lk');

    sp.getStunden('111').should.equal(12);
    sp.getStunden('112').should.equal(12);
    sp.getStunden('121').should.equal(10);
    sp.getStunden('122').should.equal(12);

    sp.getStundenSchnitt().should.equal(11.5);
  });

  it('removing should work', () => {
    const sp = new Studienplan();

    sp.addFach(consts.faecher.bi);
    sp.getFach('bi').typ.should.equal('b');

    sp.removeFach('bi');
    should.not.exist(sp.getFach('bi'));
  });

  it('getPossibleP1s should work', () => {
    const sp = new Studienplan('spr');
    sp.getPossibleP1().should.eql(['en', 'la', 'sn', 'fr']);
  });

  it('getPossibleP2s should work', () => {
    const sp = new Studienplan('nw', { p1: 'ph' });

    sp.getPossibleP2().should.eql(['bi', 'ch', 'ma']);
  });
});
