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
  });

  it('getPossibleP5s should work', () => {
    let sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de' }, {}, true);

    sp.getPossibleP5().should.include.members(['ph', 'ch', 'kr']);
    sp.getPossibleP5().should.not.include.members(['ge', 'sp']);

    sp = new Studienplan('spr', { p1: 'en', p2: 'la', p3: 'de', p4: 'ma' }, {}, true);

    sp.getPossibleP5().should.not.include.members(['sn', 'sa', 'fr']); // do not include a faecher
    sp.getPossibleP5().should.include.members(['ge', 'po', 'ek']);
  });

  it('getKernfachCount should work', () => {
    let sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de' }, {}, true);
    sp.getKernFachCount().should.equal(2);

    sp = new Studienplan('spr', { p1: 'en', p2: 'la', p3: 'de', p4: 'ma' }, {}, true);
    sp.getKernFachCount().should.equal(3);
  });

  it('getFeldCount should work', () => {
    const sp = new Studienplan('gw', { p1: 'ge', p2: 'ma', p3: 'po', p4: 'de' }, {}, true);
    sp.getFeldCount().a.should.equal(1);
    sp.getFeldCount().b.should.equal(2);
    sp.getFeldCount().c.should.equal(1);
  });
});
