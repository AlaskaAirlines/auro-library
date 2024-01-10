import markdownMagic from 'markdown-magic';
import * as fs from 'fs';
import * as https from 'https';

import AuroLibraryUtils from "../scripts/utils/auroLibraryUtils.mjs";

const auroLibraryUtils = new AuroLibraryUtils();

const readmeTemplateUrl = 'https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README.md';
const dirDocTemplates = './docTemplates';
const readmeFilePath = dirDocTemplates + '/README.md';

/**
   * Replace all instances of [npm], [name], [Name], [namespace] and [Namespace] accordingly
   */
function formatApiTableContents(content, destination) {
  const nameExtractionData = auroLibraryUtils.nameExtraction();
  const wcName = nameExtractionData.namespace + '-' + nameExtractionData.name;

  let result = content;

  result = result
    .replace(/\r\n|\r|\n####\s`([a-zA-Z]*)`/g, `\r\n#### <a name="$1"></a>\`$1\`<a href="#${wcName}" style="float: right; font-size: 1rem; font-weight: 100;">back to top</a>`)
    .replace(/\r\n|\r|\n\|\s`([a-zA-Z]*)`/g, '\r\n| [$1](#$1)')
    .replace(/\| \[\]\(#\)/g, "");

  fs.writeFileSync(destination, result, { encoding: 'utf8'});

  fs.readFile('./demo/api.md', 'utf8', function(err, data) {
    auroLibraryUtils.formatFileContents(data, './demo/api.md');
  });
}

/**
 * Compiles `./docTemplates/README.md` -> `./README.md`
 */

function processReadme() {
  const callback = function() {

    if (fs.existsSync('./README.md')) {
      fs.readFile('./README.md', 'utf8', function(err, data) {
        auroLibraryUtils.formatFileContents(data, './README.md');
      });
    } else {
      console.log('ERROR: ./README.md file is missing');
    }
  };

  const config = {
    matchWord: 'AURO-GENERATED-CONTENT',
    outputDir: './'
  };

  const markdownPath = './docTemplates/README.md';

  markdownMagic(markdownPath, config, callback);
}

/**
 * Compiles `./docTemplates/demo.md` -> `./demo/demo.md`
 */

function processDemo() {
  const callback = function() {
    if (fs.existsSync('./demo/demo.md')) {
      fs.readFile('./demo/demo.md', 'utf8', function(err, data) {
        auroLibraryUtils.formatFileContents(data, './demo/demo.md');
      });
    } else {
      console.log('ERROR: ./demo/demo.md file is missing');
    }
  };

  const configDemo = {
    matchWord: 'AURO-GENERATED-CONTENT',
    outputDir: './demo'
  };

  const markdownPath = './docs/partials/demo.md';

  markdownMagic(markdownPath, configDemo, callback);
}

/**
 * Compiles `./docTemplates/api.md` -> `./demo/api.md`
 */

function processApiExamples() {
  const callback = function() {
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

  const markdownPath = './docs/partials/api.md';

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

  https.get(readmeTemplateUrl, function(response) {
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
