# AGENTS.md

## Project overview

Litapp Blog is a TiddlyWiki 5.3.5 static site generator and demo blog. Content is stored as tiddlers in `editions/demo/tiddlers/`; rendering logic, templates, styles, and build commands live in `plugins/litapp/blog/`. Node.js scripts in `scripts/` build and test the generated site.

The repository is an ES module package (`"type": "module"`) using Yarn and Node's built-in test runner. Keep changes focused on source files; `editions/demo/output/` is generated output and must not be edited manually.

## Repository layout

- `plugins/litapp/blog/templates/` — TiddlyWiki `.tid` page and component templates.
- `plugins/litapp/blog/styles/` — CSS and CSS bundle tiddlers.
- `plugins/litapp/blog/build.txt` — static render command definitions.
- `plugins/litapp/blog/config.tid` — plugin configuration.
- `editions/demo/tiddlers/` — sample posts, pictures, tags, and configuration tiddlers.
- `editions/demo/tiddlywiki.info` — demo edition configuration.
- `editions/demo/output/` — generated TiddlyWiki and static blog output.
- `scripts/` — development, build maintenance, screenshot, and test scripts.
- `scripts/test-html.js.snapshot` — HTML snapshot data.
- `.github/workflows/publish.yml` — CI tests, screenshots, build, and Pages deployment.

## Install and development

Use the committed Yarn lockfile and prefer Yarn commands in this repository.

```bash
yarn install
yarn dev
```

`yarn dev` starts TiddlyWiki and the static preview. The wiki normally listens on port `8080`; the static preview is served on `http://localhost:9021`. The watcher observes `plugins` and `editions`, rebuilds after changes, and sends reload notifications through `/blog-build`.

Stop the development process with `Ctrl-C`. Do not start a second process on port `9021` while screenshot tooling or another preview is running.

## Build commands

- `yarn build-blog` cleans and renders the static blog into `editions/demo/output/static/`.
- `yarn build` builds the standalone demo TiddlyWiki `index.html`.
- `yarn clean` removes generated static output; use it only when a clean build is intended.
- `yarn tw <args>` invokes the local TiddlyWiki CLI.
- `yarn set-plugin-version [version]` updates `plugins/litapp/blog/plugin.info` from the package version or an optional version argument.

`build-blog` sets `TIDDLYWIKI_PLUGIN_PATH=./plugins` and creates the collections output directory before rendering. Preserve that behavior when changing build commands.

## Tests and formatting

Run the complete suite with:

```bash
yarn test
```

This expands to Node's test runner over `scripts/test-*.js` with experimental snapshot support. Tests cover generated HTML, RSS, sitemap, and robots.txt output. Individual test files can be run with:

```bash
node --test --experimental-test-snapshots scripts/test-html.js
node --test --experimental-test-snapshots scripts/test-rss.js
```

Run one named test or subtest with Node's `--test-name-pattern`:

```bash
node --test --experimental-test-snapshots --test-name-pattern="HTML generation snapshots" scripts/test-html.js
node --test --experimental-test-snapshots --test-name-pattern="Snapshot for home" scripts/test-html.js
```

Tests frequently invoke `yarn build-blog` themselves. Avoid running build-based test files concurrently when they clean the same output directory. Run formatting with `yarn prettier`; the configured script targets `plugins`, `src`, and `scripts` (the `src` path may not currently exist). There is no separate lint script or TypeScript compiler configured.

## Snapshot workflow

HTML tests normalize timestamps, years, versions, random gallery slices, and long data URIs before comparing snapshots. If intended HTML changes, first run the relevant test and inspect the rendered output. Only then regenerate snapshots:

```bash
node --test --experimental-test-snapshots --test-update-snapshots scripts/test-html.js
yarn test
```

Do not update snapshots merely to make a failing test pass. Check all changed snapshots for unintended navigation, whitespace, metadata, or escaping changes.

## JavaScript style

- Use modern ECMAScript modules and `import`/`export`; do not introduce CommonJS `require` in new code.
- Prefer built-in `node:` specifiers for Node modules, as used by the test scripts.
- Use double quotes, trailing commas, and Prettier formatting. Keep lines readable rather than hand-aligning them.
- Use `const` by default; use `let` only for reassigned state. Avoid mutable module-level state unless required by a server or watcher.
- Use descriptive camelCase variables and functions; use PascalCase only for classes or constructors.
- Prefer small named functions for path construction, normalization, discovery, and validation.
- Use `path.join` for filesystem paths and `fileURLToPath(import.meta.url)` when deriving paths from an ES module.
- Resolve paths from the repository or script directory instead of assuming the process's current directory where practical.
- Use strict assertions with actionable failure messages in tests.
- Handle expected child-process or watcher shutdown errors deliberately; do not silently swallow unexpected failures.
- Keep caught errors available for logging or explicitly document why an error is ignored.
- Do not add types or a TypeScript migration without a separate requirement; this project currently uses plain JavaScript.

## TiddlyWiki and tiddler style

Templates are `.tid` files with `type: text/vnd.tiddlywiki`. Keep filter syntax valid and simple; malformed filters can fail the whole static build with opaque errors.

Use `<$transclude mode="block" />` for the current tiddler body. When a list changes rendering context, explicitly pass the item tiddler. Use `<$text>` for transformed variables. For display titles, preserve the established `caption` fallback behavior where applicable.

Use `encodeuricomponent[]` when constructing generated URLs from titles. `<$link>` resolves tiddler links, not arbitrary generated static paths; use a normal `<a href=...>` for generated paths that are not tiddler titles.

Published content generally uses a `published` field. Preserve existing tags, fields, and metadata conventions when adding demo tiddlers. Prefer an existing `thumbnail` field and fall back to `image` for picture previews.

## CSS and assets

Add site-specific styles to `plugins/litapp/blog/styles/custom.css`; keep the CSS bundle configuration in `styles/index.css.tid`. Follow the existing responsive, mobile-first gallery/grid conventions. Avoid editing generated CSS or HTML in `editions/demo/output/`.

## Collections

A collection definition has a title beginning with `pf:`, has the `collection` tag, and is associated with published pictures tagged with that exact `pf:<name>` title. The index is `/collections.html`; individual pages are `/collections/<name>.html`.

Collection body text renders before its gallery. The index removes the `pf:` prefix for display, includes body content, and places a thumbnail grid last. Collection links and picture links must point to their generated pages, remain responsive, and preserve the conditional Collections navigation behavior.

Relevant files are `build.txt`, `templates/collection.tid`, `templates/collections.tid`, `templates/page.tid`, and `styles/custom.css`.

## Content and change workflow

- Keep demo content changes in `editions/demo/tiddlers/`; do not embed sample content in templates or scripts.
- Preserve existing tiddler titles, tags, fields, and metadata unless the change explicitly requires a migration.
- Use the existing `published` convention when adding content intended for static output.
- Check generated links with URL-encoded titles, especially titles containing spaces, punctuation, or non-ASCII characters.
- For template changes, inspect at least one generated page of each affected type after building.
- For CSS changes, check both desktop and mobile layouts; the CI screenshot job uses Chromium and an iPhone 13 viewport.
- Keep changes focused and avoid broad rewrites of generated HTML, snapshots, or unrelated tiddlers.
- Do not add dependencies when a built-in Node.js or existing project dependency is sufficient.
- If a command creates temporary screenshots or build artifacts, remove them or leave only intentionally tracked output.
- Before reporting completion, review `git diff` and `git status --short` for accidental files or unrelated edits.

## CI and repository rules

GitHub Actions runs `yarn test` on pushes and pull requests. Pull requests also build the blog and capture Playwright screenshots. Main-branch builds publish the demo output to GitHub Pages. If changing visual behavior, consider running `yarn build-blog` and the screenshot script after installing the required Playwright browser.

No Cursor rules were found in `.cursor/rules/` or `.cursorrules`. No GitHub Copilot instructions were found at `.github/copilot-instructions.md`. If either is added later, treat it as additional repository guidance and update this file only if it is a stable, broadly useful summary.

Before finishing, inspect `git diff`, run the narrowest relevant test, then run `yarn test` for build/template/style changes. Never commit, push, or modify unrelated working-tree changes unless explicitly requested.
