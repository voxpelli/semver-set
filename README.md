# @voxpelli/semver-set

Finds intersections between semantic version ranges.

Started out as a fork of the original [semver-set](https://github.com/izaakschroeder/semver-set), triggered by the lack of bug fixes in that project, but is now been rewritten from scratch to fix issue with missing license in original project.

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


### intersect(...ranges)  _(deprecated)_

The original [semver-set](https://github.com/izaakschroeder/semver-set) `intersect()` method is supported to ensure backwards compatibility

```javascript
import { intersect } from '@voxpelli/semver-set';

// ^2.2.0
intersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1');

// null
intersect('~2.2.4', '~2.3.0');
```
