import { describe, it, expect } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { buildPluginFiles, renderSkillMd, serverEntry, sha256, toSkillName, zipPlugin } from "@/lib/plugin";
import type { McpServer } from "@/lib/types";

function server(overrides: Partial<McpServer>): McpServer {
  return {
    id: "1", slug: "srv", name: "Server", description: "", longDesc: null, repoUrl: "", npmPackage: null,
    authorName: "", authorUrl: null, license: "MIT", version: "1.0.0", tags: [], tools: [], clients: [],
    transport: "stdio", stars: 0, verified: false, featured: false, installCmd: null, configJson: null,
    envVars: null, category: null, downloadCount: 0, weeklyInstalls: 0, dailyInstalls: 0, npmDownloads: 0,
    riskLevel: "unknown", repoSlug: null, createdAt: new Date(0),
    ...overrides,
  };
}

const postgres = server({
  slug: "postgres",
  name: "Postgres",
  configJson: JSON.stringify({ command: "npx", args: ["-y", "pg-mcp", "${POSTGRES_URL}"], env: { PG_TOKEN: "${PG_TOKEN}" } }),
  envVars: [
    { name: "POSTGRES_URL", description: "Connection string", required: true },
    { name: "PG_TOKEN", description: "Token", required: false },
  ],
});

const linear = server({ slug: "linear", name: "Linear", transport: "http", configJson: JSON.stringify({ url: "https://mcp.linear.app/mcp" }) });

describe("toSkillName", () => {
  it("follows the Agent Skills naming rules", () => {
    expect(toSkillName("Review_PR!!")).toBe("review-pr");
    expect(toSkillName("--a--b--")).toBe("a-b");
    expect(toSkillName("x".repeat(80))).toHaveLength(64);
    expect(toSkillName("***")).toBe("skill");
  });
});

describe("renderSkillMd", () => {
  it("writes name and a quoted description as frontmatter", () => {
    const md = renderSkillMd({ slug: "review-pr", name: "Review PR", description: 'Reviews: "PRs"\nfast', type: "prompt", content: "Body" });
    expect(md).toBe('---\nname: review-pr\ndescription: "Reviews: \\"PRs\\" fast"\n---\n\nBody\n');
  });
});

describe("serverEntry", () => {
  it("maps catalog env placeholders to plugin user config", () => {
    expect(serverEntry(postgres)).toEqual({
      command: "npx",
      args: ["-y", "pg-mcp", "${user_config.POSTGRES_URL}"],
      env: { PG_TOKEN: "${user_config.PG_TOKEN}" },
    });
  });

  it("marks remote servers as http", () => {
    expect(serverEntry(linear)).toEqual({ url: "https://mcp.linear.app/mcp", type: "http" });
  });
});

describe("buildPluginFiles", () => {
  const files = buildPluginFiles({
    slug: "full-stack-dev",
    displayName: "Full-Stack Dev",
    description: "Everything to ship web apps",
    homepage: "https://example.com/stacks/full-stack-dev",
    servers: [postgres, linear],
    skills: [
      { slug: "review-pr", name: "Review PR", description: "Reviews PRs", type: "prompt", content: "Review it" },
      { slug: "senior-engineer", name: "Senior Engineer", description: "Pairs with you", type: "agent", content: "You are senior" },
    ],
  });

  it("lays out a Claude Code plugin", () => {
    expect(Object.keys(files).sort()).toEqual([
      ".claude-plugin/plugin.json",
      ".mcp.json",
      "agents/senior-engineer.md",
      "skills/review-pr/SKILL.md",
    ]);
  });

  it("declares user config for env vars, sensitive when it looks like a secret", () => {
    const manifest = JSON.parse(files[".claude-plugin/plugin.json"]);
    expect(manifest.name).toBe("full-stack-dev");
    expect(manifest.userConfig.POSTGRES_URL).toMatchObject({ type: "string", required: true });
    expect(manifest.userConfig.POSTGRES_URL.sensitive).toBeUndefined();
    expect(manifest.userConfig.PG_TOKEN).toMatchObject({ sensitive: true, required: false });
  });

  it("puts every server in .mcp.json", () => {
    const { mcpServers } = JSON.parse(files[".mcp.json"]);
    expect(Object.keys(mcpServers)).toEqual(["postgres", "linear"]);
  });

  it("zips deterministically", () => {
    const a = zipPlugin(files);
    const b = zipPlugin({ ...files });
    expect(sha256(a)).toBe(sha256(b));
    const unzipped = unzipSync(a);
    expect(strFromU8(unzipped["skills/review-pr/SKILL.md"])).toContain("name: review-pr");
  });
});

describe("stored frontmatter", () => {
  it("replaces name/description and keeps an agent's own settings", async () => {
    const { renderAgentMd } = await import("@/lib/plugin");
    const md = renderAgentMd({
      slug: "senior-engineer", name: "Senior Engineer", description: "Writes code", type: "agent",
      content: "---\nname: Senior Engineer\ndescription: old\ntools: Read, Grep\nmodel: sonnet\n---\n\nYou are senior.",
    });
    expect(md).toBe('---\nname: senior-engineer\ndescription: "Writes code"\ntools: Read, Grep\nmodel: sonnet\n---\n\nYou are senior.\n');
  });
});
