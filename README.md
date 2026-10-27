# My First Slideshow

An interactive slideshow created as a **GitHub Learning Lab** exercise for learning GitHub in July 2020. The presentation is built with **Jekyll** and **reveal.js** and hosted on **GitHub Pages**.

**Live slideshow:** https://ovidiudeica.github.io/myfirstslideshow/

## What the site contains

The original presentation has two slides:

1. **Welcome to my slide deck!** — the opening slide, with instructions to navigate using the right arrow.
2. **Welcome to my second slide!** — a slide featuring a quotation attributed to Alfred Tennyson and instructions to navigate back.

Use the keyboard arrow keys or the presentation controls to navigate. The site uses reveal.js with the Moon theme and hash-based navigation.

## Project structure

| Path | Purpose |
| --- | --- |
| `_posts/` | The two original Markdown slides |
| `index.html` | Assembles the slides into the presentation |
| `_layouts/`, `_includes/` | Jekyll presentation templates and browser assets |
| `_config.yml` | Jekyll site settings and published URL |
| `assets/reveal/` | Versioned reveal.js browser assets and their license |
| `assets/images/og-preview.jpg` | LinkedIn/Open Graph preview image |
| `_includes/head.html` | Page title, metadata and social preview configuration |
| `docs/maintenance.md` | Local setup, tests and dependency-maintenance instructions |
| `introduction-to-github.pdf` | Original GitHub learning material |

## Run locally

The existing project uses **Node.js 24** and **Ruby 3.4**, with Bundler and npm.

```sh
sh script/setup
sh script/cibuild
bundle exec jekyll serve --baseurl /myfirstslideshow
```

Open http://localhost:4000/myfirstslideshow/. The validation script checks the generated site and its local asset references. Further details are in [docs/maintenance.md](docs/maintenance.md).

## History and attribution

This repository originated in GitHub Learning Lab's **Introducing GitHub** course. Its original slide content has been preserved. The slideshow uses the open-source [reveal.js](https://revealjs.com/) library.

See [LICENSE](LICENSE) for the repository license, and [assets/reveal/LICENSE](assets/reveal/LICENSE) for the vendored reveal.js license.
