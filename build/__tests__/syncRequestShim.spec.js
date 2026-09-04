// `build/shims/syncRequest.cjs` replaces `sync-request` inside the bundle.
// markdown-magic calls it as `request('GET', url).getBody('utf8')`, so these
// tests pin that contract: a synchronous return, sync-request's throw-on-non-2xx
// behaviour, and a body that survives the base64 round trip through the child
// process intact.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const syncRequest = require(
  path.join(testDir, "..", "shims", "syncRequest.cjs"),
);

/** @type {import('node:child_process').ChildProcess} */
let serverProcess;
/** @type {string} */
let origin;

beforeAll(async () => {
  serverProcess = spawn(
    process.execPath,
    [path.join(testDir, "fixtures", "syncRequestServer.mjs")],
    { stdio: ["ignore", "pipe", "inherit"] },
  );

  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("fixture server did not report a port")),
      10000,
    );

    serverProcess.stdout.setEncoding("utf8");
    serverProcess.stdout.on("data", (chunk) => {
      const match = chunk.match(/PORT (\d+)/u);
      if (match) {
        clearTimeout(timer);
        resolve(Number(match[1]));
      }
    });
  });

  origin = `http://127.0.0.1:${port}`;
});

afterAll(() => {
  serverProcess?.kill();
});

describe("syncRequest shim", () => {
  it("returns the body synchronously, without a promise", () => {
    const response = syncRequest("GET", `${origin}/readme.md`);

    expect(response.getBody("utf8")).toBe("# Hello\n\nutf8 ✓ body\n");
  });

  it("exposes the status code and response headers", () => {
    const response = syncRequest("GET", `${origin}/readme.md`);

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-probe"]).toBe("seen");
  });

  it("returns a Buffer when no encoding is given", () => {
    const response = syncRequest("GET", `${origin}/binary`);
    const body = response.getBody();

    expect(Buffer.isBuffer(body)).toBe(true);
    expect([...body]).toEqual([0x00, 0xff, 0x10, 0x00, 0x7f]);
  });

  it("forwards the method and request headers to the server", () => {
    const echoed = JSON.parse(
      syncRequest("GET", `${origin}/echo`, {
        headers: { "x-auro-test": "forwarded" },
      }).getBody("utf8"),
    );

    expect(echoed.method).toBe("GET");
    expect(echoed.headers["x-auro-test"]).toBe("forwarded");
  });

  it("throws from getBody on a non-2xx status, like sync-request", () => {
    const response = syncRequest("GET", `${origin}/missing`);

    // The request itself resolves; only reading the body throws.
    expect(response.statusCode).toBe(404);
    expect(() => response.getBody("utf8")).toThrowError(/status code 404/u);
  });

  it("attaches the status, headers and body to the thrown error", () => {
    const response = syncRequest("GET", `${origin}/missing`);

    try {
      response.getBody("utf8");
      expect.unreachable("getBody should have thrown on a 404");
    } catch (error) {
      expect(error.statusCode).toBe(404);
      expect(error.headers["content-type"]).toBe("text/plain");
      expect(error.body.toString("utf8")).toBe("not here");
    }
  });

  it("throws when the request itself fails", () => {
    // Port 1 is reserved and never listening, so the child's fetch rejects.
    expect(() => syncRequest("GET", "http://127.0.0.1:1/nope")).toThrowError();
  });

  it("is callable as both the module and its default export", () => {
    expect(syncRequest.default).toBe(syncRequest);
  });
});
