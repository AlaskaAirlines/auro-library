import path from 'path';
import markdownMagic from 'markdown-magic';
import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';

import AuroLibraryUtils from "../utils/auroLibraryUtils.mjs";

const auroLibraryUtils = new AuroLibraryUtils();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const dirDocTemplates = './docTemplates';
const readmeFilePath = dirDocTemplates + '/README.md';

// List of components that do not support ESM to determine which README to use
const nonEsmComponents = ['combobox', 'datepicker', 'menu', 'pane', 'select'];

function generateReadmeUrl() {
  let nameExtractionData = nameExtraction();
  let esmString = '';

  if (!nonEsmComponents.includes(nameExtractionData.name)) {
    esmString = '_esm';
  }

  return 'https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README' + esmString + '.md';
}

/**
 * Extract NPM, NAMESPACE and NAME from package.json
 */

function nameExtraction() {
  let packageJson = fs.readFileSync('package.json', 'utf8', function(err, data) {
    if (err) {
      console.log('ERROR: Unable to read package.json file', err);
    }
  })

  packageJson = JSON.parse(packageJson);
  
  let pName = packageJson.name;
  let pVersion = packageJson.version;
  let pdtVersion = packageJson.peerDependencies['\@aurodesignsystem/design-tokens'].substring(1);
  let wcssVersion = packageJson.peerDependencies['\@aurodesignsystem/webcorestylesheets'].substring(1);

  let npmStart = pName.indexOf('@');
  let namespaceStart = pName.indexOf('/');
  let nameStart = pName.indexOf('-');

  return {
    'npm': pName.substring(npmStart, namespaceStart),
    'namespace': pName.substring(namespaceStart + 1, nameStart),
    'namespaceCap': pName.substring(namespaceStart + 1)[0].toUpperCase() + pName.substring(namespaceStart + 2, nameStart),
    'name': pName.substring(nameStart + 1),
    'nameCap': pName.substring(nameStart + 1)[0].toUpperCase() + pName.substring(nameStart + 2),
    'version': pVersion,
    'tokensVersion': pdtVersion,
    'wcssVersion': wcssVersion
  };
}

/**
 * Replace all instances of [npm], [name], [Name], [namespace] and [Namespace] accordingly
 */

function formatTemplateFileContents(content, destination) {
  let nameExtractionData = nameExtraction();
  let result = content;

  /**
   * Replace placeholder strings
   */
  result = result.replace(/\[npm]/g, nameExtractionData.npm);
  result = result.replace(/\[name](?!\()/g, nameExtractionData.name);
  result = result.replace(/\[Name](?!\()/g, nameExtractionData.nameCap);
  result = result.replace(/\[namespace]/g, nameExtractionData.namespace);
  result = result.replace(/\[Namespace]/g, nameExtractionData.namespaceCap);
  result = result.replace(/\[Version]/g, nameExtractionData.version);
  result = result.replace(/\[dtVersion]/g, nameExtractionData.tokensVersion);
  result = result.replace(/\[wcssVersion]/g, nameExtractionData.wcssVersion);

  /**
   * Cleanup line breaks
   */
  result = result.replace(/(\r\n|\r|\n)[\s]+(\r\n|\r|\n)/g, '\r\n\r\n'); // Replace lines containing only whitespace with a carriage return.
  result = result.replace(/>(\r\n|\r|\n){2,}/g, '>\r\n'); // Remove empty lines directly after a closing html tag.
  result = result.replace(/>(\r\n|\r|\n)```/g, '>\r\n\r\n```'); // Ensure an empty line before code samples.
  result = result.replace(/>(\r\n|\r|\n){2,}```(\r\n|\r|\n)/g, '>\r\n```\r\n'); // Ensure no empty lines before close of code sample.
  result = result.replace(/([^(\r\n|\r|\n)])(\r?\n|\r(?!\n))+#/g, "$1\r\n\r\n#"); // Ensure empty line before header sections.

  /**
   * Write the result to the destination file
   */
  fs.writeFileSync(destination, result, { encoding: 'utf8'});
}

function formatApiTableContents(content, destination) {
  const nameExtractionData = nameExtraction();
  const wcName = nameExtractionData.namespace + '-' + nameExtractionData.name;

  let result = content;

  result = result
    .replace(/\r\n|\r|\n####\s`([a-zA-Z]*)`/g, `\r\n#### <a name="$1"></a>\`$1\`<a href="#" style="float: right; font-size: 1rem; font-weight: 100;">back to top</a>`)
    .replace(/\r\n|\r|\n\|\s`([a-zA-Z]*)`/g, '\r\n| [$1](#$1)')
    .replace(/\| \[\]\(#\)/g, "");

  fs.writeFileSync(destination, result, { encoding: 'utf8'});

  fs.readFile('./demo/api.md', 'utf8', function(err, data) {
    formatTemplateFileContents(data, './demo/api.md');
  });
}

/**
 * Compiles `./docTemplates/README.md` -> `./README.md`
 */

function processReadme() {
  const callback = function(updatedContent, outputConfig) {

    if (fs.existsSync('./README.md')) {
      fs.readFile('./README.md', 'utf8', function(err, data) {
        formatTemplateFileContents(data, './README.md');
      });
    } else {
      console.log('ERROR: ./README.md file is missing');
    }
  };

  const config = {
    matchWord: 'AURO-GENERATED-CONTENT',
    outputDir: './'
  };

  const markdownPath = path.join(__dirname, './../../../../../docTemplates/README.md');

  markdownMagic(markdownPath, config, callback);
}

/**
 * Compiles `./docTemplates/index.md` -> `./demo/index.md`
 */

function processDemo() {
  const callback = function(updatedContent, outputConfig) {
    if (fs.existsSync('./demo/index.md')) {
      fs.readFile('./demo/index.md', 'utf8', function(err, data) {
        // formatTemplateFileContents(data, './demo/index.md');
        auroLibraryUtils.formatFileContents(data, './demo/index.md');
      });
    } else {
      console.log('ERROR: ./demo/index.md file is missing');
    }
  };

  const configDemo = {
    matchWord: 'AURO-GENERATED-CONTENT',
    outputDir: './demo'
  };

  const markdownPath = path.join(__dirname, './../../../../../docs/partials/index.md');

  markdownMagic(markdownPath, configDemo, callback);
}

/**
 * Compiles `./docTemplates/api.md` -> `./demo/api.md`
 */

function processApiExamples() {
  const callback = function(updatedContent, outputConfig) {
    if (fs.existsSync('./demo/api.md')) {
      fs.readFile('./demo/api.md', 'utf8', function(err, data) {
        formatApiTableContents(data, './demo/api.md');
      });
    } else {
      console.log('ERROR: ./demo/api.md file is missing');
    }
  };

  const config = {
    matchWord: 'AURO-GENERATED-CONTENT',
    outputDir: './demo'
  };

  const markdownPath = path.join(__dirname, './../../../../../docs/partials/api.md');

  markdownMagic(markdownPath, config, callback);
}

/**
 * Copy README.md template from static source
 * */

function copyReadmeLocally() {
  if (!fs.existsSync(dirDocTemplates)){
    fs.mkdirSync(dirDocTemplates);
  }

  if (!fs.existsSync(readmeFilePath)) {
    fs.writeFile(readmeFilePath, '', function(err) {
      if(err) {
        console.log('ERROR: Unable to create README.md file.', err);
      }
    });
  }

  https.get(generateReadmeUrl(), function(response) {
    let writeTemplate = response.pipe(fs.createWriteStream(readmeFilePath));

    writeTemplate.on('finish', () => {
      processReadme();
    });

  }).on('error', (err) => {
    console.log('ERROR: Unable to fetch README.md file from server.', err);
  });
}

/**
 * Run all the actual document generation
 */
copyReadmeLocally();
processApiExamples();
processDemo();

