import http from "node:http";
import os from "node:os";
import * as esbuild from "esbuild";
import serveHandler from "serve-handler";

const DEFAULT_SERVE_PORT = 8000;
const ESBUILD_SERVE_PORT = 9000;

let ctx = await esbuild.context({
  entryPoints: ["example/index.tsx"],
  bundle: true,
  outdir: "example/dist",
  logLevel: "warning",
});

await ctx.watch();

let { host, port } = await ctx.serve({
  servedir: "example",
  port: ESBUILD_SERVE_PORT,
});

const server = http.createServer((req, res) => {
  if (req.url.includes("/audio/")) {
    // Serve audio with correct mime type
    serveHandler(req, res, { public: "example" });
  } else {
    // Forward request to esbuild
    const options = {
      hostname: host,
      port: port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      // If esbuild returns "not found", send a custom 404 page
      if (proxyRes.statusCode === 404) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>Not Found</h1>");
        return;
      }

      // Otherwise, forward the response from esbuild to the client
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    // Forward the body of the request to esbuild
    req.pipe(proxyReq, { end: true });
  }
});

server.addListener("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(
      "Port %d is already in use. Trying another port.",
      DEFAULT_SERVE_PORT
    );
    setTimeout(() => {
      server.listen(0);
    }, 1000);
  } else {
    console.error(err.toString());
    server.close();
  }
});

server.addListener("listening", () => {
  const { port } = server.address();
  printServerAddresses(port);
});

server.listen(DEFAULT_SERVE_PORT);

function printServerAddresses(port) {
  const lines = [];
  for (const { address, internal } of getIP4Interfaces()) {
    lines.push(
      ` > ${internal ? "Local:  " : "Network:"} http://${address}:${port}`
    );
  }
  console.log("\n" + lines.join("\n") + "\n");
}

function getIP4Interfaces() {
  let result = [];
  for (const ifaces of Object.values(os.networkInterfaces())) {
    result = result.concat(ifaces.filter((iface) => iface.family === "IPv4"));
  }
  return result;
}
