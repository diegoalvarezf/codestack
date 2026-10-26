import chalk from "chalk";
import { spawnSync } from "child_process";
import { REGISTRY_URL } from "../lib/api.js";

const MARKETPLACE = "codestack";

function claude(args: string[]): boolean {
  const res = spawnSync("claude", args, { stdio: "inherit" });
  return !res.error && res.status === 0;
}

function hasClaude(): boolean {
  const res = spawnSync("claude", ["--version"], { stdio: "ignore" });
  return !res.error && res.status === 0;
}

// Installs a stack (or a team's setup) as a Claude Code plugin through the Codestack marketplace.
export async function pluginCommand(stack: string | undefined, opts: { team?: string; token?: string }) {
  let marketplaceUrl: string, marketplace: string, plugin: string;

  if (opts.team) {
    if (!opts.token) {
      console.log(chalk.red("Usage: codestack plugin --team <slug> --token <token>"));
      process.exit(1);
    }
    marketplaceUrl = `${REGISTRY_URL}/api/teams/${encodeURIComponent(opts.team)}/marketplace.json?token=${encodeURIComponent(opts.token)}`;
    marketplace = `${MARKETPLACE}-${opts.team}`;
    plugin = opts.team;
  } else if (stack) {
    marketplaceUrl = `${REGISTRY_URL}/api/plugins/marketplace.json`;
    marketplace = MARKETPLACE;
    plugin = stack;
  } else {
    console.log(chalk.red("Usage: codestack plugin <stack>  or  codestack plugin --team <slug> --token <token>"));
    process.exit(1);
  }

  const steps = [
    ["plugin", "marketplace", "add", marketplaceUrl],
    ["plugin", "install", `${plugin}@${marketplace}`],
  ];

  if (!hasClaude()) {
    console.log(chalk.yellow("Claude Code CLI not found. Run these once it's installed:\n"));
    for (const s of steps) console.log(chalk.cyan(`  claude ${s.join(" ")}`));
    console.log();
    return;
  }

  // Adding a marketplace that is already there fails; refresh it instead.
  if (!claude(steps[0])) {
    console.log(chalk.gray(`  Marketplace already added — updating ${marketplace}`));
    claude(["plugin", "marketplace", "update", marketplace]);
  }
  if (!claude(steps[1])) process.exit(1);

  console.log(chalk.green(`\n✓ ${plugin} installed as a Claude Code plugin`));
  console.log(chalk.gray("  Restart Claude Code. Servers that need keys ask for them on first use.\n"));
}
