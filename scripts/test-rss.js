import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const rssPath = path.join(rootDir, "editions", "demo", "output", "static", "rss.xml");

async function runTest() {
  console.log("Building blog...");
  execSync("yarn build-blog", { stdio: "inherit", cwd: rootDir });

  console.log("Verifying rss.xml...");
  if (!fs.existsSync(rssPath)) {
    throw new Error("rss.xml does not exist");
  }

  const content = fs.readFileSync(rssPath, "utf-8");

  if (content.length === 0) {
    throw new Error("rss.xml is empty");
  }

  if (!content.includes("<rss version=\"2.0\"")) {
    throw new Error(`rss.xml does not contain <rss version="2.0". Content:\n${content}`);
  }

  if (!content.includes("<title>Litapp Blog</title>")) {
    throw new Error(`rss.xml does not contain correct title. Content:\n${content}`);
  }

  if (!content.includes("<item>")) {
    throw new Error(`rss.xml does not contain any items. Content:\n${content}`);
  }

  if (!content.includes("<title>Test Post 1</title>")) {
    throw new Error(`rss.xml does not contain Test Post 1. Content:\n${content}`);
  }

  console.log("RSS generation test passed!");
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
