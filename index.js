/// <reference types="node" />

'use strict';

const semverCompare = require('semver/functions/compare');
const Range = require('semver/classes/range');
// @ts-ignore */
const ANY = require('semver/classes/comparator').ANY;

const product = require('./lib/product');

/** @typedef {import('./lib/advanced-types').Comparator} Comparator */
/** @typedef {import('./lib/advanced-types').SemVer} SemVer */
/** @typedef {[Comparator, Comparator]} ComparatorSet */

/** @type {import('./lib/advanced-types').isComparator} */
const isComparator = (value) => typeof value.test === 'function';

/** @type {Comparator} */
const lowest = { semver: -Infinity, operator: '>' };
/** @type {Comparator} */
const highest = { semver: Infinity, operator: '<' };

/**
 * @param {string} a
 * @param {string} b
 * @returns {1|0|-1}
 */
const cmp = (a, b) => {
  if (a === '<' && b === '<=') {
    return -1;
  } else if (a === '<=' && b === '<') {
    return 1;
  } else if (a === '>' && b === '>=') {
    return 1;
  } else if (a === '>=' && b === '>') {
    return -1;
  } else {
    return 0;
  }
};

/**
 * @param {SemVer} a
 * @param {SemVer} b
 * @returns {1|0|-1}
 */
const icmp = (a, b) => {
  if (a === Infinity) {
    return 1;
  } else if (b === Infinity) {
    return -1;
  } else if (a === -Infinity) {
    return -1;
  } else if (b === -Infinity) {
    return 1;
  } else {
    return 0;
  }
};

/**
 * @param {Comparator} a
 * @param {Comparator} b
 * @returns {1|0|-1}
 */
const rcmp = (a, b) => {
  return icmp(a.semver, b.semver) ||
    (isComparator(a) && isComparator(b) && semverCompare(a.semver, b.semver)) ||
    cmp(a.operator, b.operator);
};

/**
 * @param {Comparator} a
 * @param {Comparator} b
 * @returns {Comparator}
 */
const min = (a, b) => rcmp(a, b) < 0 ? a : b;
/**
 * @param {Comparator} a
 * @param {Comparator} b
 * @returns {Comparator}
 */
const max = (a, b) => rcmp(a, b) > 0 ? a : b;

/**
 * @param {Comparator} entry
 * @returns {boolean}
 */
const isHi = (entry) => /^<?=?$/.test(entry.operator);
/**
 * @param {Comparator} entry
 * @returns {boolean}
 */
const isLo = (entry) => /^>?=?$/.test(entry.operator);

/**
 * @param {ComparatorSet} set
 * @param {Comparator} a
 * @returns {ComparatorSet}
 */
const combine = ([lo, hi], a) => {
  if (!isLo(lo)) throw new Error('lo entry must be a lower bound');
  if (!isHi(hi)) throw new Error('hi entry must be an upper bound');

  if (isHi(a) && a.semver !== ANY) {
    hi = min(a, hi);
  }

  if (isLo(a) && a.semver !== ANY) {
    lo = max(a, lo);
  }

  return [lo, hi];
};

/**
 * @param {...string} ranges
 * @returns {string|null}
 */
const intersect = (...ranges) => {
  // item.set is an array of disjunctions – we can match any of the entries
  // this means we must take the cartesian product of all the disjunctions,
  // intersect them with each other, and take the disjunction of the result
  // naturally any empty results can simply be omitted.

  /** @type {(readonly Comparator[])[][]} */
  const rangeSets = [];

  for (const range of ranges) {
    const rangeInstance = new Range(range);
    const foo = [...rangeInstance.set];
    rangeSets.push(foo);
  }

  /** @type {ComparatorSet[]} */
  const lohiSets = [];

  for (const values of product(rangeSets)) {
    /** @type {ComparatorSet} */
    let set = [lowest, highest];

    for (const a of values.flat()) {
      set = combine(set, a);
    }

    const [lo, hi] = set;

    if (hi === highest || lo === lowest) {
      lohiSets.push(set);
    }

    if (isComparator(lo) && isComparator(hi) && lo.test(hi.semver) && hi.test(lo.semver)) {
      lohiSets.push(set);
    }
  }

  /** @type {string[]} */
  const finalResult = [];

  for (const [lo, hi] of lohiSets) {
    if (lo.operator === '>=' && hi.operator === '<' && isComparator(lo) && isComparator(hi)) {
      if (lo.semver.major + 1 === hi.semver.major && /\.0\.0(-0)?$/.test(hi.semver.raw)) {
        finalResult.push('^' + lo.semver.raw);
        break;
      } else if (lo.semver.major === hi.semver.major && /\.0(-0)?$/.test(hi.semver.raw)) {
        // Anything in the 0.x.x line behaves like ~ even for the ^ operator.
        const operator = (lo.semver.major === 0 ? '^' : '~');
        finalResult.push(operator + lo.semver.raw);
        break;
      }
    }
    const result = [];
    if (isComparator(lo)) result.push(lo.operator + lo.semver.raw);
    if (isComparator(hi)) {
      const range = hi.operator + hi.semver.raw;
      if (!result[0] || result[0] !== range) { result.push(range); }
    }
    finalResult.push(result.join(' '));
  }

  if (finalResult.length === 0) {
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  return finalResult.join(' || ');
};

module.exports = { intersect };
