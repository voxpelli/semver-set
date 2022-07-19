# @voxpelli/semver-set

Finds intersections between semantic version ranges.

[![npm version](https://img.shields.io/npm/v/@voxpelli/semver-set.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/semver-set)
[![npm downloads](https://img.shields.io/npm/dm/@voxpelli/semver-set.svg?style=flat)](https://www.npmjs.com/package/@voxpelli/semver-set)
[![ES Module Ready Badge](https://img.shields.io/badge/es%20module%20ready-yes-success.svg)](https://esmodules.dev/)
[![Types in JS](https://img.shields.io/badge/types_in_js-yes-brightgreen)](https://github.com/voxpelli/types-in-js)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/voxpelli/eslint-config)
[![Follow @voxpelli](https://img.shields.io/twitter/follow/voxpelli?style=social)](https://twitter.com/voxpelli)

Started out as a fork of [izaakschroeder/semver-setsemver-set](https://github.com/izaakschroeder/semver-set), triggered by the lack of bug fixes in that project, but has now been rewritten from scratch to fix issue with missing license in original project.

## Usage

### semverIntersect(firstRange, secondRange, [{ loose: false }])

Supports the [semver `loose`](https://github.com/npm/node-semver#functions) option in an optional third argument.

```javascript
import { semverIntersect } from '@voxpelli/semver-set';

// ^2.2.0
semverIntersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1');

// undefined
semverIntersect('~2.2.4', '~2.3.0');
```


### ~~intersect(...ranges)~~  _(deprecated)_

The original [semver-set](https://github.com/izaakschroeder/semver-set) `intersect()` method is supported to ensure backwards compatibility

```javascript
import { intersect } from '@voxpelli/semver-set';

// ^2.2.0
intersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1');

// null
intersect('~2.2.4', '~2.3.0');
```
