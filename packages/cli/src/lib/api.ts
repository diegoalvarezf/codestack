export interface EnvVar {
  name: string;
  description: string;
  required: boolean;
  example?: string;
}

export interface McpServer {
  slug: string;
  name: string;
  description: string;
  installCmd: string | null;
  configJson: string | null;
  envVars: EnvVar[] | null;
  npmPackage: string | null;
  transport: string;
  verified: boolean;
  version: string;
  tools: string[];
}

const REGISTRY_URL = process.env.MCPHUB_REGISTRY ?? "https://codestack-sigma.vercel.app";

export async function fetchServer(slug: string): Promise<McpServer | null> {
  const res = await fetch(`${REGISTRY_URL}/api/servers/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const data = await res.json() as { server: McpServer };
  return data.server ?? null;
}

export async function searchServers(query: string, limit = 10): Promise<McpServer[]> {
  const res = await fetch(`${REGISTRY_URL}/api/servers?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json() as { servers: McpServer[] };
  return data.servers;
}

export async function incrementDownload(slug: string): Promise<void> {
  fetch(`${REGISTRY_URL}/api/servers/${slug}/install`, { method: "POST" }).catch(() => {});
}
