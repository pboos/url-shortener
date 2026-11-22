import { spawn } from "node:child_process";
import assert from "node:assert/strict";

export function testServer(defaultPort) {
  const port = Number(process.env.TEST_PORT || defaultPort);
  assert(Number.isInteger(port) && port > 1024 && port < 65536);
  const origin = `http://127.0.0.1:${port}`;
  const token = "local-integration-bootstrap-token";
  let server;
  let output = "";
  async function start(
    database,
    { trustProxy = false, rootRedirectUrl = "" } = {},
  ) {
    output = "";
    server = spawn(process.execPath, [".next/standalone/server.js"], {
      env: {
        ...process.env,
        HOSTNAME: "127.0.0.1",
        PORT: String(port),
        PUBLIC_BASE_URL: origin,
        ROOT_REDIRECT_URL: rootRedirectUrl,
        DATABASE_PATH: database,
        SETUP_TOKEN: token,
        TRUST_PROXY: String(trustProxy),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    server.stdout.on("data", (chunk) => (output += chunk));
    server.stderr.on("data", (chunk) => (output += chunk));
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null || server.signalCode !== null)
        throw new Error(output);
      try {
        if (output.includes("Ready") && (await fetch(`${origin}/api/setup`)).ok)
          return;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error(`Server did not become ready: ${output}`);
  }
  async function stop() {
    if (!server || server.exitCode !== null || server.signalCode !== null)
      return;
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill("SIGTERM");
    await exited;
  }
  return { origin, token, start, stop };
}
