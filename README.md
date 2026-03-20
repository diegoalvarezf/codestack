# MCP Registry 🗂️

> The open registry for Model Context Protocol servers. Discover, publish, and rate MCP servers for Claude Code, Cursor, Continue, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: WIP](https://img.shields.io/badge/status-work--in--progress-orange)]()

## What is this?

The MCP ecosystem is growing fast and there's no central place to discover servers. MCP Registry fixes that — think npm registry but for MCP servers.

- **Discover** servers by name, tag, tool, or compatible client
- **Publish** your own server (coming soon)
- **Rate and review** servers you've used

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — dark mode UI
- **SQLite + Prisma** — simple, zero-config database
- **Fuse.js** — fuzzy search

## Development

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roadmap

- [x] Browse and search servers
- [x] Server detail pages
- [x] Tag and client filters
- [ ] Submit a server (form)
- [ ] Ratings and reviews
- [ ] GitHub OAuth for publishing
- [ ] API endpoint for programmatic access (`GET /api/servers`)
- [ ] CLI: `mcp publish`

## Contributing

Open an issue or PR. All contributions welcome.

## License

MIT
