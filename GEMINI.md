# Litapp Blog

Litapp Blog is a TiddlyWiki-based static site generator (SSG). It leverages TiddlyWiki's flexible data structure and templating system to author content and render it into a modern, static blog.

## Project Overview

- **Core Technology:** [TiddlyWiki 5](https://tiddlywiki.com/) (version 5.3.5)
- **Plugin:** The main logic resides in `plugins/litapp/blog`, which includes templates, styles, and configuration for the blog.
- **Static Rendering:** Uses TiddlyWiki's `--render` command to generate HTML files from tiddlers, as defined in `plugins/litapp/blog/build.txt`.
- **Styles:** Uses `mvp.css` as a base for a minimalist and responsive design, with custom extensions in `plugins/litapp/blog/styles/`.
- **Development Scripts:** Managed with Node.js and Yarn, located in the `scripts/` directory.

## Directory Structure

- `plugins/litapp/blog/`: The TiddlyWiki plugin source code.
  - `templates/`: TiddlyWiki templates (`.tid` files) for various page types (home, entry, tag, gallery).
  - `styles/`: CSS stylesheets and `index.css.tid` which bundles them.
  - `build.txt`: Definition of the TiddlyWiki render commands for building the blog.
- `editions/demo/`: A demonstration TiddlyWiki edition containing sample content.
  - `tiddlers/`: Markdown, JSON, and TiddlyWiki text files containing blog posts and metadata.
- `scripts/`: Node.js utility scripts for development, maintenance, and testing.
- `package.json`: Project dependencies, versioning (0.3.14), and script definitions.

## Building and Running

### Development Environment

To start the development environment:

```bash
yarn dev
```

- **TiddlyWiki Server:** Runs on port `8080`. Watches for changes in `plugins` and `editions`, restarting and rebuilding the static blog automatically.
- **Static Blog Preview:** Served on port `9021` using Express. It includes a live-reload script (via SSE on `/blog-build`) when `$:/config/blog/environment` is set to `dev`.

### Build Commands

- **Build Static Blog:** Generates the static HTML files in `editions/demo/output/static/`.
  ```bash
  yarn build-blog
  ```
- **Build TiddlyWiki Index:** Builds the standalone `index.html` for the demo edition.
  ```bash
  yarn build
  ```
- **Clean Output:** Removes all files from the static output directory.
  ```bash
  yarn clean
  ```
- **TiddlyWiki CLI:** A shortcut to run the TiddlyWiki CLI.
  ```bash
  yarn tw <commands>
  ```

### Testing

The project uses Node.js's built-in test runner with experimental snapshot testing.

- **Run All Tests:**
  ```bash
  yarn test
  ```
- Tests cover HTML output, RSS feeds, and Sitemap generation.

### Other Scripts

- **Format Code:** Uses Prettier to format the codebase (plugins, src, scripts).
  ```bash
  yarn prettier
  ```
- **Set Plugin Version:** Synchronizes the version in `plugins/litapp/blog/plugin.info` with `package.json`.
  ```bash
  yarn set-plugin-version
  ```

## Development Conventions

- **TiddlyWiki Templates:**
  - UI logic is primarily in `plugins/litapp/blog/templates/`.
  - The `page.tid` template handles the HTML structure, metadata, and conditional live-reload script.
  - Uses `caption` field for display titles, falling back to `title`.
- **Content:**
  - Blog posts should have a `published` field (typically a date) to be included in the static build.
  - Tags starting with `pf:` are excluded from the tag index pages.
- **Static Assets:** Images and other static assets (like `favicon.png`) are managed within the TiddlyWiki environment and exported during the build process.
- **CSS:** Custom styles should be added to `plugins/litapp/blog/styles/custom.css`. Bundle configuration is in `index.css.tid`.
