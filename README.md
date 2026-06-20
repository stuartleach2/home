# Stuart Leach Photography Website

Static photography portfolio and blog for [www.stuartleachphotography.com](https://www.stuartleachphotography.com/). The site is built from plain HTML, CSS, JavaScript, and image/audio assets so it can be served directly by GitHub Pages.

## Site overview

- `index.html` is the homepage.
- `gallery.html` links to the individual gallery rooms.
- `galleryroom*.html` files contain the current gallery collections.
- `blog.html` is the blog index page.
- `blogpost*.html` files are individual blog posts.
- `about.html` and `contact.html` are standalone information pages.
- `images/` contains newer grouped image collections and supporting media.
- Root-level image files are older gallery/blog assets that are still referenced by existing pages.
- `scripts/` contains small local JavaScript and maintenance scripts.
- `dist/css/styles.css` is reserved for shared styles, but most styling currently remains inline in the HTML pages.

## GitHub Pages deployment

The repository is designed to deploy as a GitHub Pages static site. The `CNAME` file configures the custom domain:

```text
www.stuartleachphotography.com
```

Avoid changing public file paths or deleting referenced assets unless all links are checked, because existing pages and external links may depend on them.

## Local preview

From the repository root, run a simple local web server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/> in a browser.

## Link audit

Run the local link audit before committing changes:

```bash
python3 scripts/audit-links.py
```

The audit checks local links, scripts, stylesheets, images, and CSS `url(...)` references. It intentionally ignores external URLs, `mailto:`, `tel:`, data URLs, JavaScript URLs, and same-page hash links.

## Asset Structure

Current image and media assets are grouped under `images/` by collection or purpose:

```text
images/
├── aurora/
├── boats/
├── kefalonia/
├── kefalonianconversations/
├── misc/
├── music/
├── suffolk/
├── turtles/
└── waterfalls/
```

- New images should go in the most appropriate folder under `images/`.
- Avoid placing image files in the repository root.
- Preserve filenames unless all references are updated in the same PR.
- GitHub Pages is case-sensitive, so `.jpg` and `.JPG` are different files.
- Gallery pages may reference images directly from collection folders.
- Blog images may be referenced both in individual `blogpost*.html` files and in `scripts/blog-posts.js` metadata.
- When moving blog images, update both the post content and the metadata where relevant.

Run the link audit after moving or renaming assets:

```bash
python3 scripts/audit-links.py
```

## Blog posts

Blog posts currently use a hybrid static approach:

- `scripts/blog-posts.js` stores the metadata used to render the blog index cards on `blog.html`.
- Each `blogpost*.html` file is a standalone static post page.

When adding or changing a post, update both the individual `blogpost*.html` page and the corresponding entry in `scripts/blog-posts.js` so the blog index stays in sync.
