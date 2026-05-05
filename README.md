# Litapp Blog

A TiddlyWiki-based static site generator (SSG) for modern, developer-centric blogs. Litapp Blog combines the flexibility of TiddlyWiki's content management with a streamlined, "dev-like" aesthetic and high-performance static rendering.

## Features

- **Dev-like Theme:** A minimalist, dark-themed design focused on typography and code.
- **Mobile-First:** Fully responsive layout that looks great on everything from phones to desktops.
- **Dynamic Tag Pages:** Automatically generates dedicated pages for every tag used in your articles, allowing users to browse by topic.
- **Cross-Linked Navigation:** Tags are automatically linked to their respective tag pages across all articles and lists.
- **Masonry Gallery:** Automatically handles photo galleries with original image proportions using a modern masonry layout.
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

## Building the Blog

To generate the static HTML files for your blog:

```bash
yarn build-blog
```

The output will be generated in `editions/demo/output/static/`.

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
