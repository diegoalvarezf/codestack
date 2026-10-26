import chalk from "chalk";
import { searchServers } from "../lib/api.js";

export async function searchCommand(query: string) {
  const servers = await searchServers(query, 10);

  if (servers.length === 0) {
    console.log(chalk.yellow(`No results for "${query}"`));
    return;
  }

  console.log(chalk.bold(`\n${servers.length} result${servers.length !== 1 ? "s" : ""} for "${query}":\n`));

  for (const s of servers) {
    const badges = [
      s.verified ? chalk.blue("✓ verified") : "",
      s.transport === "http" || s.transport === "sse" ? chalk.magenta("● remote") : chalk.green("● local"),
    ].filter(Boolean).join("  ");

    console.log(`  ${chalk.bold(s.name)} ${chalk.gray(`(${s.slug})`)}  ${badges}`);
    console.log(`  ${chalk.gray(s.description)}`);
    console.log(`  ${chalk.cyan(`codestack install ${s.slug}`)}`);
    console.log();
  }
}
