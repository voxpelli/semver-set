import Comparator from 'semver/classes/comparator.js';
import Range from 'semver/classes/range.js';
import { rangeIntersection, sortRangeIntersection } from './lib/subset.js';

// @ts-ignore
const ANY = Comparator.ANY;

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
export function semverIntersect (rangeA, rangeB, { loose = false } = {}) {
  const a = new Range(rangeA, { loose });
  const b = new Range(rangeB, { loose });

  const intersection = rangeIntersection(a, b, { loose });

  if (!intersection || intersection.length === 0) return;

  sortRangeIntersection(intersection);

  return intersection.map(comparators => formatCompactedComparator(comparators)).join(' || ');
}

/**
 * @deprecated Use semverIntersect() instead
 * @param {...string} ranges
 * @returns {string|null}
 */
export function intersect (...ranges) {
  let currentIntersection = ranges.shift();

  for (const intersectionTarget of ranges) {
    if (currentIntersection === undefined) break;
    currentIntersection = semverIntersect(currentIntersection, intersectionTarget);
  }

  // Backwards compatibility
  // eslint-disable-next-line unicorn/no-null
  return currentIntersection || null;
}
