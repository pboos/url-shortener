import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import jsQR from "jsqr";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { testServer } from "./test-server.mjs";

const { origin, token, start, stop } = testServer(3198);
const directory = await mkdtemp(path.join(tmpdir(), "shortener-browser-"));
let browser;

try {
  await start(path.join(directory, "test.db"));
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
  });
  const context = await browser.newContext({
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  await page.goto(origin + "/admin");
  await page.getByLabel("Username").fill("editor");
  await page
    .getByLabel("Password", { exact: true })
    .fill("browser-test-password");
  await page.locator("input[name=token]").fill(token);
  await page.getByRole("button", { name: "Create account" }).click();
  await page
    .getByRole("button", { name: "Create link", exact: true })
    .first()
    .click();
  await page
    .locator("input[name=url]")
    .fill("https://example.org/studio/guide");
  await page.getByLabel("Short link key").fill("studio-guide");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create link" })
    .click();
  await page.getByRole("button", { name: "Copy short URL" }).click();
  const shortUrl = origin + "/studio-guide";
  assert.equal(
    await page.evaluate(() => navigator.clipboard.readText()),
    shortUrl,
  );
  await page.getByRole("searchbox").fill("absent-destination");
  await page.getByText("No matching links").waitFor();
  await page.getByRole("searchbox").fill("studio/guide");
  await page.getByRole("link", { name: "Manage studio-guide" }).click();
  await page.getByLabel("Dot style").selectOption("dots");
  const logo = new PNG({ width: 30, height: 30 });
  logo.data.fill(255);
  for (let i = 0; i < logo.data.length; i += 4) logo.data[i] = 20;
  await page.getByLabel("Upload logo").setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: PNG.sync.write(logo),
  });
  await page.getByRole("button", { name: "Remove logo" }).waitFor();
  await page.getByRole("button", { name: "Save design" }).click();
  await page.getByText("Design saved.").waitFor();
  await page.reload();
  await page.getByRole("button", { name: "Remove logo" }).waitFor();
  assert.equal(await page.getByLabel("Dot style").inputValue(), "dots");
  await page.getByLabel("Download format").selectOption("png");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const png = PNG.sync.read(await readFile(await (await download).path()));
  assert.equal(
    jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data,
    shortUrl,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.getByRole("button", { name: "Delete link", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete link" })
    .click();
  await page.getByText("No links yet").waitFor();
  console.log(
    "Browser verification passed, including setup, search, copy, mobile deletion and decoding the customized QR download.",
  );
} finally {
  await browser?.close();
  await stop();
  await rm(directory, { recursive: true, force: true });
}
