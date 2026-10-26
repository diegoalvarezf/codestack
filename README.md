# Codestack

> Your personal MCP library: save MCP servers, skills and agents, group them into stacks, and install everything into your AI dev environment with one command.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@diegoalvarezf/codestack)](https://www.npmjs.com/package/@diegoalvarezf/codestack)

**[mcp-registry-sigma.vercel.app](https://mcp-registry-sigma.vercel.app)**

## What is this?

Setting up MCP servers means copying JSON into a different config file for every client. Codestack keeps a catalog of servers, skills and agents, lets you save the ones you use, and installs them for you into whichever clients you have.

- **Discover** MCP servers, skills and agents by name, tag, tool or compatible client
- **Library**: save what you use and keep it in one place
- **Stacks**: group servers, skills and agents and install them all at once — or as a **Claude Code plugin** from the Codestack marketplace
- **Agent Skills**: skills are installed in the open `SKILL.md` format, so Claude Code, Codex, Copilot, Gemini CLI, OpenCode and Cursor all load them
- **Remote MCP servers**: official hosted servers (GitHub, Linear, Notion, Sentry, Stripe…) over HTTP with OAuth, no local process or API keys
- **Teams**: share a set of servers and skills with your team and sync it with one command
- **Security auditing** with a 4-tier trust system and AI-assisted audits (Claude)
- **Publish** your own server, and rate and review the ones you've used
- GitHub stars and npm data synced daily

## CLI

```bash
npm install -g @diegoalvarezf/codestack
```

| Command | What it does |
|---|---|
| `codestack search <query>` | Search MCP servers |
| `codestack install <slug>` | Install a server (prompts for its env vars, or pass `-e KEY=VALUE`) |
| `codestack install-skill <slug>` | Install a prompt or agent |
| `codestack install-stack <slug>` | Install every server, skill and agent in a stack |
| `codestack plugin <slug>` | Install a stack as a Claude Code plugin |
| `codestack list` | List installed servers across all clients |
| `codestack remove <slug>` | Remove a server |
| `codestack sync --team <slug>` | Sync a team's servers and skills |
| `codestack plugin --team <slug> --token <token>` | Install a team's setup as a Claude Code plugin |

The CLI detects your clients and writes to each one's config: **Claude Code, Claude Desktop, Cursor, Continue.dev, GitHub Copilot (VS Code) and OpenClaw**. Skills go to `~/.claude/skills/` and `~/.agents/skills/`, agents to `~/.claude/agents/`.

## Claude Code plugins

Every curated and public stack is also a Claude Code plugin:

```bash
claude plugin marketplace add https://mcp-registry-sigma.vercel.app/api/plugins/marketplace.json
claude plugin install full-stack-dev@codestack
```

The plugin bundles the stack's MCP servers, skills and agents; API keys are asked for on install and stored by Claude Code. Teams get their own private marketplace at `/api/teams/<slug>/marketplace.json?token=<invite token>`.

## Stack

- **Next.js 14** (App Router) + TypeScript, Tailwind CSS
- **PostgreSQL + Prisma**
- **Auth.js** with GitHub OAuth
- **Upstash Redis** for rate limiting
- **Claude API** for automated security audits
- Vercel Cron for daily and weekly jobs
- i18n EN / ES

## Development

```bash
git clone https://github.com/diegoalvarezf/codestack.git
cd codestack
pnpm install
```

Create `.env.local` with:

```
DATABASE_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_TOKEN=              # stars sync
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ANTHROPIC_API_KEY=         # AI-assisted audits
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
pnpm db:push
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Point the CLI at your local instance with `CODESTACK_REGISTRY=http://localhost:3000`.

## Contributing

Open an issue or PR. All contributions welcome.

## License

MIT
