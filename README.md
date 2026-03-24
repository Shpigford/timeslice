# Timeslice

A visual time-blocking calendar for freelancers and consultants. Drag clients onto your calendar to plan your week — no account required, everything stays in your browser.

Made by [@Shpigford](https://x.com/Shpigford)

## Features

- **Drag-and-drop scheduling** — drag clients onto AM/PM slots to create time blocks
- **Week and month views** — toggle between detailed week view and month overview
- **Client management** — color-coded clients with monthly hour budgets
- **Archive clients** — hide inactive clients without losing their history
- **Summary dashboard** — see hours logged per client with monthly breakdowns
- **Export/import** — download your data as JSON, restore it anytime
- **Dark mode** — automatic or manual theme switching
- **No account needed** — all data stored in your browser's localStorage

## Running locally

```
npm install
npm run dev
```

Opens at `http://localhost:5190`.

## Your data

Everything is stored in your browser's localStorage. No server, no database, no tracking. Your data never leaves your machine.

**Back up your data** — click the download icon in the header to export a JSON backup. Click the upload icon to restore from a backup.

## Deploying

Timeslice is a static site. Deploy it anywhere that serves HTML.

### Cloudflare Workers

The repo includes a `wrangler.toml` configured for Cloudflare Workers with static assets. Connect your repo in the Cloudflare dashboard and it deploys automatically.

### Other hosts

Run `npm run build` and serve the `dist/` directory. Works with Vercel, Netlify, GitHub Pages, or any static host.

## Tech stack

- [React](https://react.dev) — UI
- [Vite](https://vite.dev) — build tool
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Radix UI](https://radix-ui.com) — accessible component primitives
- [Framer Motion](https://motion.dev) — animations
- [Recharts](https://recharts.org) — summary charts

## License

MIT
