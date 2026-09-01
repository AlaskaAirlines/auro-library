/* eslint-disable no-unused-vars */

import { describe, it, beforeAll, afterAll, expect, afterEach } from "vitest";
import { mkdir, writeFile, access, rm, readFile } from "node:fs/promises";

import { runMarkdownMagicOnFile } from "../../sharedFileProcessorUtils.mjs";

const workingDir = "./tmp/runMarkdownMagicOnFile";
const mockReadmeFile = `${workingDir}/mockReadme.md`;
const mockTemplateFile = `${workingDir}/mockTemplate.md`;
// Force Windows path style (\)
const windowsPathStyleOutputDir = mockReadmeFile.replace(/\//gu, "\\");
const mockMdMagicConfig = {
  output: {
    directory: workingDir,
  },
};
const mockReadmeFileData = `
<!-- AURO-GENERATED-CONTENT:START (FILE:src=./mockTemplate.md) -->
This content should be dynamically replaced
<!-- AURO-GENERATED-CONTENT:END -->
`;
const mockTemplateFileData = "This is the new content";
const expectedFileData = `
<!-- AURO-GENERATED-CONTENT:START (FILE:src=./mockTemplate.md) -->
<!-- The below content is automatically added from ./mockTemplate.md -->
This is the new content
<!-- AURO-GENERATED-CONTENT:END -->
`;

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

/**
 *
 * @param {string} dir - Mock directory to be created.
 * @param {string} filePath - File path to be created.
 * @param {string} fileData - Data to be written inside the mock file.
 */
const createMockfiles = async (dir, filePath, fileData) => {
  if (!await exists(dir)) {
    await mkdir(dir, {
      recursive: true,
    });
  }

  if (!await exists(filePath)) {
    await writeFile(filePath, fileData);
  }
};

describe("runMarkdownMagicOnFile", () => {
  beforeAll(async () => {
    await createMockfiles(workingDir, mockReadmeFile, mockReadmeFileData);
    await createMockfiles(workingDir, mockTemplateFile, mockTemplateFileData);
  });
  afterEach(async () => {
    await writeFile(mockReadmeFile, mockReadmeFileData);
  });

  afterAll(async () => {
    if (await exists(workingDir)) {
      await rm(workingDir, {
        recursive: true,
        force: true,
      });
    }
  });

  it("should not replace file content if output is using Windows path style", async () => {
    await runMarkdownMagicOnFile(windowsPathStyleOutputDir, mockMdMagicConfig);

    const fileContents = (await readFile(mockReadmeFile)).toString();
    // If we are suing windows path styles the output result should not be the same as the expected result
    expect(fileContents).not.toEqual(expectedFileData);
    // Instead it should return the data exactly as it was before
    expect(fileContents).toEqual(mockReadmeFileData);
  });

  it("should replace file content if output is using Unix path style", async () => {
    await runMarkdownMagicOnFile(mockReadmeFile, mockMdMagicConfig);

    const fileContents = (await readFile(mockReadmeFile)).toString();
    expect(fileContents).toEqual(expectedFileData);
  });
});
