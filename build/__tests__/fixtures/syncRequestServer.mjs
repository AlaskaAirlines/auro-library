// Fixture server for syncRequestShim.spec.js.
//
// This runs as its own process on purpose. The shim under test uses
// `spawnSync`, which blocks its caller's event loop for the duration of the
// request -- a server listening inside the test process could never accept the
// connection, and every request would deadlock until the shim's timeout.
//
// Prints `PORT <n>` on stdout once listening, then serves until killed.

import { createServer } from "node:http";

const server = createServer((req, res) => {
  if (req.url === "/echo") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ method: req.method, headers: req.headers }));
    return;
  }

  if (req.url === "/missing") {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not here");
    return;
  }

  if (req.url === "/binary") {
    res.writeHead(200, { "content-type": "application/octet-stream" });
    res.end(Buffer.from([0x00, 0xff, 0x10, 0x00, 0x7f]));
    return;
  }

  res.writeHead(200, { "content-type": "text/markdown", "x-probe": "seen" });
  res.end("# Hello\n\nutf8 ✓ body\n");
});

server.listen(0, "127.0.0.1", () => {
  process.stdout.write(`PORT ${server.address().port}\n`);
});
