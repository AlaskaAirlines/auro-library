import path from 'path';
import markdownMagic from 'markdown-magic';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

import AuroLibraryUtils from "../utils/auroLibraryUtils.mjs";
import { AuroTemplateFiller } from "./auroTemplateFiller.mjs";


// Config
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const MD_MAGIC_CONFIG = {
  matchWord: 'AURO-GENERATED-CONTENT',
  outputDir: './'
};

const MD_MAGIC_CONFIG_DEMO = {
  matchWord: 'AURO-GENERATED-CONTENT',
  outputDir: './demo'
};

const auroLibraryUtils = new AuroLibraryUtils();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const docTemplateDir = './docTemplates';
const readmeFilePath = docTemplateDir + '/README.md';

const templateFiller = new AuroTemplateFiller();

// List of components that do not support ESM to determine which README to use
const nonEsmComponents = ['combobox', 'datepicker', 'menu', 'pane', 'select'];

// External assets
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function generateReadmeUrl() {
  const nameExtractionData = templateFiller.values;
  let esmString = '';

  if (!nonEsmComponents.includes(nameExtractionData.name)) {
    esmString = '_esm';
  }

  return 'https://raw.githubusercontent.com/AlaskaAirlines/WC-Generator/master/componentDocs/README' + esmString + '.md';
}

// Processors
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

async function formatApiTableAndWriteToFile(content, destination) {
  let result = content;

  result = result
    .replace(/\r\n|\r|\n####\s`([a-zA-Z]*)`/g, `\r\n#### <a name="$1"></a>\`$1\`<a href="#" style="float: right; font-size: 1rem; font-weight: 100;">back to top</a>`)
    .replace(/\r\n|\r|\n\|\s`([a-zA-Z]*)`/g, '\r\n| [$1](#$1)')
    .replace(/\| \[\]\(#\)/g, "");

  await fs.writeFile(destination, result, { encoding: 'utf8'});

  const apiDocContent = await fs.readFile('./demo/api.md', 'utf8');
  await templateFiller.formatTemplateAndWriteToFile(apiDocContent, './demo/api.md')
}

/**
 * Compiles whatever is in `./docTemplates/README.md` -> `./README.md`
 */
async function processReadme() {
  const callback = async function(updatedContent, outputConfig) {
    const readmeExists = await auroLibraryUtils.existsAsync('./README.md');
    if (readmeExists) {
      const readmeContents = await fs.readFile('./README.md', 'utf8');
      await templateFiller.formatTemplateAndWriteToFile(readmeContents, './README.md');
    } else {
      console.log('ERROR: ./README.md file is missing');
    }
  };

  const markdownPath = path.join(__dirname, './../../../../../docTemplates/README.md');
  await markdownMagic(markdownPath, MD_MAGIC_CONFIG, callback);
}

// Main Markdown magic processors
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Compiles `./docTemplates/index.md` -> `./demo/index.md`
 */
async function processDemo() {
  const callback = async function(updatedContent, outputConfig) {
    const demoIndexExists = await auroLibraryUtils.existsAsync('./demo/index.md');
    if (demoIndexExists) {
      const demoContent = await fs.readFile('./demo/index.md', 'utf8');
      await templateFiller.formatTemplateAndWriteToFile(demoContent, './demo/index.md');
    } else {
      console.log('ERROR: ./demo/index.md file is missing');
    }
  };

  const markdownPath = path.join(__dirname, './../../../../../docs/partials/index.md');
  await markdownMagic(markdownPath, MD_MAGIC_CONFIG_DEMO, callback);
}

/**
 * Compiles `./docTemplates/api.md` -> `./demo/api.md`
 */
async function processApiExamples() {
  const callback = async function(updatedContent, outputConfig) {
    const apiDemoExists = await auroLibraryUtils.existsAsync('./demo/api.md');
    if (apiDemoExists) {
      const apiMdContents = await fs.readFile('./demo/api.md', 'utf8');
      await formatApiTableAndWriteToFile(apiMdContents, './demo/api.md');
    } else {
      console.log('ERROR: ./demo/api.md file is missing');
    }
  };

  const markdownPath = path.join(__dirname, './../../../../../docs/partials/api.md');
  await markdownMagic(markdownPath, MD_MAGIC_CONFIG_DEMO, callback);
}

/**
 * Fetch upstream README copy and write to local README.md to sync all docs
 * */
async function copyReadmeLocally() {
  const docTemplateDirExists = await auroLibraryUtils.existsAsync(docTemplateDir);
  if (!docTemplateDirExists) {
    await fs.mkdir(docTemplateDir);
  }

  const existingReadme = await auroLibraryUtils.existsAsync(readmeFilePath);
  if (!existingReadme) {
    await fs.writeFile(readmeFilePath, '');
  }

  const latestReadmeContents = await fetch(generateReadmeUrl()).then(response => response.text());

  // Uncomment below when ready to write remote README.md to local README.md
  // await fs.writeFile(readmeFilePath, latestReadmeContents, { encoding: 'utf8' });
  await processReadme();
}


// Finally, the main function
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

async function main() {
  // setup
  await templateFiller.extractNames();

  // process
  await copyReadmeLocally();
  await processApiExamples();
  await processDemo();
}

main().then(() => {
  console.log('Docs generated successfully');
}).catch((error) => {
  console.error('Error generating docs', error);
});
