# Changelog

## [0.7.0](https://github.com/pkgjs/parseargs/compare/v0.6.0...v0.7.0) (2022-04-13)


### Features

* Add strict mode to parser ([#74](https://github.com/pkgjs/parseargs/issues/74)) ([8267d02](https://github.com/pkgjs/parseargs/commit/8267d02083a87b8b8a71fcce08348d1e031ea91c))

## [0.6.0](https://github.com/pkgjs/parseargs/compare/v0.5.0...v0.6.0) (2022-04-11)


### ⚠ BREAKING CHANGES

* rework results to remove redundant `flags` property and store value true for boolean options (#83)
* switch to existing ERR_INVALID_ARG_VALUE (#97)

### Code Refactoring

* rework results to remove redundant `flags` property and store value true for boolean options ([#83](https://github.com/pkgjs/parseargs/issues/83)) ([be153db](https://github.com/pkgjs/parseargs/commit/be153dbed1d488cb7b6e27df92f601ba7337713d))
* switch to existing ERR_INVALID_ARG_VALUE ([#97](https://github.com/pkgjs/parseargs/issues/97)) ([084a23f](https://github.com/pkgjs/parseargs/commit/084a23f9fde2da030b159edb1c2385f24579ce40))

## [0.5.0](https://github.com/pkgjs/parseargs/compare/v0.4.0...v0.5.0) (2022-04-10)


### ⚠ BREAKING CHANGES

* Require type to be specified for each supplied option (#95)

### Features

* Require type to be specified for each supplied option ([#95](https://github.com/pkgjs/parseargs/issues/95)) ([02cd018](https://github.com/pkgjs/parseargs/commit/02cd01885b8aaa59f2db8308f2d4479e64340068))

## [0.4.0](https://github.com/pkgjs/parseargs/compare/v0.3.0...v0.4.0) (2022-03-12)


### ⚠ BREAKING CHANGES

* parsing, revisit short option groups, add support for combined short and value (#75)
* restructure configuration to take options bag (#63)

### Code Refactoring

* parsing, revisit short option groups, add support for combined short and value ([#75](https://github.com/pkgjs/parseargs/issues/75)) ([a92600f](https://github.com/pkgjs/parseargs/commit/a92600fa6c214508ab1e016fa55879a314f541af))
* restructure configuration to take options bag ([#63](https://github.com/pkgjs/parseargs/issues/63)) ([b412095](https://github.com/pkgjs/parseargs/commit/b4120957d90e809ee8b607b06e747d3e6a6b213e))

## [0.3.0](https://github.com/pkgjs/parseargs/compare/v0.2.0...v0.3.0) (2022-02-06)


### Features

* **parser:** support short-option groups ([#59](https://github.com/pkgjs/parseargs/issues/59)) ([882067b](https://github.com/pkgjs/parseargs/commit/882067bc2d7cbc6b796f8e5a079a99bc99d4e6ba))

## [0.2.0](https://github.com/pkgjs/parseargs/compare/v0.1.1...v0.2.0) (2022-02-05)


### Features

* basic support for shorts ([#50](https://github.com/pkgjs/parseargs/issues/50)) ([a2f36d7](https://github.com/pkgjs/parseargs/commit/a2f36d7da4145af1c92f76806b7fe2baf6beeceb))


### Bug Fixes

* always store value for a=b ([#43](https://github.com/pkgjs/parseargs/issues/43)) ([a85e8dc](https://github.com/pkgjs/parseargs/commit/a85e8dc06379fd2696ee195cc625de8fac6aee42))
* support single dash as positional ([#49](https://github.com/pkgjs/parseargs/issues/49)) ([d795bf8](https://github.com/pkgjs/parseargs/commit/d795bf877d068fd67aec381f30b30b63f97109ad))

### [0.1.1](https://github.com/pkgjs/parseargs/compare/v0.1.0...v0.1.1) (2022-01-25)


### Bug Fixes

* only use arrays in results for multiples ([#42](https://github.com/pkgjs/parseargs/issues/42)) ([c357584](https://github.com/pkgjs/parseargs/commit/c357584847912506319ed34a0840080116f4fd65))

## 0.1.0 (2022-01-22)


### Features

* expand scenarios covered by default arguments for environments ([#20](https://github.com/pkgjs/parseargs/issues/20)) ([582ada7](https://github.com/pkgjs/parseargs/commit/582ada7be0eca3a73d6e0bd016e7ace43449fa4c))
* update readme and include contributing guidelines ([8edd6fc](https://github.com/pkgjs/parseargs/commit/8edd6fc863cd705f6fac732724159ebe8065a2b0))


### Bug Fixes

* do not strip excess leading dashes on long option names ([#21](https://github.com/pkgjs/parseargs/issues/21)) ([f848590](https://github.com/pkgjs/parseargs/commit/f848590ebf3249ed5979ff47e003fa6e1a8ec5c0))
* name & readme ([3f057c1](https://github.com/pkgjs/parseargs/commit/3f057c1b158a1bdbe878c64b57460c58e56e465f))
* package.json values ([9bac300](https://github.com/pkgjs/parseargs/commit/9bac300e00cd76c77076bf9e75e44f8929512da9))
* update readme name ([957d8d9](https://github.com/pkgjs/parseargs/commit/957d8d96e1dcb48297c0a14345d44c0123b2883e))


### Build System

* first release as minor ([421c6e2](https://github.com/pkgjs/parseargs/commit/421c6e2569a8668ad14fac5a5af5be60479a7571))
