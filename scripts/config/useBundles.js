// Script used by `Deploy Demo` workflow to replace component scripts in demos with their bundled versions

/* eslint-disable no-undef */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';

const currDir = process.cwd();
const demoScriptRegEx = /<script.* data-demo-script="true".*><\/script>/gum;

// Confirm ./dist exists
if (!existsSync('./dist')) {
  throw Error("Failed: Missing `dist` directory.");
}

// Grab bundled file paths from ./dist
const bundledFiles = [];
readdirSync('./dist').forEach((file) => {
  if (file.includes("_bundled.js")) {
    bundledFiles.push(file);
  }
});

// Create bundled files script tags
let bundledScriptTags = '';
bundledFiles.forEach((file) => {
  bundledScriptTags += `<script type="module" src="/dist/${file}"></script> \n`;
});

// Confirm ./demo exists
if (!existsSync('./demo')) {
  throw Error("Failed: Missing `demo` directory.");
}

// Read contents of every html file in demo directory
readdirSync('./demo').forEach((file) => {
  if (file.includes(".html")) {
    const demoContentBuffer = readFileSync(`${currDir}/demo/${file}`);
    let demoContent = demoContentBuffer.toString();

    // Find where the demo script tag exists
    const scriptIndex = demoContent.search(demoScriptRegEx);
    if (scriptIndex >= 0) {
      // Remove demo script tag
      demoContent = demoContent.replace(demoScriptRegEx, '');

      // Inject bundled script tags where demo script tags existed
      demoContent = demoContent.slice(0, scriptIndex) + bundledScriptTags + demoContent.slice(scriptIndex);

      // Write changes to file
      writeFileSync(`${currDir}/demo/${file}`, demoContent);
    }
  }
});

// Exit successfully
process.exit(0);

