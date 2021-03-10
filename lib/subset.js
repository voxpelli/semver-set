/// <reference types="node" />

'use strict';

const Comparator = require('semver/classes/comparator');

const compare = require('semver/functions/compare');
const satisfies = require('semver/functions/satisfies');

// TODO: Add this to @types/semver
// @ts-ignore
const ANY = require('semver/classes/comparator').ANY;

// Somewhat based on https://github.com/npm/node-semver/blob/e08d9167937e09e8e6fe23aacaf17f892a1d69e1/ranges/subset.js

// >=1.2.3 is lower than >1.2.3
/**
 * @param {import('semver').Comparator|undefined} a
 * @param {import('semver').Comparator} b
 * @param {import('semver').Options} options
 * @returns {import('semver').Comparator}
 */
const higherGT = (a, b, options) => {
  if (!a) return b;

  const comp = compare(a.semver, b.semver, options);

  if (comp > 0) return a;
  if (comp < 0) return b;
  if (b.operator === '>' && a.operator === '>=') return b;

  return a;
};

// <=1.2.3 is higher than <1.2.3
/**
 * @param {import('semver').Comparator|undefined} a
 * @param {import('semver').Comparator} b
 * @param {import('semver').Options} options
 * @returns {import('semver').Comparator}
 */
const lowerLT = (a, b, options) => {
  if (!a) return b;

  const comp = compare(a.semver, b.semver, options);

  if (comp < 0) return a;
  if (comp > 0) return b;
  if (b.operator === '<' && a.operator === '<=') return b;

  return a;
};

/** @typedef {[import('semver').Comparator]} CompactedComparatorFixed */
/** @typedef {[import('semver').Comparator|undefined,import('semver').Comparator|undefined]} CompactedComparatorRange */
/** @typedef {CompactedComparatorFixed|CompactedComparatorRange} CompactedComparator */

/**
 * @param {ReadonlyArray<import('semver').Comparator|undefined>} comparators
 * @param {import('semver').Options} options
 * @returns {CompactedComparator|undefined}
 */
const compactComparators = (comparators, options) => {
  /** @type {import('semver').Comparator|undefined} */
  let gt;
  /** @type {import('semver').Comparator|undefined} */
  let lt;
  /** @type {Set<import('semver').SemVer>} */
  const eqSet = new Set();

  for (const c of comparators) {
    if (c === undefined) {
      continue;
    } else if (c.operator === '>' || c.operator === '>=') {
      gt = higherGT(gt, c, options);
    } else if (c.operator === '<' || c.operator === '<=') {
      lt = lowerLT(lt, c, options);
    } else if (c.semver !== ANY) {
      eqSet.add(c.semver);
    }
  }

  // As every value in a Set can only exists once: If we have multiple values in there, then we expect an AND relation between multiple fixed versions. That can never be fulfilled.
  if (eqSet.size > 1) return;

  /** @type {0|1|-1|undefined} */
  let gtltComp;

  // We can't have an AND relation between two ranges if they don't overlap
  if (gt && lt) {
    gtltComp = compare(gt.semver, lt.semver, options);
    if (gtltComp > 0) return;
    if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) return;
  }

  const eq = [...eqSet].shift();

  // If we only have ranges, ignoring th return those
  if (eq === undefined) return [gt, lt];

  // We can't have an AND relation between a range and a value if the two doesn't overlap
  if (gt && !satisfies(eq, String(gt), options)) return;
  if (lt && !satisfies(eq, String(lt), options)) return;

  // The equality value always wins when its there. And if no value is there: Then we opt for ANY
  return [new Comparator(String(eq || ''))];
};

/**
 * @param {ReadonlyArray<import('semver').Comparator|undefined>} compA
 * @param {ReadonlyArray<import('semver').Comparator|undefined>} compB
 * @param {import('semver').Options} options
 * @returns {CompactedComparator|false|undefined}
 */
const calculateSubset = (compA, compB, options) => {
  if (
    compA.length === 1 && compA[0] && compA[0].semver === ANY &&
    compB.length === 1 && compB[0] && compB[0].semver === ANY
  ) {
    return [compA[0]];
  }

  const compactedA = compactComparators(compA, options);
  const compactedB = compactComparators(compB, options);

  if (!compactedA || !compactedB) return;

  return compactComparators([...compactedA, ...compactedB], options) || false;
};

/**
 * @param {import('semver').Range} sub
 * @param {import('semver').Range} dom
 * @param {import('semver').Options} options
 * @returns {CompactedComparator[]|undefined}
 */
const rangeIntersection = (sub, dom, options) => {
  /** @type {Array<CompactedComparator|undefined>|undefined} */
  let subsets;

  for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const result = calculateSubset(simpleSub, simpleDom, options);

      if (!result === undefined) continue;

      subsets = subsets || [];

      if (!result) continue;

      /** @type {CompactedComparator|undefined} */
      let modifiedCompactedComparator;

      for (let i = 0, length = subsets.length; i < length; i++) {
        const subset = subsets[i];

        if (!subset) continue;

        const subsetWithSubset = compactComparators([...subset, ...result], options);

        if (!subsetWithSubset) continue;

        if (modifiedCompactedComparator) {
          subsets[i] = undefined;
          continue;
        }

        if (subsetWithSubset.length === 1 && result.length === 2) {
          subsets[i] = result;
        } else {
          if (subset[0] && (result[0] === undefined || higherGT(subset[0], result[0], options) === subset[0])) {
            subset[0] = result[0];
          }
          if (subset[1] && (result[1] === undefined || lowerLT(subset[1], result[1], options) === subset[1])) {
            subset[1] = result[1];
          }
        }

        modifiedCompactedComparator = subsets[i];
      }

      if (!modifiedCompactedComparator) {
        subsets.push(result);
      }
    }
  }

  if (!subsets) return;

  // @ts-ignore
  return subsets.filter(item => !!item);
};

/**
 * @param {CompactedComparator[]} intersection
 */
const sortRangeIntersection = (intersection) => {
  intersection.sort((a, b) => {
    if (a[0]) {
      if (!b[0]) return -1;
      return compare(a[0].semver, b[0].semver);
    }
    if (a[1]) {
      if (!b[1]) return -1;
      return compare(a[1].semver, b[1].semver);
    }
    if (b[0] || b[1]) return 1;
    return 0;
  });
};

module.exports = {
  rangeIntersection,
  sortRangeIntersection,
};
