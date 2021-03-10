/* eslint-disable mocha/no-setup-in-describe */
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

/**
 * @param {string[]} ranges
 * @param {string} target
 */
const doTest = (ranges, target) => {
  it(`"${ranges.join('" and "')}"`, () => {
    throwIfNull(intersect(...ranges)).should.equal(target);
  });
};

/**
 * @param {string[]} ranges
 */
const doNegativeTest = (ranges) => {
  it(`"${ranges.join('" and "')}"`, () => {
    should.not.exist(intersect(...ranges));
  });
};

describe('intersect', () => {
  describe('should intersect', () => {
    doTest(['^1.1 || ^2.2 || >=5', '^2.2.0-alpha1'], '^2.2.0');

    doTest(['~2.2.4', '~2.2.5'], '~2.2.5');
    doTest(['^2.2.4', '~2.2.5'], '~2.2.5');

    doTest(['^2.2.4', '^2.3.5'], '^2.3.5');

    doTest(['>=6.0.0', '>=7.0.0'], '>=7.0.0');
    doTest(['>=7.0.0', '>=6.0.0'], '>=7.0.0');

    doTest(['>=6.0.0 <7.0.0', '>=6.0.0'], '^6.0.0');
    doTest(['6.x', '>=6.0.0'], '^6.0.0');
    doTest(['^6.1.0', '>=4.0.0'], '^6.1.0');
    doTest(['6.0.0', '>=6.0.0'], '6.0.0');

    doTest(['^6.1.0', '*'], '^6.1.0');
    doTest(['*', '>=4.0.0'], '>=4.0.0');

    doTest(['>=1.0.0 <7.0.0', '>2.0.0 <=8.2.0'], '>2.0.0 <7.0.0');
    doTest(['1.0.0 - 1.9.1', '1.2.0 - 2.5.0'], '>=1.2.0 <=1.9.1');

    doTest(['>=0.2.0 <0.5.3', '^0.4.8'], '^0.4.8');

    doTest(['>= 4.x <= 10.x', '>=6.0.0'], '>=6.0.0 <11.0.0-0');
    doTest(['>= 4.x <= 10.2.4-rc1', '>=6.0.0'], '>=6.0.0 <=10.2.4-rc1');
    doTest(['>= 4.x <= 10.2.4-rc1', '>=6.0.0-alpha1 <=10.2.4-rc2'], '>=6.0.0-alpha1 <=10.2.4-rc1');
  });

  describe('should not intersect', () => {
    doNegativeTest(['~2.2.4', '~2.3.0']);
    doNegativeTest(['>=6.0.0', '<6.0.0']);
    doNegativeTest(['^0.2.4', '^0.3.5']);
  });
});
