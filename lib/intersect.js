'use strict';

const semver = require('semver');
const product = require('cartesian-product');
const invariant = require('invariant');

const lowest = { semver: -Infinity, operator: '>' };
const highest = { semver: Infinity, operator: '<' };

const pluck = (array, prop) => array.map(obj => obj[prop]);
const flatten = (array) => array.reduce((a, b) => [...a, ...b], []);

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

const rcmp = (a, b) => {
  return icmp(a.semver, b.semver) ||
    semver.compare(a.semver, b.semver) ||
    cmp(a.operator, b.operator);
};

const min = (a, b) => rcmp(a, b) < 0 ? a : b;
const max = (a, b) => rcmp(a, b) > 0 ? a : b;

const isHi = (entry) => /^<?=?$/.test(entry.operator);
const isLo = (entry) => /^>?=?$/.test(entry.operator);

const combine = ([lo, hi], a) => {
  invariant(isLo(lo), 'lo entry must be a lower bound');
  invariant(isHi(hi), 'hi entry must be an upper bound');

  if (isHi(a)) {
    hi = min(a, hi);
  }

  if (isLo(a)) {
    lo = max(a, lo);
  }

  return [lo, hi];
};

const intersect = (...rawRanges) => {
  let ranges = rawRanges.map(range => semver.Range(range));
  // item.set is an array of disjunctions – we can match any of the entries
  // this means we must take the cartesian product of all the disjunctions,
  // intersect them with each other, and take the disjunction of the result
  // naturally any empty results can simply be omitted.

  ranges = product(pluck(ranges, 'set'))
    .map(values => flatten(values).reduce((set, a) => combine(set, a), [lowest, highest]))
    .filter(([lo, hi]) => hi === highest || lo === lowest || (lo.test(hi.semver) && hi.test(lo.semver)));

  ranges = ranges.map(([lo, hi]) => {
    if (lo.operator === '>=' && hi.operator === '<') {
      if (lo.semver.major + 1 === hi.semver.major && /\.0\.0$/.test(hi.semver.raw)) {
        return '^' + lo.semver.raw;
      } else if (lo.semver.major === hi.semver.major && /\.0$/.test(hi.semver.raw)) {
        // Anything in the 0.x.x line behaves like ~ even for the ^ operator.
        if (lo.semver.major === 0) {
          return '^' + lo.semver.raw;
        } else {
          return '~' + lo.semver.raw;
        }
      }
    }
    const result = [];
    if (lo.semver.raw) { result.push(lo.operator + lo.semver.raw); }
    if (hi.semver.raw) {
      const range = hi.operator + hi.semver.raw;
      if (!result[0] || result[0] !== range) { result.push(range); }
    }
    return result.join(' ');
  });

  if (ranges.length === 0) {
    // Because of backwards compatibility
    // eslint-disable-next-line unicorn/no-null
    return null;
  }

  return ranges.join(' || ');
};

module.exports = intersect;
