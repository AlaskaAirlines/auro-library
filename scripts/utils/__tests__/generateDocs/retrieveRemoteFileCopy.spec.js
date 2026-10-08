import { access, readFile, rm } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";

// Import the source, not the shim in scripts/, so the suite exercises the real
// implementation rather than requiring a dist/ build first.
import { retrieveRemoteFileCopy } from "../../../../src/utils/sharedFileProcessorUtils.mjs";

const workingDir = "./tmp/retrieveRemoteFileCopy";
const fileName = `${workingDir}/README.md`;
const remoteUrl = "https://example.com/README.md";

describe("retrieveRemoteFileCopy", () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    await rm(workingDir, { recursive: true, force: true });
  });

  it("should write the remote contents to the local file", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("# {{ capitalize name }}")),
    );

    await retrieveRemoteFileCopy({ remoteUrl, fileName });

    expect(await readFile(fileName, "utf8")).toBe("# {{ capitalize name }}");
  });

  it("should throw and write nothing when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("404: Not Found", {
          status: 404,
          statusText: "Not Found",
        }),
      ),
    );

    await expect(
      retrieveRemoteFileCopy({ remoteUrl, fileName }),
    ).rejects.toThrow(`${remoteUrl}: HTTP 404 Not Found`);
    await expect(access(fileName)).rejects.toThrow();
  });
});
