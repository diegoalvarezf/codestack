import type { Metadata } from "next";
import { ModelsClient } from "./ModelsClient";

export const metadata: Metadata = {
  title: "Run Local — MCPHub",
  description: "Find which open AI models run on your hardware. Filter by tool use support, context window, and install with Ollama or LM Studio.",
};

export default function ModelsPage() {
  return <ModelsClient />;
}
