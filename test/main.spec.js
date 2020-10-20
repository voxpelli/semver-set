'use strict';

const chai = require('chai');

const should = chai.should();

const intersect = require('../lib/intersect');

describe('intersect', () => {
  it('basic usage', () => {
    intersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1').should.equal('^2.2.0');

    should.not.exist(intersect('~2.2.4', '~2.3.0'));
    intersect('~2.2.4', '~2.2.5').should.equal('~2.2.5');
    intersect('^2.2.4', '~2.2.5').should.equal('~2.2.5');

    intersect('^2.2.4', '^2.3.5').should.equal('^2.3.5');

    intersect('>=6.0.0', '>=7.0.0').should.equal('>=7.0.0');
    intersect('>=7.0.0', '>=6.0.0').should.equal('>=7.0.0');
    should.not.exist(intersect('>=6.0.0', '<6.0.0'));

    intersect('>=6.0.0 <7.0.0', '>=6.0.0').should.equal('^6.0.0');
    intersect('6.x', '>=6.0.0').should.equal('^6.0.0');
    intersect('^6.1.0', '>=4.0.0').should.equal('^6.1.0');
    intersect('6.0.0', '>=6.0.0').should.equal('6.0.0');

    intersect('^6.1.0', '*').should.equal('^6.1.0');
    intersect('*', '>=4.0.0').should.equal('>=4.0.0');

    intersect('>=1.0.0 <7.0.0', '>2.0.0 <=8.2.0').should.equal('>2.0.0 <7.0.0');
    intersect('1.0.0 - 1.9.1', '1.2.0 - 2.5.0').should.equal('>=1.2.0 <=1.9.1');

    should.not.exist(intersect('^0.2.4', '^0.3.5'));
    intersect('>=0.2.0 <0.5.3', '^0.4.8').should.equal('^0.4.8');

    intersect('>= 4.x <= 10.x', '>=6.0.0').should.equal('>=6.0.0 <11.0.0');
    intersect('>= 4.x <= 10.2.4-rc1', '>=6.0.0').should.equal('>=6.0.0 <=10.2.4-rc1');
    intersect('>= 4.x <= 10.2.4-rc1', '>=6.0.0-alpha1 <=10.2.4-rc2').should.equal('>=6.0.0-alpha1 <=10.2.4-rc1');
  });
});
