import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const staticDir = path.join(rootDir, "editions", "demo", "output", "static");

function normalize(html) {
  return html
    .replace(
      /Generated \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC/g,
      "Generated [TIMESTAMP] UTC",
    )
    .replace(/© \d{4}/g, "© [YEAR]")
    .replace(/© \[YEAR\] .+/g, "© [YEAR] [AUTHOR]")
    .replace(/litapp-blog \d+\.\d+\.\d+/g, "litapp-blog [VERSION]")
    .replace(
      /\s*<div class="mobile-gallery-slice">[\s\S]*?<\/div>\s*/g,
      '<div class="mobile-gallery-slice">[RANDOM IMAGE SLICE]</div>',
    )
    .replace(/data:[^"]{200,}/g, "data:[DATA URI]");
}

test("HTML generation snapshots", async (t) => {
  // Build the blog first
  console.log("Building blog for HTML tests...");
  execSync("yarn build-blog", { stdio: "inherit", cwd: rootDir });

  const pages = [
    { name: "home", path: "index.html" },
    { name: "articles", path: "articles.html" },
    { name: "gallery", path: "gallery.html" },
    { name: "post", path: "Test Post 1.html" },
    {
      name: "photo",
      path: "Laghetto Villa Reale, Monza #duck #microfourthirds #monza #gloomy #lake #foggymorning.html",
    },
    { name: "picture-tag", path: "picture-tag/cross.html" },
    { name: "404", path: "404.html" },
  ];

  for (const page of pages) {
    await t.test(`Snapshot for ${page.name}`, (t) => {
      const filePath = path.join(staticDir, page.path);
      assert.ok(
        fs.existsSync(filePath),
        `${page.path} should exist at ${filePath}`,
      );
      const content = fs.readFileSync(filePath, "utf-8");
      if (page.name === "404") {
        assert.ok(
          content.includes("404 - Page Not Found"),
          "404 page should have correct title",
        );
        assert.ok(
          content.includes("Explore by Tags"),
          "404 page should have tag cloud",
        );
        // We don't snapshot 404 because it's random
      } else {
        t.assert.snapshot(normalize(content));
      }
    });
  }
});
