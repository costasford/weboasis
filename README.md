# 🌴 WebOasis

**A personal all-in-one start page and web portal — built for tech enthusiasts who like their homepage to actually do something.**

🔗 **Live site:** [costasford.github.io/weboasis](https://costasford.github.io/weboasis/)

---

## What is this?

WebOasis is a customizable start page with a curated icon menu, a live matrix-rain background, and a whole shelf of self-contained tools bolted on underneath it. Instead of a search bar and six bookmarks, you get a search bar, six bookmarks, a stock chart, a WebTorrent client, a 550-question FAQ, and a couple of secret menus you have to find on your own.

No build step, no framework lock-in, no backend to babysit — it's plain HTML/CSS/JS, deployed straight to GitHub Pages.

## Features

**Homepage**
- Customizable icon menu (drag to reorder, add your own links, pick your own category colors)
- Animated matrix / stars / nodes / gradient / circuits backgrounds, or upload your own
- Built-in notes widget, system-info panel, and IP lookup
- Two hidden "secret menus" for the curious

**Tools & mini-sites**
| | |
|---|---|
| 🧲 **Magnet Search** / **WebTorrent Client** | Search + stream torrents in-browser |
| 📈 **Stocks** | Live quotes and price history |
| ⛅ **Weather** | Location-based forecast |
| ✅ **Todo** | Day-by-day and custom lists |
| 💬 **Forum** | Lightweight threaded discussion |
| ❓ **FAQ** | ~480 internet/tech Q&As |
| 🕹️ **Arcade** | A directory of browser games, plus a few playable ones bundled in |
| ✍️ **Text Tools** | ~35 single-purpose text utilities (case conversion, dedup, diff, etc.) |
| 🖼️ **Editors / Image Host / Upload** | Quick image editing and hosting |
| 📰 **News / Tech / Twitter** | RSS-fed reading feeds |
| 🪙 **Crypto** | Live price tracker |
| 🔳 **QR Generator**, **Unit Converter**, and more | |

## Running it locally

It's a static site — any local server works. This repo happens to ship a tiny no-cache Python server under `.claude/` for dev use:

```bash
python .claude/nocache_server.py 8123
```

Then open `http://localhost:8123`.

## Deployment

Pushing to `main` triggers a GitHub Actions workflow (`.github/workflows/static.yml`) that publishes the whole repo to GitHub Pages. No build step in between — what's in the repo is what ships.

## A note on paths

Because this is hosted as a GitHub Pages **project** site (`/weboasis/`, not the domain root), every internal link uses directory-relative paths rather than root-relative ones. Keep that in mind if you add new pages — a stray `href="/foo"` will quietly break under this hosting setup.

## History

This started as someone else's project. The original author passed away and made the code free to use before that happened — this repo is a continuation and ongoing cleanup of that work, not a from-scratch build.

## License

Not yet decided — treat it as source-available for now. If you want to actually use or fork parts of this, open an issue and ask.
