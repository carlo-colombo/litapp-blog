import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import test from "node:test";
import assert from "node:assert";

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

test("RSS generation", async (t) => {
  await t.test("Build blog", () => {
    execSync("yarn build-blog", { stdio: "inherit", cwd: rootDir });
  });

  await t.test("Verify rss.xml existence and content", () => {
    assert.strictEqual(fs.existsSync(rssPath), true, "rss.xml does not exist");
    const content = fs.readFileSync(rssPath, "utf-8");
    assert.notStrictEqual(content.length, 0, "rss.xml is empty");

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
    const parser = new XMLParser();
    const jObj = parser.parse(content);

    const channel = jObj.rss?.channel;
    assert.ok(channel, "rss.xml is missing <channel> tag");
    assert.strictEqual(
      channel.title,
      "Litapp Blog",
      `Unexpected channel title: ${channel.title}`,
    );

    const items = Array.isArray(channel.item) ? channel.item : [channel.item];
    const findItemByTitle = (title) => items.find((i) => i.title === title);

    assert.ok(findItemByTitle("Test Post 1"), "rss.xml does not contain Test Post 1");

    const ampItem = findItemByTitle("Test & Ampersand");
    assert.ok(ampItem, "rss.xml does not contain 'Test & Ampersand'");
    assert.strictEqual(
      ampItem.description,
      "<p><p>Content of the test post.\n</p></p>",
      `Description mismatch for 'Test & Ampersand': ${ampItem.description}`,
    );

    const specialItem = findItemByTitle('Test <Tag> & "Quote"');
    assert.ok(specialItem, "rss.xml does not contain 'Test <Tag> & \"Quote\"'");

    // 3. Validate pubDate format (RFC-822)
    // Example: Sat, 28 Mar 2026 23:57:54 GMT
    // We check for: DayName, Day MonthName Year Time Zone
    // MonthName must be 3 characters.
    const rfc822Regex = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/;
    items.forEach((item) => {
      assert.ok(
        rfc822Regex.test(item.pubDate),
        `pubDate "${item.pubDate}" in item "${item.title}" does not match RFC-822 format (expected: Sat, 28 Mar 2026 23:57:54 GMT)`,
      );
    });
  });
});
