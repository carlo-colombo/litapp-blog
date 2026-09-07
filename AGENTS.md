# AGENTS.md

## Project overview

This repository is a TiddlyWiki-based static blog. The blog is rendered from tiddlers using templates in `plugins/litapp/blog/templates/`, with generated files written under `editions/demo/output/static/`.

## Local development

- Start the development preview with `yarn dev`.
- The static preview is served at `http://localhost:9021`.
- Build the static blog with `yarn build-blog`.
- Run the complete test suite with `yarn test`.
- HTML snapshots are stored in `scripts/test-html.js.snapshot`.
- The development server watches `plugins` and `editions`, rebuilds after changes, and reloads connected pages through `/blog-build`.

## Collections

A collection definition is a tiddler that:

- Has a title beginning with `pf:`; for example, `pf:generative`.
- Has `collection` in its `tags` field.
- Has published picture tiddlers tagged with the exact same `pf:<name>` title.

Collection behavior:

- Individual pages are generated at `/collections/<name>.html`.
- The index is generated at `/collections.html`.
- Collection body text is rendered before the image gallery.
- The collections index displays the title without the `pf:` prefix, rendered body content, and a thumbnail grid at the end.
- Collection titles on the index link to their individual collection pages.
- Pictures in the thumbnail grid link to their individual picture pages.
- The header Collections link is conditional and should only appear when collection definitions are available.
- Collection image layouts should remain responsive on desktop and mobile; reuse the existing gallery/grid conventions where possible.

Relevant files:

- `plugins/litapp/blog/build.txt` — static render commands.
- `plugins/litapp/blog/templates/collection.tid` — individual collection pages.
- `plugins/litapp/blog/templates/collections.tid` — collection index.
- `plugins/litapp/blog/templates/page.tid` — shared page shell and navigation.
- `plugins/litapp/blog/styles/custom.css` — collection and site styling.

## TiddlyWiki template lessons

- A template tiddler must have `type: text/vnd.tiddlywiki`.
- Use `<$transclude mode="block" />` when rendering the current tiddler's body. For a list item, explicitly pass the item tiddler when the list changes the rendering context.
- Static render filters must be valid TiddlyWiki filter syntax. A malformed filter can fail the entire build with an opaque `Missing [ in filter expression` error.
- Keep collection discovery filters simple and test them incrementally. `[tag[collection]]` reliably discovers collection definitions; additional matching logic is safer inside the page template or in a dedicated filter tested against fixture data.
- When transforming a tiddler title for display, use a filter operation such as `removeprefix[pf:]` and render the resulting variable with `<$text>`.
- When constructing a URL from a title, use `encodeuricomponent[]` before adding the path and `.html` suffix.
- `<$link>` resolves tiddler links, not arbitrary generated static paths. For generated collection URLs, use a regular `<a href=...>` when the destination is not a real tiddler title.
- Prefer the existing `thumbnail` field and fall back to `image` for picture previews.

## Snapshot and build considerations

- Navigation changes affect all full-page HTML snapshots, even when the page content itself is unchanged.
- Regenerate snapshots only after confirming the generated HTML is correct:
  `node --test --experimental-test-snapshots --test-update-snapshots scripts/test-html.js`
- Run `yarn test` afterward to verify HTML, feed, and auxiliary tests.
- The build creates the `editions/demo/output/static/collections` directory before rendering collection pages. Preserve this behavior when changing build scripts.
- Build output is generated content and should not be edited manually.
