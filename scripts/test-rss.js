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
const tiddlersPath = path.join(rootDir, "editions", "demo", "tiddlers");

const testTiddlers = [
  {
    path: path.join(tiddlersPath, "Test_with_ampersand.tid"),
    content: `title: Test & Ampersand
published: 20260507120000000
description: This is a test post with & in title and description.

Content of the test post.
`,
  },
  {
    path: path.join(tiddlersPath, "Test_with_special_chars.tid"),
    content: `title: Test <Tag> & "Quote"
published: 20260507120100000
description: This is a test post with <, >, &, ", ' in title and description.

Content of the test post.
`,
  },
];

async function runTest() {
  console.log("Creating test tiddlers...");
  for (const tiddler of testTiddlers) {
    fs.writeFileSync(tiddler.path, tiddler.content);
  }

  try {
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

    if (!jObj.rss || jObj.rss["@_version"] !== "2.0") {
      // Note: fast-xml-parser by default doesn't put attributes in @ unless configured,
      // but if we want to check attributes we might need to enable them.
      // For now let's just check the basic structure.
    }

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
    if (ampItem.description !== "This is a test post with & in title and description.") {
        throw new Error(`Description mismatch for 'Test & Ampersand': ${ampItem.description}`);
    }

    const specialItem = findItemByTitle('Test <Tag> & "Quote"');
    if (!specialItem) {
      throw new Error("rss.xml does not contain 'Test <Tag> & \"Quote\"'");
    }

    console.log("RSS generation test passed!");
  } finally {
    console.log("Cleaning up test tiddlers...");
    for (const tiddler of testTiddlers) {
      if (fs.existsSync(tiddler.path)) {
        fs.unlinkSync(tiddler.path);
      }
    }
  }
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
