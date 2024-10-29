/* eslint-disable no-unused-vars */

import {describe, it, beforeEach, afterAll, expect} from 'vitest';
import {mkdir, writeFile, access, rm, readFile} from 'node:fs/promises';

import {optionallyCopyFile} from "../../sharedFileProcessorUtils.mjs";

const workingDir = './tmp/optionallyCopyFile';

const mockFileData = `
# Mock File Data
---
- item 1
- item 2
- item 3

\`\`\`html
<my-component></my-component>
\`\`\`
`;

const alternateData = `#Some other MD data`;

const fileData = {
  mockInput: `${workingDir}/mockInput.md`,
  mockOutput: `${workingDir}/mockOutput.md`,
};

/**
 * @param {string} filePath - The file path to check.
 * @returns {Promise<boolean>}
 */
async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch (_err) {
    return false;
  }
}

describe('optionallyCopyFile', () => {
  beforeEach(async () => {
    if (!await exists(workingDir)) {
      await mkdir(workingDir, {
        recursive: true
      });
    }

    if (!await exists(fileData.mockInput)) {
      await writeFile(fileData.mockInput, mockFileData);
    }

    if (await exists(fileData.mockOutput)) {
      await rm(fileData.mockOutput);
    }

    await writeFile(fileData.mockOutput, alternateData);
  });

  afterAll(async () => {
    if (await exists(workingDir)) {
      await rm(workingDir, {
        recursive: true,
        force: true
      });
    }
  });

  it('should copy file even if output exists (by default)', async () => {
    await optionallyCopyFile(fileData.mockInput, fileData.mockOutput);

    const fileContents = (await readFile(fileData.mockOutput)).toString();
    expect(fileContents).toEqual(mockFileData);
  });

  describe('when passing `overwrite: false` flag', () => {
    it('should still copy the file when file is missing', async () => {
      await rm(fileData.mockOutput);
      // Pass overwrite flag so copy doesn't get made
      await optionallyCopyFile(fileData.mockInput, fileData.mockOutput, false);

      // Overwrite SHOULD be made even though `false` is passed
      const fileContents = (await readFile(fileData.mockOutput)).toString();
      expect(fileContents).toEqual(mockFileData);
    });

    it('should NOT copy the file when file exists', async () => {
      // Pass overwrite flag so copy doesn't get made
      await optionallyCopyFile(fileData.mockInput, fileData.mockOutput, false);

      // Overwrite should not be made
      const fileContents = (await readFile(fileData.mockOutput)).toString();
      expect(fileContents).toEqual(alternateData);
    });
  });
});
