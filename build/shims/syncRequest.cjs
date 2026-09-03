// Bundle-safe stand-in for `sync-request`.
//
// Why this exists: markdown-magic reaches `sync-request` through
// `markdown-magic/lib/utils/remoteRequest.js`, and `sync-request` delegates to
// `sync-rpc`, which calls `require.resolve('./worker')` at module load time.
// Inside a bundle that resolves relative to the *output* file, so it throws
// `Cannot find module './worker'`. markdown-magic loads that path eagerly
// (lib/transforms/index.js -> code.js -> remoteRequest.js), so it breaks on a
// normal run, not just when a remote transform is used.
//
// `remoteRequest.js` only ever does `request('GET', url).getBody('utf8')`, so we
// reimplement that narrow contract on top of `fetch` in a child process to keep
// the synchronous signature. This also drops the whole sync-rpc/then-request
// tree from the bundle.

const { spawnSync } = require("node:child_process");

// Runs in a child process. Reads the request off argv and emits a single JSON
// line so the parent can rebuild a sync-request-shaped response.
const CHILD_SOURCE = `
const [method, url, headersJson] = process.argv.slice(1);
fetch(url, { method, headers: JSON.parse(headersJson), redirect: 'follow' })
  .then(async (res) => {
    const buf = Buffer.from(await res.arrayBuffer());
    process.stdout.write(JSON.stringify({
      ok: true,
      statusCode: res.status,
      headers: Object.fromEntries(res.headers),
      bodyBase64: buf.toString('base64')
    }));
  })
  .catch((err) => {
    process.stdout.write(JSON.stringify({ ok: false, message: err && err.message ? err.message : String(err) }));
  });
`;

const DEFAULT_TIMEOUT_MS = 30000;
const MAX_BUFFER_BYTES = 64 * 1024 * 1024;

/**
 * Synchronously perform an HTTP request.
 * @param {string} method - HTTP method, e.g. `GET`.
 * @param {string} url - Absolute URL to request.
 * @param {object} [options] - Subset of sync-request options that we support.
 * @param {Record<string, string>} [options.headers] - Request headers.
 * @param {number} [options.timeout] - Timeout in milliseconds.
 * @returns {{statusCode: number, headers: Record<string, string>, body: Buffer, getBody: (encoding?: string) => (string | Buffer)}}
 */
function request(method, url, options = {}) {
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      CHILD_SOURCE,
      String(method || "GET"),
      String(url),
      JSON.stringify(options.headers || {}),
    ],
    {
      encoding: "utf8",
      timeout: options.timeout || DEFAULT_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER_BYTES,
    },
  );

  if (result.error) {
    throw result.error;
  }

  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch {
    throw new Error(
      `sync-request shim: could not parse child response for ${url}. stderr: ${result.stderr || "(none)"}`,
    );
  }

  if (!payload.ok) {
    throw new Error(payload.message);
  }

  const body = Buffer.from(payload.bodyBase64, "base64");

  return {
    statusCode: payload.statusCode,
    headers: payload.headers,
    body,

    /**
     * Mirrors sync-request: throws on a non-2xx status, otherwise returns the
     * body as a string when an encoding is given and a Buffer when it is not.
     * @param {string} [encoding] - Encoding to decode the body with.
     * @returns {string | Buffer}
     */
    getBody(encoding) {
      if (payload.statusCode >= 300) {
        const err = new Error(
          `Server responded to ${method} ${url} with status code ${payload.statusCode}:\n${body.toString("utf8")}`,
        );
        err.statusCode = payload.statusCode;
        err.headers = payload.headers;
        err.body = body;
        throw err;
      }

      return encoding ? body.toString(encoding) : body;
    },
  };
}

module.exports = request;
module.exports.default = request;
