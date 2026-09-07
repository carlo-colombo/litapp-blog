# Add collections feature

## Goal

Add collection pages for picture tags defined by `pf:<name>` tiddlers tagged `collection`.

## Requirements

- A collection definition is a tiddler whose title is `pf:<name>` and whose tags include `collection`.
- A collection includes published picture tiddlers (`pixelfed` and `published`) tagged with the exact collection title.
- Empty collections are omitted from generated pages, the collections index, and navigation.
- Generate `/collections.html` containing all non-empty collections.
- Generate `/collections/<name>.html` for each non-empty collection.
- Render collection tiddler content before its image gallery.
- Render all matching pictures in the existing responsive gallery style.
- Link each picture to its picture page.
- Add a conditional Collections link to the header navigation.
- Support desktop and mobile layouts.
- Add or update automated HTML tests and snapshots.

## Implementation areas

- `plugins/litapp/blog/build.txt`
- New collection and collections-index templates under `plugins/litapp/blog/templates/`
- `plugins/litapp/blog/templates/page.tid`
- `plugins/litapp/blog/styles/custom.css`
- `scripts/test-html.js` and snapshots
- Demo tiddler fixtures as needed

## Acceptance criteria

- A valid non-empty collection produces both index entry and individual page.
- Collection body text appears before the first image.
- No empty collection appears anywhere publicly.
- Header link is absent when no non-empty collection exists and present otherwise.
- Existing article, gallery, tag, and picture-tag rendering remains functional.
- Automated tests pass.
