import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import test from "node:test";
import assert from "node:assert";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const sitemapPath = path.join(
  rootDir,
  "editions",
  "demo",
  "output",
  "static",
  "sitemap.xml",
);

test("Sitemap generation", async (t) => {
  await t.test("Build blog", () => {
    // We assume build-blog was already run by rss test if run together,
    // but for independence we can run it here too.
    // However, if we run them together with node --test, they might run in parallel.
    // yarn build-blog cleans the output dir, which might cause issues if run in parallel.
    // For now, let's just ensure it exists, or run it.
    if (!fs.existsSync(sitemapPath)) {
      execSync("yarn build-blog", { stdio: "inherit", cwd: rootDir });
    }
  });

  await t.test("Verify sitemap.xml existence and content", () => {
    assert.strictEqual(
      fs.existsSync(sitemapPath),
      true,
      "sitemap.xml does not exist",
    );
    const content = fs.readFileSync(sitemapPath, "utf-8");
    assert.notStrictEqual(content.length, 0, "sitemap.xml is empty");

    // 1. Validate XML Well-formedness
    const validationResult = XMLValidator.validate(content);
    assert.strictEqual(
      validationResult,
      true,
      validationResult !== true
        ? `XML validation failed: ${validationResult.err.msg} at line ${validationResult.err.line}, col ${validationResult.err.col}`
        : "",
    );

    // 2. Parse and check structure
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    const jObj = parser.parse(content);

    const urlset = jObj.urlset;
    assert.ok(urlset, "sitemap.xml is missing <urlset> tag");
    assert.strictEqual(
      urlset["@_xmlns"],
      "http://www.sitemaps.org/schemas/sitemap/0.9",
    );

    const urls = Array.isArray(urlset.url) ? urlset.url : [urlset.url];
    const locs = urls.map((u) => u.loc);

    // Check for some expected URLs (based on demo edition)
    // We need to know the SiteBaseUrl. In demo it might be empty or something specific.
    // Let's check config.tid or similar.

    assert.ok(
      locs.some((l) => l.endsWith("/")),
      "Missing root URL",
    );
    assert.ok(
      locs.some((l) => l.endsWith("/articles.html")),
      "Missing articles.html",
    );
    assert.ok(
      locs.some((l) => l.endsWith("/gallery.html")),
      "Missing gallery.html",
    );
    assert.ok(
      locs.some((l) => l.endsWith("/Test%20Post%201.html")),
      "Missing Test Post 1.html",
    );
  });
});
