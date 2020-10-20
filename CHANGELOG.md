## 2.0.0 (2020-10-20)

* **BREAKING:** Require at least Node 12.x
* **BREAKING:** Now returns `false` on no intersection rather than `null`
* **Improvements**: Expose TypeScript types
* **Improvements**: Fewer dependencies
* **Refactor:** Modernize code base
* **Refactor:** Validate types

## 1.0.0 (2017-11-07)

* **Bug fix:** `intersect('>=1.0.0 <7.0.0', '>2.0.0 <=8.2.0')` previously wrongly added an `&&` between upper and lower resolved version range, now returns `>2.0.0 <7.0.0`
* **Bug fix:** `intersect('6.0.0', '>=6.0.0')` previously returned a duplicated `6.0.0` in the version range, now currectly returns just `6.0.0`
* **Improvements**: Merged changes from [Concatapult/semver-set](https://github.com/Concatapult/semver-set), which removed lodash and added some tests
* **Dependencies**: Moved to newer version of `semver`
* **Code quality**: Moved to [semistandard](https://github.com/Flet/eslint-config-semistandard) ESLint linting
* **Code quality**: Added Mocha + Istanbul + Chai tests

## 0.1.1

* Last version before `@voxpelli/semver-set` fork
