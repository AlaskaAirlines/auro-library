// Copyright (c) Alaska Air. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

const auroSubNameIndex = 5;

/**
 * Writes a version file for the specified dependency package into the `src` directory.
 * @param {string} pkg Dependency to write version file for.
 */
function writeDepVersionFile(pkg) {
  const fs = require('fs');
  const path = `${pkg}/package.json`;
  const json = require(path);
  const {version} = json;
  const elemSubName = pkg.substring(pkg.indexOf('auro-') + auroSubNameIndex);
  const versionFilePath = `./src/${elemSubName}Version.js`;

  fs.writeFileSync(versionFilePath, `export default '${version}'`);
}

// add the code below
module.exports = { writeDepVersionFile };
