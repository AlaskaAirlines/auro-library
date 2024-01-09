# Semantic Release Automated Changelog

## [2.2.2](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.1...v2.2.2) (2024-01-09)


### Bug Fixes

* update dependency script to be ES6 ([426b58f](https://github.com/AlaskaAirlines/auro-library/commit/426b58f13c0c9a72cbe0619c33a3d1773013c56c))

## [2.2.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.0...v2.2.1) (2024-01-09)


### Bug Fixes

* update relative path ([d8eed9f](https://github.com/AlaskaAirlines/auro-library/commit/d8eed9ffb985dd57bbd179e7f2a1bbcbbd587b8f))

# [2.2.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.1.1...v2.2.0) (2024-01-09)


### Features

* add build scripts from generator [#47](https://github.com/AlaskaAirlines/auro-library/issues/47) ([ac81a7d](https://github.com/AlaskaAirlines/auro-library/commit/ac81a7d3768e97435d7c80436ae241e2ce38e30b))

## [2.1.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.1.0...v2.1.1) (2023-12-29)


### Bug Fixes

* **utils:** move runtime utils to separete file from node utils ([592990e](https://github.com/AlaskaAirlines/auro-library/commit/592990eeb693282999d75998dc49e62f0857012a))

# [2.1.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.0.0...v2.1.0) (2023-12-28)


### Features

* **closest:** add closest element function [#43](https://github.com/AlaskaAirlines/auro-library/issues/43) ([f215c74](https://github.com/AlaskaAirlines/auro-library/commit/f215c746c59d70007da2b3fcad7dfb74420bd182))

# [2.0.0](https://github.com/AlaskaAirlines/auro-library/compare/v1.1.0...v2.0.0) (2023-10-05)


### Performance Improvements

* **npmignore:** include scripts/config/ directory [#38](https://github.com/AlaskaAirlines/auro-library/issues/38) ([e4e1a75](https://github.com/AlaskaAirlines/auro-library/commit/e4e1a7526765cc828d6124c71853d8cb9e9d3f6f))
* **scripts:** update directory file for config scripts [#38](https://github.com/AlaskaAirlines/auro-library/issues/38) ([8167f2f](https://github.com/AlaskaAirlines/auro-library/commit/8167f2f5521a22145419d9f7cd8f5e5c4ba5dd80))


### BREAKING CHANGES

* **scripts:** The automation scripts directory name has been changed from "setup" to "config".

# [1.1.0](https://github.com/AlaskaAirlines/auro-library/compare/v1.0.2...v1.1.0) (2023-08-31)


### Bug Fixes

* **err:** update parameter handling ([04af13a](https://github.com/AlaskaAirlines/auro-library/commit/04af13a315ebb35795fe7b6c162373d7b9c5d3b3))


### Features

* **automation:** add automation scripts for workflows and linters [#32](https://github.com/AlaskaAirlines/auro-library/issues/32) ([5dff1b7](https://github.com/AlaskaAirlines/auro-library/commit/5dff1b7dcbe2d7862b4994399f40781037b48d69))
* **surge:** add workflow that deploys surge demo [#35](https://github.com/AlaskaAirlines/auro-library/issues/35) ([7117212](https://github.com/AlaskaAirlines/auro-library/commit/71172129d0309e132821f1bcb5d8673baa746468))


### Performance Improvements

* **.npmignore:** update .npmignore ([2de9db7](https://github.com/AlaskaAirlines/auro-library/commit/2de9db717b6e069a8ffb6b6e067a83b08c41d8c6))
* **docs:** add generateDocs script [#36](https://github.com/AlaskaAirlines/auro-library/issues/36) ([9746820](https://github.com/AlaskaAirlines/auro-library/commit/97468201ca83767b3cc1dd1396e0d78f311a69f5))
* **extraction:** extract functions and insert into library utils [#36](https://github.com/AlaskaAirlines/auro-library/issues/36) ([c3018eb](https://github.com/AlaskaAirlines/auro-library/commit/c3018eb01acf4b3682b63b0b92c3beb5b3641161))

## [1.0.2](https://github.com/AlaskaAirlines/auro-library/compare/v1.0.1...v1.0.2) (2023-07-24)


### Bug Fixes

* print surge output in publishDemo [#29](https://github.com/AlaskaAirlines/auro-library/issues/29) ([02001d8](https://github.com/AlaskaAirlines/auro-library/commit/02001d8d16c4d874d489a327ddabafb2994e5221))
* update demo url filter to replace '#' chars [#31](https://github.com/AlaskaAirlines/auro-library/issues/31) ([d81fcc2](https://github.com/AlaskaAirlines/auro-library/commit/d81fcc25dfa6580bb333f0b22241fedd9cf548c4))

## [1.0.1](https://github.com/AlaskaAirlines/auro-library/compare/v1.0.0...v1.0.1) (2023-07-19)


### Bug Fixes

* **versionWriter:** use correct path to node_modules directory [#23](https://github.com/AlaskaAirlines/auro-library/issues/23) ([e926397](https://github.com/AlaskaAirlines/auro-library/commit/e926397a8b31c90e9c7e80fd5126600d20ffc3b5))

# 1.0.0 (2023-07-14)


### Bug Fixes

* **action:** allow SURGE_TOKEN secret to be passed in ([12bddae](https://github.com/AlaskaAirlines/auro-library/commit/12bddae92a764af0c97af5116af7257152300f5e))
* **release:** add missing config setup for semantic release [#13](https://github.com/AlaskaAirlines/auro-library/issues/13) ([7bc6f83](https://github.com/AlaskaAirlines/auro-library/commit/7bc6f83e23dc72bbb30adbb9da8bde85fb9d299d))


### Features

* **actions:** introduce publish demo workflow ([2dd4d88](https://github.com/AlaskaAirlines/auro-library/commit/2dd4d88b8010929c02d3624ec02961d7643b789b))
* **assign:** add workflow action [#9](https://github.com/AlaskaAirlines/auro-library/issues/9) ([8b18979](https://github.com/AlaskaAirlines/auro-library/commit/8b18979b793277b2e1ea69358638cd2384f89965))
* **demo:** write script to replace demo script tags ([bf378f4](https://github.com/AlaskaAirlines/auro-library/commit/bf378f407a6b954e45c36de7dc3ebf69ec68e850))
* introduce surge teardown workflow [#5](https://github.com/AlaskaAirlines/auro-library/issues/5) ([429d7e4](https://github.com/AlaskaAirlines/auro-library/commit/429d7e49fb006768f0c2be69552de6911af7e363))
* **npm:** add npm resources + husky git hooks ([3876a57](https://github.com/AlaskaAirlines/auro-library/commit/3876a5763cab5800f463e18bbcf014d437602417))
* **npm:** configure repo for releasing as an NPM package [#13](https://github.com/AlaskaAirlines/auro-library/issues/13) ([c81d36f](https://github.com/AlaskaAirlines/auro-library/commit/c81d36f239bc58b6fb97089f3fb9af8ace6fb9e5))
* **versioning:** add dependency versioning utility and docs [#11](https://github.com/AlaskaAirlines/auro-library/issues/11) ([739679f](https://github.com/AlaskaAirlines/auro-library/commit/739679f36e24f3c3583e87a77982d7f34a631f55))
