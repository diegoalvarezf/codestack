import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { fetchServer, incrementDownload } from "../lib/api.js";
import { detectClients, type DetectedClient } from "../lib/detect.js";
import { installForClient, isAlreadyInstalled } from "../lib/config.js";

export async function installCommand(slug: string, envOverrides: Record<string, string> = {}) {
  const spinner = ora(`Buscando ${chalk.bold(slug)} en MCPHub...`).start();

  const server = await fetchServer(slug).catch(() => null);
  if (!server) {
    spinner.fail(`No se encontró "${slug}" en MCPHub.`);
    console.log(chalk.gray(`  Prueba: mcp search ${slug}`));
    process.exit(1);
  }

  spinner.succeed(
    `${chalk.bold(server.name)} v${server.version}${server.verified ? chalk.blue("  ✓ verified") : ""}`
  );
  console.log(chalk.gray(`  ${server.description}\n`));

  // Env vars — use overrides first, prompt only for missing required ones
  const envValues: Record<string, string> = { ...envOverrides };
  if (server.envVars && server.envVars.length > 0) {
    const missing = server.envVars.filter(
      (ev) => ev.required && !envValues[ev.name]?.trim()
    );
    if (missing.length > 0) {
      console.log(chalk.yellow("Required environment variables:"));
      for (const ev of missing) {
        const { value } = await inquirer.prompt<{ value: string }>([
          {
            type: "input",
            name: "value",
            message: `${chalk.cyan(ev.name)} — ${ev.description}${ev.example ? chalk.gray(` (e.g. ${ev.example})`) : ""}:`,
            validate: (input: string) => {
              if (!input.trim()) return "This field is required";
              return true;
            },
          },
        ]);
        if (value.trim()) envValues[ev.name] = value.trim();
      }
      console.log();
    }
  }

  // Detectar clientes
  const detected = detectClients();
  let targets: DetectedClient[] = [];

  if (detected.length === 0) {
    console.log(chalk.yellow("No se detectó ningún cliente MCP instalado."));
    console.log(chalk.gray("  Instala Claude Code, Cursor o Continue.dev primero.\n"));
    process.exit(1);
  }

  if (detected.length === 1) {
    targets = detected;
  } else {
    const { selected } = await inquirer.prompt<{ selected: string[] }>([
      {
        type: "checkbox",
        name: "selected",
        message: "¿En qué clientes instalar?",
        choices: detected.map((c) => ({
          name: c.label,
          value: c.id,
          checked: true,
        })),
        validate: (choices: string[]) => choices.length > 0 || "Selecciona al menos uno",
      },
    ]);
    targets = detected.filter((c) => selected.includes(c.id));
  }

  console.log();

  // Instalar en cada cliente
  for (const client of targets) {
    const alreadyInstalled = isAlreadyInstalled(client.id, server.slug);
    const s = ora(`Configurando en ${chalk.bold(client.label)}${alreadyInstalled ? chalk.gray(" (actualizando)") : ""}...`).start();
    try {
      const configPath = installForClient(client.id, server, envValues);
      s.succeed(`${chalk.bold(client.label)} ${chalk.gray(`→ ${configPath}`)}`);
    } catch (err: any) {
      s.fail(`${client.label}: ${err.message}`);
    }
  }

  console.log();
  console.log(chalk.green(`✓ ${server.name} instalado correctamente`));

  if (server.tools && server.tools.length > 0) {
    console.log(chalk.gray(`  Herramientas: ${server.tools.slice(0, 5).join(", ")}${server.tools.length > 5 ? ` +${server.tools.length - 5} más` : ""}`));
  }

  console.log(chalk.gray("  Reinicia tu cliente MCP para activar el servidor.\n"));

  // Incrementar contador en background
  incrementDownload(server.slug);
}
