## 3.0.0-0 (2020-03-10)

* **REWRITE**: Completely rewritten from scratch to fix license, now licensed as MIT
* **Bug fix:** `^10.17.0 || >=12.0.0` and `>=8.0.0` now properly calculates
* **Improvements**: Generate declaration map for TypeScript types

## 2.0.1 (2020-10-23)

* **Fix**: Fixed GitHub package publishing

## 2.0.0 (2020-10-20)

* **BREAKING:** Require at least Node 12.x
* **BREAKING:** Now returns `false` on no intersection rather than `null`
* **SEMI-BREAKING**: Updated to latest `semver`, can change some output
* **Improvements**: Expose TypeScript types
* **Improvements**: Replaced two unmaintained dependencies with in project code
* **Refactor:** Modernize code base, target Node 12
* **Refactor:** Add and validate JSDoc types

## 1.0.0 (2017-11-07)

* **Bug fix:** `intersect('>=1.0.0 <7.0.0', '>2.0.0 <=8.2.0')` previously wrongly added an `&&` between upper and lower resolved version range, now returns `>2.0.0 <7.0.0`
* **Bug fix:** `intersect('6.0.0', '>=6.0.0')` previously returned a duplicated `6.0.0` in the version range, now currectly returns just `6.0.0`
* **Improvements**: Merged changes from [Concatapult/semver-set](https://github.com/Concatapult/semver-set), which removed lodash and added some tests
* **Dependencies**: Moved to newer version of `semver`
* **Code quality**: Moved to [semistandard](https://github.com/Flet/eslint-config-semistandard) ESLint linting
* **Code quality**: Added Mocha + Istanbul + Chai tests

## 0.1.1

* Last version before `@voxpelli/semver-set` fork
