import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const rssPath = path.join(
  rootDir,
  "editions",
  "demo",
  "output",
  "static",
  "rss.xml",
);

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

  // 1. Validate XML Well-formedness
  console.log("Validating XML well-formedness...");
  const validationResult = XMLValidator.validate(content);
  if (validationResult !== true) {
    throw new Error(
      `XML validation failed: ${validationResult.err.msg} at line ${validationResult.err.line}, col ${validationResult.err.col}`,
    );
  }

  // 2. Parse and check structure
  console.log("Parsing RSS content...");
  const parser = new XMLParser();
  const jObj = parser.parse(content);

  const channel = jObj.rss?.channel;
  if (!channel) {
    throw new Error("rss.xml is missing <channel> tag");
  }

  if (channel.title !== "Litapp Blog") {
    throw new Error(`Unexpected channel title: ${channel.title}`);
  }

  const items = Array.isArray(channel.item) ? channel.item : [channel.item];

  const findItemByTitle = (title) => items.find((i) => i.title === title);

  if (!findItemByTitle("Test Post 1")) {
    throw new Error("rss.xml does not contain Test Post 1");
  }

  const ampItem = findItemByTitle("Test & Ampersand");
  if (!ampItem) {
    throw new Error("rss.xml does not contain 'Test & Ampersand'");
  }
  if (
    ampItem.description !== "This is a test post with & in title and description."
  ) {
    throw new Error(
      `Description mismatch for 'Test & Ampersand': ${ampItem.description}`,
    );
  }

  const specialItem = findItemByTitle('Test <Tag> & "Quote"');
  if (!specialItem) {
    throw new Error("rss.xml does not contain 'Test <Tag> & \"Quote\"'");
  }

  console.log("RSS generation test passed!");
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
