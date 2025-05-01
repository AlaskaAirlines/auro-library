# Semantic Release Automated Changelog

## [4.4.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.4.0...v4.4.1) (2025-05-01)


### Bug Fixes

* allow typing in space on Input Element ([7d0e250](https://github.com/AlaskaAirlines/auro-library/commit/7d0e25053bbfe52f5038224f82e60054facfef81))

# [4.4.0](https://github.com/AlaskaAirlines/auro-library/compare/v4.3.1...v4.4.0) (2025-04-30)


### Features

* add support for dayless (e.g. 10/1999) and two-digit year (e.g. 10/99) date formats ([50b730b](https://github.com/AlaskaAirlines/auro-library/commit/50b730bd5ed9a5de7f3c3b44cb0826d96dfed982))

## [4.3.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.3.0...v4.3.1) (2025-04-30)


### Bug Fixes

* add .element to fix undefined value on isPopoverVisible ([69f4223](https://github.com/AlaskaAirlines/auro-library/commit/69f4223e35a6f180d932e669c2514a03369a47a3))

## [4.3.1-beta.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.3.0...v4.3.1-beta.1) (2025-04-30)


### Bug Fixes

* add .element to fix undefined value on isPopoverVisible ([69f4223](https://github.com/AlaskaAirlines/auro-library/commit/69f4223e35a6f180d932e669c2514a03369a47a3))

# [4.3.0](https://github.com/AlaskaAirlines/auro-library/compare/v4.2.1...v4.3.0) (2025-04-18)


### Bug Fixes

* update `matchDate` function to correctly check older dates than year 1000 ([81852fc](https://github.com/AlaskaAirlines/auro-library/commit/81852fc18b6cabc5a4f009c9ddda4a2c10119a67))


### Features

* add exported date constraints to dateUtilities for external reference by consumers and allow for barrel imports ([d796e96](https://github.com/AlaskaAirlines/auro-library/commit/d796e963ab5a1db778c78b2b15e45cd28ea1100d))

# [4.3.0-beta.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.2.2-beta.1...v4.3.0-beta.1) (2025-04-16)


### Features

* add exported date constraints to dateUtilities for external reference by consumers and allow for barrel imports ([d796e96](https://github.com/AlaskaAirlines/auro-library/commit/d796e963ab5a1db778c78b2b15e45cd28ea1100d))

## [4.2.2-beta.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.2.1...v4.2.2-beta.1) (2025-04-16)


### Bug Fixes

* update `matchDate` function to correctly check older dates than year 1000 ([81852fc](https://github.com/AlaskaAirlines/auro-library/commit/81852fc18b6cabc5a4f009c9ddda4a2c10119a67))

## [4.2.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.2.0...v4.2.1) (2025-04-14)


### Bug Fixes

* add SSR env condition check in floatingUI ([c71a77e](https://github.com/AlaskaAirlines/auro-library/commit/c71a77ed805dc2e61593dd0c483a01c9f19e2a01))
* correct method call to hide dropdown in AuroFloatingUI class ([44e30fc](https://github.com/AlaskaAirlines/auro-library/commit/44e30fc384be9adbcd3f493faba4c2f652c019f3))
* not to hide bib on blur event with mouse being pressed ([8808ee6](https://github.com/AlaskaAirlines/auro-library/commit/8808ee6911ccfb81c0e9a0ed23762852983e1239))
* remove bib on disconnect in floatingUI ([b5a2935](https://github.com/AlaskaAirlines/auro-library/commit/b5a29358910199589422067ad30767c99bb16daa))
* setup mousePressChecker in floatingUI's configure function ([6136d36](https://github.com/AlaskaAirlines/auro-library/commit/6136d36a980802dc56a0bea9d9aa12b7bf3e6621))

# [4.2.0](https://github.com/AlaskaAirlines/auro-library/compare/v4.1.1...v4.2.0) (2025-04-10)


### Features

* add dateAndFormatMatch to date utilities ([4ce4779](https://github.com/AlaskaAirlines/auro-library/commit/4ce47799514a528d351ec829b8fc8f3f093868cf))

## [4.1.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.1.0...v4.1.1) (2025-04-09)


### Bug Fixes

* update wca writing script not to write lines with [@tags](https://github.com/tags) ([8ff5eab](https://github.com/AlaskaAirlines/auro-library/commit/8ff5eab39a656bcf2eac1d4439cb0d44d3208d48))

# [4.1.0](https://github.com/AlaskaAirlines/auro-library/compare/v4.0.0...v4.1.0) (2025-04-02)


### Bug Fixes

* hide bib correctly when losing focus on trigger ([226ed07](https://github.com/AlaskaAirlines/auro-library/commit/226ed07a6200d733649f6a9f6e651b88e6ce0d64))
* prevent clicking background of bib resetting `document.activeElement` ([b8c64d4](https://github.com/AlaskaAirlines/auro-library/commit/b8c64d494e42917c7aabbbc64addf3d7076c62c6))


### Features

* create date utilities library ([2241546](https://github.com/AlaskaAirlines/auro-library/commit/22415464a01fcf9a53e8b3b32787f068272b7eaf))

# [4.1.0-beta.2](https://github.com/AlaskaAirlines/auro-library/compare/v4.1.0-beta.1...v4.1.0-beta.2) (2025-04-01)


### Bug Fixes

* hide bib correctly when losing focus on trigger ([226ed07](https://github.com/AlaskaAirlines/auro-library/commit/226ed07a6200d733649f6a9f6e651b88e6ce0d64))
* prevent clicking background of bib resetting `document.activeElement` ([b8c64d4](https://github.com/AlaskaAirlines/auro-library/commit/b8c64d494e42917c7aabbbc64addf3d7076c62c6))

# [4.1.0-beta.1](https://github.com/AlaskaAirlines/auro-library/compare/v4.0.0...v4.1.0-beta.1) (2025-03-28)


### Features

* create date utilities library ([2241546](https://github.com/AlaskaAirlines/auro-library/commit/22415464a01fcf9a53e8b3b32787f068272b7eaf))

# [4.0.0](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.13...v4.0.0) (2025-03-24)


### Features

* add drawer behavior to floatingUI ([55e6d30](https://github.com/AlaskaAirlines/auro-library/commit/55e6d30df013193174af6b865e023bb14eaa6dd5))


### Performance Improvements

* update randomize id logic to use crypto ([0ac1a85](https://github.com/AlaskaAirlines/auro-library/commit/0ac1a85a6ecdc90b68d2bc79238a9410bd00613d))


### BREAKING CHANGES

* `data-show` attribute on bib won't be set by floatingUI

## [3.0.13](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.12...v3.0.13) (2025-03-19)


### Bug Fixes

* correct method call to hide dropdown in AuroFloatingUI class ([27d9c6c](https://github.com/AlaskaAirlines/auro-library/commit/27d9c6cc8df7f5e6603e5dc231fae2d72a75a486))

## [3.0.12](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.11...v3.0.12) (2025-03-19)


### Bug Fixes

* update dropdown reference in AuroFloatingUI class ([0fe1cb3](https://github.com/AlaskaAirlines/auro-library/commit/0fe1cb3b127b83ad5e39748429263c99580dee70))

## [3.0.11](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.10...v3.0.11) (2025-02-28)


### Performance Improvements

* update eslint-config to get rid of node version warnings ([ecb349e](https://github.com/AlaskaAirlines/auro-library/commit/ecb349ebf223a9eb14f0e01ddaee5cfdc4558acd))

## [3.0.10](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.9...v3.0.10) (2025-02-20)


### Bug Fixes

* make bib not to pushed up by keyboard ([50773d0](https://github.com/AlaskaAirlines/auro-library/commit/50773d08141bebc5a9f8b50b83c94cd34149fc3d))

## [3.0.9](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.8...v3.0.9) (2025-02-17)


### Bug Fixes

* fix runtime error on floatingui with no trigger slot ([060c30f](https://github.com/AlaskaAirlines/auro-library/commit/060c30f3da32004e5e0d978949e7d65c661ddfed))
* lock body scroll only when bib is open in fullscreen mode ([ce5df91](https://github.com/AlaskaAirlines/auro-library/commit/ce5df91b981d7b41b9e938b7d41cc114a279cb59))
* simplify the strategy logic on `floatingUI` ([42c89db](https://github.com/AlaskaAirlines/auro-library/commit/42c89dbdf9cb48756928143b09b25aa82989dfd4))


### Performance Improvements

* lock body's scroll while bib is open ([d78b46e](https://github.com/AlaskaAirlines/auro-library/commit/d78b46ecc689f45b75b3a5317ae029d8b3061c1e))

## [3.0.8](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.7...v3.0.8) (2025-02-05)


### Bug Fixes

* temporarily comment out aria-expanded code [#105](https://github.com/AlaskaAirlines/auro-library/issues/105) ([b7cd263](https://github.com/AlaskaAirlines/auro-library/commit/b7cd2632047641d92b3557beef9450d4d9f109c2))

## [3.0.7](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.6...v3.0.7) (2025-01-13)


### Performance Improvements

* add ability to pass custom env variables [#103](https://github.com/AlaskaAirlines/auro-library/issues/103) ([fab4c8e](https://github.com/AlaskaAirlines/auro-library/commit/fab4c8e10cab475426b3ed5dfe6db7e9ac99f07c))

## [3.0.6](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.5...v3.0.6) (2025-01-02)


### Bug Fixes

* postCSS reference path ([6d33791](https://github.com/AlaskaAirlines/auro-library/commit/6d33791e9f1b74c5052ffcaadc456a798c1ece4d))

## [3.0.5](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.4...v3.0.5) (2024-12-27)


### Bug Fixes

* force focus state to dropdown.trigger as `document.activeElement` stays in body even with clicking [#99](https://github.com/AlaskaAirlines/auro-library/issues/99) ([5bfec7a](https://github.com/AlaskaAirlines/auro-library/commit/5bfec7a004c48b4f9612193eb4a64057b81e57cc))

## [3.0.4](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.3...v3.0.4) (2024-12-27)


### Performance Improvements

* update `floatingUI` to match with `auro-formkit/dropdown` ([d003072](https://github.com/AlaskaAirlines/auro-library/commit/d00307245d16ad3a4d5aa1b2d60bb374caf3d454))

## [3.0.3](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.2...v3.0.3) (2024-12-23)


### Performance Improvements

* update node to version 22 ([6005e32](https://github.com/AlaskaAirlines/auro-library/commit/6005e32156c3c4e6d9b8205270092b4c77a1bf1a))

## [3.0.2](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.1...v3.0.2) (2024-11-13)


### Bug Fixes

* automatically create `docTemplate` when generating docs [#94](https://github.com/AlaskaAirlines/auro-library/issues/94) ([e6195d9](https://github.com/AlaskaAirlines/auro-library/commit/e6195d958233cd5b0902cb5afbf769dff246e852))


### Performance Improvements

* omit dir exist checking (sourcery reccomendation) ([68de618](https://github.com/AlaskaAirlines/auro-library/commit/68de61844960bf6d32df2ed66ca714857da1d623))

## [3.0.1](https://github.com/AlaskaAirlines/auro-library/compare/v3.0.0...v3.0.1) (2024-11-07)


### Bug Fixes

* make api table formatter a preProcessor ([98d3de1](https://github.com/AlaskaAirlines/auro-library/commit/98d3de1e290ea2e3f03da9ef0d167c3291bc195b))
* properly consume remoteReadmeVariant ([7b5f108](https://github.com/AlaskaAirlines/auro-library/commit/7b5f1082710288d86f8bf182c0ceb71ac3ad7420))
* sourcery feedback ([de11fe8](https://github.com/AlaskaAirlines/auro-library/commit/de11fe8d70946b6096970026406f63bd9fdc10ba))
* use fileURLToPath instead of manual formatting ([3d4e834](https://github.com/AlaskaAirlines/auro-library/commit/3d4e8348bf249620eb88a6e1094a8f920c34369a))
* use import.meta.url instead of __dirname ([9185197](https://github.com/AlaskaAirlines/auro-library/commit/9185197d8b0179dfe645497c640b025d8f39c6b3))

# [3.0.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.11.0...v3.0.0) (2024-11-05)


### Bug Fixes

* add missing logger import ([8258705](https://github.com/AlaskaAirlines/auro-library/commit/8258705385b20950dba442a59fa41b56052955bf))
* sourcery feedback - change tag detection ([51b134f](https://github.com/AlaskaAirlines/auro-library/commit/51b134fea57c79e9625b6053296049c19959595a))


### Features

* add more consistent "component root" path generator ([c88f5a8](https://github.com/AlaskaAirlines/auro-library/commit/c88f5a8018fcbcbc1deefa35a0152c1696681957))
* add syncGithubFiles.mjs script ([207009d](https://github.com/AlaskaAirlines/auro-library/commit/207009d000565566aed4687ed45ee7e286528856))
* **build:** new script that generate extended component files for `wca` to be able to analyze [#85](https://github.com/AlaskaAirlines/auro-library/issues/85) ([ae8e6ab](https://github.com/AlaskaAirlines/auro-library/commit/ae8e6ab41db40df05f53562e14692a943c37d796))
* change API for generateReadmeURL and processDocs ([a1a975c](https://github.com/AlaskaAirlines/auro-library/commit/a1a975c0d9020bdd71c9da0bf165777c54801e8b))


### BREAKING CHANGES

* `processDocFiles` no longer accepts individual config arguments

# [2.11.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.10.1...v2.11.0) (2024-11-01)


### Features

* adding .editoconfig file for IDE formatting ([82e2b64](https://github.com/AlaskaAirlines/auro-library/commit/82e2b64673319c8d5b18269dca2d0d3f8a7de83b))

## [2.10.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.10.0...v2.10.1) (2024-10-21)


### Bug Fixes

* reference consuming component's package.json, rather than relatively ([21cf238](https://github.com/AlaskaAirlines/auro-library/commit/21cf2382a54d4a620d1d5d658fa928b54e15d077))

# [2.10.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.9.0...v2.10.0) (2024-10-09)


### Bug Fixes

* add tmp/ to npmignore ([94a61b5](https://github.com/AlaskaAirlines/auro-library/commit/94a61b526b72dbe445633dfbea41bf56cc4fef89))
* update file ending and disable overwrite by default ([fd65cf3](https://github.com/AlaskaAirlines/auro-library/commit/fd65cf39f0051577c5fb43e77bd6bdd6cb0ccdf9))


### Features

* add first test suites for doc gen ([88d8987](https://github.com/AlaskaAirlines/auro-library/commit/88d8987126d04f82d14a6ac11078d509eb3e8629))
* add vitest for unit testing ([0f96702](https://github.com/AlaskaAirlines/auro-library/commit/0f967027ea177f0218d3b6f44e973ce5d22768a8))


### Performance Improvements

* remove extra comment from early in dev ([25ac890](https://github.com/AlaskaAirlines/auro-library/commit/25ac8903be38ca600fbd8b1e2ec02d56bc711770))

# [2.9.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.8.0...v2.9.0) (2024-10-07)


### Bug Fixes

* add matchWord to md magic config ([372cb28](https://github.com/AlaskaAirlines/auro-library/commit/372cb28a1c9eb0bd5f1014a4a8a9e6415cf659e5))


### Features

* add handlebars template support ([bc3851d](https://github.com/AlaskaAirlines/auro-library/commit/bc3851dd87eb907927a3e2e22de53013c5e4e958))
* add new processing paradigm ([9a1dd25](https://github.com/AlaskaAirlines/auro-library/commit/9a1dd254e1288a6c7873b145a62087a37233a641))

# [2.8.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.7.0...v2.8.0) (2024-09-19)


### Features

* add runtime script for Floating UI [#65](https://github.com/AlaskaAirlines/auro-library/issues/65) ([e180fcb](https://github.com/AlaskaAirlines/auro-library/commit/e180fcb319e9ab6673765041b5a96057e562bd60))

# [2.7.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.6.3...v2.7.0) (2024-08-21)


### Features

* add registerComponent function ([fc3a135](https://github.com/AlaskaAirlines/auro-library/commit/fc3a135f5fad8e3b5fc022f2e0f38443b11681fc))

## [2.6.3](https://github.com/AlaskaAirlines/auro-library/compare/v2.6.2...v2.6.3) (2024-08-07)


### Bug Fixes

* **readme:** update generateDocs script for dynamic readme support [#57](https://github.com/AlaskaAirlines/auro-library/issues/57) ([f3c3092](https://github.com/AlaskaAirlines/auro-library/commit/f3c3092f4c9cc61dcc9f4b55cb5f63be4127c6de))

## [2.6.2](https://github.com/AlaskaAirlines/auro-library/compare/v2.6.1...v2.6.2) (2024-08-07)


### Bug Fixes

* update various build scripts ([9b726b3](https://github.com/AlaskaAirlines/auro-library/commit/9b726b3ad2fd616987a4488cc440f0f7498c0028))

## [2.6.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.6.0...v2.6.1) (2024-08-06)


### Performance Improvements

* cleanup and update existing build scripts ([b6d5d95](https://github.com/AlaskaAirlines/auro-library/commit/b6d5d952c8e0ce8c7636057e612ae821f5e85079))

# [2.6.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.5.1...v2.6.0) (2024-04-29)


### Features

* **tagname:** add new functions for handling custom named components. [#51](https://github.com/AlaskaAirlines/auro-library/issues/51) ([1c7addc](https://github.com/AlaskaAirlines/auro-library/commit/1c7addcb9c637bdf043470e04626b9b4328ed6b6))

## [2.5.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.5.0...v2.5.1) (2024-02-07)


### Bug Fixes

* update reference to index.md ([e504708](https://github.com/AlaskaAirlines/auro-library/commit/e5047082cc0e198d0ee8e35fccdd1d715e3ff940))

# [2.5.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.7...v2.5.0) (2024-02-07)


### Features

* add alt generator ([4bb0207](https://github.com/AlaskaAirlines/auro-library/commit/4bb0207a47a80230954c876647115f47dc9cdfb4))
* add support for scrapping package.json ([551b407](https://github.com/AlaskaAirlines/auro-library/commit/551b4071ea407d5d5db68037fb63b1874161a35d))


### Performance Improvements

* update to support index.md ([87634f6](https://github.com/AlaskaAirlines/auro-library/commit/87634f62a76a1923e3584bc9c7b98c673f663755))

## [2.4.7](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.6...v2.4.7) (2024-02-07)


### Performance Improvements

* update template ([54c3da8](https://github.com/AlaskaAirlines/auro-library/commit/54c3da858e5b898bd1ade63b4ade324c78ee5379))

## [2.4.6](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.5...v2.4.6) (2024-02-07)


### Performance Improvements

* add support for version extraction ([d7d80cd](https://github.com/AlaskaAirlines/auro-library/commit/d7d80cda8b605300553fa67c38249d73ab23ca07))

## [2.4.5](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.4...v2.4.5) (2024-02-06)


### Performance Improvements

* remove unnecessary auto-assigned ([1d6b88c](https://github.com/AlaskaAirlines/auro-library/commit/1d6b88c004e16de3c8c95d5fe1f1adcf2590496d))

## [2.4.4](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.3...v2.4.4) (2024-02-06)


### Performance Improvements

* remove optional labeled filter ([62e2cf2](https://github.com/AlaskaAirlines/auro-library/commit/62e2cf2fe052d6d832701e36ce1d1a71174f7b0b))

## [2.4.3](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.2...v2.4.3) (2024-02-02)


### Bug Fixes

* remove accidental duplicate line ([9de53ed](https://github.com/AlaskaAirlines/auro-library/commit/9de53ed23512d11f293e30a97a2a7a23dc6e2874))

## [2.4.2](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.1...v2.4.2) (2024-02-02)


### Performance Improvements

* update regex ([0ac7870](https://github.com/AlaskaAirlines/auro-library/commit/0ac78704cf0cdc8867d3a88190534c7e9fd86d8a))

## [2.4.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.4.0...v2.4.1) (2024-01-30)


### Performance Improvements

* update workflow dependencies ([15d2a6a](https://github.com/AlaskaAirlines/auro-library/commit/15d2a6a3b31cb2ad17bbef52db5d971e5f98bca7))

# [2.4.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.3.2...v2.4.0) (2024-01-26)


### Features

* add shell scripts ([caccc2a](https://github.com/AlaskaAirlines/auro-library/commit/caccc2a62855337727c4a805d2cc9e3879c42e18))

## [2.3.2](https://github.com/AlaskaAirlines/auro-library/compare/v2.3.1...v2.3.2) (2024-01-25)


### Bug Fixes

* update workflow call ref ([fdf5659](https://github.com/AlaskaAirlines/auro-library/commit/fdf5659b309e97916d6190e3c26495750a00f26b))

## [2.3.1](https://github.com/AlaskaAirlines/auro-library/compare/v2.3.0...v2.3.1) (2024-01-25)


### Bug Fixes

* update workflow_call: in script ([c72ec89](https://github.com/AlaskaAirlines/auro-library/commit/c72ec895366d2d36223930bd9de4f56c780dcae4))

# [2.3.0](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.7...v2.3.0) (2024-01-25)


### Features

* add new workflow template ([368f423](https://github.com/AlaskaAirlines/auro-library/commit/368f42300639587f11a24d9e951eea08767a27a1))

## [2.2.7](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.6...v2.2.7) (2024-01-24)


### Performance Improvements

* update dependencies ([87ae1c3](https://github.com/AlaskaAirlines/auro-library/commit/87ae1c34601b03cc45d8f62e3c732edea23f175e))

## [2.2.6](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.5...v2.2.6) (2024-01-19)


### Bug Fixes

* update to current version of docs generator script ([31f3ea9](https://github.com/AlaskaAirlines/auro-library/commit/31f3ea9b03a87345ac69c3d84e33375bcdf403a9))

## [2.2.5](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.4...v2.2.5) (2024-01-11)


### Bug Fixes

* update package location ref ([e8cdbf8](https://github.com/AlaskaAirlines/auro-library/commit/e8cdbf8114dcc1e8a9a2af0e37fdca7a5616f6be))

## [2.2.4](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.3...v2.2.4) (2024-01-11)


### Performance Improvements

* add script to bin dir ([80476b5](https://github.com/AlaskaAirlines/auro-library/commit/80476b5d434446c34bf9a5c22749d4541fb5d8b9))

## [2.2.3](https://github.com/AlaskaAirlines/auro-library/compare/v2.2.2...v2.2.3) (2024-01-10)


### Performance Improvements

* make generateDocs available from bin dir ([157aef6](https://github.com/AlaskaAirlines/auro-library/commit/157aef6ba3641bbf55d6e542d525159e5f780fc5))

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
