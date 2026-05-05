# Plan: Fix and Generate All Tag-Specific Pages

## Context & Findings
- TiddlyWiki uses `--render` for testing and debugging filter outputs.
- Currently, tag rendering is incomplete or missing.
- Requirement: Only render tags for articles (exclude tags starting with `pf:`).
- Requirement: Create pages for tags in the `tags/` folder (e.g., `tags/android.html`).
- Requirement: The tag page should use the same template as `entry.tid`, but with a customized title.

## Strategy
1. **Verify Filter Logic:**
   - Define a filter that selects all tags used by articles (where article is defined by having a `published` field) and excludes tags starting with `pf:`.
   - Test filter: `[has:field[published]tags[]!prefix[pf:]]`

2. **Update Rendering Configuration (`plugins/litapp/blog/build.txt`):**
   - Configure the `--render` command to iterate over the filtered tags and map them to `tags/<tagName>.html`.
   - Update the template reference to use `entry.tid` (or a variation that allows injecting the tag title).

3. **Template Customization:**
   - Adjust `plugins/litapp/blog/templates/entry.tid` (or a wrapper) to detect if it's being rendered as a tag page and set the title accordingly.

4. **Execution & Validation:**
   - Run `yarn build-blog`.
   - Verify that the `tags/` directory contains an HTML file for every relevant tag.
   - Confirm that tag pages correctly display the list of associated articles.
