# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Drinkle** — a Jekyll-based PWA (Progressive Web App) for silently ordering cocktails by showing cards to a bartender. Deployed via GitHub Pages.

## Development Commands

```bash
# Install dependencies (first time)
gem install bundler
bundle install

# Run local dev server with live reload
bundle exec jekyll serve --incremental

# Build static site (outputs to _site/)
bundle exec jekyll build

# Run tests (also what CI runs on PRs)
bundle exec ruby test/drinks_test.rb
bundle exec jekyll build && bundle exec htmlproofer _site --disable-external
```

Requires Ruby 3.3+. Uses the `github-pages` gem to pin all dependencies to what GitHub Pages' built-in builder uses (Jekyll 3.10.0). No test suite exists.

## Architecture

This is a static Jekyll site with no build pipeline beyond Jekyll itself.

### Data Flow
1. **`_data/drinks.yaml`** — single source of truth for all cocktail data (name, shortname, ingredients list, instruction)
2. **`index.html`** → iterates over `site.data.drinks` → renders each via **`_includes/slide.html`**
3. Jekyll also inlines the full drinks array as JSON (`var drinks = ...`) so client-side JS can access original defaults for reset
4. **`_layouts/default.html`** — single layout wrapping all pages (header, animated bubble background, Swiper/Tingle scripts)

### Client-Side JavaScript (`js/main.js`)
- **Swiper.js** (CDN) — horizontal looping card carousel
- **Tingle.js** (local) — modal for editing drink cards
- **localStorage** — persists user edits per drink (keyed by `shortname`); `rehydrate()` applies saved edits on load; `resetCard()` clears them
- **Card flip** — CSS 3D flip on click (`.is-flipped` class toggle)
- **Service worker** (`js/serviceworker.js`) — minimal stub registered for PWA installability; currently only logs install/activate events

### CSS
- `css/style.css` — main styles (card flip, swiper layout, responsive, animations)
- `css/circles.css` — animated floating bubble background
- `css/tingle.min.css` — modal library (vendored)

### Adding a New Drink
1. Add an entry to `_data/drinks.yaml` with `name`, `shortname`, `ingredients` (list), and `instruction`
2. Add a corresponding image at `assets/<shortname>.png`

The `shortname` must be a unique slug — it's used as DOM element IDs, localStorage keys, and image filenames.

### External CDN Dependencies
- Reset CSS, Swiper 11, Animate.css (loaded in `_layouts/default.html`)
- Google Fonts: VT323 (retro header font)
- Tingle.js/CSS vendored locally in `js/` and `css/`

## Deployment

Push to `master` branch — GitHub Pages auto-builds and deploys. The `CNAME` file sets the custom domain.
