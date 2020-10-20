/// <reference types="node" />
/// <reference types="mocha" />
/// <reference types="chai" />

'use strict';

const chai = require('chai');

const should = chai.should();

const { intersect } = require('..');

/**
 * @template T
 * @param {T|null} value
 * @returns {T}
 */
const throwIfNull = (value) => {
  if (value === null) throw new Error('Should not be null');
  return value;
};

describe('intersect', () => {
  it('basic usage', () => {
    throwIfNull(intersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1')).should.equal('^2.2.0');

    should.not.exist(intersect('~2.2.4', '~2.3.0'));
    throwIfNull(intersect('~2.2.4', '~2.2.5')).should.equal('~2.2.5');
    throwIfNull(intersect('^2.2.4', '~2.2.5')).should.equal('~2.2.5');

    throwIfNull(intersect('^2.2.4', '^2.3.5')).should.equal('^2.3.5');

    throwIfNull(intersect('>=6.0.0', '>=7.0.0')).should.equal('>=7.0.0');
    throwIfNull(intersect('>=7.0.0', '>=6.0.0')).should.equal('>=7.0.0');
    should.not.exist(intersect('>=6.0.0', '<6.0.0'));

    throwIfNull(intersect('>=6.0.0 <7.0.0', '>=6.0.0')).should.equal('^6.0.0');
    throwIfNull(intersect('6.x', '>=6.0.0')).should.equal('^6.0.0');
    throwIfNull(intersect('^6.1.0', '>=4.0.0')).should.equal('^6.1.0');
    throwIfNull(intersect('6.0.0', '>=6.0.0')).should.equal('6.0.0');

    throwIfNull(intersect('^6.1.0', '*')).should.equal('^6.1.0');
    throwIfNull(intersect('*', '>=4.0.0')).should.equal('>=4.0.0');

    throwIfNull(intersect('>=1.0.0 <7.0.0', '>2.0.0 <=8.2.0')).should.equal('>2.0.0 <7.0.0');
    throwIfNull(intersect('1.0.0 - 1.9.1', '1.2.0 - 2.5.0')).should.equal('>=1.2.0 <=1.9.1');

    should.not.exist(intersect('^0.2.4', '^0.3.5'));
    throwIfNull(intersect('>=0.2.0 <0.5.3', '^0.4.8')).should.equal('^0.4.8');

    throwIfNull(intersect('>= 4.x <= 10.x', '>=6.0.0')).should.equal('>=6.0.0 <11.0.0-0');
    throwIfNull(intersect('>= 4.x <= 10.2.4-rc1', '>=6.0.0')).should.equal('>=6.0.0 <=10.2.4-rc1');
    throwIfNull(intersect('>= 4.x <= 10.2.4-rc1', '>=6.0.0-alpha1 <=10.2.4-rc2')).should.equal('>=6.0.0-alpha1 <=10.2.4-rc1');
  });
});
