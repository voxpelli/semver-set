# @voxpelli/semver-set

Set operations for semver.

This is a fork of the original [semver-set](https://github.com/izaakschroeder/semver-set), triggered by the lack of bug fixes in that project.

## Install

```bash
npm install -g @voxpelli/semver-set
```

## Usage

### intersect

Find the intersection of multiple semver ranges. This can be useful for finding a "lowest common denominator" of versions.

```javascript
import { intersect } from 'semver-set';

// ^2.2.0
intersect('^1.1 || ^2.2 || >=5', '^2.2.0-alpha1');

// null
intersect('~2.2.4', '~2.3.0');
```
