/// <reference types="node" />

'use strict';

const Range = require('semver/classes/range');

// @ts-ignore
const ANY = require('semver/classes/comparator').ANY;

const { rangeIntersection, sortRangeIntersection } = require('./lib/subset');

/**
 * @param {import('./lib/subset').CompactedComparator} comparators
 * @returns {string}
 */
const formatCompactedComparator = (comparators) => {
  if (comparators.length === 1) {
    return comparators[0].semver === ANY ? '*' : String(comparators[0]);
  }

  const [gt, lt] = comparators;

  if (!gt || !lt) return String(gt || lt);

  const ltSemverString = String(lt.semver);

  if (gt.semver.major + 1 === lt.semver.major) {
    if (ltSemverString.endsWith('.0.0-0') || ltSemverString.endsWith('.0.0')) {
      return '^' + gt.semver;
    }
  } else if (gt.semver.major === lt.semver.major && gt.semver.minor + 1 === lt.semver.minor) {
    // eslint-disable-next-line unicorn/no-lonely-if
    if (ltSemverString.endsWith('.0-0') || ltSemverString.endsWith('.0')) {
      return (gt.semver.major === 0 ? '^' : '~') + gt.semver;
    }
  }

  return gt + ' ' + lt;
};

/**
 * @param {string} rangeA
 * @param {string} rangeB
 * @param {{ loose?: boolean }} [options]
 * @returns {string|undefined}
 */
const semverIntersect = (rangeA, rangeB, { loose } = {}) => {
  const a = new Range(rangeA, { loose });
  const b = new Range(rangeB, { loose });

  const intersection = rangeIntersection(a, b, { loose });

  if (!intersection || intersection.length === 0) return;

  sortRangeIntersection(intersection);

  return intersection.map(comparators => formatCompactedComparator(comparators)).join(' || ');
};

/**
 * @deprecated Use semverIntersect() instead
 * @param {...string} ranges
 * @returns {string|null}
 */
const intersect = (...ranges) => {
  let currentIntersection = ranges.shift();

  for (const intersectionTarget of ranges) {
    if (currentIntersection === undefined) break;
    currentIntersection = semverIntersect(currentIntersection, intersectionTarget);
  }

  // Backwards compatibility
  // eslint-disable-next-line unicorn/no-null
  return currentIntersection || null;
};

module.exports = {
  intersect,
  semverIntersect,
};
