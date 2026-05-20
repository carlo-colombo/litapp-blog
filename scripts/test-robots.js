import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const robotsPath = path.join(
  rootDir,
  "editions",
  "demo",
  "output",
  "static",
  "robots.txt",
);

test("Robots.txt generation", async (t) => {
  await t.test("Build blog", () => {
    // Always build to ensure we are testing the latest changes
    execSync("yarn build-blog", { stdio: "inherit", cwd: rootDir });
  });

  await t.test("Verify robots.txt existence and content", () => {
    assert.strictEqual(
      fs.existsSync(robotsPath),
      true,
      "robots.txt does not exist",
    );
    const content = fs.readFileSync(robotsPath, "utf-8");
    assert.notStrictEqual(content.length, 0, "robots.txt is empty");

    assert.ok(content.includes("User-agent: *"), "Missing User-agent");
    assert.ok(content.includes("Allow: /"), "Missing Allow: /");
    assert.ok(content.includes("Sitemap:"), "Missing Sitemap keyword");
    assert.ok(content.includes("/sitemap.xml"), "Missing /sitemap.xml");

    // Ensure no TiddlyWiki artifacts like backticks or other formatting
    assert.ok(!content.includes("`"), "Contains unexpected backticks");
  });
});
