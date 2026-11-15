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
    {
      name: "multi-photo",
      path: "Demo multi-photo story #multi-photo #photography.html",
    },
    {
      name: "split-photo-1",
      path: "Demo split story #split #multi-photo.html",
    },
    {
      name: "split-photo-2",
      path: "Demo split story #split #multi-photo /2.html",
    },
    { name: "picture-tag", path: "picture-tag/cross.html" },
    { name: "multi-photo-tag", path: "picture-tag/multi-photo.html" },
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

  await t.test("multi-photo and split-photo rendering", () => {
    const detailPath = path.join(
      staticDir,
      "Demo multi-photo story #multi-photo #photography.html",
    );
    const detail = fs.readFileSync(detailPath, "utf-8");
    const imageURLs = [
      "https://litapp-blog-images.s3.nl-ams.scw.cloud/images/04bb984786fc6f5057234dbab3e4bf99d9c88c6669bac3b551ce6cb67b622a54",
      "https://litapp-blog-images.s3.nl-ams.scw.cloud/images/31631ffd-f124-40d8-8f52-c31c824940f2.jpg",
      "https://litapp-blog-images.s3.nl-ams.scw.cloud/images/27e9da1ada21dc42aadbbd5bb3e04e8a1ce9232015c5bf74a386da480bd42828",
    ];
    const entryImages = detail.match(
      /<div class="entry-images">([\s\S]*?)<\/div>/,
    )?.[1];
    assert.ok(entryImages, "detail page should render its photo group");
    const imagePositions = imageURLs.map((url) => entryImages.indexOf(url));
    assert.ok(
      imagePositions.every((position) => position >= 0),
      "detail page should render every photo",
    );
    assert.deepEqual(
      imagePositions,
      [...imagePositions].sort((a, b) => a - b),
      "detail photos should retain source order",
    );
    assert.equal(
      (entryImages.match(/class="full-image"/g) || []).length,
      3,
      "normal multi-photo detail should show all three photos",
    );
    assert.ok(
      detail.includes("View on Pixelfed"),
      "detail page should preserve the Pixelfed link",
    );
    assert.ok(
      detail.includes("Three photos from one Pixelfed post."),
      "detail page should preserve the caption",
    );
    assert.ok(
      detail.includes("11 May 2026"),
      "detail page should preserve the post date",
    );
    assert.ok(
      detail.includes('href="/picture-tag/multi-photo.html"'),
      "detail page should preserve its tags",
    );

    const splitPages = [
      {
        path: "Demo split story #split #multi-photo.html",
        image:
          "https://litapp-blog-images.s3.nl-ams.scw.cloud/images/31631ffd-f124-40d8-8f52-c31c824940f2.jpg",
      },
      {
        path: "Demo split story #split #multi-photo /2.html",
        image:
          "https://litapp-blog-images.s3.nl-ams.scw.cloud/images/27e9da1ada21dc42aadbbd5bb3e04e8a1ce9232015c5bf74a386da480bd42828",
      },
    ];
    for (const splitPage of splitPages) {
      const html = fs.readFileSync(
        path.join(staticDir, splitPage.path),
        "utf-8",
      );
      assert.ok(
        html.includes(splitPage.image),
        `${splitPage.path} should render its own photo`,
      );
      assert.equal(
        (html.match(/class="full-image"/g) || []).length,
        1,
        `${splitPage.path} should render one photo`,
      );
    }

    const expectedGalleryHref =
      "/Demo%20multi-photo%20story%20%23multi-photo%20%23photography.html";
    for (const galleryPath of [
      "index.html",
      "gallery.html",
      "picture-tag/multi-photo.html",
    ]) {
      const html = fs.readFileSync(path.join(staticDir, galleryPath), "utf-8");
      const gallery = html.slice(html.indexOf('class="gallery-grid"'));
      assert.equal(
        (gallery.match(new RegExp(`href="${expectedGalleryHref}"`, "g")) || [])
          .length,
        3,
        `${galleryPath} should link the primary photo and both thumbnails to the canonical detail page`,
      );
      assert.ok(
        gallery.includes("gallery-item-thumbnails"),
        `${galleryPath} should group secondary thumbnails in the item`,
      );
      assert.ok(
        gallery.includes(
          "https://litapp-blog-images.s3.nl-ams.scw.cloud/thumbs/69958e11-6776-45b6-8873-b09a649a891e.jpg",
        ) &&
          gallery.includes(
            "https://litapp-blog-images.s3.nl-ams.scw.cloud/thumbs/27e9da1ada21dc42aadbbd5bb3e04e8a1ce9232015c5bf74a386da480bd42828",
          ),
        `${galleryPath} should render both secondary photo thumbnails`,
      );
    }
  });
});
