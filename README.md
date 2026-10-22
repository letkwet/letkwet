# Letkwet

A simple, offline-first [ChordPro](https://chordpro.org) based song book web app
that can be hosted on GitHub Pages.

Visit the demo Myanmar song book at [`letkwet.github.io`](https://letkwet.github.io).

## Stack

- [Svelte 5](https://svelte.dev) with runes + [SvelteKit 2](https://kit.svelte.dev)
- [Tailwind CSS](https://tailwindcss.com)
- Client-side routing via [`svelte-spa-router`](https://github.com/ItalyPaleAle/svelte-spa-router)
- Storage via [`idb`](https://github.com/jakearchibald/idb) (a tiny IndexedDB wrapper)
- A lean, custom ChordPro parser/formatter

## Features

- Fully offline after first visit — songs are cached in IndexedDB and the app shell is cached by a service worker.
- Search songs and artists by name.
- Transpose, auto-scroll, and toggle chords/lyrics on the song page.
- **Custom chord diagrams** per song using the standard ChordPro `{define: ...}` directive.
- **Recently viewed songs** shown on the home page.
- **Multi-column lyrics layout** on wider screens so chord sheets read like a songbook instead of a single narrow column.
- Load local `.cho`/`.chopro`/`.chord` ChordPro files.

## Song database

The app expects a `songs.json` file at the site root with this shape:

```json
{
  "songs": [
    {
      "key": "Song Title_Artist Name",
      "title": "Song Title",
      "artists": ["Artist Name"],
      "album": "Album",
      "lyrics": "{title: Song Title}\n{artist: Artist Name}\n..."
    }
  ]
}
```

- See <https://github.com/letkwet/mm-songs-chordpro> for a generator that turns a folder of ChordPro files into `songs.json`.
- See <https://github.com/letkwet/letkwet.github.io> for the generated static site and song database.

## Development

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

Place your `songs.json` at the site root (or in `static/` for local dev) before the first page load so the app can bootstrap its offline database.
