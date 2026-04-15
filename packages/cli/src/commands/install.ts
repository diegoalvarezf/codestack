import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { fetchServer, incrementDownload } from "../lib/api.js";
import { detectClients } from "../lib/detect.js";
import { installForClient, isAlreadyInstalled } from "../lib/config.js";

export async function installCommand(slug: string, envOverrides: Record<string, string> = {}) {
  const spinner = ora(`Looking up ${chalk.bold(slug)}...`).start();

  const server = await fetchServer(slug).catch(() => null);
  if (!server) {
    spinner.fail(`"${slug}" not found in Codestack.`);
    console.log(chalk.gray(`  Try: npx @codestack/cli search ${slug}`));
    process.exit(1);
  }

  spinner.succeed(
    `${chalk.bold(server.name)} ${chalk.gray("v" + server.version)}${server.verified ? chalk.blue("  ✓") : ""}`
  );
  if (server.description) console.log(chalk.gray(`  ${server.description}\n`));

  // Prompt only for required env vars not already provided via --env
  const envValues: Record<string, string> = { ...envOverrides };
  const SENSITIVE_RE = /key|token|secret|password|passwd|credential|auth|api_?key/i;

  const missing = (server.envVars ?? []).filter(
    (ev) => ev.required && !envValues[ev.name]?.trim()
  );
  for (const ev of missing) {
    const isSensitive = SENSITIVE_RE.test(ev.name);
    const { value } = await inquirer.prompt<{ value: string }>([{
      type: isSensitive ? "password" : "input",
      name: "value",
      message: `${chalk.cyan(ev.name)}  ${chalk.gray(ev.description)}${!isSensitive && ev.example ? chalk.gray(` (e.g. ${ev.example})`) : ""}`,
      mask: isSensitive ? "*" : undefined,
      validate: (input: string) => input.trim() ? true : "Required",
    }]);
    if (value.trim()) envValues[ev.name] = value.trim();
  }
  if (missing.length > 0) console.log();

  // Detect clients — install to all by default
  const detected = detectClients();
  if (detected.length === 0) {
    console.log(chalk.yellow("No MCP client detected."));
    console.log(chalk.gray("  Install Claude Code, Cursor, or Continue.dev first.\n"));
    process.exit(1);
  }

  for (const client of detected) {
    const updating = isAlreadyInstalled(client.id, server.slug);
    const s = ora(`${updating ? "Updating" : "Installing"} in ${chalk.bold(client.label)}...`).start();
    try {
      const configPath = installForClient(client.id, server, envValues);
      s.succeed(`${chalk.bold(client.label)}  ${chalk.gray(configPath)}`);
    } catch (err: any) {
      s.fail(`${client.label}: ${err.message}`);
    }
  }

  console.log();
  console.log(chalk.green(`✓ ${server.name} installed`) + chalk.gray("  Restart your client to activate."));
  if (server.tools?.length) {
    console.log(chalk.gray(`  Tools: ${server.tools.slice(0, 6).join(", ")}${server.tools.length > 6 ? ` +${server.tools.length - 6} more` : ""}`));
  }
  console.log();

  incrementDownload(server.slug);
}
