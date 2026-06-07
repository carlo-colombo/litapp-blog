import { chromium, devices } from "playwright";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(
  __dirname,
  "..",
  "editions",
  "demo",
  "output",
  "static",
);
const screenshotsDir = path.join(__dirname, "..", "screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

/**
 * Robustly find a single article and a single photo from the static output.
 */
function findDynamicPages() {
  const files = fs.readdirSync(staticDir);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));

  const articleFile =
    htmlFiles.find((f) => {
      const content = fs.readFileSync(path.join(staticDir, f), "utf8");
      return (
        !content.includes("pixelfed") &&
        !["index.html", "gallery.html", "articles.html", "404.html"].includes(f)
      );
    }) || "index.html";

  const photoFile =
    htmlFiles.find((f) => {
      const content = fs.readFileSync(path.join(staticDir, f), "utf8");
      return (
        content.includes("pixelfed") &&
        !["index.html", "gallery.html", "articles.html", "404.html"].includes(f)
      );
    }) || "index.html";

  return { articleFile, photoFile };
}

const { articleFile, photoFile } = findDynamicPages();
console.log(`Dynamic pages selected: Article: ${articleFile}, Photo: ${photoFile}`);

const app = express();
app.use(express.static(staticDir));

const server = app.listen(9021, async () => {
  console.log("Serving static blog on port 9021");

  const browser = await chromium.launch();

  const pages = [
    { name: "home", file: "index.html" },
    { name: "gallery", file: "gallery.html" },
    { name: "articles", file: "articles.html" },
    { name: "article", file: articleFile },
    { name: "photo", file: photoFile },
  ];

  const configs = [
    { name: "desktop", viewport: { width: 1280, height: 800 } },
    { name: "mobile", ...devices["iPhone 13"] },
  ];

  const summaries = {};

  for (const config of configs) {
    let summaryMarkdown = `## PR Screenshots (${config.name.charAt(0).toUpperCase() + config.name.slice(1)})\n\n`;
    summaryMarkdown +=
      "Full-page screenshots are attached as artifacts to this run.\n\n";
    summaryMarkdown += "| Page | Preview |\n| --- | --- |\n";

    const context = await browser.newContext(config);
    const page = await context.newPage();

    for (const p of pages) {
      console.log(`Capturing ${p.name} on ${config.name}...`);

      const targetUrl = `http://localhost:9021/${encodeURIComponent(p.file)}`;

      try {
        await page.goto(targetUrl, { waitUntil: "networkidle" });

        // Full page screenshot for artifact
        const screenshotPath = path.join(
          screenshotsDir,
          `${p.name}-${config.name}.jpg`,
        );
        await page.screenshot({
          path: screenshotPath,
          type: "jpeg",
          quality: 20,
          fullPage: true,
        });

        // Thumbnail for summary (above the fold)
        const thumbPath = path.join(
          screenshotsDir,
          `${p.name}-${config.name}-thumb.jpg`,
        );
        await page.screenshot({
          path: thumbPath,
          type: "jpeg",
          quality: 10,
          fullPage: false,
        });

        const base64 = fs.readFileSync(thumbPath).toString("base64");
        summaryMarkdown += `| ${p.name} | ![${p.name}](data:image/jpeg;base64,${base64}) |\n`;
      } catch (err) {
        console.error(`Failed to capture ${p.name}: ${err.message}`);
        summaryMarkdown += `| ${p.name} | ⚠️ Failed to capture |\n`;
      }
    }
    await context.close();
    summaries[config.name] = summaryMarkdown;
  }

  await browser.close();
  server.close();

  for (const [name, markdown] of Object.entries(summaries)) {
    fs.writeFileSync(path.join(screenshotsDir, `summary-${name}.md`), markdown);
  }

  // Keep summary.md for GITHUB_STEP_SUMMARY, concatenating all summaries
  const fullSummary = Object.values(summaries).join("\n\n");
  fs.writeFileSync(path.join(screenshotsDir, "summary.md"), fullSummary);

  console.log(
    `Screenshots captured successfully. Total summary size: ${Math.round(fullSummary.length / 1024)} KB`,
  );
});
