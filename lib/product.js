/// <reference types="node" />

'use strict';

/**
 * @template T
 * @param {T[][]} elements
 * @returns {T[][]}
 */
const product = (elements) => {
  if (!Array.isArray(elements)) {
    throw new TypeError('Expected an array input');
  }

  const end = elements.length - 1;
  /** @type {T[][]} */
  const result = [];

  /**
   * @template T
   * @param {T[]} curr
   * @param {number} start
   */
  const addTo = (curr, start) => {
    const first = elements[start] || [];
    const last = (start === end);

    for (const item of first) {
      const copy = [...curr];
      copy.push(item);

      if (last) {
        result.push(copy);
      } else {
        addTo(copy, start + 1);
      }
    }
  };

  if (elements.length) {
    addTo([], 0);
  } else {
    result.push([]);
  }

  return result;
};

module.exports = product;
