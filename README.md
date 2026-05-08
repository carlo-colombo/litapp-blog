# Litapp Blog

A TiddlyWiki-based static site generator (SSG) for modern, developer-centric blogs. Litapp Blog combines the flexibility of TiddlyWiki's content management with a streamlined, "dev-like" aesthetic and high-performance static rendering.

## Features

- **Dev-like Theme:** A minimalist, dark-themed design focused on typography and code.
- **Mobile-First:** Fully responsive layout that looks great on everything from phones to desktops.
- **Dynamic Tag Pages:** Automatically generates dedicated pages for every tag used in your articles, allowing users to browse by topic.
- **Cross-Linked Navigation:** Tags are automatically linked to their respective tag pages across all articles and lists.
- **Sitemap & RSS:** Automatically generates a valid `sitemap.xml` and an RSS feed for better SEO and discoverability.
- **Masonry Gallery:** Automatically handles photo galleries with original image proportions using a modern masonry layout.
- **Cooklang Support:** Built-in support for rendering [Cooklang](https://cooklang.org/) recipes with automatic ingredient lists and step-by-step instructions.
- **Data-Driven Navigation:** Footer links and site metadata are easily configured through TiddlyWiki data tiddlers.
- **TiddlyWiki Power:** Leverage the full power of TiddlyWiki filters, templates, and plugins for content creation.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [Yarn](https://yarnpkg.com/) or npm

### Installation

```bash
git clone https://github.com/carlo-colombo/litapp-blog.git
cd litapp-blog
yarn install
```

## Development

To start the development environment, which includes a TiddlyWiki server and a live-reloading static blog preview:

```bash
yarn dev
```

- TiddlyWiki will be available on its default port (usually `8080`).
- The static blog preview will be served on port `9021`.

### Testing

The project uses Node.js's built-in test runner with experimental snapshot testing to ensure the generated blog stays consistent.

```bash
yarn test
```

## Building

To generate the static HTML files for your blog:

```bash
yarn build-blog
```

The output will be generated in `editions/demo/output/static/`.

To build a standalone TiddlyWiki `index.html` file (useful for full wiki access):

```bash
yarn build
```

## Maintenance

- **Format Code:** Uses Prettier to format the codebase.
  ```bash
  yarn prettier
  ```
- **Update Plugin Version:** Synchronizes the TiddlyWiki plugin version with the `package.json` version.
  ```bash
  yarn set-plugin-version
  ```

## Project Structure

- `plugins/litapp/blog/`: The core TiddlyWiki plugin.
  - `templates/`: Wikitext templates for rendering pages.
  - `styles/`: Custom CSS styles (`custom.css` contains the main theme).
  - `build.txt`: Defines the render commands for the SSG.
- `editions/demo/`: A demonstration TiddlyWiki edition.
  - `tiddlers/`: Content files (Markdown/Wikitext).
- `scripts/`: Development and maintenance utilities.

## License

This project is licensed under the MIT License - see the `package.json` for details.
