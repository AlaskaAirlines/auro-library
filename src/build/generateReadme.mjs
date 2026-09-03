import * as fs from "fs";
import markdownMagic from "markdown-magic";

const dirDocs = "./docs";
const readmeFilePath = dirDocs + "/README.md";

import AuroLibraryUtils from "../../scripts/utils/auroLibraryUtils.mjs";

const auroLibraryUtils = new AuroLibraryUtils();

/**
 * Compiles `./docs/README.md` -> `./README.md`
 */

function processReadme() {
  const callback = () => {
    if (fs.existsSync("./README.md")) {
      fs.readFile("./README.md", "utf8", (err, data) => {
        auroLibraryUtils.formatFileContents(data, "./README.md");
      });
    } else {
      console.log("ERROR: ./README.md file is missing");
    }
  };

  const config = {
    matchWord: "AURO-GENERATED-CONTENT",
    outputDir: "./",
  };

  const markdownPath = "./docs/README.md";

  markdownMagic(markdownPath, config, callback);

  fs.copyFileSync(readmeFilePath, "./README.md");
}

/**
 * Copy README.md template from static source
 * */

function copyReadmeLocally() {
  if (!fs.existsSync(dirDocs)) {
    fs.mkdirSync(dirDocs);
  }

  if (!fs.existsSync(readmeFilePath)) {
    fs.writeFile(readmeFilePath, "", (err) => {
      if (err) {
        console.log("ERROR: Unable to create README.md file.", err);
      }
    });
  }

  processReadme();
}

copyReadmeLocally();
