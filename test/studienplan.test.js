/**
 * Created by jan on 15.01.17.
 */
import chai from 'chai';
import * as consts from '../lib/constants';
import Studienplan from '../lib/studienplan';

const should = chai.should();

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

  it('hasFach should work', () => {
    const sp = new Studienplan();
    sp.addFach(consts.faecher.ds, 'b', {}, 'gk');

    sp.hasFach('de').should.equal(false);
    sp.hasFach('ds').should.equal(true);
  });

  it('appearances should be counted correctly', () => {
    const sp = new Studienplan('spr', { p1: 'la' }, {}, true);

    sp.addFach(consts.faecher.bi);
    sp.addFach(consts.faecher.ch);

    sp.countAppearance(['bi', 'ch', 'ph']).should.equal(2);
    sp.countAppearance(['de', 'ds', 'la']).should.equal(1);
    sp.countAppearance(['de', 'ds', 'fr']).should.equal(0);
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

  it('getPossibleP3s should work', () => {
    const sp = new Studienplan('gw', { p1: 'ge', p2: 'ma' });

    sp.getPossibleP3().should.eql(['po']);
  });

  it('getPossibleP4s should work', () => {
    let sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po' }, {}, true);

    sp.getPossibleP4().length.should.equal(11);

    sp = new Studienplan('spr', { p1: 'en', p2: 'la', p3: 'de' });
    sp.getPossibleP4().should.not.include.members(['sn', 'sa', 'fr']); // do not include a faecher

    sp = new Studienplan('gw', { p1: 'ge', p2: 'ek', p3: 'po' }, {}, true); // unrealistic
    sp.getPossibleP4().should.include.members(['de', 'la', 'fr']);
    sp.getPossibleP4().should.not.include.members(['er', 'kr', 'ek']);
    sp.getPossibleP4().forEach((val) => {
      consts.faecher[val].feld.should.not.equal('b');
    });

    sp = new Studienplan('spr', { p1: 'la', p2: 'de', p3: 'en' }, {}, true); // unrealistic
    sp.getPossibleP4().forEach((val) => {
      consts.faecher[val].feld.should.not.equal('a');
    });

    sp = new Studienplan('spr', { p1: 'la', p2: 'fr', p3: 'en' }, {}, true); // unrealistic
    sp.getPossibleP4().forEach((val) => {
      consts.faecher[val].feld.should.not.equal('a');
    });
    sp.getPossibleP4().should.eql(['ma']);
  });

  it('getPossibleP5s should work', () => {
    let sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de' }, {}, true);

    sp.getPossibleP5().should.include.members(['ph', 'ch', 'kr']);
    sp.getPossibleP5().should.not.include.members(['ge', 'sp']);

    sp = new Studienplan('spr', { p1: 'en', p2: 'la', p3: 'de', p4: 'ma' }, {}, true);

    sp.getPossibleP5().should.not.include.members(['sn', 'sa', 'fr']); // do not include a faecher
    sp.getPossibleP5().should.include.members(['ge', 'po', 'ek']);

    sp = new Studienplan('spr', { p1: 'en', p2: 'la', p3: 'ge', p4: 'ph' }, {}, true);
    sp.getPossibleP5().should.eql(['de', 'ma']);

    sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'ek' }, {}, true); // unrealistic
    sp.getPossibleP5().should.include.members(['de', 'la', 'fr']);

    sp = new Studienplan('gw', { p1: 'ge', p2: 'la', p3: 'po', p4: 'de' }, {}, true);
    sp.getPossibleP5().should.include.members(['ma', 'ph', 'ch']);
  });

  it('getKernfachCount should work', () => {
    let sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de' }, {}, true);
    sp.getKernFachCount().should.equal(2);

    sp = new Studienplan('spr', { p1: 'en', p2: 'la', p3: 'de', p4: 'ma' }, {}, true);
    sp.getKernFachCount().should.equal(3);
  });

  it('getFeldCount should work', () => {
    const sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de' }, {}, true);
    sp.addFach(consts.faecher.sp, 'b', consts.parseBelegungAlts('4x2'));

    sp.getFeldCount().a.should.equal(1);
    sp.getFeldCount().b.should.equal(2);
    sp.getFeldCount().c.should.equal(1);
  });

  it('getPossibleEF should work', () => {
    let sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de', p5: 'ph' }, {}, true);
    sp.getPossibleEF().faecher.should.eql(['en', 'la', 'sn', 'fr', 'bi', 'ch']);
    sp.getPossibleEF().belegung.stunden111.should.equal(4);
    sp.getPossibleEF().belegung.alts[0].stunden121.should.equal(4);

    sp = new Studienplan('spr', { p1: 'la', p2: 'de', p3: 'ge', p4: 'ma', p5: 'er' }, {}, true);
    sp.getPossibleEF().faecher.should.eql(['en', 'sn', 'fr']);
    sp = new Studienplan('spr', { p1: 'la', p2: 'en', p3: 'ge', p4: 'ma', p5: 'er' }, {}, true);
    should.not.exist(sp.getPossibleEF().faecher);

    sp = new Studienplan('nw', { p1: 'ph', p2: 'ma', p3: 'ge', p4: 'de', p5: 'po' }, {}, true);
    sp.getPossibleEF().faecher.should.eql(['bi', 'ch']);
    sp = new Studienplan('nw', { p1: 'ph', p2: 'ma', p3: 'ge', p4: 'de', p5: 'bi' }, {}, true);
    should.not.exist(sp.getPossibleEF().faecher);

    sp = new Studienplan('mk', { p1: 'mu', p2: 'ma', p3: 'po', p4: 'de', p5: 'ph' }, {}, true);
    sp.getPossibleEF().faecher.should.eql(['ku', 'ds']);
    sp = new Studienplan('mk', { p1: 'ku', p2: 'ma', p3: 'po', p4: 'de', p5: 'ph' }, {}, true);
    sp.getPossibleEF().faecher.should.eql(['mu']);

    sp = new Studienplan('unbekannt');
    should.not.exist(sp.getPossibleEF().faecher);
  });

  it('addDefaults should work', () => {
    const sp = new Studienplan();

    sp.addDefaultFaecher();
    sp.hasFach('sp').should.equal(true);
    sp.fachstunden.sp.stunden.stunden111.should.equal(2);

    sp.hasFach('la').should.equal(false);
  });
});
